using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Entities;
using backend.DTOs;
using System.Threading.Tasks;
using System.Linq;
using System;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Collections.Generic;

namespace backend.Controllers
{
    public partial class BookingsController : ControllerBase
    {
        [HttpPost("{id}/check-in")]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> CheckinBooking(int id, [FromQuery] bool forceByAdmin = false)
        {
            var eligibility = await EvaluateCheckInEligibilityAsync(id);

            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            bool isStaffOrAdmin = string.Equals(userRole, "ADMIN", System.StringComparison.OrdinalIgnoreCase) || string.Equals(userRole, "STAFF", System.StringComparison.OrdinalIgnoreCase);

            bool bypassEnabled = false;
            if (!eligibility.CanCheckIn && isStaffOrAdmin && (forceByAdmin || eligibility.ReasonCode == "TOO_EARLY" || eligibility.ReasonCode == "TASK_NOT_COMPLETED"))
            {
                bypassEnabled = true;
            }

            if (!eligibility.CanCheckIn && !bypassEnabled)
            {
                return BadRequest(eligibility);
            }

            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            booking.BookingStatus = "Checked_In";
            booking.CheckedInAt = nowLocal;

            if (bypassEnabled)
            {
                booking.CheckedInByAdminId = currentUserId;
                await LogActionAsync(booking.Id, currentUserId, "Admin đã duyệt đặc cách check-in sớm trước giờ.");
            }
            else
            {
                await LogActionAsync(booking.Id, currentUserId, "Đã hoàn tất xác nhận Check-in.");
            }

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Check-in thành công.", 
                bookingStatus = booking.BookingStatus,
                checkedInAt = booking.CheckedInAt
            });
        }

        // POST: /api/bookings/{id}/arrive (Báo có mặt)
        [HttpPost("{id}/arrive")]
        public async Task<IActionResult> ArriveBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Confirmed")
            {
                return BadRequest(new { message = "Chỉ có thể báo có mặt cho đặt chỗ đã xác nhận (Confirmed)." });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER" && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            booking.Arrived = true;
            await _context.SaveChangesAsync();

            await LogActionAsync(booking.Id, currentUserId > 0 ? currentUserId : booking.UserId, "Khách hàng báo đã có mặt tại quầy.");
            return Ok(new { message = "Đã ghi nhận có mặt. Lịch hẹn của bạn sẽ không bị tự động hủy No-Show." });
        }
    }
}
