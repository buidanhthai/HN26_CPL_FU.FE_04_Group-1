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
                // Lấy đơn đặt chỗ đang hoạt động (Checked_In) hoặc đơn gần nhất chưa kết thúc
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
                    CheckInVerificationCode = booking.CheckInVerificationCode
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

            // Nếu là USER, chỉ được xem booking của chính mình
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
                    CheckInVerificationCode = b.CheckInVerificationCode,
                    CustomerName = b.CustomerName,
                    CustomerPhone = b.CustomerPhone,
                    CreatedByUserId = b.CreatedByUserId
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

            // 1. Validate dates
            if (dto.StartTime <= backend.Helpers.TimeHelper.GetVietnamTime() || dto.EndTime <= dto.StartTime)
            {
                return BadRequest(new { message = "Thời gian không hợp lệ. Vui lòng chọn thời gian ở tương lai và thời gian kết thúc phải lớn hơn bắt đầu." });
            }

            // 2. Lấy thông tin Layout để biết thời gian setup (Buffer time)
            var layout = await _context.RoomLayouts.FindAsync(dto.LayoutId);
            int setupMinutes = layout != null ? layout.SetupDurationMinutes : 0;
            
            DateTime realStartTime = dto.StartTime.AddMinutes(-setupMinutes);
            DateTime realEndTime = dto.EndTime; // Có thể thêm teardown nếu cần

            // 3. Thuật toán chống trùng lịch (Double Booking Prevention)
            var overlappingBooking = await _context.Bookings
                .Include(b => b.RoomLayout)
                .Where(b => b.AssetId == dto.AssetId && b.BookingStatus != "Cancelled")
                .Where(b => 
                    // Kiểm tra xem khoảng thời gian (bao gồm setup của cả 2) có giao thoa không
                    (realStartTime < b.EndTime) && 
                    (b.StartTime.AddMinutes(-b.RoomLayout.SetupDurationMinutes) < realEndTime)
                )
                .FirstOrDefaultAsync();

            if (overlappingBooking != null)
            {
                return Conflict(new { message = "Khung giờ này đã có người đặt hoặc đang trong thời gian chuẩn bị phòng. Vui lòng chọn giờ khác." });
            }

            var isStaffOrAdmin = userRole == "ADMIN" || userRole == "STAFF";

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
                PaymentDeadline = backend.Helpers.TimeHelper.GetVietnamTime().AddMinutes(10),
                CustomerName = isStaffOrAdmin ? dto.CustomerName : null,
                CustomerPhone = isStaffOrAdmin ? dto.CustomerPhone : null,
                CreatedByUserId = isStaffOrAdmin ? currentUserId : null
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            await LogActionAsync(booking.Id, currentUserId > 0 ? currentUserId : dto.UserId, "Đã tạo đơn đặt chỗ.");

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
                CheckInVerificationCode = booking.CheckInVerificationCode
            });
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
            booking.CheckInVerificationCode = new Random().Next(100000, 999999).ToString();

            // Tự động sinh Task chuẩn bị phòng (UC_14)
            var layout = await _context.RoomLayouts.FindAsync(booking.LayoutId);
            if (layout != null && layout.SetupDurationMinutes > 0)
            {
                var task = new InternalTask
                {
                    BookingId = booking.Id,
                    TaskCategory = "LOGISTICS",
                    TaskDescription = $"Setup layout {layout.LayoutName} for Booking #{booking.Id}",
                    RequiredStaffCount = 1,
                    TaskStatus = "Unassigned"
                };
                _context.InternalTasks.Add(task);
            }

            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, userId, "Đã xác nhận thanh toán đặt trước.");
            return Ok(new { message = "Thanh toán giả lập thành công. Trạng thái đã chuyển sang Confirmed và đã tạo Task hậu cần." });
        }

        [HttpPut("{id}/request-checkin")]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> RequestCheckin(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Confirmed")
            {
                return BadRequest(new { message = "Chỉ có thể yêu cầu mã check-in cho đơn đặt chỗ đã được xác nhận (Confirmed)." });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            if (userRole == "USER" && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            // Sinh mã xác nhận 6 chữ số ngẫu nhiên nếu chưa có
            if (string.IsNullOrEmpty(booking.CheckInVerificationCode))
            {
                booking.CheckInVerificationCode = new Random().Next(100000, 999999).ToString();
                await _context.SaveChangesAsync();
                await LogActionAsync(booking.Id, currentUserId, "Đã yêu cầu lấy mã check-in.");
            }

            return Ok(new { 
                message = "Mã xác nhận check-in đã được tạo thành công.", 
                code = booking.CheckInVerificationCode 
            });
        }

        [HttpPut("{id}/checkin")]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> CheckinBooking(int id, [FromQuery] string code)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Confirmed")
            {
                return BadRequest(new { message = "Chỉ có thể check-in cho đơn đặt chỗ đã được xác nhận (Confirmed)." });
            }

            if (string.IsNullOrEmpty(booking.CheckInVerificationCode))
            {
                return BadRequest(new { message = "Khách hàng chưa thực hiện yêu cầu check-in để nhận mã xác nhận." });
            }

            if (booking.CheckInVerificationCode != code)
            {
                return BadRequest(new { message = "Mã xác nhận check-in không chính xác." });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var now = backend.Helpers.TimeHelper.GetVietnamTime();

            if (now > booking.EndTime)
            {
                return BadRequest(new { message = "Không thể check-in vì thời gian đặt chỗ đã kết thúc." });
            }

            var checkinWindowStart = booking.StartTime.AddHours(-2);

            if (now < checkinWindowStart)
            {
                if (userRole != "ADMIN")
                {
                    return BadRequest(new { message = "Check-in sớm hơn 2 tiếng so với giờ đặt cần có Admin xác nhận." });
                }

                booking.BookingStatus = "Checked_In";
                booking.CheckedInAt = now;
                booking.CheckedInByAdminId = currentUserId;
                booking.CheckInVerificationCode = null; // Xóa mã sau khi check-in thành công
            }
            else
            {
                booking.BookingStatus = "Checked_In";
                booking.CheckedInAt = now;
                booking.CheckInVerificationCode = null; // Xóa mã sau khi check-in thành công
            }

            await _context.SaveChangesAsync();

            if (now < checkinWindowStart)
            {
                await LogActionAsync(booking.Id, currentUserId, "Đã phê duyệt và thực hiện Check-in sớm.");
            }
            else
            {
                await LogActionAsync(booking.Id, currentUserId, "Đã hoàn tất xác nhận Check-in.");
            }

            return Ok(new { 
                message = "Check-in thành công.", 
                bookingStatus = booking.BookingStatus,
                checkedInAt = booking.CheckedInAt,
                checkedInByAdminId = booking.CheckedInByAdminId
            });
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

        [HttpPut("{id}/checkout")]
        [Authorize(Roles = "STAFF,ADMIN")]
        public async Task<IActionResult> CheckoutBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingServiceDetails)
                .Include(b => b.Invoices)
                .FirstOrDefaultAsync(b => b.Id == id);
                
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Awaiting_Checkout" && booking.BookingStatus != "Checked_In")
            {
                return BadRequest(new { message = "Chỉ có thể Checkout các phòng đang sử dụng hoặc chờ checkout." });
            }

            var invoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Final");
            if (invoice == null)
            {
                // Tự động tạo nếu chưa có yêu cầu
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

            if (invoice.PaymentStatus != "Paid")
            {
                return BadRequest(new { message = "Chưa thanh toán hoàn thiện hóa đơn cuối. Không thể thực hiện checkout." });
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            booking.BookingStatus = "Checked_Out";
            
            // Đảm bảo đánh dấu các dịch vụ là Paid
            foreach (var service in booking.BookingServiceDetails.Where(s => s.IsIncurred))
            {
                service.PaymentStatus = "Paid";
            }

            await _context.SaveChangesAsync();

            await LogActionAsync(booking.Id, currentUserId, "Đã hoàn tất Checkout phòng.");

            invoice.Booking = null;

            return Ok(new { message = "Checkout thành công.", invoice });
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
                    CheckInVerificationCode = booking.CheckInVerificationCode
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
}
