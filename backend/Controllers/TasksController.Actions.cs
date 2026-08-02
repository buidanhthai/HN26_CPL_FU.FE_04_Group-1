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
    public partial class TasksController : ControllerBase
    {
        [HttpPost("{id}/claim")]
        public async Task<IActionResult> ClaimTask(int id)
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                            ?? User.FindFirst("sub")?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var task = await _context.InternalTasks
                    .Include(t => t.TaskAllocations)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (task == null) return NotFound();

                if (task.TaskStatus != "Unassigned")
                {
                    var existingAllocation = task.TaskAllocations.FirstOrDefault(a => a.CompletedAt == null);
                    var staffName = existingAllocation != null 
                        ? (await _context.Users.FindAsync(existingAllocation.StaffId))?.FullName 
                        : "nhân viên khác";
                    return Conflict(new { message = $"Nhiệm vụ này đã được nhận bởi {staffName}." });
                }

                task.TaskStatus = "In_Progress";
                var allocation = new TaskAllocation
                {
                    TaskId = id,
                    StaffId = currentUserId,
                    JoinedAt = backend.Helpers.TimeHelper.GetVietnamTime()
                };
                _context.TaskAllocations.Add(allocation);
                await _context.SaveChangesAsync();

                // Log task claim action
                var userObj = await _context.Users.FindAsync(currentUserId);
                var staffNameStr = userObj?.FullName ?? "Staff";
                var log = new TaskLog
                {
                    TaskId = task.Id,
                    UserFullName = staffNameStr,
                    ActionDescription = $"Nhân viên {staffNameStr} đã nhận nhiệm vụ.",
                    Timestamp = backend.Helpers.TimeHelper.GetVietnamTime()
                };
                _context.TaskLogs.Add(log);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { message = "Nhận việc thành công." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> CompleteTask(int id, [FromBody] CompleteTaskDto dto)
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                            ?? User.FindFirst("sub")?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var task = await _context.InternalTasks
                .Include(t => t.TaskAllocations)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound();

            task.TaskStatus = "Completed";

            var allocation = task.TaskAllocations.FirstOrDefault(a => a.StaffId == currentUserId && a.CompletedAt == null);
            if (allocation != null)
            {
                allocation.CompletedAt = backend.Helpers.TimeHelper.GetVietnamTime();
                allocation.CompletionNote = dto.CompletionNote;
                allocation.EvidenceImageUrl = dto.EvidenceImageUrl;
            }
            else
            {
                var newAllocation = new TaskAllocation
                {
                    TaskId = id,
                    StaffId = currentUserId,
                    JoinedAt = backend.Helpers.TimeHelper.GetVietnamTime(),
                    CompletedAt = backend.Helpers.TimeHelper.GetVietnamTime(),
                    CompletionNote = dto.CompletionNote,
                    EvidenceImageUrl = dto.EvidenceImageUrl
                };
                _context.TaskAllocations.Add(newAllocation);
            }

            await _context.SaveChangesAsync();

            // Log task completion action
            var userObj = await _context.Users.FindAsync(currentUserId);
            var staffNameStr = userObj?.FullName ?? "Staff";
            var log = new TaskLog
            {
                TaskId = task.Id,
                UserFullName = staffNameStr,
                ActionDescription = $"Nhiệm vụ đã hoàn thành. Ghi chú nghiệm thu: {dto.CompletionNote ?? "N/A"}",
                Timestamp = backend.Helpers.TimeHelper.GetVietnamTime()
            };
            _context.TaskLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Nhiệm vụ đã hoàn thành." });
        }

        [HttpPost("{id}/assign")]
        public async Task<IActionResult> AssignTask(int id, [FromBody] int staffId)
        {
            var task = await _context.InternalTasks
                .Include(t => t.TaskAllocations)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound();

            if (task.TaskStatus == "Completed")
            {
                return BadRequest(new { message = "Nhiệm vụ đã hoàn thành không thể phân công lại." });
            }

            task.TaskStatus = "In_Progress";
            
            foreach (var activeAlloc in task.TaskAllocations.Where(a => a.CompletedAt == null))
            {
                activeAlloc.CompletedAt = backend.Helpers.TimeHelper.GetVietnamTime();
                activeAlloc.CompletionNote = "Được chuyển sang nhân viên khác";
            }

            var allocation = new TaskAllocation
            {
                TaskId = id,
                StaffId = staffId,
                JoinedAt = backend.Helpers.TimeHelper.GetVietnamTime()
            };
            _context.TaskAllocations.Add(allocation);
            await _context.SaveChangesAsync();

            // Log task assignment action
            var assignedStaffObj = await _context.Users.FindAsync(staffId);
            var assignedStaffName = assignedStaffObj?.FullName ?? "Staff";
            var log = new TaskLog
            {
                TaskId = task.Id,
                UserFullName = "Hệ thống/Admin",
                ActionDescription = $"Đã giao nhiệm vụ cho nhân viên {assignedStaffName}.",
                Timestamp = backend.Helpers.TimeHelper.GetVietnamTime()
            };
            _context.TaskLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Giao việc thành công." });
        }

        [HttpPost("{id}/unassign")]
        public async Task<IActionResult> UnassignTask(int id)
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                            ?? User.FindFirst("sub")?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var task = await _context.InternalTasks
                .Include(t => t.TaskAllocations)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound();

            task.TaskStatus = "Unassigned";

            var activeAllocs = task.TaskAllocations.Where(a => a.CompletedAt == null).ToList();
            if (activeAllocs.Any())
            {
                _context.TaskAllocations.RemoveRange(activeAllocs);
            }

            await _context.SaveChangesAsync();

            // Log task unassignment action
            var userObj = await _context.Users.FindAsync(currentUserId);
            var staffNameStr = userObj?.FullName ?? "Staff";
            var log = new TaskLog
            {
                TaskId = task.Id,
                UserFullName = staffNameStr,
                ActionDescription = "Đã trả nhiệm vụ về bể công việc chung.",
                Timestamp = backend.Helpers.TimeHelper.GetVietnamTime()
            };
            _context.TaskLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã trả nhiệm vụ về bể công việc chung." });
        }
    }
}
