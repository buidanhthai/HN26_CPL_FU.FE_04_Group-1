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

        private static async Task SeedTaskLogAsync(AppDbContext context, int taskId, string user, string action, int minutesAgo)
        {
            var taskLog = await context.TaskLogs.FirstOrDefaultAsync(l => l.TaskId == taskId && l.ActionDescription == action);
            if (taskLog == null)
            {
                context.TaskLogs.Add(new TaskLog
                {
                    TaskId = taskId,
                    UserFullName = user,
                    ActionDescription = action,
                    Timestamp = DateTime.UtcNow.AddMinutes(-minutesAgo)
                });
            }
        }

        private static async Task SeedBookingLogAsync(AppDbContext context, int bookingId, string user, string action, int minutesAgo)
        {
            var bookingLog = await context.BookingLogs.FirstOrDefaultAsync(l => l.BookingId == bookingId && l.ActionDescription == action);
            if (bookingLog == null)
            {
                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = bookingId,
                    UserFullName = user,
                    ActionDescription = action,
                    Timestamp = DateTime.UtcNow.AddMinutes(-minutesAgo)
                });
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
                    CustomerName = "Alice User",
                    AssetId = 3,
                    LayoutId = 1,
                    StartTime = now.AddHours(-1),
                    EndTime = now.AddHours(1).AddMinutes(45),
                    BookingStatus = "Checked_In",
                    BookingCode = "BK-260716-03",
                    SnapshotBasePrice = 300000m,
                    SnapshotPriceModifier = 0m,
                    CustomSetupNote = "Yêu cầu setup bàn họp chữ U, chuẩn bị máy chiếu (Projector) kết nối HDMI sẵn, thêm 2 ghế phụ, 1 bảng viết di động, 2 bút viết lông và 10 chai nước khoáng đặt sẵn.",
                    CreatedAt = now.AddHours(-2),
                    Arrived = true,
                    CheckedInAt = now.AddHours(-1)
                };
                context.Bookings.Add(activeBooking);
                await context.SaveChangesAsync();
            }
            else
            {
                activeBooking.CustomerName = "Alice User";
                activeBooking.StartTime = now.AddHours(-1);
                activeBooking.EndTime = now.AddHours(1).AddMinutes(45);
                activeBooking.BookingStatus = "Checked_In";
                activeBooking.CustomSetupNote = "Yêu cầu setup bàn họp chữ U, chuẩn bị máy chiếu (Projector) kết nối HDMI sẵn, thêm 2 ghế phụ, 1 bảng viết di động, 2 bút viết lông và 10 chai nước khoáng đặt sẵn.";
                activeBooking.Arrived = true;
                activeBooking.CheckedInAt = now.AddHours(-1);
            }

            // Seed logs for booking #3
            await SeedBookingLogAsync(context, activeBooking.Id, "Alice User", "Đã tạo đơn đặt chỗ.", 120);
            await SeedBookingLogAsync(context, activeBooking.Id, "Hệ thống", "Đã xác nhận thanh toán đặt trước.", 90);
            await SeedBookingLogAsync(context, activeBooking.Id, "John Staff", "Đã hoàn tất xác nhận Check-in.", 60);

            // 1. Dịch vụ: Cà phê sữa đá (x2) - Đã thanh toán (Prepaid)
            if (!await context.BookingServiceDetails.AnyAsync(d => d.BookingId == activeBooking.Id && d.ServiceId == 3))
            {
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = activeBooking.Id,
                    ServiceId = 3,
                    Quantity = 2,
                    SnapshotUnitPrice = 25000m,
                    IsIncurred = false,
                    PaymentStatus = "Paid"
                });
            }

            // 2. Dịch vụ: Bảng di động & Bút viết (x1) - Đã thanh toán (Prepaid)
            if (!await context.BookingServiceDetails.AnyAsync(d => d.BookingId == activeBooking.Id && d.ServiceId == 8))
            {
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = activeBooking.Id,
                    ServiceId = 8,
                    Quantity = 1,
                    SnapshotUnitPrice = 30000m,
                    IsIncurred = false,
                    PaymentStatus = "Paid"
                });
            }

            // 3. Dịch vụ: Trà đào cam sả (x1) - Chưa thanh toán (Incurred)
            if (!await context.BookingServiceDetails.AnyAsync(d => d.BookingId == activeBooking.Id && d.ServiceId == 5))
            {
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = activeBooking.Id,
                    ServiceId = 5,
                    Quantity = 1,
                    SnapshotUnitPrice = 35000m,
                    IsIncurred = true,
                    PaymentStatus = "Unpaid"
                });
            }

            // 4. Dịch vụ: Bánh mì sừng bò (Croissant) (x1) - Chưa thanh toán (Incurred)
            if (!await context.BookingServiceDetails.AnyAsync(d => d.BookingId == activeBooking.Id && d.ServiceId == 6))
            {
                context.BookingServiceDetails.Add(new BookingServiceDetail
                {
                    BookingId = activeBooking.Id,
                    ServiceId = 6,
                    Quantity = 1,
                    SnapshotUnitPrice = 30000m,
                    IsIncurred = true,
                    PaymentStatus = "Unpaid"
                });
            }

            // 5. Yêu cầu hỗ trợ 1: INCIDENT (Báo sự cố) - Đang xử lý
            if (!await context.ServiceRequests.AnyAsync(r => r.BookingId == activeBooking.Id && r.RequestType == "INCIDENT"))
            {
                context.ServiceRequests.Add(new ServiceRequest
                {
                    BookingId = activeBooking.Id,
                    UserId = 3,
                    RequestType = "INCIDENT",
                    RoomName = "Tiếp Khách VIP 103",
                    Title = "Báo sự cố: Điều hòa chảy nước",
                    Detail = "Nhiệt độ phòng hơi nóng và điều hòa góc cửa ra vào bị rò rỉ nước nhẹ. Nhờ hỗ trợ kỹ thuật xử lý.",
                    RequestStatus = "In_Progress",
                    CreatedAt = now.AddMinutes(-30)
                });
            }

            // 6. Yêu cầu hỗ trợ 2: SERVICE (Gọi dịch vụ) - Đã giải quyết (Resolved)
            if (!await context.ServiceRequests.AnyAsync(r => r.BookingId == activeBooking.Id && r.RequestType == "SERVICE"))
            {
                context.ServiceRequests.Add(new ServiceRequest
                {
                    BookingId = activeBooking.Id,
                    UserId = 3,
                    RequestType = "SERVICE",
                    RoomName = "Tiếp Khách VIP 103",
                    Title = "Yêu cầu gọi nước & bánh ngọt thêm",
                    Detail = "Vui lòng đem thêm 1 ly Trà đào cam sả và 1 Bánh sừng bò lên phòng Tiếp Khách VIP 103.",
                    ServiceId = 5,
                    Quantity = 1,
                    RequestStatus = "Resolved",
                    CreatedAt = now.AddMinutes(-45)
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

            // Seed logs for Bob
            await SeedBookingLogAsync(context, bobBooking.Id, "Bob", "Đã tạo đơn đặt chỗ.", 240);
            await SeedBookingLogAsync(context, bobBooking.Id, "Hệ thống", "Đã xác nhận thanh toán đặt trước.", 210);
            await SeedBookingLogAsync(context, bobBooking.Id, "John Staff", "Đã hoàn tất xác nhận Check-in.", 180);

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
                var task = await context.InternalTasks.FirstOrDefaultAsync(t => t.TaskDescription == seed.Desc);
                if (task == null)
                {
                    task = new InternalTask
                    {
                        BookingId = seed.BookingId,
                        TaskCategory = seed.Category,
                        TaskDescription = seed.Desc,
                        RequiredStaffCount = seed.Staff,
                        TaskStatus = seed.Status,
                        CreatedAt = DateTime.UtcNow.AddMinutes(-new Random().Next(5, 120))
                    };
                    context.InternalTasks.Add(task);
                    await context.SaveChangesAsync();
                }

                // Seed logs for this task
                if (seed.Status == "Unassigned")
                {
                    await SeedTaskLogAsync(context, task.Id, "Hệ thống", "Nhiệm vụ được tạo tự động.", 60);
                }
                else if (seed.Status == "In_Progress")
                {
                    await SeedTaskLogAsync(context, task.Id, "Hệ thống", "Nhiệm vụ được tạo tự động.", 90);
                    await SeedTaskLogAsync(context, task.Id, "Nguyễn Văn B", "Nhân viên Nguyễn Văn B đã nhận nhiệm vụ.", 45);
                }
                else if (seed.Status == "Completed")
                {
                    await SeedTaskLogAsync(context, task.Id, "Hệ thống", "Nhiệm vụ được tạo tự động.", 120);
                    await SeedTaskLogAsync(context, task.Id, "John Staff", "Nhân viên John Staff đã nhận nhiệm vụ.", 90);
                    await SeedTaskLogAsync(context, task.Id, "John Staff", "Nhiệm vụ đã hoàn thành. Ghi chú nghiệm thu: Đã hoàn tất setup dọn dẹp.", 30);
                }
            }
        }

        // Helper: Đảm bảo các Booking giả tồn tại để tasks không bị FK error
        private static async Task EnsureTestBookingsExistAsync(AppDbContext context)
        {
            var now = backend.Helpers.TimeHelper.GetVietnamTime();

            // Booking #1 - Alice
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

            // Booking #5 - Khách B
            var readyBooking = await context.Bookings.FirstOrDefaultAsync(b => b.Id == 5);
            if (readyBooking == null)
            {
                context.Bookings.Add(new Booking
                {
                    Id = 5,
                    UserId = 3,
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

