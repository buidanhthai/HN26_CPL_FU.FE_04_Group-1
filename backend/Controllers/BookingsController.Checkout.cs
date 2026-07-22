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

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
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
                    PaymentStatus = (incurredTotal + overtimeFee) > 0 ? "Unpaid" : "Paid"
                };
                _context.Invoices.Add(invoice);
            }
            else
            {
                invoice.TotalAmount = upfrontTotal + incurredTotal + overtimeFee;
                invoice.FinalDue = incurredTotal + overtimeFee;
                invoice.PaymentStatus = (incurredTotal + overtimeFee) > 0 ? "Unpaid" : "Paid";
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
            decimal overtimeFee = 0m;

            if (invoice == null)
            {
                var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
                overtimeFee = CalculateOvertimeFee(booking, nowLocal);

                decimal incurredTotal = booking.BookingServiceDetails
                    .Where(s => s.IsIncurred && s.PaymentStatus == "Unpaid")
                    .Sum(s => s.SnapshotUnitPrice * s.Quantity);

                decimal upfrontTotal = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;

                invoice = new Invoice
                {
                    BookingId = booking.Id,
                    TotalAmount = upfrontTotal + incurredTotal + overtimeFee,
                    PaidUpfront = upfrontTotal,
                    FinalDue = incurredTotal + overtimeFee,
                    InvoiceType = "Final",
                    PaymentStatus = (incurredTotal + overtimeFee) > 0 ? "Unpaid" : "Paid"
                };
                _context.Invoices.Add(invoice);
                await _context.SaveChangesAsync();
            }
            else
            {
                decimal incurredTotal = booking.BookingServiceDetails
                    .Where(s => s.IsIncurred && s.PaymentStatus == "Unpaid")
                    .Sum(s => s.SnapshotUnitPrice * s.Quantity);
                decimal upfrontTotal = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
                overtimeFee = Math.Max(0m, invoice.TotalAmount - upfrontTotal - incurredTotal);
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
                CreatedAt = backend.Helpers.TimeHelper.GetVietnamTime()
            };
            _context.InternalTasks.Add(cleanupTask);

            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, currentUserId, "Đã hoàn tất Checkout phòng và kích hoạt Task dọn dẹp.");

            invoice.Booking = null;

            return Ok(new { 
                message = "Checkout thành công. Đã tạo nhiệm vụ dọn dẹp.", 
                invoice = new {
                    invoice.Id,
                    invoice.TotalAmount,
                    invoice.PaidUpfront,
                    invoice.FinalDue,
                    invoice.InvoiceType,
                    invoice.PaymentStatus,
                    OvertimeFee = overtimeFee
                }
            });
        }

        private decimal CalculateOvertimeFee(Booking booking, DateTime actualCheckoutTime)
        {
            decimal overtimeFee = 0m;
            if (actualCheckoutTime > booking.EndTime)
            {
                var overtimeDuration = actualCheckoutTime - booking.EndTime;
                double overtimeMinutes = overtimeDuration.TotalMinutes;

                if (overtimeMinutes > 15.0) // 15 phút đệm dỡ tải
                {
                    decimal baseHourlyRate = booking.SnapshotBasePrice;
                    decimal penaltyMultiplier = 1.5m;
                    decimal calculatedMinutes = (decimal)Math.Ceiling(overtimeMinutes);

                    decimal totalOvertimeAmount = (baseHourlyRate * calculatedMinutes * penaltyMultiplier) / 60.0m;
                    overtimeFee = Math.Round(totalOvertimeAmount, 0); // Làm tròn chẵn block VNĐ
                }
            }
            return overtimeFee;
        }
    }
}
