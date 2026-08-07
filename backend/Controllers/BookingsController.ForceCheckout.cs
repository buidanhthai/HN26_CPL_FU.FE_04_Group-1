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

            // Tính toán phụ thu trễ giờ phạt 1.5x tại BE (gọi từ BookingsController.Checkout.cs)
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
