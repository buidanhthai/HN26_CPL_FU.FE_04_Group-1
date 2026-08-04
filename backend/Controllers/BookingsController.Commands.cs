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

        [HttpPut("{id}/pay")]
        public async Task<IActionResult> ConfirmPayment(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Awaiting_Payment")
            {
                return BadRequest(new { message = "Đơn đặt chỗ này đã được thanh toán hoặc đã hủy." });
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            booking.BookingStatus = "Confirmed";
            booking.PaymentDeadline = null;

            var existingUpfrontInvoice = await _context.Invoices
                .FirstOrDefaultAsync(i => i.BookingId == id && i.InvoiceType == "Upfront");

            if (existingUpfrontInvoice == null)
            {
                var upfrontTotal = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
                var upfrontInvoice = new Invoice
                {
                    BookingId = booking.Id,
                    TotalAmount = upfrontTotal,
                    PaidUpfront = upfrontTotal,
                    FinalDue = 0,
                    InvoiceType = "Upfront",
                    PaymentStatus = "Paid",
                    CreatedAt = backend.Helpers.TimeHelper.GetVietnamTime()
                };
                _context.Invoices.Add(upfrontInvoice);
            }
            else
            {
                existingUpfrontInvoice.PaymentStatus = "Paid";
                existingUpfrontInvoice.PaidUpfront = existingUpfrontInvoice.TotalAmount;
                existingUpfrontInvoice.FinalDue = 0;
            }

            var existingSetupTask = await _context.InternalTasks
                .FirstOrDefaultAsync(t => t.BookingId == id && t.TaskCategory == "LOGISTICS");

            if (existingSetupTask == null)
            {
                var setupTask = new InternalTask
                {
                    BookingId = booking.Id,
                    TaskCategory = "LOGISTICS",
                    TaskDescription = $"Bố trí phòng theo sơ đồ {booking.LayoutId} cho Booking {booking.BookingCode}",
                    RequiredStaffCount = 1,
                    TaskStatus = "Unassigned",
                    CreatedAt = backend.Helpers.TimeHelper.GetVietnamTime()
                };
                _context.InternalTasks.Add(setupTask);
            }

            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, userId, "Đã xác nhận thanh toán đặt trước.");
            return Ok(new { message = "Thanh toán giả lập thành công. Trạng thái đã chuyển sang Confirmed." });
        }

        [HttpPost("{id}/check-in")]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> CheckinBooking(int id, [FromQuery] bool forceByAdmin = false)
        {
            var eligibility = await EvaluateCheckInEligibilityAsync(id);

            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            bool isStaffOrAdmin = string.Equals(userRole, "ADMIN", System.StringComparison.OrdinalIgnoreCase) || string.Equals(userRole, "STAFF", System.StringComparison.OrdinalIgnoreCase);

            bool bypassEnabled = false;
            if (!eligibility.CanCheckIn && isStaffOrAdmin && (forceByAdmin || eligibility.ReasonCode == "TOO_EARLY" || eligibility.ReasonCode == "TASK_NOT_COMPLETED"))
            {
                bypassEnabled = true;
            }

            if (!eligibility.CanCheckIn && !bypassEnabled)
            {
                return BadRequest(eligibility);
            }

            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            booking.BookingStatus = "Checked_In";
            booking.CheckedInAt = nowLocal;

            if (bypassEnabled)
            {
                booking.CheckedInByAdminId = currentUserId;
                await LogActionAsync(booking.Id, currentUserId, "Admin đã duyệt đặc cách check-in sớm trước giờ.");
            }
            else
            {
                await LogActionAsync(booking.Id, currentUserId, "Đã hoàn tất xác nhận Check-in.");
            }

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Check-in thành công.", 
                bookingStatus = booking.BookingStatus,
                checkedInAt = booking.CheckedInAt
            });
        }

        [HttpPost("{id}/services")]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> AddIncurredServices(int id, [FromBody] AddIncurredServicesDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingServiceDetails)
                .FirstOrDefaultAsync(b => b.Id == id);
            
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Checked_In")
            {
                return BadRequest(new { message = "Chỉ có thể thêm dịch vụ phát sinh khi phòng đang được sử dụng (Checked_In)." });
            }

            foreach (var item in dto.Services)
            {
                var service = await _context.AddOnServices.FindAsync(item.ServiceId);
                if (service == null) continue;

                var existingDetail = booking.BookingServiceDetails
                    .FirstOrDefault(sd => sd.ServiceId == item.ServiceId && sd.IsIncurred);

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
                        IsIncurred = true,
                        PaymentStatus = "Unpaid"
                    };
                    _context.BookingServiceDetails.Add(newDetail);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã cập nhật dịch vụ phát sinh thành công." });
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Cancelled")
            {
                return BadRequest(new { message = "Chỉ được phép xóa các đơn đặt chỗ đã bị hủy do chưa thanh toán đặt trước." });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            bool isStaffOrAdmin = string.Equals(userRole, "STAFF", StringComparison.OrdinalIgnoreCase) || 
                                   string.Equals(userRole, "ADMIN", StringComparison.OrdinalIgnoreCase);

            if (!isStaffOrAdmin && booking.UserId != userId)
            {
                return Forbid();
            }

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: /api/bookings/{id}/arrive (Báo có mặt)
        [HttpPost("{id}/arrive")]
        public async Task<IActionResult> ArriveBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Confirmed")
            {
                return BadRequest(new { message = "Chỉ có thể báo có mặt cho đặt chỗ đã xác nhận (Confirmed)." });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER" && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            booking.Arrived = true;
            await _context.SaveChangesAsync();

            await LogActionAsync(booking.Id, currentUserId > 0 ? currentUserId : booking.UserId, "Khách hàng báo đã có mặt tại quầy.");
            return Ok(new { message = "Đã ghi nhận có mặt. Lịch hẹn của bạn sẽ không bị tự động hủy No-Show." });
        }

        // POST: /api/bookings/{id}/cancel (Hủy đặt chỗ và tự động hoàn cọc)
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id, [FromBody] CancelBookingDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.Invoices)
                .FirstOrDefaultAsync(b => b.Id == id);
            
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Awaiting_Payment" && booking.BookingStatus != "Confirmed")
            {
                return BadRequest(new { message = "Không thể hủy đặt chỗ ở trạng thái hiện tại." });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER" && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
            decimal refundRate = 0.0m;
            
            if (booking.BookingStatus == "Confirmed")
            {
                double hoursToStart = (booking.StartTime - nowLocal).TotalHours;

                if (hoursToStart >= 24.0)
                {
                    refundRate = 1.0m;
                }
                else if (hoursToStart >= 4.0)
                {
                    refundRate = 0.5m;
                }
                else
                {
                    refundRate = 0.0m;
                }
            }
            else // Awaiting_Payment -> Hủy thì hoàn 0đ (chưa thanh toán)
            {
                refundRate = 0.0m;
            }

            decimal totalPaid = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
            booking.RefundAmount = totalPaid * refundRate;
            booking.CancellationReason = dto.CancellationReason;
            booking.BookingStatus = "Cancelled";
            booking.PaymentDeadline = null;

            // Đổi trạng thái hóa đơn liên quan sang Cancelled hoặc hoàn trả
            var upfrontInvoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Upfront");
            if (upfrontInvoice != null)
            {
                upfrontInvoice.PaymentStatus = "Cancelled";
            }

            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, currentUserId > 0 ? currentUserId : booking.UserId, $"Đã hủy đặt chỗ. Hoàn cọc: {booking.RefundAmount:N0}đ (Tỷ lệ: {refundRate * 100}%). Lý do: {dto.CancellationReason}");

            return Ok(new { 
                message = "Hủy đặt chỗ thành công.", 
                bookingStatus = booking.BookingStatus, 
                refundAmount = booking.RefundAmount 
            });
        }

        // POST: /api/bookings/{id}/extend (Gia hạn phòng - Serializable Lock)
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

        // POST: /api/bookings/{id}/force-checkout (Cưỡng chế checkout)
        [HttpPost("{id}/force-checkout")]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> ForceCheckout(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingServiceDetails)
                .Include(b => b.Invoices)
                .Include(b => b.SpaceAsset)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Checked_In" && booking.BookingStatus != "Awaiting_Checkout")
            {
                return BadRequest(new { message = "Chỉ có thể cưỡng chế checkout phòng đang sử dụng hoặc chờ checkout." });
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
            booking.ActualEndTime = nowLocal;
            booking.BookingStatus = "Checked_Out";

            // Tính toán phụ thu trễ giờ phạt 1.5x tại BE
            decimal overtimeFee = CalculateOvertimeFee(booking, nowLocal);

            var invoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Final");
            decimal incurredTotal = booking.BookingServiceDetails
                .Where(s => s.IsIncurred && s.PaymentStatus == "Unpaid")
                .Sum(s => s.SnapshotUnitPrice * s.Quantity);
            decimal upfrontTotal = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;

            if (invoice == null)
            {
                invoice = new Invoice
                {
                    BookingId = booking.Id,
                    TotalAmount = upfrontTotal + incurredTotal + overtimeFee,
                    PaidUpfront = upfrontTotal,
                    FinalDue = incurredTotal + overtimeFee,
                    InvoiceType = "Final",
                    PaymentStatus = "Unpaid" // Force checkout luôn đẩy công nợ sang dạng nợ
                };
                _context.Invoices.Add(invoice);
            }
            else
            {
                invoice.TotalAmount = upfrontTotal + incurredTotal + overtimeFee;
                invoice.FinalDue = incurredTotal + overtimeFee;
                invoice.PaymentStatus = "Unpaid";
            }

            // Tạo task dọn dẹp vệ sinh phòng
            var cleanupTask = new InternalTask
            {
                BookingId = booking.Id,
                TaskCategory = "CLEANING",
                TaskDescription = $"[CƯỠNG CHẾ CHECKOUT] Dọn dẹp phòng sau khi Booking #{booking.BookingCode} cưỡng chế checkout",
                RequiredStaffCount = 1,
                TaskStatus = "Unassigned",
                CreatedAt = nowLocal
            };
            _context.InternalTasks.Add(cleanupTask);

            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, currentUserId, $"Đã thực hiện Cưỡng chế Checkout phòng họp và ghi nhận hóa đơn nợ: {invoice.FinalDue:N0}đ.");

            return Ok(new { message = "Cưỡng chế checkout thành công, phòng đã được giải phóng.", finalDue = invoice.FinalDue });
        }
    }
}
