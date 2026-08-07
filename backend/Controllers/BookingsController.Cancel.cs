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
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Cancelled")
            {
                return BadRequest(new { message = "Chỉ được phép xóa các đơn đặt chỗ đã bị hủy do chưa thanh toán đặt trước." });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            bool isStaffOrAdmin = string.Equals(userRole, "STAFF", StringComparison.OrdinalIgnoreCase) || 
                                   string.Equals(userRole, "ADMIN", StringComparison.OrdinalIgnoreCase);

            if (!isStaffOrAdmin && booking.UserId != userId)
            {
                return Forbid();
            }

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: /api/bookings/{id}/cancel (Hủy đặt chỗ và tự động hoàn cọc)
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id, [FromBody] CancelBookingDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.Invoices)
                .FirstOrDefaultAsync(b => b.Id == id);
            
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Awaiting_Payment" && booking.BookingStatus != "Confirmed")
            {
                return BadRequest(new { message = "Không thể hủy đặt chỗ ở trạng thái hiện tại." });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER" && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
            decimal refundRate = 0.0m;
            
            if (booking.BookingStatus == "Confirmed")
            {
                double hoursToStart = (booking.StartTime - nowLocal).TotalHours;

                if (hoursToStart >= 24.0)
                {
                    refundRate = 1.0m;
                }
                else if (hoursToStart >= 4.0)
                {
                    refundRate = 0.5m;
                }
                else
                {
                    refundRate = 0.0m;
                }
            }
            else // Awaiting_Payment -> Hủy thì hoàn 0đ (chưa thanh toán)
            {
                refundRate = 0.0m;
            }

            decimal totalPaid = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
            booking.RefundAmount = totalPaid * refundRate;
            booking.CancellationReason = dto.CancellationReason;
            booking.BookingStatus = "Cancelled";
            booking.PaymentDeadline = null;

            // Đổi trạng thái hóa đơn liên quan sang Cancelled hoặc hoàn trả
            var upfrontInvoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Upfront");
            if (upfrontInvoice != null)
            {
                upfrontInvoice.PaymentStatus = "Cancelled";
            }

            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, currentUserId > 0 ? currentUserId : booking.UserId, $"Đã hủy đặt chỗ. Hoàn cọc: {booking.RefundAmount:N0}đ (Tỷ lệ: {refundRate * 100}%). Lý do: {dto.CancellationReason}");

            return Ok(new { 
                message = "Hủy đặt chỗ thành công.", 
                bookingStatus = booking.BookingStatus, 
                refundAmount = booking.RefundAmount 
            });
        }
    }
}
