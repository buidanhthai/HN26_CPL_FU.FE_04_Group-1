using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Entities;
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
                // Fallback to User 3 (Alice) or User 4 (Bob) if unauthenticated in dev
                userId = 3;
            }

            var requests = await _context.CustomerRequests
                .Include(r => r.User)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new CustomerRequestDto
                {
                    Id = r.Id,
                    Type = r.RequestType,
                    Title = r.Title,
                    Detail = r.Detail,
                    RoomName = r.RoomName,
                    CustomerName = r.User != null ? r.User.FullName : "Khách hàng",
                    Status = r.Status,
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
            var requests = await _context.CustomerRequests
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new CustomerRequestDto
                {
                    Id = r.Id,
                    Type = r.RequestType,
                    Title = r.Title,
                    Detail = r.Detail,
                    RoomName = r.RoomName,
                    CustomerName = r.User != null ? r.User.FullName : "Khách hàng",
                    Status = r.Status,
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
                userId = 3; // Default to Alice User in dev mode if token missing
            }

            var userObj = await _context.Users.FindAsync(userId);

            var newReq = new CustomerRequest
            {
                UserId = userId,
                RequestType = dto.Type ?? "SERVICE",
                Title = dto.Title.Trim(),
                Detail = dto.Detail?.Trim() ?? string.Empty,
                RoomName = dto.RoomName.Trim(),
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.CustomerRequests.Add(newReq);
            await _context.SaveChangesAsync();

            return Ok(new CustomerRequestDto
            {
                Id = newReq.Id,
                Type = newReq.RequestType,
                Title = newReq.Title,
                Detail = newReq.Detail,
                RoomName = newReq.RoomName,
                CustomerName = userObj?.FullName ?? "Khách hàng",
                Status = newReq.Status,
                ResolvedNote = newReq.ResolvedNote,
                CreatedAt = newReq.CreatedAt
            });
        }

        // PATCH: api/user-requests/{id} (Staff/Admin updates status and note)
        [HttpPatch("{id}")]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> UpdateRequestStatus(int id, [FromBody] UpdateCustomerRequestDto dto)
        {
            var req = await _context.CustomerRequests.Include(r => r.User).FirstOrDefaultAsync(r => r.Id == id);
            if (req == null)
            {
                return NotFound("Không tìm thấy yêu cầu.");
            }

            if (!string.IsNullOrEmpty(dto.Status))
            {
                req.Status = dto.Status;
            }

            if (dto.ResolvedNote != null)
            {
                req.ResolvedNote = dto.ResolvedNote;
            }

            await _context.SaveChangesAsync();

            return Ok(new CustomerRequestDto
            {
                Id = req.Id,
                Type = req.RequestType,
                Title = req.Title,
                Detail = req.Detail,
                RoomName = req.RoomName,
                CustomerName = req.User?.FullName ?? "Khách hàng",
                Status = req.Status,
                ResolvedNote = req.ResolvedNote,
                CreatedAt = req.CreatedAt
            });
        }
    }
}
