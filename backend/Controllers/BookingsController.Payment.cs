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
        [HttpPut("{id}/pay")]
        public async Task<IActionResult> ConfirmPayment(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingServiceDetails)
                    .ThenInclude(sd => sd.AddOnService)
                .Include(b => b.SpaceAsset)
                .FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Awaiting_Payment")
            {
                return BadRequest(new { message = "Đơn đặt chỗ này đã được thanh toán hoặc đã hủy." });
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();

            booking.BookingStatus = "Confirmed";
            booking.PaymentDeadline = null;

            // Cập nhật trạng thái thanh toán của các dịch vụ đặt trước
            foreach (var detail in booking.BookingServiceDetails.Where(sd => !sd.IsIncurred))
            {
                detail.PaymentStatus = "Paid";
            }

            var existingUpfrontInvoice = await _context.Invoices
                .FirstOrDefaultAsync(i => i.BookingId == id && i.InvoiceType == "Upfront");

            var upfrontServiceCost = booking.BookingServiceDetails
                .Where(sd => !sd.IsIncurred)
                .Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);
            var upfrontTotal = booking.SnapshotBasePrice + booking.SnapshotPriceModifier + upfrontServiceCost;

            if (existingUpfrontInvoice == null)
            {
                var upfrontInvoice = new Invoice
                {
                    BookingId = booking.Id,
                    TotalAmount = upfrontTotal,
                    PaidUpfront = upfrontTotal,
                    FinalDue = 0,
                    InvoiceType = "Upfront",
                    PaymentStatus = "Paid",
                    CreatedAt = nowLocal
                };
                _context.Invoices.Add(upfrontInvoice);
            }
            else
            {
                existingUpfrontInvoice.TotalAmount = upfrontTotal;
                existingUpfrontInvoice.PaymentStatus = "Paid";
                existingUpfrontInvoice.PaidUpfront = upfrontTotal;
                existingUpfrontInvoice.FinalDue = 0;
            }

            // Tự động đồng bộ và gom nhóm công việc cho nhân viên
            await SyncServiceTasksForBookingAsync(booking.Id);

            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, userId, "Đã xác nhận thanh toán đặt trước.");
            return Ok(new { message = "Thanh toán giả lập thành công. Trạng thái đã chuyển sang Confirmed." });
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

            if (booking.BookingStatus != "Checked_In" && booking.BookingStatus != "Awaiting_Checkout")
            {
                return BadRequest(new { message = "Chỉ có thể thanh toán hóa đơn cuối cho đơn đang hoạt động hoặc đang chờ checkout." });
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
                var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
                decimal overtimeFee = CalculateOvertimeFee(booking, nowLocal);
                decimal incurredTotal = booking.BookingServiceDetails
                    .Where(s => s.IsIncurred && s.PaymentStatus == "Unpaid")
                    .Sum(s => s.SnapshotUnitPrice * s.Quantity);
                decimal upfrontTotal = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;

                invoice = new Invoice
                {
                    BookingId = booking.Id,
                    TotalAmount = upfrontTotal + incurredTotal + overtimeFee,
                    PaidUpfront = upfrontTotal,
                    FinalDue = 0,
                    InvoiceType = "Final",
                    PaymentStatus = "Paid"
                };
                _context.Invoices.Add(invoice);
            }
            else
            {
                invoice.PaymentStatus = "Paid";
                invoice.FinalDue = 0;
            }

            foreach (var service in booking.BookingServiceDetails.Where(s => s.IsIncurred))
            {
                service.PaymentStatus = "Paid";
            }

            await _context.SaveChangesAsync();
            await LogActionAsync(booking.Id, currentUserId, "Đã hoàn thành thanh toán hóa đơn cuối.");

            return Ok(new { message = "Thanh toán hóa đơn cuối thành công.", invoicePaymentStatus = invoice.PaymentStatus });
        }
    }
}
