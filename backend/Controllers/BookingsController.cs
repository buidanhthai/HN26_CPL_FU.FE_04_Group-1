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
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("active")]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> GetActiveBooking([FromQuery] int? bookingId = null)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var query = _context.Bookings
                .Include(b => b.SpaceAsset)
                .Include(b => b.RoomLayout)
                .Include(b => b.InternalTasks)
                .Include(b => b.BookingServiceDetails)
                    .ThenInclude(sd => sd.AddOnService)
                .AsQueryable();

            Booking? booking = null;

            if (bookingId.HasValue)
            {
                booking = await query.FirstOrDefaultAsync(b => b.Id == bookingId.Value && b.UserId == currentUserId);
            }
            else
            {
                booking = await query
                    .Where(b => b.UserId == currentUserId && b.BookingStatus == "Checked_In")
                    .FirstOrDefaultAsync();

                if (booking == null)
                {
                    booking = await query
                        .Where(b => b.UserId == currentUserId && b.BookingStatus != "Cancelled" && b.BookingStatus != "Checked_Out")
                        .OrderBy(b => b.StartTime)
                        .FirstOrDefaultAsync();
                }
            }

            if (booking == null)
            {
                return Ok(null);
            }

            var prepaidFee = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
            var services = booking.BookingServiceDetails.Select(sd => new
            {
                sd.ServiceId,
                ServiceName = sd.AddOnService?.ServiceName ?? "Dịch vụ",
                sd.Quantity,
                sd.SnapshotUnitPrice,
                sd.PaymentStatus,
                sd.IsIncurred
            }).ToList();

            var incurredUnpaidTotal = booking.BookingServiceDetails
                .Where(sd => sd.IsIncurred && sd.PaymentStatus == "Unpaid")
                .Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);

            var totalAmount = prepaidFee + booking.BookingServiceDetails.Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);

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
                services,
                prepaidFee,
                incurredUnpaidTotal,
                totalAmount
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetBookings()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var query = _context.Bookings.AsQueryable();

            if (userRole == "USER")
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

            var nowUtc = DateTime.UtcNow;
            if (nowUtc > booking.EndTime)
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
            booking.CheckedInAt = nowUtc;
            
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

        [HttpGet("{id}/checkout-preview")]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> GetCheckoutPreview(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingServiceDetails)
                    .ThenInclude(sd => sd.AddOnService)
                .Include(b => b.Invoices)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Checked_In" && booking.BookingStatus != "Awaiting_Checkout")
            {
                return BadRequest(new { message = "Chỉ có thể xem trước checkout cho đơn đang sử dụng hoặc chờ checkout." });
            }

            var invoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Final");
            
            var services = booking.BookingServiceDetails.Select(sd => new
            {
                sd.ServiceId,
                ServiceName = sd.AddOnService?.ServiceName ?? "Dịch vụ",
                sd.Quantity,
                sd.SnapshotUnitPrice,
                sd.PaymentStatus,
                sd.IsIncurred
            }).ToList();

            if (invoice == null)
            {
                decimal incurredTotal = booking.BookingServiceDetails
                    .Where(s => s.IsIncurred && s.PaymentStatus == "Unpaid")
                    .Sum(s => s.SnapshotUnitPrice * s.Quantity);

                invoice = new Invoice
                {
                    BookingId = booking.Id,
                    TotalAmount = booking.SnapshotBasePrice + booking.SnapshotPriceModifier + incurredTotal,
                    PaidUpfront = booking.SnapshotBasePrice + booking.SnapshotPriceModifier,
                    FinalDue = incurredTotal,
                    InvoiceType = "Final",
                    PaymentStatus = incurredTotal > 0 ? "Unpaid" : "Paid"
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
                    SnapshotBasePrice = booking.SnapshotBasePrice,
                    SnapshotPriceModifier = booking.SnapshotPriceModifier
                },
                services,
                invoice = new
                {
                    invoice.Id,
                    invoice.TotalAmount,
                    invoice.PaidUpfront,
                    invoice.FinalDue,
                    invoice.InvoiceType,
                    invoice.PaymentStatus
                }
            });
        }

        [HttpPut("{id}/request-checkout")]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> RequestCheckout(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingServiceDetails)
                .Include(b => b.Invoices)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Checked_In")
            {
                return BadRequest(new { message = "Chỉ có thể yêu cầu checkout khi phòng đang được sử dụng (Checked_In)." });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER" && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            booking.BookingStatus = "Awaiting_Checkout";

            var invoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Final");
            decimal incurredTotal = booking.BookingServiceDetails
                .Where(s => s.IsIncurred && s.PaymentStatus == "Unpaid")
                .Sum(s => s.SnapshotUnitPrice * s.Quantity);

            if (invoice == null)
            {
                invoice = new Invoice
                {
                    BookingId = booking.Id,
                    TotalAmount = booking.SnapshotBasePrice + booking.SnapshotPriceModifier + incurredTotal,
                    PaidUpfront = booking.SnapshotBasePrice + booking.SnapshotPriceModifier,
                    FinalDue = incurredTotal,
                    InvoiceType = "Final",
                    PaymentStatus = incurredTotal > 0 ? "Unpaid" : "Paid"
                };
                _context.Invoices.Add(invoice);
            }
            else
            {
                invoice.TotalAmount = booking.SnapshotBasePrice + booking.SnapshotPriceModifier + incurredTotal;
                invoice.FinalDue = incurredTotal;
                invoice.PaymentStatus = incurredTotal > 0 ? "Unpaid" : "Paid";
            }

            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, currentUserId, "Đã yêu cầu thực hiện Checkout phòng.");

            return Ok(new { message = "Yêu cầu Checkout thành công. Vui lòng thanh toán hóa đơn cuối (nếu có).", bookingStatus = booking.BookingStatus });
        }

        [HttpPut("{id}/pay-final")]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> PayFinal(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingServiceDetails)
                .Include(b => b.Invoices)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Awaiting_Checkout")
            {
                return BadRequest(new { message = "Chỉ có thể thanh toán hóa đơn cuối cho đơn đang chờ checkout (Awaiting_Checkout)." });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER" && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            var invoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Final");
            if (invoice == null)
            {
                return BadRequest(new { message = "Không tìm thấy hóa đơn cuối cho đơn đặt chỗ này." });
            }

            invoice.PaymentStatus = "Paid";

            foreach (var service in booking.BookingServiceDetails.Where(s => s.IsIncurred))
            {
                service.PaymentStatus = "Paid";
            }

            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, currentUserId, "Đã hoàn thành thanh toán hóa đơn cuối.");

            return Ok(new { message = "Thanh toán hóa đơn cuối thành công.", invoicePaymentStatus = invoice.PaymentStatus });
        }

        [HttpPost("{id}/confirm-checkout")]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> ConfirmCheckout(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingServiceDetails)
                .Include(b => b.Invoices)
                .FirstOrDefaultAsync(b => b.Id == id);
                
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Checked_In" && booking.BookingStatus != "Awaiting_Checkout")
            {
                return BadRequest(new { message = "Chỉ có thể Checkout các phòng đang sử dụng hoặc chờ checkout." });
            }

            var invoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Final");
            if (invoice == null)
            {
                decimal incurredTotal = booking.BookingServiceDetails
                    .Where(s => s.IsIncurred && s.PaymentStatus == "Unpaid")
                    .Sum(s => s.SnapshotUnitPrice * s.Quantity);

                invoice = new Invoice
                {
                    BookingId = booking.Id,
                    TotalAmount = booking.SnapshotBasePrice + booking.SnapshotPriceModifier + incurredTotal,
                    PaidUpfront = booking.SnapshotBasePrice + booking.SnapshotPriceModifier,
                    FinalDue = incurredTotal,
                    InvoiceType = "Final",
                    PaymentStatus = incurredTotal > 0 ? "Unpaid" : "Paid"
                };
                _context.Invoices.Add(invoice);
                await _context.SaveChangesAsync();
            }

            if (invoice.PaymentStatus != "Paid" || booking.BookingServiceDetails.Any(s => s.IsIncurred && s.PaymentStatus == "Unpaid"))
            {
                return BadRequest(new { message = "Chưa thanh toán hoàn thiện hóa đơn cuối. Không thể thực hiện checkout." });
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            booking.BookingStatus = "Checked_Out";
            
            // Auto trigger a CleanUpTask
            var cleanupTask = new InternalTask
            {
                BookingId = booking.Id,
                TaskCategory = "CLEANING",
                TaskDescription = $"Dọn dẹp phòng sau khi Booking #{booking.BookingCode} (ID: {booking.Id}) Checked Out",
                RequiredStaffCount = 1,
                TaskStatus = "Unassigned",
                CreatedAt = DateTime.UtcNow
            };
            _context.InternalTasks.Add(cleanupTask);

            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, currentUserId, "Đã hoàn tất Checkout phòng và kích hoạt Task dọn dẹp.");

            invoice.Booking = null;

            return Ok(new { message = "Checkout thành công. Đã tạo nhiệm vụ dọn dẹp.", invoice });
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

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER" && booking.UserId != userId)
            {
                return Forbid();
            }

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            return NoContent();
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

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER" && booking.UserId != currentUserId)
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

            var invoices = booking.Invoices
                .Select(i => (object)new
                {
                    i.Id,
                    i.TotalAmount,
                    i.PaidUpfront,
                    i.FinalDue,
                    i.InvoiceType,
                    i.PaymentStatus,
                    i.CreatedAt
                }).ToList();

            if (invoices.Count == 0)
            {
                decimal roomCost = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
                decimal serviceCost = booking.BookingServiceDetails.Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);
                decimal totalAmount = roomCost + serviceCost;

                invoices.Add(new
                {
                    Id = 0,
                    TotalAmount = totalAmount,
                    PaidUpfront = (booking.BookingStatus == "Confirmed" || booking.BookingStatus == "Checked_In" || booking.BookingStatus == "Checked_Out") ? totalAmount : 0m,
                    FinalDue = (booking.BookingStatus == "Confirmed" || booking.BookingStatus == "Checked_In" || booking.BookingStatus == "Checked_Out") ? 0m : totalAmount,
                    InvoiceType = "Upfront",
                    PaymentStatus = (booking.BookingStatus == "Confirmed" || booking.BookingStatus == "Checked_In" || booking.BookingStatus == "Checked_Out") ? "Paid" : "Unpaid",
                    CreatedAt = booking.CreatedAt
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
                invoices
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
