using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Entities;

namespace backend.Data.Seeders
{
    public static class EdgeCasePathSeeder
    {
        public static async Task SeedEdgeCasesAsync(AppDbContext context)
        {
            var now = DateTime.UtcNow;

            // ==========================================
            // SCENARIO SC-04: Force Checkout & Quá hạn sử dụng
            // Mô tả hành trình: Checked_In -> Quá giờ 30 phút -> Staff thực hiện Force Checkout -> Phạt overtime 1.5x -> Sinh công nợ Unpaid -> Tạo task CLEANING.
            // ==========================================
            var forceCode = "BK-SIM-FORCECO";
            var forceBooking = await context.Bookings
                .Include(b => b.Invoices)
                .Include(b => b.BookingLogs)
                .Include(b => b.InternalTasks)
                .FirstOrDefaultAsync(b => b.BookingCode == forceCode);

            if (forceBooking == null)
            {
                /* 1. Tạo bản ghi Booking chính */
                forceBooking = new Booking
                {
                    UserId = 3, // Alice User
                    AssetId = 3, // Tiếp Khách VIP 103 (BasePrice 200,000 VNĐ)
                    LayoutId = 1, // Sơ đồ Chữ U
                    StartTime = now.AddHours(-3),
                    EndTime = now.AddMinutes(-30), // Lịch kết thúc từ 30 phút trước
                    ActualEndTime = now, // Thực tế Checkout muộn 30 phút
                    BookingStatus = "Checked_Out",
                    BookingCode = forceCode,
                    PaymentDeadline = now.AddHours(-4),
                    SnapshotBasePrice = 200000m,
                    SnapshotPriceModifier = 0m,
                    CreatedAt = now.AddHours(-4),
                    Arrived = true,
                    CheckedInAt = now.AddHours(-3).AddMinutes(5),
                    CheckedInByAdminId = 2
                };
                context.Bookings.Add(forceBooking);
                await context.SaveChangesAsync();

                /* 2. Tạo Hóa đơn cọc trước (Paid) */
                context.Invoices.Add(new Invoice
                {
                    BookingId = forceBooking.Id,
                    TotalAmount = 200000m,
                    PaidUpfront = 200000m,
                    FinalDue = 0m,
                    InvoiceType = "Upfront",
                    PaymentStatus = "Paid",
                    CreatedAt = now.AddHours(-4)
                });

                /* 3. Phạt trễ giờ (CalculateOvertimeFee logic):
                   base = 200,000 / giờ. Phạt 1.5x. Trễ 30 phút.
                   Phí phạt = (200,000 * 30 * 1.5) / 60 = 150,000 VNĐ.
                */
                var penaltyFee = 150000m;

                /* 4. Tạo Hóa đơn cuối (Final Invoice) ghi nợ Unpaid (Rule 10) */
                context.Invoices.Add(new Invoice
                {
                    BookingId = forceBooking.Id,
                    TotalAmount = 350000m, // 200k upfront + 150k phạt
                    PaidUpfront = 200000m,
                    FinalDue = penaltyFee,
                    InvoiceType = "Final",
                    PaymentStatus = "Unpaid", // Đẩy sang dạng nợ chưa trả
                    CreatedAt = now
                });

                /* 5. Ghi log lịch sử */
                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = forceBooking.Id,
                    UserFullName = "John Staff",
                    ActionDescription = "Đã thực hiện Check-in cho khách hàng.",
                    Timestamp = now.AddHours(-3).AddMinutes(5)
                });

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = forceBooking.Id,
                    UserFullName = "John Staff",
                    ActionDescription = $"Cưỡng chế checkout (Force Checkout) do khách hàng sử dụng phòng quá giờ quy định (quá hạn 30 phút). Phụ thu phạt trễ 1.5x: {penaltyFee:N0} VNĐ ghi nhận vào công nợ.",
                    Timestamp = now
                });

                /* 6. Tạo Task dọn dẹp (CLEANING Task) */
                context.InternalTasks.Add(new InternalTask
                {
                    BookingId = forceBooking.Id,
                    TaskCategory = "CLEANING",
                    TaskDescription = $"Dọn dẹp sau khi cưỡng chế checkout Booking #{forceCode}",
                    RequiredStaffCount = 1,
                    TaskStatus = "Unassigned",
                    CreatedAt = now
                });

                await context.SaveChangesAsync();
            }

            // ==========================================
            // SCENARIO SC-05: Gia hạn sử dụng phòng họp
            // Mô tả hành trình: Đơn đang Checked_In -> Khách bấm Gia hạn -> Kiểm tra trống và duyệt -> Cập nhật giờ kết thúc.
            // ==========================================
            var extendCode = "BK-SIM-EXT-OK";
            var extendBooking = await context.Bookings
                .Include(b => b.BookingLogs)
                .FirstOrDefaultAsync(b => b.BookingCode == extendCode);

            if (extendBooking == null)
            {
                extendBooking = new Booking
                {
                    UserId = 3, // Alice User
                    AssetId = 6, // Phòng Phỏng Vấn 203 (BasePrice 100k)
                    LayoutId = 1,
                    StartTime = now.AddHours(-1),
                    EndTime = now.AddHours(1), // Kéo dài đến 1 tiếng nữa
                    BookingStatus = "Checked_In",
                    BookingCode = extendCode,
                    PaymentDeadline = now.AddHours(-2),
                    SnapshotBasePrice = 100000m,
                    SnapshotPriceModifier = 0m,
                    CreatedAt = now.AddHours(-2),
                    Arrived = true,
                    CheckedInAt = now.AddHours(-1).AddMinutes(2),
                    CheckedInByAdminId = 2
                };
                context.Bookings.Add(extendBooking);
                await context.SaveChangesAsync();

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = extendBooking.Id,
                    UserFullName = "Alice User",
                    ActionDescription = "Đã check-in phòng và bắt đầu sử dụng.",
                    Timestamp = now.AddHours(-1).AddMinutes(2)
                });

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = extendBooking.Id,
                    UserFullName = "Alice User",
                    ActionDescription = "Đã yêu cầu gia hạn thêm 30 phút sử dụng phòng thành công. Giờ kết thúc mới: " + extendBooking.EndTime.ToString("HH:mm"),
                    Timestamp = now.AddMinutes(-5)
                });

                await context.SaveChangesAsync();
            }

            // ==========================================
            // SCENARIO SC-06: Chuyển phòng khẩn cấp do Bảo trì đột xuất
            // Mô tả hành trình: Đơn cũ (Phòng 202 bị sự cố) -> Chuyển phòng khẩn cấp sang Phòng 102 (Đơn mới).
            // ==========================================
            var swOldCode = "BK-SIM-SW-OLD";
            var swNewCode = "BK-SIM-SW-NEW";

            var swOldBooking = await context.Bookings.FirstOrDefaultAsync(b => b.BookingCode == swOldCode);
            if (swOldBooking == null)
            {
                // Đơn cũ: Đặt phòng 202 (Id = 5) từ 2 tiếng trước, dự kiến dùng 4 tiếng.
                // Sự cố xảy ra tại hour -1, chuyển phòng sang Phòng 102 (Id = 2).
                swOldBooking = new Booking
                {
                    UserId = 4, // Bob User
                    AssetId = 5, // Phòng Dự Án 202 (Bảo trì)
                    LayoutId = 1,
                    StartTime = now.AddHours(-2),
                    EndTime = now.AddHours(-1), // Đóng sớm tại mốc 1 giờ trước
                    ActualEndTime = now.AddHours(-1),
                    BookingStatus = "Checked_Out",
                    BookingCode = swOldCode,
                    SnapshotBasePrice = 75000m, // Pro-rata: Dùng 1/2 thời gian -> thu 75,000 VNĐ thay vì 150,000 VNĐ
                    SnapshotPriceModifier = 0m,
                    CreatedAt = now.AddHours(-3),
                    Arrived = true,
                    CheckedInAt = now.AddHours(-2).AddMinutes(5),
                    CheckedInByAdminId = 2
                };
                context.Bookings.Add(swOldBooking);
                await context.SaveChangesAsync();

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = swOldBooking.Id,
                    UserFullName = "Bob User",
                    ActionDescription = "Khởi tạo booking phòng 202.",
                    Timestamp = now.AddHours(-3)
                });

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = swOldBooking.Id,
                    UserFullName = "John Staff",
                    ActionDescription = "Kích hoạt chuyển phòng khẩn cấp sang Họp Chiến Lược 102 do phòng cũ 202 gặp sự cố mất điện.",
                    Timestamp = now.AddHours(-1)
                });

                // Đơn mới: Tiếp quản thời gian còn lại (1 tiếng trước đến 2 tiếng sau) tại phòng 102 (Id = 2)
                var swNewBooking = new Booking
                {
                    UserId = 4, // Bob User
                    AssetId = 2, // Họp Chiến Lược 102
                    LayoutId = 1,
                    StartTime = now.AddHours(-1),
                    EndTime = now.AddHours(2), // Tiếp tục dùng đến 2 tiếng nữa
                    BookingStatus = "Checked_In",
                    BookingCode = swNewCode,
                    SnapshotBasePrice = 250000m,
                    SnapshotPriceModifier = 50000m,
                    CreatedAt = now.AddHours(-1),
                    Arrived = true,
                    CheckedInAt = now.AddHours(-1).AddMinutes(2),
                    CheckedInByAdminId = 2
                };
                context.Bookings.Add(swNewBooking);
                await context.SaveChangesAsync();

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = swNewBooking.Id,
                    UserFullName = "Hệ thống",
                    ActionDescription = $"Đơn đặt chỗ được tạo tự động từ quy trình chuyển phòng khẩn cấp (Đơn gốc #{swOldBooking.Id}).",
                    Timestamp = now.AddHours(-1)
                });

                // Chuyển dịch vụ phát sinh chưa thanh toán (Projector) từ đơn cũ sang đơn mới
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = swNewBooking.Id,
                    ServiceId = 2, // Projector
                    Quantity = 1,
                    SnapshotUnitPrice = 50000m,
                    IsIncurred = true,
                    PaymentStatus = "Unpaid" // Chưa trả tiền dịch vụ này
                });

                // Tạo Task dọn dẹp phòng cũ 202
                context.InternalTasks.Add(new InternalTask
                {
                    BookingId = swOldBooking.Id,
                    TaskCategory = "CLEANING",
                    TaskDescription = $"Dọn dẹp vệ sinh phòng cũ 202 sau khi chuyển phòng khẩn cấp #{swOldCode}",
                    RequiredStaffCount = 1,
                    TaskStatus = "Unassigned",
                    CreatedAt = now.AddHours(-1)
                });

                await context.SaveChangesAsync();
            }
        }
    }
}
