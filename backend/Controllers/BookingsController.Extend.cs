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
        [HttpPost("{id}/extend")]
        public async Task<IActionResult> ExtendBooking(int id, [FromBody] ExtendBookingDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.RoomLayout)
                .FirstOrDefaultAsync(b => b.Id == id);
            
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Checked_In")
            {
                return BadRequest(new { message = "Chỉ có thể gia hạn khi đang sử dụng phòng (Checked_In)." });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER" && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
            var newEndTime = booking.EndTime.AddMinutes(dto.Minutes);

            if (newEndTime <= booking.EndTime)
            {
                return BadRequest(new { message = "Thời gian kết thúc mới phải lớn hơn thời gian hiện tại." });
            }

            using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            try
            {
                // Khóa phòng họp vật lý chống trùng lịch đồng thời
                await _context.Database.ExecuteSqlRawAsync(
                    "SELECT 1 FROM [Space_Asset] WITH (UPDLOCK, ROWLOCK) WHERE [Id] = {0}", booking.AssetId);

                // Kiểm tra xem dải giờ sau [booking.EndTime, newEndTime] có bị trùng lịch khác không
                var overlappingBooking = await _context.Bookings
                    .Include(b => b.RoomLayout)
                    .Where(b => b.AssetId == booking.AssetId && b.Id != booking.Id && b.BookingStatus != "Cancelled")
                    .Where(b => !(b.BookingStatus == "Awaiting_Payment" && b.PaymentDeadline.HasValue && b.PaymentDeadline.Value < nowLocal))
                    .Where(b => 
                        (booking.EndTime < b.EndTime) && 
                        (b.StartTime.AddMinutes(-b.RoomLayout!.SetupDurationMinutes) < newEndTime)
                    )
                    .FirstOrDefaultAsync();

                if (overlappingBooking != null)
                {
                    return Conflict(new { message = "Khung giờ kế tiếp đã được đặt hoặc đang trong thời gian chuẩn bị phòng. Vui lòng chọn thời gian khác." });
                }

                // Gia hạn giờ kết thúc
                booking.EndTime = newEndTime;

                await _context.SaveChangesAsync();
                await LogActionAsync(booking.Id, currentUserId > 0 ? currentUserId : booking.UserId, $"Đã gia hạn thêm {dto.Minutes} phút sử dụng phòng. Giờ kết thúc mới: {booking.EndTime:HH:mm}");

                await transaction.CommitAsync();

                return Ok(new { message = "Gia hạn sử dụng phòng thành công.", newEndTime = booking.EndTime });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // POST: /api/bookings/{id}/switch-asset (Chuyển phòng họp - Serializable Lock)
        [HttpPost("{id}/switch-asset")]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> SwitchAsset(int id, [FromBody] SwitchRoomDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.RoomLayout)
                .Include(b => b.BookingServiceDetails)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Checked_In")
            {
                return BadRequest(new { message = "Chỉ có thể chuyển phòng khi đang sử dụng phòng (Checked_In)." });
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();

            using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            try
            {
                // Khóa phòng họp mới
                await _context.Database.ExecuteSqlRawAsync(
                    "SELECT 1 FROM [Space_Asset] WITH (UPDLOCK, ROWLOCK) WHERE [Id] = {0}", dto.NewAssetId);

                var newAsset = await _context.SpaceAssets.FindAsync(dto.NewAssetId);
                if (newAsset == null) return NotFound(new { message = "Phòng họp mới không tìm thấy." });
                if (!newAsset.IsActive || newAsset.IsMaintenance) return BadRequest(new { message = "Phòng họp mới đang tạm khóa hoặc bảo trì." });

                var newLayout = await _context.RoomLayouts.FindAsync(dto.NewLayoutId);
                if (newLayout == null) return NotFound(new { message = "Sơ đồ layout mới không tìm thấy." });

                // Kiểm tra xem phòng mới có trống trong khoảng thời gian [nowLocal, booking.EndTime] không
                var overlappingBooking = await _context.Bookings
                    .Include(b => b.RoomLayout)
                    .Where(b => b.AssetId == dto.NewAssetId && b.BookingStatus != "Cancelled")
                    .Where(b => !(b.BookingStatus == "Awaiting_Payment" && b.PaymentDeadline.HasValue && b.PaymentDeadline.Value < nowLocal))
                    .Where(b => 
                        (nowLocal < b.EndTime) && 
                        (b.StartTime.AddMinutes(-b.RoomLayout!.SetupDurationMinutes) < booking.EndTime)
                    )
                    .FirstOrDefaultAsync();

                if (overlappingBooking != null)
                {
                    return Conflict(new { message = "Phòng họp mới đã có người đặt hoặc đang chuẩn bị phòng trong khoảng thời gian này." });
                }

                // Thực hiện Chuyển phòng:
                // 1. Đóng đơn hiện tại ở thời điểm thực tế, tính chi phí pro-rata
                var originalEndTime = booking.EndTime;
                var totalOriginalMinutes = (originalEndTime - booking.StartTime).TotalMinutes;
                var minutesUsed = Math.Max(0, (nowLocal - booking.StartTime).TotalMinutes);
                
                decimal proRataRate = totalOriginalMinutes > 0 ? (decimal)(minutesUsed / totalOriginalMinutes) : 0m;
                proRataRate = Math.Min(1.0m, proRataRate);

                booking.EndTime = nowLocal;
                booking.ActualEndTime = nowLocal;
                booking.BookingStatus = "Checked_Out";
                booking.SnapshotBasePrice = Math.Round(booking.SnapshotBasePrice * proRataRate, 0);
                booking.SnapshotPriceModifier = Math.Round(booking.SnapshotPriceModifier * proRataRate, 0);

                // Auto Clean Task cho phòng cũ
                var cleanupOldTask = new InternalTask
                {
                    BookingId = booking.Id,
                    TaskCategory = "CLEANING",
                    TaskDescription = $"Dọn dẹp phòng cũ sau khi khách chuyển sang phòng mới (Booking #{booking.BookingCode})",
                    RequiredStaffCount = 1,
                    TaskStatus = "Unassigned",
                    CreatedAt = nowLocal
                };
                _context.InternalTasks.Add(cleanupOldTask);

                // 2. Tạo đơn mới cho phòng mới
                var dateStr = nowLocal.ToString("yyMMdd");
                var randomSuffix = new Random().Next(1000, 9999).ToString();
                var newBookingCode = $"BK-{dateStr}-{randomSuffix}-SW";

                var newBooking = new Booking
                {
                    UserId = booking.UserId,
                    AssetId = dto.NewAssetId,
                    LayoutId = dto.NewLayoutId,
                    StartTime = nowLocal,
                    EndTime = originalEndTime,
                    BookingStatus = "Checked_In",
                    BookingCode = newBookingCode,
                    SnapshotBasePrice = newAsset.BasePrice,
                    SnapshotPriceModifier = newLayout.PriceModifier,
                    Arrived = true,
                    CheckedInAt = nowLocal,
                    CustomerName = booking.CustomerName,
                    CustomerPhone = booking.CustomerPhone,
                    CreatedByUserId = currentUserId
                };
                _context.Bookings.Add(newBooking);
                await _context.SaveChangesAsync();

                // Chuyển toàn bộ các dịch vụ chưa sử dụng hoặc dịch vụ kèm theo chưa thanh toán sang đơn mới
                foreach (var sd in booking.BookingServiceDetails.ToList())
                {
                    if (sd.PaymentStatus == "Unpaid")
                    {
                        var newSd = new BookingServiceDetail
                        {
                            BookingId = newBooking.Id,
                            ServiceId = sd.ServiceId,
                            Quantity = sd.Quantity,
                            SnapshotUnitPrice = sd.SnapshotUnitPrice,
                            IsIncurred = sd.IsIncurred,
                            PaymentStatus = sd.PaymentStatus
                        };
                        _context.BookingServiceDetails.Add(newSd);
                        _context.BookingServiceDetails.Remove(sd);
                    }
                }

                await _context.SaveChangesAsync();

                await LogActionAsync(booking.Id, currentUserId, $"Đã chuyển phòng thành công sang phòng {newAsset.AssetName} (Đơn mới: #{newBooking.Id}).");
                await LogActionAsync(newBooking.Id, currentUserId, $"Đơn được tạo do chuyển phòng từ đơn #{booking.Id}.");

                await transaction.CommitAsync();

                return Ok(new { message = "Chuyển phòng thành công.", oldBookingId = booking.Id, newBookingId = newBooking.Id });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
