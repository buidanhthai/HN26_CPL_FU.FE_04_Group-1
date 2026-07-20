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
                await context.Database.MigrateAsync();

                await SeedActiveDashboardBookingAsync(context);
                await SeedBobOverdueBookingAsync(context);
                await SeedStaffOperationalTasksAsync(context);

                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Seeder Error]: {ex.Message}");
            }
        }

        // Kịch bản 1: Nguyễn Văn A (Booking ID 3 - Đang sử dụng)
        private static async Task SeedActiveDashboardBookingAsync(AppDbContext context)
        {
            var now = DateTime.UtcNow;
            var activeBooking = await context.Bookings.FirstOrDefaultAsync(b => b.Id == 3);

            if (activeBooking == null)
            {
                activeBooking = new Booking
                {
                    UserId = 3,
                    CustomerName = "Nguyễn Văn A",
                    AssetId = 3,
                    LayoutId = 1,
                    StartTime = now.AddHours(-1),
                    EndTime = now.AddHours(1).AddMinutes(45),
                    BookingStatus = "Checked_In",
                    BookingCode = "BK-260716-03",
                    SnapshotBasePrice = 300000m,
                    SnapshotPriceModifier = 0m,
                    CreatedAt = now.AddHours(-2)
                };
                context.Bookings.Add(activeBooking);
                await context.SaveChangesAsync();
            }
            else
            {
                activeBooking.CustomerName = "Nguyễn Văn A";
                activeBooking.StartTime = now.AddHours(-1);
                activeBooking.EndTime = now.AddHours(1).AddMinutes(45);
                activeBooking.BookingStatus = "Checked_In";
            }

            // Dịch vụ: Trà sữa Matcha (x2) - Đã thanh toán
            var matchaService = await context.AddOnServices.FirstOrDefaultAsync(s => s.ServiceName.Contains("Matcha") || s.Id == 3);
            int serviceId = matchaService?.Id ?? 3;

            var existingMatcha = await context.BookingServiceDetails
                .FirstOrDefaultAsync(d => d.BookingId == activeBooking.Id && d.ServiceId == serviceId);

            if (existingMatcha == null)
            {
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = activeBooking.Id,
                    ServiceId = serviceId,
                    Quantity = 2,
                    SnapshotUnitPrice = 45000m,
                    IsIncurred = false,
                    PaymentStatus = "Paid"
                });
            }
        }

        // Kịch bản 2: Bob (Booking ID 2 - Quá hạn 10 phút)
        private static async Task SeedBobOverdueBookingAsync(AppDbContext context)
        {
            var now = DateTime.UtcNow;
            var bobBooking = await context.Bookings.FirstOrDefaultAsync(b => b.Id == 2 || b.BookingCode == "BK-BOB-OVERDUE");

            if (bobBooking == null)
            {
                bobBooking = new Booking
                {
                    UserId = 4,
                    CustomerName = "Bob",
                    AssetId = 2,
                    LayoutId = 1,
                    StartTime = now.AddHours(-3),
                    EndTime = now.AddMinutes(-10), // Quá hạn 10 phút
                    BookingStatus = "Checked_In",
                    BookingCode = "BK-BOB-OVERDUE",
                    SnapshotBasePrice = 1200000m,
                    SnapshotPriceModifier = 50000m,
                    CreatedAt = now.AddHours(-4)
                };
                context.Bookings.Add(bobBooking);
                await context.SaveChangesAsync();
            }
            else
            {
                bobBooking.CustomerName = "Bob";
                bobBooking.StartTime = now.AddHours(-3);
                bobBooking.EndTime = now.AddMinutes(-10); // Quá hạn 10 phút
                bobBooking.BookingStatus = "Checked_In";
            }

            // 1. Trà đá & Cà phê (x3) - Đã thanh toán
            if (!await context.BookingServiceDetails.AnyAsync(d => d.BookingId == bobBooking.Id && d.ServiceId == 1))
            {
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = bobBooking.Id,
                    ServiceId = 1,
                    Quantity = 3,
                    SnapshotUnitPrice = 25000m,
                    IsIncurred = false,
                    PaymentStatus = "Paid"
                });
            }

            // 2. Máy chiếu Projector (x1) - Chưa thanh toán (Phát sinh)
            if (!await context.BookingServiceDetails.AnyAsync(d => d.BookingId == bobBooking.Id && d.ServiceId == 2))
            {
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = bobBooking.Id,
                    ServiceId = 2,
                    Quantity = 1,
                    SnapshotUnitPrice = 100000m,
                    IsIncurred = true,
                    PaymentStatus = "Unpaid"
                });
            }
        }

        // Kịch bản 3: Seed các Task Vận Hành Ca Trực
        private static async Task SeedStaffOperationalTasksAsync(AppDbContext context)
        {
            if (!await context.InternalTasks.AnyAsync(t => t.TaskDescription.Contains("Setup Máy chiếu")))
            {
                context.InternalTasks.Add(new InternalTask
                {
                    BookingId = 1,
                    TaskCategory = "LOGISTICS",
                    TaskDescription = "Setup Máy chiếu & Sơ đồ phòng họp B1 (Cho Booking #1 • Check-in lúc 17:00)",
                    RequiredStaffCount = 1,
                    TaskStatus = "Unassigned",
                    CreatedAt = DateTime.UtcNow
                });
            }

            if (!await context.InternalTasks.AnyAsync(t => t.TaskDescription.Contains("Dọn dẹp & Khử khuẩn")))
            {
                context.InternalTasks.Add(new InternalTask
                {
                    BookingId = 2,
                    TaskCategory = "CLEANING",
                    TaskDescription = "Dọn dẹp & Khử khuẩn Phòng Họp A2 (Sau khi khách Bob checkout)",
                    RequiredStaffCount = 1,
                    TaskStatus = "Unassigned",
                    CreatedAt = DateTime.UtcNow
                });
            }

            if (!await context.InternalTasks.AnyAsync(t => t.TaskDescription.Contains("Kiểm tra nước uống")))
            {
                context.InternalTasks.Add(new InternalTask
                {
                    BookingId = 3,
                    TaskCategory = "TECHNICAL",
                    TaskDescription = "Kiểm tra nước uống bàn C12 (Đã hoàn thành 14:00)",
                    RequiredStaffCount = 1,
                    TaskStatus = "Completed",
                    CreatedAt = DateTime.UtcNow
                });
            }
        }
    }
}
