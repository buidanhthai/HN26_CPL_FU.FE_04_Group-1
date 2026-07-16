using System;
using System.Collections.Generic;
using backend.Entities;

namespace backend.Data
{
    public static class SeedData
    {
        private static readonly string DefaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("123456");

        public static List<User> GetUsers() => new List<User>
        {
            new User { Id = 1, FullName = "System Admin", Email = "admin@example.com", PasswordHash = DefaultPasswordHash, Role = "ADMIN", CreatedAt = new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 2, FullName = "John Staff", Email = "staff@example.com", PasswordHash = DefaultPasswordHash, Role = "STAFF", CreatedAt = new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 3, FullName = "Alice User", Email = "alice@example.com", PasswordHash = DefaultPasswordHash, Role = "USER", CreatedAt = new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 4, FullName = "Bob User", Email = "bob@example.com", PasswordHash = DefaultPasswordHash, Role = "USER", CreatedAt = new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) }
        };

        public static List<SpaceAsset> GetSpaceAssets() => new List<SpaceAsset>
        {
            new SpaceAsset { Id = 1, LocationName = "Lầu 1", AssetName = "Hội Trường Lớn 101", AssetType = "Meeting_Room", BasePrice = 300000m, Capacity = 15, Dimensions = "6m x 5m", AreaM2 = 30.00m, IsActive = true },
            new SpaceAsset { Id = 2, LocationName = "Lầu 1", AssetName = "Họp Chiến Lược 102", AssetType = "Meeting_Room", BasePrice = 250000m, Capacity = 10, Dimensions = "5m x 4m", AreaM2 = 20.00m, IsActive = true },
            new SpaceAsset { Id = 3, LocationName = "Lầu 1", AssetName = "Tiếp Khách VIP 103", AssetType = "Meeting_Room", BasePrice = 200000m, Capacity = 6, Dimensions = "4m x 4m", AreaM2 = 16.00m, IsActive = true },
            new SpaceAsset { Id = 4, LocationName = "Lầu 2", AssetName = "Phòng Dự Án 201", AssetType = "Meeting_Room", BasePrice = 150000m, Capacity = 6, Dimensions = "4m x 3m", AreaM2 = 12.00m, IsActive = true },
            new SpaceAsset { Id = 5, LocationName = "Lầu 2", AssetName = "Phòng Dự Án 202", AssetType = "Meeting_Room", BasePrice = 150000m, Capacity = 6, Dimensions = "4m x 3m", AreaM2 = 12.00m, IsActive = true },
            new SpaceAsset { Id = 6, LocationName = "Lầu 2", AssetName = "Phòng Phỏng Vấn 203", AssetType = "Meeting_Room", BasePrice = 100000m, Capacity = 4, Dimensions = "3m x 3m", AreaM2 = 9.00m, IsActive = true },
            new SpaceAsset { Id = 7, LocationName = "Lầu 2", AssetName = "Phòng Nghiên Cứu 204", AssetType = "Meeting_Room", BasePrice = 200000m, Capacity = 8, Dimensions = "4m x 4m", AreaM2 = 16.00m, IsActive = true },
            new SpaceAsset { Id = 8, LocationName = "Lầu 3", AssetName = "Họp Nhóm A", AssetType = "Meeting_Room", BasePrice = 120000m, Capacity = 5, Dimensions = "3.5m x 3m", AreaM2 = 10.50m, IsActive = true },
            new SpaceAsset { Id = 9, LocationName = "Lầu 3", AssetName = "Họp Nhóm B", AssetType = "Meeting_Room", BasePrice = 120000m, Capacity = 5, Dimensions = "3.5m x 3m", AreaM2 = 10.50m, IsActive = true },
            new SpaceAsset { Id = 10, LocationName = "Lầu 3", AssetName = "Hội Thảo 303", AssetType = "Meeting_Room", BasePrice = 250000m, Capacity = 12, Dimensions = "5m x 5m", AreaM2 = 25.00m, IsActive = true },
            new SpaceAsset { Id = 11, LocationName = "Lầu 3", AssetName = "Đào Tạo 304", AssetType = "Meeting_Room", BasePrice = 400000m, Capacity = 20, Dimensions = "8m x 5m", AreaM2 = 40.00m, IsActive = true }
        };

