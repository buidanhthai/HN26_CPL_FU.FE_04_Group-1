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
    public partial class BookingsController : ControllerBase
    {
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

            var prepaidFee = booking.SnapshotBasePrice + booking.SnapshotPriceModifier + 
                             booking.BookingServiceDetails
                                 .Where(sd => !sd.IsIncurred)
                                 .Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);

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

            var incurredPaidTotal = booking.BookingServiceDetails
                .Where(sd => sd.IsIncurred && sd.PaymentStatus == "Paid")
                .Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);

            var totalAmount = prepaidFee + incurredUnpaidTotal + incurredPaidTotal;

            bool isOverdue = booking.BookingStatus == "Checked_In" && DateTime.UtcNow > booking.EndTime;
            int overdueMinutes = isOverdue ? (int)(DateTime.UtcNow - booking.EndTime).TotalMinutes : 0;

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
                totalAmount,
                isOverdue,
                overdueMinutes
            });
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

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            bool isStaffOrAdmin = string.Equals(userRole, "STAFF", StringComparison.OrdinalIgnoreCase) || 
                                  string.Equals(userRole, "ADMIN", StringComparison.OrdinalIgnoreCase);

            if (!isStaffOrAdmin && booking.UserId != currentUserId)
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

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            bool isStaffOrAdmin = string.Equals(userRole, "STAFF", StringComparison.OrdinalIgnoreCase) || 
                                  string.Equals(userRole, "ADMIN", StringComparison.OrdinalIgnoreCase);

            if (!isStaffOrAdmin && booking.UserId != currentUserId)
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
