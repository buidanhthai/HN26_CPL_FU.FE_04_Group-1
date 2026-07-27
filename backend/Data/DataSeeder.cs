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
                await SeedCustomerRequestsAsync(context);

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
            var now = DateTime.UtcNow;

            // Booking #1 - nếu chưa có (có thể bị xóa hoặc chưa seed)
            if (!await context.Bookings.AnyAsync(b => b.Id == 1))
            {
                context.Bookings.Add(new Booking
                {
                    Id = 1,
                    UserId = 3,
                    AssetId = 1,
                    CustomerName = "Alice User",
                    StartTime = now.AddHours(3),
                    EndTime = now.AddHours(5),
                    BookingStatus = "Confirmed",
                    BookingCode = "BK-SEED-001",
                    SnapshotBasePrice = 300000m,
                    SnapshotPriceModifier = 0m,
                    CreatedAt = now.AddHours(-1)
                });
                await context.SaveChangesAsync();
            }
        }

        // Kịch bản 4: Seed các Yêu cầu & Sự cố từ Khách hàng (User Requests & Incidents)
        private static async Task SeedCustomerRequestsAsync(AppDbContext context)
        {
            try
            {
                // Tự động kiểm tra và tạo bảng CustomerRequests trong SQL Server nếu chưa có
                var createTableSql = @"
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CustomerRequests')
                    BEGIN
                        CREATE TABLE [CustomerRequests] (
                            [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [UserId] INT NOT NULL,
                            [RequestType] NVARCHAR(50) NOT NULL DEFAULT 'SERVICE',
                            [Title] NVARCHAR(255) NOT NULL,
                            [Detail] NVARCHAR(MAX) NULL,
                            [RoomName] NVARCHAR(255) NOT NULL,
                            [Status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
                            [ResolvedNote] NVARCHAR(MAX) NULL,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                            CONSTRAINT [FK_CustomerRequests_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
                        );
                    END";
                await context.Database.ExecuteSqlRawAsync(createTableSql);

                if (!await context.CustomerRequests.AnyAsync())
                {
                    var now = DateTime.UtcNow;
                    context.CustomerRequests.AddRange(
                        new CustomerRequest
                        {
                            UserId = 3, // Alice
                            RequestType = "SERVICE",
                            Title = "Gọi thêm cà phê sữa đá x2",
                            Detail = "Phòng cần thêm 2 ly cà phê sữa đá, không đường.",
                            RoomName = "Họp Chiến Lược 102",
                            Status = "Pending",
                            CreatedAt = now.AddMinutes(-20)
                        },
                        new CustomerRequest
                        {
                            UserId = 4, // Bob
                            RequestType = "INCIDENT",
                            Title = "Điều hòa không lạnh",
                            Detail = "Nhiệt độ phòng vẫn cao dù đã bật điều hòa 30 phút.",
                            RoomName = "Tiếp Khách VIP 103",
                            Status = "In_Progress",
                            CreatedAt = now.AddMinutes(-45)
                        },
                        new CustomerRequest
                        {
                            UserId = 3, // Alice
                            RequestType = "SERVICE",
                            Title = "Mượn bảng di động + 2 bút",
                            Detail = "Cần bảng di động cho buổi brainstorm nhóm 8 người.",
                            RoomName = "Phòng Dự Án 201",
                            Status = "Pending",
                            CreatedAt = now.AddMinutes(-5)
                        },
                        new CustomerRequest
                        {
                            UserId = 4, // Bob
                            RequestType = "INCIDENT",
                            Title = "Micro không nhận tín hiệu",
                            Detail = "Micro trên bàn họp bị mất kết nối, khách đang chờ.",
                            RoomName = "Hội Trường Lớn 101",
                            Status = "Pending",
                            CreatedAt = now.AddMinutes(-2)
                        },
                        new CustomerRequest
                        {
                            UserId = 3, // Alice
                            RequestType = "SERVICE",
                            Title = "Bổ sung thêm nước lọc (6 chai)",
                            Detail = "",
                            RoomName = "Họp Nhóm A",
                            Status = "Resolved",
                            ResolvedNote = "Đã mang thêm 6 chai nước lạnh lúc 09:30.",
                            CreatedAt = now.AddHours(-2)
                        }
                    );
                    await context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CustomerRequests Seeder Warning]: {ex.Message}");
            }
        }
    }
}