        public static List<AddOnService> GetAddOnServices() => new List<AddOnService>
        {
            new AddOnService { Id = 1, ServiceName = "Trà đá & Cà phê", ChargeMethod = "Fixed", UnitPrice = 20000m, IsAvailable = true },
            new AddOnService { Id = 2, ServiceName = "Projector", ChargeMethod = "By_Hour", UnitPrice = 50000m, IsAvailable = true },
            new AddOnService { Id = 3, ServiceName = "Cà phê sữa đá", ChargeMethod = "Fixed", UnitPrice = 25000m, IsAvailable = true },
            new AddOnService { Id = 4, ServiceName = "Bạc xỉu", ChargeMethod = "Fixed", UnitPrice = 29000m, IsAvailable = true },
            new AddOnService { Id = 5, ServiceName = "Trà đào cam sả", ChargeMethod = "Fixed", UnitPrice = 35000m, IsAvailable = true },
            new AddOnService { Id = 6, ServiceName = "Bánh mì sừng bò (Croissant)", ChargeMethod = "Fixed", UnitPrice = 30000m, IsAvailable = true },
            new AddOnService { Id = 7, ServiceName = "In ấn / Sao chụp tài liệu", ChargeMethod = "By_Quantity", UnitPrice = 2000m, IsAvailable = true },
            new AddOnService { Id = 8, ServiceName = "Bảng di động & Bút viết", ChargeMethod = "Fixed", UnitPrice = 30000m, IsAvailable = true }
        };

        public static List<RoomLayout> GetRoomLayouts() => new List<RoomLayout>
        {
            new RoomLayout { Id = 1, AssetId = 2, LayoutName = "Chữ U", MaxCapacity = 8, SetupDurationMinutes = 15, PriceModifier = 50000m },
            new RoomLayout { Id = 2, AssetId = 2, LayoutName = "Lớp học", MaxCapacity = 10, SetupDurationMinutes = 20, PriceModifier = 0m }
        };

        public static List<Booking> GetBookings() => new List<Booking>
        {
            new Booking { Id = 1, UserId = 3, AssetId = 1, LayoutId = 1, StartTime = DateTime.UtcNow.AddDays(1), EndTime = DateTime.UtcNow.AddDays(1).AddHours(2), BookingStatus = "Awaiting_Payment", BookingCode = "BK-260716-01", SnapshotBasePrice = 50000m, SnapshotPriceModifier = 0m, PaymentDeadline = DateTime.UtcNow.AddMinutes(10), CreatedAt = DateTime.UtcNow },
            new Booking { Id = 2, UserId = 4, AssetId = 2, LayoutId = 1, StartTime = DateTime.UtcNow.AddDays(2), EndTime = DateTime.UtcNow.AddDays(2).AddHours(4), BookingStatus = "Confirmed", BookingCode = "BK-260716-02", SnapshotBasePrice = 1200000m, SnapshotPriceModifier = 50000m, CreatedAt = DateTime.UtcNow },
            new Booking { Id = 3, UserId = 3, AssetId = 2, LayoutId = 2, StartTime = DateTime.UtcNow.AddHours(-1), EndTime = DateTime.UtcNow.AddHours(2), BookingStatus = "Checked_In", BookingCode = "BK-260716-03", SnapshotBasePrice = 900000m, SnapshotPriceModifier = 0m, CreatedAt = DateTime.UtcNow }
        };

        public static List<InternalTask> GetInternalTasks() => new List<InternalTask>
        {
            new InternalTask { Id = 1, BookingId = 2, TaskCategory = "LOGISTICS", TaskDescription = "Setup Chữ U cho Booking #2 (Bob)", RequiredStaffCount = 1, TaskStatus = "Unassigned", CreatedAt = DateTime.UtcNow },
            new InternalTask { Id = 2, BookingId = 3, TaskCategory = "CLEANING", TaskDescription = "Dọn phòng sau khi Booking #3 (Alice) checkout", RequiredStaffCount = 1, TaskStatus = "Unassigned", CreatedAt = DateTime.UtcNow }
        };
    }
}
