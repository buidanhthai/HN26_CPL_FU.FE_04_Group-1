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
                await Seeders.MaintenanceSeeder.SeedMaintenanceDataAsync(context);
                await Seeders.OverdueBookingSeeder.SeedOverdueBookingAsync(context);
                await Seeders.HappyPathSeeder.SeedHappyPathAsync(context);
                await Seeders.ExceptionPathSeeder.SeedExceptionPathsAsync(context);
                await Seeders.EdgeCasePathSeeder.SeedEdgeCasesAsync(context);
                await Seeders.BoundaryDataSeeder.SeedBoundaryDataAsync(context);

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

        // Kịch bản 3: Seed các Task Vận Hành Ca Trực - đủ loại & trạng thái để test UI
        private static async Task SeedStaffOperationalTasksAsync(AppDbContext context)
        {
            // Đảm bảo Booking test tồn tại trước khi seed tasks (tránh FK violation)
            await EnsureTestBookingsExistAsync(context);

            var taskSeeds = new[]
            {
                // --- UNASSIGNED (hiển thị ở Task Pool) ---
                new { Desc = "[SEED] Setup Máy chiếu & Sơ đồ chữ U - Phòng Họp Chiến Lược 102 (Booking #2 • Check-in lúc 14:00)", Category = "LOGISTICS", BookingId = 2, Staff = 1, Status = "Unassigned" },
                new { Desc = "[SEED] Chuẩn bị 10 ghế thêm & Bảng di động - Hội Trường Lớn 101 (Booking #1 • VIP)", Category = "LOGISTICS", BookingId = 1, Staff = 2, Status = "Unassigned" },
                new { Desc = "[SEED] Kiểm tra điều hòa & mic không dây - Phòng Tiếp Khách VIP 103", Category = "TECHNICAL", BookingId = 3, Staff = 1, Status = "Unassigned" },
                new { Desc = "[SEED] Phục vụ Trà đá & Bánh ngọt cho đoàn khách 8 người - Phòng 102", Category = "SERVICE", BookingId = 2, Staff = 1, Status = "Unassigned" },
                new { Desc = "[SEED] Dọn dẹp & Khử khuẩn Phòng Phỏng Vấn 203 (Trước 09:00 sáng mai)", Category = "CLEANING", BookingId = 3, Staff = 1, Status = "Unassigned" },

                // --- IN_PROGRESS (đang thực hiện) ---
                new { Desc = "[SEED] Sắp xếp bàn ghế sơ đồ lớp học - Phòng Đào Tạo 304 (Đang làm)", Category = "LOGISTICS", BookingId = 1, Staff = 2, Status = "In_Progress" },
                new { Desc = "[SEED] Sửa bộ chiếu overhead tầng 3 (Kỹ thuật viên đang xử lý)", Category = "TECHNICAL", BookingId = 2, Staff = 1, Status = "In_Progress" },

                // --- COMPLETED (đã hoàn thành, dùng để test filter) ---
                new { Desc = "[SEED] Vệ sinh phòng họp A2 sau checkout Bob (Hoàn thành 11:30)", Category = "CLEANING", BookingId = 2, Staff = 1, Status = "Completed" },
                new { Desc = "[SEED] Kiểm tra mạng Wi-Fi tầng 2 (Hoàn thành 09:00)", Category = "TECHNICAL", BookingId = 1, Staff = 1, Status = "Completed" },
                new { Desc = "[SEED] Bố trí bàn ghế hoàn tất - Phòng 102 (Sẵn sàng dùng)", Category = "LOGISTICS", BookingId = 5, Staff = 1, Status = "Completed" },
            };

            foreach (var seed in taskSeeds)
            {
                if (!await context.InternalTasks.AnyAsync(t => t.TaskDescription == seed.Desc))
                {
                    context.InternalTasks.Add(new InternalTask
                    {
                        BookingId = seed.BookingId,
                        TaskCategory = seed.Category,
                        TaskDescription = seed.Desc,
                        RequiredStaffCount = seed.Staff,
                        TaskStatus = seed.Status,
                        CreatedAt = DateTime.UtcNow.AddMinutes(-new Random().Next(5, 120))
                    });
                }
            }
        }

        // Helper: Đảm bảo các Booking giả tồn tại để tasks không bị FK error
        private static async Task EnsureTestBookingsExistAsync(AppDbContext context)
        {
            var now = backend.Helpers.TimeHelper.GetVietnamTime();

            // Booking #1 - Alice (Bị chặn dọn dẹp vì LOGISTICS task is Unassigned/In_Progress)
            var aliceBooking = await context.Bookings.FirstOrDefaultAsync(b => b.Id == 1);
            if (aliceBooking == null)
            {
                context.Bookings.Add(new Booking
                {
                    Id = 1,
                    UserId = 3,
                    AssetId = 1,
                    CustomerName = "Alice User",
                    StartTime = now.AddMinutes(-5),
                    EndTime = now.AddHours(2),
                    BookingStatus = "Confirmed",
                    BookingCode = "BK-SEED-001",
                    SnapshotBasePrice = 300000m,
                    SnapshotPriceModifier = 0m,
                    CreatedAt = now.AddHours(-1),
                    Arrived = true
                });
                
                using var transaction = await context.Database.BeginTransactionAsync();
                try
                {
                    await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Booking ON");
                    await context.SaveChangesAsync();
                    await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Booking OFF");
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            else
            {
                aliceBooking.StartTime = now.AddMinutes(-5);
                aliceBooking.EndTime = now.AddHours(2);
                aliceBooking.BookingStatus = "Confirmed";
                aliceBooking.Arrived = true;
                await context.SaveChangesAsync();
            }

            // Booking #5 - Khách B (Sẵn sàng Check-in vì LOGISTICS task is Completed)
            var readyBooking = await context.Bookings.FirstOrDefaultAsync(b => b.Id == 5);
            if (readyBooking == null)
            {
                context.Bookings.Add(new Booking
                {
                    Id = 5,
                    UserId = 3, // Alice User
                    AssetId = 2,
                    CustomerName = "Khách Hàng B",
                    LayoutId = 1,
                    StartTime = now.AddMinutes(5),
                    EndTime = now.AddHours(2),
                    BookingStatus = "Confirmed",
                    BookingCode = "BK-SEED-005",
                    SnapshotBasePrice = 400000m,
                    SnapshotPriceModifier = 0m,
                    CreatedAt = now.AddHours(-1),
                    Arrived = true
                });
                
                using var transaction = await context.Database.BeginTransactionAsync();
                try
                {
                    await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Booking ON");
                    await context.SaveChangesAsync();
                    await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Booking OFF");
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            else
            {
                readyBooking.StartTime = now.AddMinutes(5);
                readyBooking.EndTime = now.AddHours(2);
                readyBooking.BookingStatus = "Confirmed";
                readyBooking.Arrived = true;
                await context.SaveChangesAsync();
            }
        }
    }
}
