using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Entities;

namespace backend.Data.Seeders
{
    public static class ExceptionPathSeeder
    {
        public static async Task SeedExceptionPathsAsync(AppDbContext context)
        {
            var now = DateTime.UtcNow;

            // ==========================================
            // SCENARIO SC-02: Hủy do quá hạn thanh toán đặt trước (Expired & Cancelled)
            // Mô tả hành trình: Khởi tạo đơn đặt chỗ -> Quá hạn thanh toán 10 phút -> Hệ thống tự động hủy đơn.
            // ==========================================
            var timeoutCode = "BK-SIM-TIMEOUT";
            var timeoutBooking = await context.Bookings
                .Include(b => b.Invoices)
                .Include(b => b.BookingLogs)
                .FirstOrDefaultAsync(b => b.BookingCode == timeoutCode);

            if (timeoutBooking == null)
            {
                /* 1. Tạo bản ghi Booking chính */
                timeoutBooking = new Booking
                {
                    UserId = 4, // Bob User
                    AssetId = 3, // Tiếp Khách VIP 103
                    LayoutId = 1, // Sơ đồ Chữ U (hoặc mặc định)
                    StartTime = now.AddHours(4),
                    EndTime = now.AddHours(6),
                    BookingStatus = "Cancelled",
                    BookingCode = timeoutCode,
                    PaymentDeadline = now.AddHours(-1), // Quá hạn từ 1 giờ trước
                    SnapshotBasePrice = 200000m,
                    SnapshotPriceModifier = 0m,
                    CreatedAt = now.AddHours(-1).AddMinutes(-10),
                    Arrived = false
                };
                context.Bookings.Add(timeoutBooking);
                await context.SaveChangesAsync();

                /* 2. Tạo Hóa đơn trả trước (Upfront Invoice) ở trạng thái Unpaid */
                context.Invoices.Add(new Invoice
                {
                    BookingId = timeoutBooking.Id,
                    TotalAmount = 200000m,
                    PaidUpfront = 0m,
                    FinalDue = 200000m,
                    InvoiceType = "Upfront",
                    PaymentStatus = "Unpaid",
                    CreatedAt = now.AddHours(-1).AddMinutes(-10)
                });

                /* 3. Nhật ký hệ thống hủy đơn */
                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = timeoutBooking.Id,
                    UserFullName = "Hệ thống",
                    ActionDescription = "Hủy đơn đặt chỗ tự động do khách hàng không hoàn tất thanh toán cọc đúng hạn.",
                    Timestamp = now.AddHours(-1)
                });

                await context.SaveChangesAsync();
            }

            // ==========================================
            // SCENARIO SC-03: No-Show (Khách không đến nhận phòng sau 30 phút)
            // Mô tả hành trình: Đặt chỗ Confirmed -> Staff setup xong phòng -> Quá 30 phút bắt đầu mà khách không Check-in -> Chuyển sang No_Show.
            // ==========================================
            var noshowCode = "BK-SIM-NOSHOW";
            var noshowBooking = await context.Bookings
                .Include(b => b.Invoices)
                .Include(b => b.InternalTasks)
                .Include(b => b.BookingLogs)
                .FirstOrDefaultAsync(b => b.BookingCode == noshowCode);

            if (noshowBooking == null)
            {
                /* 1. Tạo bản ghi Booking chính */
                noshowBooking = new Booking
                {
                    UserId = 3, // Alice User
                    AssetId = 4, // Phòng Dự Án 201
                    LayoutId = 1, // Sơ đồ Chữ U
                    StartTime = now.AddMinutes(-45), // Lịch bắt đầu từ 45 phút trước
                    EndTime = now.AddHours(2),
                    BookingStatus = "No_Show",
                    BookingCode = noshowCode,
                    PaymentDeadline = now.AddHours(-2),
                    SnapshotBasePrice = 150000m,
                    SnapshotPriceModifier = 0m,
                    CreatedAt = now.AddHours(-2).AddMinutes(-30),
                    Arrived = false // Chưa từng báo có mặt
                };
                context.Bookings.Add(noshowBooking);
                await context.SaveChangesAsync();

                /* 2. Tạo Hóa đơn cọc trước dạng Paid */
                context.Invoices.Add(new Invoice
                {
                    BookingId = noshowBooking.Id,
                    TotalAmount = 150000m,
                    PaidUpfront = 150000m,
                    FinalDue = 0m,
                    InvoiceType = "Upfront",
                    PaymentStatus = "Paid",
                    CreatedAt = now.AddHours(-2).AddMinutes(-20)
                });

                /* 3. Tạo Task chuẩn bị phòng và đã hoàn tất */
                var logisticsTask = new InternalTask
                {
                    BookingId = noshowBooking.Id,
                    TaskCategory = "LOGISTICS",
                    TaskDescription = "Setup phòng 201 sẵn sàng đón khách",
                    RequiredStaffCount = 1,
                    TaskStatus = "Completed",
                    CreatedAt = now.AddHours(-2)
                };
                context.InternalTasks.Add(logisticsTask);
                await context.SaveChangesAsync();

                context.TaskAllocations.Add(new TaskAllocation
                {
                    TaskId = logisticsTask.Id,
                    StaffId = 2,
                    JoinedAt = now.AddHours(-2).AddMinutes(5)
                });

                /* 4. Nhật ký tự động chuyển No-Show */
                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = noshowBooking.Id,
                    UserFullName = "Alice User",
                    ActionDescription = "Thanh toán đặt cọc thành công.",
                    Timestamp = now.AddHours(-2).AddMinutes(-20)
                });

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = noshowBooking.Id,
                    UserFullName = "John Staff",
                    ActionDescription = "Hoàn thành công tác bố trí phòng chuẩn bị đón khách.",
                    Timestamp = now.AddMinutes(-55)
                });

                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = noshowBooking.Id,
                    UserFullName = "Hệ thống",
                    ActionDescription = "Đơn đặt chỗ tự động hủy chuyển sang No_Show do quá 30 phút bắt đầu mà khách không đến check-in.",
                    Timestamp = now.AddMinutes(-15) // Quá 30 phút từ StartTime
                });

                await context.SaveChangesAsync();
            }
        }
    }
}
