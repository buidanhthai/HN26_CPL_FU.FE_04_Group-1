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
    [Route("api/bookings")]
    [Authorize]
    public partial class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetBookings()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var query = _context.Bookings.AsQueryable();

            if (string.Equals(userRole, "USER", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(b => b.UserId == userId);
            }

            var bookings = await query
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    AssetId = b.AssetId,
                    LayoutId = b.LayoutId,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    BookingStatus = b.BookingStatus,
                    PaymentDeadline = b.PaymentDeadline,
                    CustomSetupNote = b.CustomSetupNote,
                    SnapshotBasePrice = b.SnapshotBasePrice,
                    SnapshotPriceModifier = b.SnapshotPriceModifier,
                    CreatedAt = b.CreatedAt,
                    BookingCode = b.BookingCode,
                    CustomerName = b.CustomerName,
                    CustomerPhone = b.CustomerPhone,
                    CreatedByUserId = b.CreatedByUserId,
                    SetupTaskStatus = b.InternalTasks.FirstOrDefault(t => t.TaskCategory == "LOGISTICS").TaskStatus
                }).ToListAsync();

            return Ok(bookings);
        }

        [HttpPost]
        [Authorize(Roles = "USER,ADMIN,STAFF")]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var nowUtc = DateTime.UtcNow;
            if (dto.StartTime <= nowUtc || dto.EndTime <= dto.StartTime)
            {
                return BadRequest(new { message = "Thời gian không hợp lệ. Vui lòng chọn thời gian ở tương lai và thời gian kết thúc phải lớn hơn bắt đầu." });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "SELECT 1 FROM [Space_Asset] WITH (UPDLOCK, ROWLOCK) WHERE [Id] = {0}", dto.AssetId);

                var layout = await _context.RoomLayouts.FindAsync(dto.LayoutId);
                int setupMinutes = layout != null ? layout.SetupDurationMinutes : 0;
                
                DateTime realStartTime = dto.StartTime.AddMinutes(-setupMinutes);
                DateTime realEndTime = dto.EndTime;

                var overlappingBooking = await _context.Bookings
                    .Include(b => b.RoomLayout)
                    .Where(b => b.AssetId == dto.AssetId && b.BookingStatus != "Cancelled")
                    .Where(b => !(b.BookingStatus == "Awaiting_Payment" && b.PaymentDeadline.HasValue && b.PaymentDeadline.Value < nowUtc))
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
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    CustomSetupNote = dto.CustomSetupNote,
                    SnapshotBasePrice = dto.SnapshotBasePrice,
                    SnapshotPriceModifier = dto.SnapshotPriceModifier,
                    BookingStatus = "Awaiting_Payment",
                    BookingCode = bookingCode,
                    PaymentDeadline = nowUtc.AddMinutes(10),
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
                    PaymentDeadline = booking.PaymentDeadline,
                    CustomSetupNote = booking.CustomSetupNote,
                    SnapshotBasePrice = booking.SnapshotBasePrice,
                    SnapshotPriceModifier = booking.SnapshotPriceModifier,
                    CreatedAt = booking.CreatedAt,
                    BookingCode = booking.BookingCode
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Lỗi hệ thống khi tạo lịch đặt: " + ex.Message });
            }
        }

        [HttpPut("{id}/pay")]
        [Authorize(Roles = "USER,ADMIN")]
        public async Task<IActionResult> ConfirmBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER" && booking.UserId != userId)
            {
                return Forbid();
            }

            if (booking.BookingStatus != "Awaiting_Payment")
            {
                return BadRequest(new { message = "Đơn đặt chỗ không ở trạng thái chờ thanh toán." });
            }

            booking.BookingStatus = "Confirmed";
            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, userId, "Đã xác nhận thanh toán đặt trước.");
            return Ok(new { message = "Thanh toán giả lập thành công. Trạng thái đã chuyển sang Confirmed." });
        }


        [HttpGet("{id}/details")]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> GetBookingDetails(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.SpaceAsset)
                .Include(b => b.RoomLayout)
                .Include(b => b.InternalTasks)
                .Include(b => b.BookingServiceDetails)
                    .ThenInclude(sd => sd.AddOnService)
                .Include(b => b.BookingLogs)
                .Include(b => b.Invoices)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            bool isStaffOrAdmin = string.Equals(userRole, "STAFF", StringComparison.OrdinalIgnoreCase) || 
                                  string.Equals(userRole, "ADMIN", StringComparison.OrdinalIgnoreCase);

            if (!isStaffOrAdmin && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            var services = booking.BookingServiceDetails.Select(sd => new
            {
                sd.ServiceId,
                ServiceName = sd.AddOnService?.ServiceName ?? "Dịch vụ",
                sd.Quantity,
                sd.SnapshotUnitPrice,
                sd.PaymentStatus,
                sd.IsIncurred
            }).ToList();

            var logs = booking.BookingLogs
                .OrderBy(l => l.Timestamp)
                .Select(l => new
                {
                    l.Id,
                    l.UserFullName,
                    l.ActionDescription,
                    l.Timestamp
                }).ToList();

            // 1. KIỂM TRA HÓA ĐƠN UPFRONT (TRẢ TRƯỚC) TRONG DATABASE
            var invoices = new List<object>();
            var dbUpfrontInvoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Upfront");
            if (dbUpfrontInvoice != null)
            {
                // Sử dụng hóa đơn thật trong DB để bảo toàn ID và lịch sử đối soát giao dịch
                invoices.Add(new
                {
                    Id = dbUpfrontInvoice.Id,
                    TotalAmount = dbUpfrontInvoice.TotalAmount,
                    PaidUpfront = dbUpfrontInvoice.PaidUpfront,
                    FinalDue = dbUpfrontInvoice.FinalDue,
                    InvoiceType = dbUpfrontInvoice.InvoiceType,
                    PaymentStatus = dbUpfrontInvoice.PaymentStatus,
                    CreatedAt = dbUpfrontInvoice.CreatedAt
                });
            }
            else
            {
                // Nếu chưa có hóa đơn thật (đơn mới tạo chưa thanh toán), tự sinh hóa đơn Upfront nháp
                decimal roomCost = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
                decimal upfrontServiceCost = booking.BookingServiceDetails
                    .Where(sd => !sd.IsIncurred)
                    .Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);
                decimal upfrontTotal = roomCost + upfrontServiceCost;

                bool isPaidStatus = (booking.BookingStatus == "Confirmed" || 
                                     booking.BookingStatus == "Checked_In" || 
                                     booking.BookingStatus == "Awaiting_Checkout" || 
                                     booking.BookingStatus == "Checked_Out");

                invoices.Add(new
                {
                    Id = 0,
                    TotalAmount = upfrontTotal,
                    PaidUpfront = isPaidStatus ? upfrontTotal : 0m,
                    FinalDue = isPaidStatus ? 0m : upfrontTotal,
                    InvoiceType = "Upfront",
                    PaymentStatus = isPaidStatus ? "Paid" : "Unpaid",
                    CreatedAt = booking.CreatedAt
                });
            }

            // 2. XỬ LÝ HÓA ĐƠN FINAL (QUYẾT TOÁN)
            var dbFinalInvoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Final");
            if (dbFinalInvoice != null)
            {
                // Đơn đã hoàn tất checkout, trả về hóa đơn quyết toán thật từ DB
                invoices.Add(new
                {
                    Id = dbFinalInvoice.Id,
                    TotalAmount = dbFinalInvoice.TotalAmount,
                    PaidUpfront = dbFinalInvoice.PaidUpfront,
                    FinalDue = dbFinalInvoice.FinalDue,
                    InvoiceType = dbFinalInvoice.InvoiceType,
                    PaymentStatus = dbFinalInvoice.PaymentStatus,
                    CreatedAt = dbFinalInvoice.CreatedAt
                });
            }
            else if (booking.BookingStatus == "Checked_In" || booking.BookingStatus == "Awaiting_Checkout")
            {
                // Khách đang dùng hoặc đang đợi checkout: Tự sinh "Final Invoice nháp" để Lễ tân xem trước tại quầy
                decimal roomCost = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
                decimal upfrontServiceCost = booking.BookingServiceDetails
                    .Where(sd => !sd.IsIncurred)
                    .Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);
                decimal upfrontTotal = roomCost + upfrontServiceCost;

                // Tính toán phí quá giờ (Overtime Fee) - Công thức Nhân trước Chia sau chống sai lệch
                decimal overtimeFee = 0m;
                var actualCheckoutTime = DateTime.UtcNow;
                if (actualCheckoutTime > booking.EndTime)
                {
                    var overtimeDuration = actualCheckoutTime - booking.EndTime;
                    double overtimeMinutes = overtimeDuration.TotalMinutes;

                    if (overtimeMinutes > 15.0) // 15 phút đệm dỡ tải
                    {
                        decimal baseHourlyRate = booking.SpaceAsset?.BasePrice ?? 0m;
                        decimal penaltyMultiplier = 1.5m;
                        decimal calculatedMinutes = (decimal)Math.Ceiling(overtimeMinutes);

                        decimal totalOvertimeAmount = (baseHourlyRate * calculatedMinutes * penaltyMultiplier) / 60.0m;
                        overtimeFee = Math.Round(totalOvertimeAmount, 0); // Làm tròn chẵn block VNĐ
                    }
                }

                // Tính tổng dịch vụ phát sinh chưa trả
                decimal incurredTotal = booking.BookingServiceDetails
                    .Where(s => s.IsIncurred && s.PaymentStatus == "Unpaid")
                    .Sum(s => s.SnapshotUnitPrice * s.Quantity);

                decimal finalTotalAmount = upfrontTotal + overtimeFee + incurredTotal;
                decimal finalDue = overtimeFee + incurredTotal;

                invoices.Add(new
                {
                    Id = 0, // Ký hiệu hóa đơn nháp hiển thị xem trước
                    TotalAmount = finalTotalAmount,
                    PaidUpfront = upfrontTotal,
                    FinalDue = finalDue,
                    InvoiceType = "Final",
                    PaymentStatus = finalDue > 0 ? "Unpaid" : "Paid",
                    CreatedAt = DateTime.UtcNow
                });
            }

            object? userInfo = null;
            if (userRole != "USER")
            {
                userInfo = new
                {
                    FullName = booking.User?.FullName,
                    Email = booking.User?.Email
                };
            }

            return Ok(new
            {
                booking = new BookingDto
                {
                    Id = booking.Id,
                    UserId = booking.UserId,
                    AssetId = booking.AssetId,
                    LayoutId = booking.LayoutId,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    BookingStatus = booking.BookingStatus,
                    PaymentDeadline = booking.PaymentDeadline,
                    CustomSetupNote = booking.CustomSetupNote,
                    SnapshotBasePrice = booking.SnapshotBasePrice,
                    SnapshotPriceModifier = booking.SnapshotPriceModifier,
                    CreatedAt = booking.CreatedAt,
                    BookingCode = booking.BookingCode,
                    SetupTaskStatus = booking.InternalTasks.FirstOrDefault(t => t.TaskCategory == "LOGISTICS")?.TaskStatus
                },
                spaceAsset = new
                {
                    booking.SpaceAsset?.AssetName,
                    booking.SpaceAsset?.LocationName,
                    booking.SpaceAsset?.Capacity,
                    booking.SpaceAsset?.Dimensions,
                    booking.SpaceAsset?.AreaM2,
                    booking.SpaceAsset?.AssetType
                },
                roomLayout = new
                {
                    booking.RoomLayout?.LayoutName,
                    booking.RoomLayout?.SetupDurationMinutes
                },
                user = userInfo,
                services,
                logs,
                invoices,
                isOverdue = booking.BookingStatus == "Checked_In" && DateTime.UtcNow > booking.EndTime,
                overdueMinutes = (booking.BookingStatus == "Checked_In" && DateTime.UtcNow > booking.EndTime) ? (int)(DateTime.UtcNow - booking.EndTime).TotalMinutes : 0,
                overtimeFee = (booking.BookingStatus == "Checked_In" && DateTime.UtcNow > booking.EndTime && (DateTime.UtcNow - booking.EndTime).TotalMinutes > 15.0) 
                    ? Math.Round(((booking.SpaceAsset?.BasePrice ?? 0m) * (decimal)Math.Ceiling((DateTime.UtcNow - booking.EndTime).TotalMinutes) * 1.5m) / 60.0m, 0)
                    : 0m
            });
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

        private async Task LogActionAsync(int bookingId, int userId, string actionDescription)
        {
            var user = await _context.Users.FindAsync(userId);
            var log = new BookingLog
            {
                BookingId = bookingId,
                UserFullName = user?.FullName ?? "Hệ thống",
                ActionDescription = actionDescription,
                Timestamp = backend.Helpers.TimeHelper.GetVietnamTime()
            };
            _context.BookingLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }

    public class AddIncurredServicesDto
    {
        public System.Collections.Generic.List<IncurredServiceItemDto> Services { get; set; } = new();
    }

    public class IncurredServiceItemDto
    {
        public int ServiceId { get; set; }
        public int Quantity { get; set; }
    }
}
