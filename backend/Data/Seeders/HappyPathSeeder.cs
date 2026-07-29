using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Entities;

namespace backend.Data.Seeders
{
    public static class HappyPathSeeder
    {
        public static async Task SeedHappyPathAsync(AppDbContext context)
        {
            var now = DateTime.UtcNow;

            // SCENARIO SC-01: Happy Path (Quy trình trọn vẹn)
            // Mô tả hành trình: Khởi tạo -> Đặt cọc -> Chuẩn bị phòng -> Check-in -> Yêu cầu nước uống -> Checkout thành công -> Đánh giá 5 sao.
            var bookingCode = "BK-SIM-HAPPY";
            var booking = await context.Bookings
                .Include(b => b.Invoices)
                .Include(b => b.BookingServiceDetails)
                .Include(b => b.InternalTasks)
                .Include(b => b.BookingLogs)
                .Include(b => b.ServiceRequests)
                .FirstOrDefaultAsync(b => b.BookingCode == bookingCode);

            if (booking == null)
            {
                /* 1. Tạo bản ghi Booking chính */
                booking = new Booking
                {
                    UserId = 3, // Alice User
                    AssetId = 2, // Họp Chiến Lược 102
                    LayoutId = 1, // Sơ đồ Chữ U
                    StartTime = now.AddHours(-2), // Giờ bắt đầu sử dụng thực tế
                    EndTime = now, // Giờ kết thúc theo lịch đặt
                    ActualEndTime = now.AddMinutes(-5), // Thực tế trả phòng sớm 5 phút
                    BookingStatus = "Checked_Out",
                    BookingCode = bookingCode,
                    PaymentDeadline = now.AddHours(-4),
                    CustomSetupNote = "Yêu cầu setup 8 ghế ngồi sơ đồ chữ U thẳng hàng.",
                    SnapshotBasePrice = 250000m, // Giá gốc Họp Chiến Lược 102
                    SnapshotPriceModifier = 50000m, // Phụ thu sơ đồ Chữ U
                    CreatedAt = now.AddHours(-4).AddMinutes(-30),
                    Arrived = true,
                    CheckedInAt = now.AddHours(-2).AddMinutes(-10),
                    CheckedInByAdminId = 2, // John Staff thực hiện check-in
                    Rating = 5,
                    ReviewComment = "Phòng họp rất sạch sẽ, hỗ trợ setup sơ đồ chữ U chuẩn xác. Phục vụ trà và bánh nhanh chóng."
                };
                context.Bookings.Add(booking);
                await context.SaveChangesAsync(); // Lưu để sinh Booking ID cho các bảng liên quan

                /* 2. Tạo Hóa đơn cọc trước (Upfront Invoice) */
                // Hóa đơn cọc trả trước (Upfront) - Đã thanh toán lúc đặt phòng
                var upfrontInvoice = new Invoice
                {
                    BookingId = booking.Id,
                    TotalAmount = 300000m, // 250k base + 50k layout
                    PaidUpfront = 300000m,
                    FinalDue = 0m,
                    InvoiceType = "Upfront",
                    PaymentStatus = "Paid",
                    CreatedAt = now.AddHours(-4).AddMinutes(-25)
                };
                context.Invoices.Add(upfrontInvoice);

                /* 3. Tạo Task chuẩn bị phòng (LOGISTICS Setup Task) - Đã hoàn thành bởi Staff */
                var setupTask = new InternalTask
                {
                    BookingId = booking.Id,
                    TaskCategory = "LOGISTICS",
                    TaskDescription = "Setup Chữ U cho Booking #BK-SIM-HAPPY (Phòng 102)",
                    RequiredStaffCount = 1,
                    TaskStatus = "Completed",
                    CreatedAt = now.AddHours(-3)
                };
                context.InternalTasks.Add(setupTask);
                await context.SaveChangesAsync();

                // Log task logs for setupTask
                context.TaskLogs.Add(new TaskLog
                {
                    TaskId = setupTask.Id,
                    UserFullName = "Hệ thống",
                    ActionDescription = "Nhiệm vụ được tạo tự động.",
                    Timestamp = now.AddHours(-3)
                });
                context.TaskLogs.Add(new TaskLog
                {
                    TaskId = setupTask.Id,
                    UserFullName = "John Staff",
                    ActionDescription = "Nhân viên John Staff đã nhận nhiệm vụ.",
                    Timestamp = now.AddHours(-3).AddMinutes(5)
                });
                context.TaskLogs.Add(new TaskLog
                {
                    TaskId = setupTask.Id,
                    UserFullName = "John Staff",
                    ActionDescription = "Nhiệm vụ đã hoàn thành. Ghi chú nghiệm thu: Đã sắp xếp 8 ghế chữ U.",
                    Timestamp = now.AddHours(-2).AddMinutes(-30)
                });

                // Phân bổ nhân sự cho Setup Task
                context.TaskAllocations.Add(new TaskAllocation
                {
                    TaskId = setupTask.Id,
                    StaffId = 2, // John Staff làm
                    JoinedAt = now.AddHours(-3).AddMinutes(5)
                });

                /* 4. Nhật ký duyệt & Check-in (BookingLogs) */
                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = booking.Id,
                    UserFullName = "Alice User",
                    ActionDescription = "Đã khởi tạo đơn đặt phòng và thanh toán đặt cọc thành công.",
                    Timestamp = now.AddHours(-4).AddMinutes(-20)
                });

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = booking.Id,
                    UserFullName = "John Staff",
                    ActionDescription = "Đã xác nhận hoàn thành công tác chuẩn bị phòng họp.",
                    Timestamp = now.AddHours(-2).AddMinutes(-30)
                });

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = booking.Id,
                    UserFullName = "John Staff",
                    ActionDescription = "Đã thực hiện Check-in cho khách hàng vào phòng.",
                    Timestamp = now.AddHours(-2).AddMinutes(-10)
                });

                /* 5. Khách yêu cầu dịch vụ ăn uống (ServiceRequest) */
                var beverageRequest = new ServiceRequest
                {
                    BookingId = booking.Id,
                    UserId = 3, // Alice User
                    RequestType = "SERVICE",
                    RoomName = "Họp Chiến Lược 102",
                    Title = "Gọi đồ uống & đồ ăn nhẹ",
                    Detail = "Vui lòng mang thêm 2 ly Cà phê sữa đá và 2 Bánh mì sừng bò.",
                    ServiceId = 3, // Cà phê sữa đá
                    Quantity = 2,
                    RequestStatus = "Resolved",
                    CreatedAt = now.AddHours(-1).AddMinutes(-30)
                };
                context.ServiceRequests.Add(beverageRequest);

                /* 6. Chi tiết Dịch vụ phát sinh được đồng bộ tự động sang hóa đơn (Rule 9) */
                // Dịch vụ 1: Cà phê sữa đá (x2) - Đã thanh toán lúc checkout
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = booking.Id,
                    ServiceId = 3, // Cà phê sữa đá
                    Quantity = 2,
                    SnapshotUnitPrice = 25000m,
                    IsIncurred = true,
                    PaymentStatus = "Paid"
                });

                // Dịch vụ 2: Bánh mì sừng bò (x2) - Đã thanh toán lúc checkout
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = booking.Id,
                    ServiceId = 6, // Bánh mì sừng bò
                    Quantity = 2,
                    SnapshotUnitPrice = 30000m,
                    IsIncurred = true,
                    PaymentStatus = "Paid"
                });

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = booking.Id,
                    UserFullName = "Hệ thống",
                    ActionDescription = "Đồng bộ dịch vụ phát sinh từ yêu cầu hỗ trợ (ID Yêu cầu): Cà phê sữa đá x2, Bánh mì sừng bò x2.",
                    Timestamp = now.AddHours(-1).AddMinutes(-20)
                });

                /* 7. Khách yêu cầu Checkout và Lễ tân phê duyệt */
                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = booking.Id,
                    UserFullName = "Alice User",
                    ActionDescription = "Gửi yêu cầu trả phòng (Request Checkout).",
                    Timestamp = now.AddMinutes(-15)
                });

                /* 8. Tạo Hóa đơn thanh toán cuối (Final Invoice) - Đã thanh toán */
                var finalInvoice = new Invoice
                {
                    BookingId = booking.Id,
                    TotalAmount = 410000m, // 300k upfront + 50k cafe + 60k croissant
                    PaidUpfront = 300000m,
                    FinalDue = 110000m,
                    InvoiceType = "Final",
                    PaymentStatus = "Paid",
                    CreatedAt = now.AddMinutes(-12)
                };
                context.Invoices.Add(finalInvoice);

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = booking.Id,
                    UserFullName = "Alice User",
                    ActionDescription = "Hoàn tất thanh toán hóa đơn cuối (110,000 VNĐ).",
                    Timestamp = now.AddMinutes(-10)
                });

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = booking.Id,
                    UserFullName = "John Staff",
                    ActionDescription = "Xác nhận Checkout thành công. Giải phóng phòng họp.",
                    Timestamp = now.AddMinutes(-5)
                });

                /* 9. Tạo Task dọn dẹp phòng sau Checkout (CLEANING Task) */
                var cleanupTask = new InternalTask
                {
                    BookingId = booking.Id,
                    TaskCategory = "CLEANING",
                    TaskDescription = "Dọn dẹp phòng sau khi Booking #BK-SIM-HAPPY Checked Out",
                    RequiredStaffCount = 1,
                    TaskStatus = "Unassigned",
                    CreatedAt = now.AddMinutes(-5)
                };
                context.InternalTasks.Add(cleanupTask);
                await context.SaveChangesAsync();

                // Log task log for cleanupTask
                context.TaskLogs.Add(new TaskLog
                {
                    TaskId = cleanupTask.Id,
                    UserFullName = "Hệ thống",
                    ActionDescription = "Nhiệm vụ dọn dẹp được tự động kích hoạt sau checkout.",
                    Timestamp = now.AddMinutes(-5)
                });
                await context.SaveChangesAsync();
            }
        }
    }
}
