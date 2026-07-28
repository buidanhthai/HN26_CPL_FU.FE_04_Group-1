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

namespace backend.Controllers
{
    [ApiController]
    [Authorize]
    public class ServiceRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServiceRequestsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /api/my-requests (Khách hàng xem các yêu cầu của họ)
        [HttpGet("api/my-requests")]
        [Authorize(Roles = "USER")]
        public async Task<IActionResult> GetMyRequests()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            int currentUserId = int.Parse(userIdStr);

            var requests = await _context.ServiceRequests
                .Where(r => r.UserId == currentUserId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ServiceRequestDto
                {
                    Id = r.Id,
                    BookingId = r.BookingId,
                    UserId = r.UserId,
                    RequestType = r.RequestType,
                    RoomName = r.RoomName,
                    Title = r.Title,
                    Detail = r.Detail,
                    ServiceId = r.ServiceId,
                    Quantity = r.Quantity,
                    RequestStatus = r.RequestStatus,
                    CreatedAt = r.CreatedAt
                }).ToListAsync();

            return Ok(requests);
        }

        // POST: /api/my-requests (Khách hàng gửi yêu cầu/sự cố mới)
        [HttpPost("api/my-requests")]
        [Authorize(Roles = "USER")]
        public async Task<IActionResult> CreateRequest([FromBody] CreateServiceRequestDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            int currentUserId = int.Parse(userIdStr);

            int? bookingId = dto.BookingId;
            if (!bookingId.HasValue)
            {
                // Tự động tìm booking đang active (Checked_In) của user này
                var activeBooking = await _context.Bookings
                    .FirstOrDefaultAsync(b => b.UserId == currentUserId && b.BookingStatus == "Checked_In");
                if (activeBooking != null)
                {
                    bookingId = activeBooking.Id;
                }
            }

            var request = new ServiceRequest
            {
                BookingId = bookingId,
                UserId = currentUserId,
                RequestType = dto.RequestType,
                RoomName = dto.RoomName,
                Title = dto.Title,
                Detail = dto.Detail,
                ServiceId = dto.ServiceId,
                Quantity = dto.Quantity > 0 ? dto.Quantity : 1,
                RequestStatus = "Pending",
                CreatedAt = backend.Helpers.TimeHelper.GetVietnamTime()
            };

            _context.ServiceRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new ServiceRequestDto
            {
                Id = request.Id,
                BookingId = request.BookingId,
                UserId = request.UserId,
                RequestType = request.RequestType,
                RoomName = request.RoomName,
                Title = request.Title,
                Detail = request.Detail,
                ServiceId = request.ServiceId,
                Quantity = request.Quantity,
                RequestStatus = request.RequestStatus,
                CreatedAt = request.CreatedAt
            });
        }

        // GET: /api/requests (Staff/Admin xem danh sách yêu cầu hệ thống)
        [HttpGet("api/requests")]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> GetAllRequests()
        {
            var requests = await _context.ServiceRequests
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ServiceRequestDto
                {
                    Id = r.Id,
                    BookingId = r.BookingId,
                    UserId = r.UserId,
                    RequestType = r.RequestType,
                    RoomName = r.RoomName,
                    Title = r.Title,
                    Detail = r.Detail,
                    ServiceId = r.ServiceId,
                    Quantity = r.Quantity,
                    RequestStatus = r.RequestStatus,
                    CreatedAt = r.CreatedAt,
                    UserFullName = r.User != null ? r.User.FullName : "Khách hàng"
                }).ToListAsync();

            return Ok(requests);
        }

        // PUT: /api/requests/{id}/status (Staff/Admin cập nhật trạng thái yêu cầu)
        [HttpPut("api/requests/{id}/status")]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> UpdateRequestStatus(int id, [FromBody] UpdateServiceRequestStatusDto dto)
        {
            var request = await _context.ServiceRequests.FindAsync(id);
            if (request == null) return NotFound(new { message = "Yêu cầu không tìm thấy." });

            var oldStatus = request.RequestStatus;
            request.RequestStatus = dto.RequestStatus;

            // Nếu đổi sang Resolved và loại là SERVICE (Gọi món), tự động tạo BookingServiceDetail phát sinh
            if (dto.RequestStatus == "Resolved" && oldStatus != "Resolved" && request.RequestType == "SERVICE")
            {
                int? bookingId = request.BookingId;
                if (!bookingId.HasValue)
                {
                    // Thử tìm booking active của user này
                    var activeBooking = await _context.Bookings
                        .FirstOrDefaultAsync(b => b.UserId == request.UserId && b.BookingStatus == "Checked_In");
                    if (activeBooking != null)
                    {
                        bookingId = activeBooking.Id;
                        request.BookingId = bookingId;
                    }
                }

                if (bookingId.HasValue && request.ServiceId.HasValue)
                {
                    var booking = await _context.Bookings.FindAsync(bookingId.Value);
                    var service = await _context.AddOnServices.FindAsync(request.ServiceId.Value);

                    if (booking != null && service != null && booking.BookingStatus == "Checked_In")
                    {
                        var existingDetail = await _context.BookingServiceDetails
                            .FirstOrDefaultAsync(sd => sd.BookingId == booking.Id && sd.ServiceId == service.Id && sd.IsIncurred);

                        if (existingDetail != null)
                        {
                            existingDetail.Quantity += request.Quantity;
                        }
                        else
                        {
                            var newDetail = new BookingServiceDetail
                            {
                                BookingId = booking.Id,
                                ServiceId = service.Id,
                                Quantity = request.Quantity,
                                SnapshotUnitPrice = service.UnitPrice,
                                IsIncurred = true,
                                PaymentStatus = "Unpaid"
                            };
                            _context.BookingServiceDetails.Add(newDetail);
                        }

                        // Log to BookingLog
                        var log = new BookingLog
                        {
                            BookingId = booking.Id,
                            UserFullName = "Hệ thống",
                            ActionDescription = $"Đồng bộ dịch vụ phát sinh từ yêu cầu hỗ trợ (ID Yêu cầu: {request.Id}): {service.ServiceName} (Số lượng: {request.Quantity}).",
                            Timestamp = backend.Helpers.TimeHelper.GetVietnamTime()
                        };
                        _context.BookingLogs.Add(log);
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công.", status = request.RequestStatus });
        }
    }
}
