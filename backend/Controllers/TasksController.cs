using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Entities;
using backend.DTOs;
using System.Threading.Tasks;
using System.Linq;
using System;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize(Roles = "STAFF,ADMIN")]
    public partial class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                            ?? User.FindFirst("sub")?.Value;
            return string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);
        }

        private async Task LogActionAsync(int taskId, int userId, string actionDescription)
        {
            var user = await _context.Users.FindAsync(userId);
            var log = new TaskLog
            {
                TaskId = taskId,
                UserFullName = user?.FullName ?? "Hệ thống",
                ActionDescription = actionDescription,
                Timestamp = backend.Helpers.TimeHelper.GetVietnamTime()
            };
            _context.TaskLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        [HttpGet]
        public async Task<IActionResult> GetTasks(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] string? priority,
            [FromQuery] string? category,
            [FromQuery] bool? assignedToMe,
            [FromQuery] string? sortBy,
            [FromQuery] string? sortOrder)
        {
            int currentUserId = GetCurrentUserId();

            var query = _context.InternalTasks
                .Include(t => t.Booking)
                    .ThenInclude(b => b!.SpaceAsset)
                .Include(t => t.SpaceAsset)
                .Include(t => t.TaskLogs)
                .Include(t => t.TaskAllocations)
                    .ThenInclude(a => a.Staff)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(t => t.TaskStatus == status);

            if (!string.IsNullOrEmpty(priority))
                query = query.Where(t => t.Priority == priority);

            if (!string.IsNullOrEmpty(category))
                query = query.Where(t => t.TaskCategory == category);

            if (assignedToMe == true && currentUserId > 0)
                query = query.Where(t => t.TaskAllocations.Any(a => a.StaffId == currentUserId && a.CompletedAt == null));

            if (!string.IsNullOrEmpty(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(t => 
                    (t.TaskDescription != null && t.TaskDescription.ToLower().Contains(lowerSearch)) ||
                    t.TaskCategory.ToLower().Contains(lowerSearch) ||
                    (t.Booking != null && t.Booking.BookingCode.ToLower().Contains(lowerSearch)) ||
                    (t.SpaceAsset != null && (t.SpaceAsset.LocationName.ToLower().Contains(lowerSearch) || t.SpaceAsset.AssetName.ToLower().Contains(lowerSearch))) ||
                    (t.Booking != null && t.Booking.SpaceAsset != null && (t.Booking.SpaceAsset.LocationName.ToLower().Contains(lowerSearch) || t.Booking.SpaceAsset.AssetName.ToLower().Contains(lowerSearch))) ||
                    t.TaskAllocations.Any(a => a.Staff != null && a.Staff.FullName.ToLower().Contains(lowerSearch))
                );
            }

            bool isDesc = string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase);
            if (string.Equals(sortBy, "priority", StringComparison.OrdinalIgnoreCase))
            {
                query = isDesc 
                    ? query.OrderByDescending(t => t.Priority == "URGENT" ? 4 : t.Priority == "HIGH" ? 3 : t.Priority == "MEDIUM" ? 2 : 1)
                    : query.OrderBy(t => t.Priority == "URGENT" ? 4 : t.Priority == "HIGH" ? 3 : t.Priority == "MEDIUM" ? 2 : 1);
            }
            else if (string.Equals(sortBy, "deadline", StringComparison.OrdinalIgnoreCase))
            {
                query = isDesc ? query.OrderByDescending(t => t.Deadline) : query.OrderBy(t => t.Deadline);
            }
            else if (string.Equals(sortBy, "roomNumber", StringComparison.OrdinalIgnoreCase))
            {
                query = isDesc 
                    ? query.OrderByDescending(t => t.SpaceAsset != null ? t.SpaceAsset.AssetName : (t.Booking != null && t.Booking.SpaceAsset != null ? t.Booking.SpaceAsset.AssetName : ""))
                    : query.OrderBy(t => t.SpaceAsset != null ? t.SpaceAsset.AssetName : (t.Booking != null && t.Booking.SpaceAsset != null ? t.Booking.SpaceAsset.AssetName : ""));
            }
            else
            {
                query = isDesc ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt);
            }

            var tasks = await query.Select(t => new TaskDto
            {
                Id = t.Id,
                BookingId = t.BookingId,
                SpaceAssetId = t.SpaceAssetId,
                RoomNumber = t.SpaceAsset != null 
                    ? $"{t.SpaceAsset.LocationName} {t.SpaceAsset.AssetName}" 
                    : (t.Booking != null && t.Booking.SpaceAsset != null ? $"{t.Booking.SpaceAsset.LocationName} {t.Booking.SpaceAsset.AssetName}" : null),
                TaskCategory = t.TaskCategory,
                TaskDescription = t.TaskDescription,
                RequiredStaffCount = t.RequiredStaffCount,
                TaskStatus = t.TaskStatus,
                Priority = t.Priority,
                Deadline = t.Deadline,
                CreatedAt = t.CreatedAt,
                AssignedStaff = t.TaskAllocations
                    .Where(a => a.CompletedAt == null)
                    .Select(a => new AssignedStaffDto
                    {
                        Id = a.StaffId,
                        FullName = a.Staff != null ? a.Staff.FullName : string.Empty,
                        AvatarUrl = null
                    })
                    .FirstOrDefault(),
                TaskLogs = t.TaskLogs.OrderByDescending(l => l.Timestamp).Select(l => new TaskLogDto
                {
                    Id = l.Id,
                    UserFullName = l.UserFullName,
                    ActionDescription = l.ActionDescription,
                    Timestamp = l.Timestamp
                }).ToList()
            }).ToListAsync();

            return Ok(tasks);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
        {
            var task = new InternalTask
            {
                BookingId = dto.BookingId,
                SpaceAssetId = dto.SpaceAssetId,
                TaskCategory = dto.TaskCategory,
                TaskDescription = dto.TaskDescription,
                RequiredStaffCount = dto.RequiredStaffCount,
                Priority = dto.Priority,
                Deadline = dto.Deadline,
                TaskStatus = "Unassigned",
                CreatedAt = backend.Helpers.TimeHelper.GetVietnamTime()
            };

            _context.InternalTasks.Add(task);
            await _context.SaveChangesAsync();

            // Create TaskLog entry
            await LogActionAsync(task.Id, GetCurrentUserId(), $"Nhiệm vụ được tạo thủ công: {task.TaskCategory} - {task.TaskDescription}. Độ ưu tiên: {task.Priority}");

            return Ok(new TaskDto
            {
                Id = task.Id,
                BookingId = task.BookingId,
                SpaceAssetId = task.SpaceAssetId,
                TaskCategory = task.TaskCategory,
                TaskDescription = task.TaskDescription,
                RequiredStaffCount = task.RequiredStaffCount,
                TaskStatus = task.TaskStatus,
                Priority = task.Priority,
                Deadline = task.Deadline,
                CreatedAt = task.CreatedAt,
                TaskLogs = new System.Collections.Generic.List<TaskLogDto>
                {
                    new TaskLogDto
                    {
                        UserFullName = (await _context.Users.FindAsync(GetCurrentUserId()))?.FullName ?? "Hệ thống",
                        ActionDescription = $"Nhiệm vụ được tạo thủ công: {task.TaskCategory} - {task.TaskDescription}. Độ ưu tiên: {task.Priority}",
                        Timestamp = task.CreatedAt
                    }
                }
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
        {
            var task = await _context.InternalTasks
                .Include(t => t.TaskLogs)
                .FirstOrDefaultAsync(t => t.Id == id);
            if (task == null) return NotFound();

            if (dto.TaskCategory != null) task.TaskCategory = dto.TaskCategory;
            if (dto.TaskDescription != null) task.TaskDescription = dto.TaskDescription;
            if (dto.RequiredStaffCount.HasValue) task.RequiredStaffCount = dto.RequiredStaffCount.Value;
            if (dto.TaskStatus != null) task.TaskStatus = dto.TaskStatus;
            if (dto.Priority != null) task.Priority = dto.Priority;
            if (dto.Deadline.HasValue) task.Deadline = dto.Deadline;
            if (dto.SpaceAssetId.HasValue) task.SpaceAssetId = dto.SpaceAssetId;

            await _context.SaveChangesAsync();

            // Create TaskLog entry
            await LogActionAsync(task.Id, GetCurrentUserId(), "Nhiệm vụ được chỉnh sửa thông tin.");

            return Ok(new TaskDto
            {
                Id = task.Id,
                BookingId = task.BookingId,
                SpaceAssetId = task.SpaceAssetId,
                TaskCategory = task.TaskCategory,
                TaskDescription = task.TaskDescription,
                RequiredStaffCount = task.RequiredStaffCount,
                TaskStatus = task.TaskStatus,
                Priority = task.Priority,
                Deadline = task.Deadline,
                CreatedAt = task.CreatedAt,
                TaskLogs = task.TaskLogs.OrderByDescending(l => l.Timestamp).Select(l => new TaskLogDto
                {
                    Id = l.Id,
                    UserFullName = l.UserFullName,
                    ActionDescription = l.ActionDescription,
                    Timestamp = l.Timestamp
                }).ToList()
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.InternalTasks.FindAsync(id);
            if (task != null)
            {
                _context.InternalTasks.Remove(task);
                await _context.SaveChangesAsync();
            }
            return NoContent();
        }
    }
}
