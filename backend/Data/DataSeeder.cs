using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using backend.Entities;

namespace backend.Data
{
    public static class DataSeeder
    {
        public static async Task SeedLiveDemoDataAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            try
            {
                // 1. Tự động Migrate DB nếu cần
                await context.Database.MigrateAsync();

                // 2. Gọi các kịch bản Seed dữ liệu riêng biệt
                await SeedActiveDashboardBookingAsync(context);
                await SeedBobOverdueBookingAsync(context);

                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Seeder Error]: {ex.Message}");
            }
        }

        // Private Method 1: Dành cho màn hình Dashboard (Booking ID 3 - Alice)
        private static async Task SeedActiveDashboardBookingAsync(AppDbContext context)
        {
            var activeBooking = await context.Bookings.FirstOrDefaultAsync(b => b.Id == 3);
            if (activeBooking == null) return;

            var now = DateTime.UtcNow;
            activeBooking.StartTime = now.AddHours(-1);
            activeBooking.EndTime = now.AddMinutes(-5);
            activeBooking.BookingStatus = "Checked_In";

            if (!await context.BookingServiceDetails.AnyAsync(d => d.BookingId == 3 && d.ServiceId == 1))
            {
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = 3,
                    ServiceId = 1,
                    Quantity = 2,
                    SnapshotUnitPrice = 20000m,
                    IsIncurred = false,
                    PaymentStatus = "Paid"
                });
            }

            if (!await context.BookingServiceDetails.AnyAsync(d => d.BookingId == 3 && d.ServiceId == 2))
            {
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = 3,
                    ServiceId = 2,
                    Quantity = 1,
                    SnapshotUnitPrice = 50000m,
                    IsIncurred = true,
                    PaymentStatus = "Unpaid"
                });
            }
        }

        // Private Method 2: Dành cho kịch bản quá hạn checkout của Bob (UserId = 4)
        private static async Task SeedBobOverdueBookingAsync(AppDbContext context)
        {
            var now = DateTime.UtcNow;
            
            // Tìm booking ID 2 (của Bob) hoặc booking có mã BK-BOB-OVERDUE
            var bobBooking = await context.Bookings.FirstOrDefaultAsync(b => b.Id == 2 || b.BookingCode == "BK-BOB-OVERDUE");

            if (bobBooking == null)
            {
                // Nếu chưa có, tạo mới 1 đơn quá hạn checkout cho Bob
                bobBooking = new Booking
                {
                    UserId = 4, // Bob User
                    AssetId = 2,
                    LayoutId = 1,
                    StartTime = now.AddHours(-3),
                    EndTime = now.AddMinutes(-20), // Quá hạn checkout 20 phút
                    BookingStatus = "Checked_In",
                    BookingCode = "BK-BOB-OVERDUE",
                    SnapshotBasePrice = 1200000m,
                    SnapshotPriceModifier = 50000m,
                    CreatedAt = now.AddHours(-4)
                };
                context.Bookings.Add(bobBooking);
                await context.SaveChangesAsync(); // Lưu để lấy ID cho BookingServiceDetail
            }
            else
            {
                // Nếu đã có, cập nhật thời gian để đảm bảo ở trạng thái Quá hạn Checkout
                bobBooking.UserId = 4;
                bobBooking.StartTime = now.AddHours(-3);
                bobBooking.EndTime = now.AddMinutes(-20); // Quá hạn checkout 20 phút
                bobBooking.BookingStatus = "Checked_In";
            }

            // Dịch vụ đi kèm cố định (Đã trả tiền)
            if (!await context.BookingServiceDetails.AnyAsync(d => d.BookingId == bobBooking.Id && d.ServiceId == 1))
            {
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = bobBooking.Id,
                    ServiceId = 1,
                    Quantity = 3,
                    SnapshotUnitPrice = 20000m,
                    IsIncurred = false,
                    PaymentStatus = "Paid"
                });
            }

            // Dịch vụ phát sinh (Chưa trả tiền - để tính hóa đơn quyết toán nháp)
            if (!await context.BookingServiceDetails.AnyAsync(d => d.BookingId == bobBooking.Id && d.ServiceId == 2))
            {
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = bobBooking.Id,
                    ServiceId = 2,
                    Quantity = 1,
                    SnapshotUnitPrice = 50000m,
                    IsIncurred = true,
                    PaymentStatus = "Unpaid"
                });
            }
        }
    }
}
