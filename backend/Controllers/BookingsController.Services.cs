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
        [HttpPost("{id}/services")]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> AddIncurredServices(int id, [FromBody] AddIncurredServicesDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingServiceDetails)
                    .ThenInclude(sd => sd.AddOnService)
                .Include(b => b.SpaceAsset)
                .FirstOrDefaultAsync(b => b.Id == id);
            
            if (booking == null) return NotFound();

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            bool isUser = string.Equals(userRole, "USER", StringComparison.OrdinalIgnoreCase);
            if (isUser && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            if (booking.BookingStatus != "Awaiting_Payment" && booking.BookingStatus != "Checked_In")
            {
                return BadRequest(new { message = "Chỉ có thể thêm dịch vụ khi đơn đặt chỗ đang chờ thanh toán hoặc đang sử dụng." });
            }

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
            bool isIncurred = booking.BookingStatus == "Checked_In";

            foreach (var item in dto.Services)
            {
                var service = await _context.AddOnServices.FindAsync(item.ServiceId);
                if (service == null) continue;

                var existingDetail = booking.BookingServiceDetails
                    .FirstOrDefault(sd => sd.ServiceId == item.ServiceId && sd.IsIncurred == isIncurred);

                if (existingDetail != null)
                {
                    existingDetail.Quantity += item.Quantity;
                }
                else
                {
                    var newDetail = new BookingServiceDetail
                    {
                        BookingId = booking.Id,
                        ServiceId = item.ServiceId,
                        Quantity = item.Quantity,
                        SnapshotUnitPrice = service.UnitPrice,
                        IsIncurred = isIncurred,
                        PaymentStatus = "Unpaid"
                    };
                    _context.BookingServiceDetails.Add(newDetail);
                }
            }

            // Tự động đồng bộ và gom nhóm công việc phục vụ dịch vụ cho nhân viên
            await SyncServiceTasksForBookingAsync(booking.Id);

            await _context.SaveChangesAsync();
            string actionType = isIncurred ? "dịch vụ phát sinh" : "dịch vụ đặt trước";
            await LogActionAsync(booking.Id, currentUserId > 0 ? currentUserId : booking.UserId, $"Đã cập nhật {actionType} thành công.");
            
            return Ok(new { message = $"Đã cập nhật {actionType} thành công." });
        }

        private async Task SyncServiceTasksForBookingAsync(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingServiceDetails)
                    .ThenInclude(sd => sd.AddOnService)
                .Include(b => b.SpaceAsset)
                .Include(b => b.RoomLayout)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null) return;

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
            string roomName = booking.SpaceAsset != null 
                ? $"{booking.SpaceAsset.LocationName} {booking.SpaceAsset.AssetName}" 
                : $"Không gian #{booking.AssetId}";

            // Query existing uncompleted tasks for this booking
            var activeTasks = await _context.InternalTasks
                .Where(t => t.BookingId == bookingId && t.TaskStatus != "Completed" && t.TaskStatus != "Forced_Completed")
                .ToListAsync();

            // Group services by category
            var serviceGroup = booking.BookingServiceDetails
                .GroupBy(sd => GetServiceCategory(sd.AddOnService?.ServiceName ?? ""))
                .ToDictionary(g => g.Key, g => g.ToList());

            // 1. F_B Task
            if (serviceGroup.TryGetValue("F_B", out var fbServices) && fbServices.Any())
            {
                string itemsText = CompileServiceItemsText(fbServices);
                string description = $"Chuẩn bị và phục vụ F&B: {itemsText} cho Booking {booking.BookingCode} tại {roomName}.";
                var (priority, deadline) = backend.Helpers.TaskHelper.AssessTaskPriorityAndDeadline(booking, "F_B", nowLocal);

                var fbTask = activeTasks.FirstOrDefault(t => t.TaskCategory == "F_B");
                if (fbTask != null)
                {
                    fbTask.TaskDescription = description;
                    fbTask.Priority = priority;
                    fbTask.Deadline = deadline;
                }
                else
                {
                    fbTask = new InternalTask
                    {
                        BookingId = bookingId,
                        SpaceAssetId = booking.AssetId,
                        TaskCategory = "F_B",
                        TaskDescription = description,
                        RequiredStaffCount = 1,
                        TaskStatus = "Unassigned",
                        Priority = priority,
                        Deadline = deadline,
                        CreatedAt = nowLocal
                    };
                    _context.InternalTasks.Add(fbTask);
                }
            }

            // 2. TECHNICAL Task
            if (serviceGroup.TryGetValue("TECHNICAL", out var techServices) && techServices.Any())
            {
                string itemsText = CompileServiceItemsText(techServices);
                string description = $"Chuẩn bị và bàn giao thiết bị: {itemsText} cho Booking {booking.BookingCode} tại {roomName}.";
                var (priority, deadline) = backend.Helpers.TaskHelper.AssessTaskPriorityAndDeadline(booking, "TECHNICAL", nowLocal);

                var techTask = activeTasks.FirstOrDefault(t => t.TaskCategory == "TECHNICAL");
                if (techTask != null)
                {
                    techTask.TaskDescription = description;
                    techTask.Priority = priority;
                    techTask.Deadline = deadline;
                }
                else
                {
                    techTask = new InternalTask
                    {
                        BookingId = bookingId,
                        SpaceAssetId = booking.AssetId,
                        TaskCategory = "TECHNICAL",
                        TaskDescription = description,
                        RequiredStaffCount = 1,
                        TaskStatus = "Unassigned",
                        Priority = priority,
                        Deadline = deadline,
                        CreatedAt = nowLocal
                    };
                    _context.InternalTasks.Add(techTask);
                }
            }

            // 3. LOGISTICS Task (combines layout setup + logistics services)
            var hasLayout = booking.LayoutId > 0;
            serviceGroup.TryGetValue("LOGISTICS", out var logServices);

            if (hasLayout || (logServices != null && logServices.Any()))
            {
                var logisticsItems = new List<string>();
                if (hasLayout)
                {
                    string layoutName = booking.RoomLayout != null ? booking.RoomLayout.LayoutName : $"Sơ đồ #{booking.LayoutId}";
                    logisticsItems.Add($"Bố trí phòng theo sơ đồ {layoutName}");
                }
                if (logServices != null && logServices.Any())
                {
                    logisticsItems.Add(CompileServiceItemsText(logServices));
                }

                string itemsText = string.Join(", ", logisticsItems);
                string description = $"Bố trí phòng & Logistics: {itemsText} cho Booking {booking.BookingCode} tại {roomName}.";
                var (priority, deadline) = backend.Helpers.TaskHelper.AssessTaskPriorityAndDeadline(booking, "LOGISTICS", nowLocal);

                var logTask = activeTasks.FirstOrDefault(t => t.TaskCategory == "LOGISTICS");
                if (logTask != null)
                {
                    logTask.TaskDescription = description;
                    logTask.Priority = priority;
                    logTask.Deadline = deadline;
                }
                else
                {
                    logTask = new InternalTask
                    {
                        BookingId = bookingId,
                        SpaceAssetId = booking.AssetId,
                        TaskCategory = "LOGISTICS",
                        TaskDescription = description,
                        RequiredStaffCount = 1,
                        TaskStatus = "Unassigned",
                        Priority = priority,
                        Deadline = deadline,
                        CreatedAt = nowLocal
                    };
                    _context.InternalTasks.Add(logTask);
                }
            }
        }

        private string GetServiceCategory(string serviceName)
        {
            string lowerName = (serviceName ?? "").ToLower();
            if (lowerName.Contains("cà phê") || lowerName.Contains("cafe") || lowerName.Contains("bạc xỉu") ||
                lowerName.Contains("trà") || lowerName.Contains("sinh tố") || lowerName.Contains("nước") ||
                lowerName.Contains("bánh") || lowerName.Contains("croissant") || lowerName.Contains("ăn"))
            {
                return "F_B";
            }
            else if (lowerName.Contains("máy chiếu") || lowerName.Contains("projector") || lowerName.Contains("tivi") || 
                     lowerName.Contains("thiết bị") || lowerName.Contains("cáp") || lowerName.Contains("âm thanh") || 
                     lowerName.Contains("mic"))
            {
                return "TECHNICAL";
            }
            return "LOGISTICS";
        }

        private string CompileServiceItemsText(List<BookingServiceDetail> details)
        {
            var parts = new List<string>();
            foreach (var detail in details)
            {
                var name = detail.AddOnService != null ? detail.AddOnService.ServiceName : $"Dịch vụ #{detail.ServiceId}";
                parts.Add($"{detail.Quantity} {name}");
            }
            return string.Join(", ", parts);
        }
    }
}
