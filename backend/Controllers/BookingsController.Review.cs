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
        [HttpPost("{id}/review")]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> SubmitReview(int id, [FromBody] SubmitReviewDto dto)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound(new { message = "Không tìm thấy đơn đặt chỗ." });

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            bool isStaffOrAdmin = string.Equals(userRole, "STAFF", StringComparison.OrdinalIgnoreCase) || 
                                   string.Equals(userRole, "ADMIN", StringComparison.OrdinalIgnoreCase);

            if (!isStaffOrAdmin && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            if (booking.BookingStatus != "Checked_Out")
            {
                return BadRequest(new { message = "Chỉ có thể đánh giá sau khi đã hoàn thành checkout phòng." });
            }

            if (dto.Rating < 1 || dto.Rating > 5)
            {
                return BadRequest(new { message = "Điểm đánh giá phải từ 1 đến 5 sao." });
            }

            booking.Rating = dto.Rating;
            booking.ReviewComment = dto.ReviewComment;

            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, currentUserId, $"Đã gửi đánh giá dịch vụ: {dto.Rating} sao. Nhận xét: {dto.ReviewComment}");

            return Ok(new { message = "Gửi đánh giá dịch vụ thành công." });
        }
    }

    public class SubmitReviewDto
    {
        public int Rating { get; set; }
        public string? ReviewComment { get; set; }
    }
}
