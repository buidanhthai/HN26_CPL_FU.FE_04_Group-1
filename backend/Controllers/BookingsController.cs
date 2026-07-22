using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Entities;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    [Authorize]
    public partial class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        private async Task LogActionAsync(int bookingId, int userId, string actionDescription)
        {
            var user = await _context.Users.FindAsync(userId);
            var log = new BookingLog
            {
                BookingId = bookingId,
                UserFullName = user?.FullName ?? "Hệ thống",
                ActionDescription = actionDescription,
                Timestamp = backend.Helpers.TimeHelper.GetVietnamTime()
            };
            _context.BookingLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }

    public class AddIncurredServicesDto
    {
        public System.Collections.Generic.List<IncurredServiceItemDto> Services { get; set; } = new();
    }

    public class IncurredServiceItemDto
    {
        public int ServiceId { get; set; }
        public int Quantity { get; set; }
    }
}
