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
        [HttpPost]
        [Authorize(Roles = "USER,ADMIN,STAFF")]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var startLocal = dto.StartTime;
            var endLocal = dto.EndTime;
            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();

            if (endLocal <= startLocal)
            {
                return BadRequest(new { message = "Thời gian kết thúc phải lớn hơn thời gian bắt đầu." });
            }

            bool isUser = string.Equals(userRole, "USER", StringComparison.OrdinalIgnoreCase);
            if (isUser)
            {
                if (startLocal < nowLocal.AddMinutes(30))
                {
                    return BadRequest(new { message = "Khách hàng chỉ được phép đặt phòng trước ít nhất 30 phút so với hiện tại." });
                }
            }
            else
            {
                if (startLocal < nowLocal)
                {
                    return BadRequest(new { message = "Thời gian bắt đầu không được ở trong quá khứ." });
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "SELECT 1 FROM [Space_Asset] WITH (UPDLOCK, ROWLOCK) WHERE [Id] = {0}", dto.AssetId);

                var asset = await _context.SpaceAssets.FindAsync(dto.AssetId);
                if (asset == null) return NotFound(new { message = "Không tìm thấy không gian." });
                if (!asset.IsActive || asset.IsMaintenance)
                {
                    return BadRequest(new { message = "Không gian đang tạm khóa hoặc trong thời gian bảo trì." });
                }

                var layout = await _context.RoomLayouts.FindAsync(dto.LayoutId);
                int setupMinutes = layout != null ? layout.SetupDurationMinutes : 0;
                
                DateTime realStartTime = startLocal.AddMinutes(-setupMinutes);
                DateTime realEndTime = endLocal;

                // Kiểm tra lịch bảo trì định kỳ
                var isMaintenanceConflict = await _context.AssetUnavailabilities
                    .AnyAsync(u => u.AssetId == dto.AssetId && 
                                   realStartTime < u.EndTime && 
                                   u.StartTime < realEndTime);

                if (isMaintenanceConflict)
                {
                    return BadRequest(new { message = "Không gian này đang trong thời gian bảo trì và sửa chữa." });
                }

                var overlappingBooking = await _context.Bookings
                    .Include(b => b.RoomLayout)
                    .Where(b => b.AssetId == dto.AssetId && b.BookingStatus != "Cancelled")
                    .Where(b => !(b.BookingStatus == "Awaiting_Payment" && b.PaymentDeadline.HasValue && b.PaymentDeadline.Value < nowLocal))
                    .Where(b => 
                        (realStartTime < b.EndTime) && 
                        (b.StartTime.AddMinutes(-b.RoomLayout!.SetupDurationMinutes) < realEndTime)
                    )
                    .FirstOrDefaultAsync();

                if (overlappingBooking != null)
                {
                    return Conflict(new { message = "Khung giờ này đã có người đặt hoặc đang trong thời gian chuẩn bị phòng. Vui lòng chọn giờ khác." });
                }

                var isStaffOrAdmin = userRole == "ADMIN" || userRole == "STAFF";
                
                var dateStr = backend.Helpers.TimeHelper.GetVietnamTime().ToString("yyMMdd");
                var randomSuffix = new Random().Next(1000, 9999).ToString();
                var bookingCode = $"BK-{dateStr}-{randomSuffix}";

                var booking = new Booking
                {
                    UserId = (dto.UserId > 0) ? dto.UserId : (userRole == "USER" ? currentUserId : 3),
                    AssetId = dto.AssetId,
                    LayoutId = dto.LayoutId,
                    StartTime = startLocal,
                    EndTime = endLocal,
                    CustomSetupNote = dto.CustomSetupNote,
                    SnapshotBasePrice = dto.SnapshotBasePrice,
                    SnapshotPriceModifier = dto.SnapshotPriceModifier,
                    BookingStatus = "Awaiting_Payment",
                    BookingCode = bookingCode,
                    PaymentDeadline = nowLocal.AddMinutes(10),
                    CustomerName = isStaffOrAdmin ? dto.CustomerName : null,
                    CustomerPhone = isStaffOrAdmin ? dto.CustomerPhone : null,
                    CreatedByUserId = isStaffOrAdmin ? currentUserId : null
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                await LogActionAsync(booking.Id, currentUserId > 0 ? currentUserId : dto.UserId, "Đã tạo đơn đặt chỗ.");

                await transaction.CommitAsync();

                return Ok(new BookingDto
                {
                    Id = booking.Id,
                    UserId = booking.UserId,
                    AssetId = booking.AssetId,
                    LayoutId = booking.LayoutId,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    BookingStatus = booking.BookingStatus,
                    CustomerName = booking.CustomerName,
                    CustomerPhone = booking.CustomerPhone,
                    CreatedByUserId = booking.CreatedByUserId,
                    BookingCode = booking.BookingCode,
                    PaymentDeadline = booking.PaymentDeadline,
                    SnapshotBasePrice = booking.SnapshotBasePrice,
                    SnapshotPriceModifier = booking.SnapshotPriceModifier,
                    CreatedAt = booking.CreatedAt
                });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        [HttpPost("calculate-estimate")]
        [AllowAnonymous]
        public async Task<IActionResult> CalculateEstimate([FromBody] CalculateEstimateDto dto)
        {
            var asset = await _context.SpaceAssets.FindAsync(dto.AssetId);
            if (asset == null) return NotFound(new { message = "Không tìm thấy không gian." });

            decimal basePrice = asset.BasePrice;
            decimal priceModifier = 0;

            if (dto.LayoutId > 0)
            {
                var layout = await _context.RoomLayouts.FindAsync(dto.LayoutId);
                if (layout != null)
                {
                    priceModifier = layout.PriceModifier;
                }
            }

            decimal spaceCost = (basePrice + priceModifier) * dto.Duration;
            decimal addonsCost = 0;

            if (dto.SelectedAddonQuantities != null && dto.SelectedAddonQuantities.Any())
            {
                var serviceIds = dto.SelectedAddonQuantities.Select(q => q.ServiceId).ToList();
                var services = await _context.AddOnServices
                    .Where(s => serviceIds.Contains(s.Id) && s.IsAvailable)
                    .ToListAsync();

                foreach (var item in dto.SelectedAddonQuantities)
                {
                    var service = services.FirstOrDefault(s => s.Id == item.ServiceId);
                    if (service == null) continue;

                    int quantity = item.Quantity > 0 ? item.Quantity : 1;

                    if (service.ChargeMethod == "By_Hour")
                    {
                        addonsCost += service.UnitPrice * dto.Duration * quantity;
                    }
                    else
                    {
                        addonsCost += service.UnitPrice * quantity;
                    }
                }
            }
            else if (dto.SelectedAddonIds != null && dto.SelectedAddonIds.Any())
            {
                var services = await _context.AddOnServices
                    .Where(s => dto.SelectedAddonIds.Contains(s.Id) && s.IsAvailable)
                    .ToListAsync();

                foreach (var serviceId in dto.SelectedAddonIds)
                {
                    var service = services.FirstOrDefault(s => s.Id == serviceId);
                    if (service == null) continue;

                    if (service.ChargeMethod == "By_Hour")
                    {
                        addonsCost += service.UnitPrice * dto.Duration;
                    }
                    else
                    {
                        addonsCost += service.UnitPrice;
                    }
                }
            }

            return Ok(new EstimateResultDto
            {
                SpaceCost = spaceCost,
                AddonsCost = addonsCost,
                TotalAmount = spaceCost + addonsCost
            });
        }
    }
}
