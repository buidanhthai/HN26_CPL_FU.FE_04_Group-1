using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Entities;
using backend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/user-requests")]
    public class CustomerRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CustomerRequestsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/user-requests/my (User views their own requests)
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyRequests()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (!int.TryParse(userIdStr, out int userId))
            {
                userId = 3; // Dev fallback
            }

            var requests = await _context.ServiceRequests
                .Include(r => r.User)
                .Include(r => r.Booking).ThenInclude(b => b!.SpaceAsset)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new CustomerRequestDto
                {
                    Id = r.Id,
                    Type = r.RequestType,
                    Title = r.Title,
                    Detail = r.Detail ?? string.Empty,
                    RoomName = !string.IsNullOrEmpty(r.RoomName) 
                        ? r.RoomName 
                        : (r.Booking != null && r.Booking.SpaceAsset != null ? r.Booking.SpaceAsset.AssetName : "Phòng"),
                    CustomerName = r.User != null ? r.User.FullName : "Khách hàng",
                    Status = r.RequestStatus,
                    ResolvedNote = r.ResolvedNote,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        // GET: api/user-requests (Staff & Admin view all requests)
        [HttpGet]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> GetAllRequests()
        {
            var requests = await _context.ServiceRequests
                .Include(r => r.User)
                .Include(r => r.Booking).ThenInclude(b => b!.SpaceAsset)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new CustomerRequestDto
                {
                    Id = r.Id,
                    Type = (r.RequestType ?? "SERVICE").ToUpper(),
                    Title = r.Title,
                    Detail = r.Detail ?? string.Empty,
                    RoomName = !string.IsNullOrEmpty(r.RoomName) 
                        ? r.RoomName 
                        : (r.Booking != null && r.Booking.SpaceAsset != null ? r.Booking.SpaceAsset.AssetName : "Phòng"),
                    CustomerName = r.User != null ? r.User.FullName : "Khách hàng",
                    Status = string.IsNullOrWhiteSpace(r.RequestStatus) ? "Pending" : r.RequestStatus,
                    ResolvedNote = r.ResolvedNote,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        // POST: api/user-requests (Create a new request)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateRequest([FromBody] CreateCustomerRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.RoomName))
            {
                return BadRequest("Tiêu đề và tên phòng là bắt buộc.");
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (!int.TryParse(userIdStr, out int userId))
            {
                userId = 3; // Default to Alice User in dev mode
            }

            var userObj = await _context.Users.FindAsync(userId);
            var activeBooking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.UserId == userId && b.BookingStatus == "Checked_In");

            var newReq = new ServiceRequest
            {
                UserId = userId,
                BookingId = activeBooking?.Id,
                RequestType = dto.Type ?? "SERVICE",
                Title = dto.Title.Trim(),
                Detail = dto.Detail?.Trim() ?? string.Empty,
                RoomName = dto.RoomName.Trim(),
                RequestStatus = "Pending",
                CreatedAt = TimeHelper.GetVietnamTime()
            };

            _context.ServiceRequests.Add(newReq);
            await _context.SaveChangesAsync();

            return Ok(new CustomerRequestDto
            {
                Id = newReq.Id,
                Type = newReq.RequestType,
                Title = newReq.Title,
                Detail = newReq.Detail ?? string.Empty,
                RoomName = newReq.RoomName,
                CustomerName = userObj?.FullName ?? "Khách hàng",
                Status = newReq.RequestStatus,
                ResolvedNote = newReq.ResolvedNote,
                CreatedAt = newReq.CreatedAt
            });
        }

        // PATCH: api/user-requests/{id} (Staff/Admin updates status and note)
        [HttpPatch("{id}")]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> UpdateRequestStatus(int id, [FromBody] UpdateCustomerRequestDto dto)
        {
            var req = await _context.ServiceRequests
                .Include(r => r.User)
                .Include(r => r.Booking)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (req == null)
            {
                return NotFound("Không tìm thấy yêu cầu.");
            }

            var oldStatus = req.RequestStatus;
            if (!string.IsNullOrEmpty(dto.Status))
            {
                req.RequestStatus = dto.Status;
            }

            if (dto.ResolvedNote != null)
            {
                req.ResolvedNote = dto.ResolvedNote;
            }

            // Rule 9: Đồng bộ Dịch vụ Phát sinh từ Yêu cầu Hỗ trợ (Request-to-Billing Synergy)
            if (dto.Status == "Resolved" && oldStatus != "Resolved" && req.RequestType == "SERVICE")
            {
                int? bookingId = req.BookingId;
                if (!bookingId.HasValue)
                {
                    var activeBooking = await _context.Bookings
                        .FirstOrDefaultAsync(b => b.UserId == req.UserId && b.BookingStatus == "Checked_In");
                    if (activeBooking != null)
                    {
                        bookingId = activeBooking.Id;
                        req.BookingId = bookingId;
                    }
                }

                if (bookingId.HasValue)
                {
                    var booking = await _context.Bookings.FindAsync(bookingId.Value);
                    if (booking != null && booking.BookingStatus == "Checked_In")
                    {
                        AddOnService? service = null;
                        if (req.ServiceId.HasValue)
                        {
                            service = await _context.AddOnServices.FindAsync(req.ServiceId.Value);
                        }
                        if (service == null)
                        {
                            service = await _context.AddOnServices.FirstOrDefaultAsync(s => req.Title.Contains(s.ServiceName))
                                ?? await _context.AddOnServices.FirstOrDefaultAsync();
                        }

                        if (service != null)
                        {
                            int qty = req.Quantity > 0 ? req.Quantity : 1;
                            var existingDetail = await _context.BookingServiceDetails
                                .FirstOrDefaultAsync(sd => sd.BookingId == booking.Id && sd.ServiceId == service.Id && sd.IsIncurred);

                            if (existingDetail != null)
                            {
                                existingDetail.Quantity += qty;
                            }
                            else
                            {
                                _context.BookingServiceDetails.Add(new BookingServiceDetail
                                {
                                    BookingId = booking.Id,
                                    ServiceId = service.Id,
                                    Quantity = qty,
                                    SnapshotUnitPrice = service.UnitPrice,
                                    IsIncurred = true,
                                    PaymentStatus = "Unpaid"
                                });
                            }

                            _context.BookingLogs.Add(new BookingLog
                            {
                                BookingId = booking.Id,
                                UserFullName = req.User?.FullName ?? "Hệ thống",
                                ActionDescription = $"Đồng bộ dịch vụ phát sinh từ yêu cầu hỗ trợ (ID: {req.Id}): {service.ServiceName} (Số lượng: {qty}).",
                                Timestamp = TimeHelper.GetVietnamTime()
                            });
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new CustomerRequestDto
            {
                Id = req.Id,
                Type = req.RequestType,
                Title = req.Title,
                Detail = req.Detail ?? string.Empty,
                RoomName = !string.IsNullOrEmpty(req.RoomName) 
                    ? req.RoomName 
                    : (req.Booking != null && req.Booking.SpaceAsset != null ? req.Booking.SpaceAsset.AssetName : "Phòng"),
                CustomerName = req.User?.FullName ?? "Khách hàng",
                Status = req.RequestStatus,
                ResolvedNote = req.ResolvedNote,
                CreatedAt = req.CreatedAt
            });
        }
    }
}
