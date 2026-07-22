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

                var layout = await _context.RoomLayouts.FindAsync(dto.LayoutId);
                int setupMinutes = layout != null ? layout.SetupDurationMinutes : 0;
                
                DateTime realStartTime = startLocal.AddMinutes(-setupMinutes);
                DateTime realEndTime = endLocal;

                var overlappingBooking = await _context.Bookings
                    .Include(b => b.RoomLayout)
                    .Where(b => b.AssetId == dto.AssetId && b.BookingStatus != "Cancelled")
                    .Where(b => !(b.BookingStatus == "Awaiting_Payment" && b.PaymentDeadline.HasValue && b.PaymentDeadline.Value < nowLocal))
                    .Where(b => 
                        (realStartTime < b.EndTime) && 
                        (b.StartTime.AddMinutes(-b.RoomLayout.SetupDurationMinutes) < realEndTime)
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
        public async Task<IActionResult> CheckinBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Confirmed")
            {
                return BadRequest(new { message = "Chỉ có thể check-in cho đơn đặt chỗ đã được xác nhận (Confirmed)." });
            }

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
            if (nowLocal > booking.EndTime)
            {
                return BadRequest(new { message = "Không thể check-in vì thời gian đặt chỗ đã kết thúc." });
            }

            var setupTask = await _context.InternalTasks
                .FirstOrDefaultAsync(t => t.BookingId == id && t.TaskCategory == "LOGISTICS");
            
            if (setupTask == null || setupTask.TaskStatus != "Completed")
            {
                return BadRequest(new { message = "Phòng hiện chưa dọn dẹp/bố trí xong. Không thể Check-in." });
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            booking.BookingStatus = "Checked_In";
            booking.CheckedInAt = nowLocal;
            
            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, currentUserId, "Đã hoàn tất xác nhận Check-in.");

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

            if (dto.SelectedAddonIds != null && dto.SelectedAddonIds.Any())
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
    }
}
