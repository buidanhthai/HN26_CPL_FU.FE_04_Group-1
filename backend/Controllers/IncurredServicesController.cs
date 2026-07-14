using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Entities;
using backend.DTOs;
using System.Threading.Tasks;
using System.Linq;

using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/bookings/{bookingId}/services")]
    [Authorize]
    public class IncurredServicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public IncurredServicesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> AddIncurredService(int bookingId, [FromBody] AddServiceDto dto)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) return NotFound(new { message = "Booking not found." });

            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER")
            {
                if (booking.UserId != currentUserId)
                {
                    return Forbid();
                }
                if (booking.BookingStatus != "Checked_In")
                {
                    return BadRequest(new { message = "Bạn chỉ có thể đặt thêm dịch vụ cho phiên booking đang hoạt động (đã check-in)." });
                }
            }

            var service = await _context.AddOnServices.FindAsync(dto.ServiceId);
            if (service == null) return NotFound(new { message = "Service not found." });

            var bookingService = await _context.BookingServiceDetails
                .FirstOrDefaultAsync(b => b.BookingId == bookingId && b.ServiceId == dto.ServiceId && b.IsIncurred == true);

            if (bookingService != null)
            {
                bookingService.Quantity += dto.Quantity;
            }
            else
            {
                bookingService = new BookingServiceDetail
                {
                    BookingId = bookingId,
                    ServiceId = dto.ServiceId,
                    Quantity = dto.Quantity,
                    SnapshotUnitPrice = service.UnitPrice,
                    IsIncurred = true,
                    PaymentStatus = "Unpaid"
                };
                _context.BookingServiceDetails.Add(bookingService);
            }

            await _context.SaveChangesAsync();

            // Log action to BookingLog
            var staffUser = await _context.Users.FindAsync(currentUserId);
            var log = new BookingLog
            {
                BookingId = bookingId,
                UserFullName = staffUser?.FullName ?? "Hệ thống",
                ActionDescription = $"Đã thêm dịch vụ phát sinh: {service.ServiceName} (Số lượng: {dto.Quantity}).",
                Timestamp = backend.Helpers.TimeHelper.GetVietnamTime()
            };
            _context.BookingLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Service added successfully.", detail = bookingService });
        }

        [HttpGet]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> GetIncurredServices(int bookingId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) return NotFound(new { message = "Không tìm thấy booking." });

            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER" && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            var services = await _context.BookingServiceDetails
                .Where(b => b.BookingId == bookingId && b.IsIncurred == true)
                .Select(b => new 
                {
                    b.ServiceId,
                    ServiceName = b.AddOnService != null ? b.AddOnService.ServiceName : "Dịch vụ",
                    b.Quantity,
                    b.SnapshotUnitPrice,
                    b.PaymentStatus
                })
                .ToListAsync();

            return Ok(services);
        }
    }
}
