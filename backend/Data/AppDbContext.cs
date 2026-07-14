using System;
using Microsoft.EntityFrameworkCore;
using backend.Entities;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }

        public DbSet<User> Users { get; set; }
        public DbSet<SpaceAsset> SpaceAssets { get; set; }
        public DbSet<AddOnService> AddOnServices { get; set; }
        public DbSet<RoomLayout> RoomLayouts { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingServiceDetail> BookingServiceDetails { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InternalTask> InternalTasks { get; set; }
        public DbSet<TaskAllocation> TaskAllocations { get; set; }
        public DbSet<BookingLog> BookingLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Table names configuration
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<SpaceAsset>().ToTable("Space_Asset");
            modelBuilder.Entity<AddOnService>().ToTable("Add_on_Service");
            modelBuilder.Entity<RoomLayout>().ToTable("Room_Layout");
            modelBuilder.Entity<Booking>().ToTable("Booking");
            modelBuilder.Entity<BookingServiceDetail>().ToTable("Booking_Service_Detail");
            modelBuilder.Entity<Invoice>().ToTable("Invoice");
            modelBuilder.Entity<InternalTask>().ToTable("Internal_Tasks");
            modelBuilder.Entity<TaskAllocation>().ToTable("Task_Allocations");
            modelBuilder.Entity<BookingLog>().ToTable("Booking_Log");

            // User mapping
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // SpaceAsset mapping
            modelBuilder.Entity<SpaceAsset>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LocationName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.AssetName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.AssetType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.BasePrice).HasPrecision(12, 2);
                entity.Property(e => e.Dimensions).IsRequired().HasMaxLength(50);
                entity.Property(e => e.AreaM2).HasPrecision(6, 2);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
            });

            // AddOnService mapping
            modelBuilder.Entity<AddOnService>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ServiceName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ChargeMethod).IsRequired().HasMaxLength(30);
                entity.Property(e => e.UnitPrice).HasPrecision(12, 2);
                entity.Property(e => e.IsAvailable).HasDefaultValue(true);
            });

            // RoomLayout mapping
            modelBuilder.Entity<RoomLayout>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LayoutName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.PriceModifier).HasPrecision(12, 2).HasDefaultValue(0);

                entity.HasOne(e => e.SpaceAsset)
                      .WithMany(s => s.RoomLayouts)
                      .HasForeignKey(e => e.AssetId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Booking mapping
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.BookingStatus).IsRequired().HasMaxLength(25).HasDefaultValue("Pending");
                entity.Property(e => e.SnapshotBasePrice).HasPrecision(12, 2);
                entity.Property(e => e.SnapshotPriceModifier).HasPrecision(12, 2).HasDefaultValue(0);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CheckInVerificationCode).HasMaxLength(10);

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Bookings)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.SpaceAsset)
                      .WithMany(s => s.Bookings)
                      .HasForeignKey(e => e.AssetId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.RoomLayout)
                      .WithMany(r => r.Bookings)
                      .HasForeignKey(e => e.LayoutId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.CheckedInByAdmin)
                      .WithMany()
                      .HasForeignKey(e => e.CheckedInByAdminId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // BookingServiceDetail mapping
            modelBuilder.Entity<BookingServiceDetail>(entity =>
            {
                entity.HasKey(e => new { e.BookingId, e.ServiceId });
                entity.Property(e => e.Quantity).HasDefaultValue(1);
                entity.Property(e => e.SnapshotUnitPrice).HasPrecision(12, 2);
                entity.Property(e => e.IsIncurred).HasDefaultValue(false);
                entity.Property(e => e.PaymentStatus).IsRequired().HasMaxLength(20).HasDefaultValue("Unpaid");

                entity.HasOne(e => e.Booking)
                      .WithMany(b => b.BookingServiceDetails)
                      .HasForeignKey(e => e.BookingId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.AddOnService)
                      .WithMany(s => s.BookingServiceDetails)
                      .HasForeignKey(e => e.ServiceId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Invoice mapping
            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalAmount).HasPrecision(12, 2);
                entity.Property(e => e.PaidUpfront).HasPrecision(12, 2).HasDefaultValue(0);
                entity.Property(e => e.FinalDue).HasPrecision(12, 2);
                entity.Property(e => e.InvoiceType).IsRequired().HasMaxLength(30);
                entity.Property(e => e.PaymentStatus).IsRequired().HasMaxLength(20).HasDefaultValue("Unpaid");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Booking)
                      .WithMany(b => b.Invoices)
                      .HasForeignKey(e => e.BookingId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // InternalTask mapping
            modelBuilder.Entity<InternalTask>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TaskCategory).IsRequired().HasMaxLength(30);
                entity.Property(e => e.RequiredStaffCount).HasDefaultValue(1);
                entity.Property(e => e.TaskStatus).IsRequired().HasMaxLength(25).HasDefaultValue("Unassigned");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Booking)
                      .WithMany(b => b.InternalTasks)
                      .HasForeignKey(e => e.BookingId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // TaskAllocation mapping
            modelBuilder.Entity<TaskAllocation>(entity =>
            {
                entity.HasKey(e => new { e.TaskId, e.StaffId });
                entity.Property(e => e.JoinedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.InternalTask)
                      .WithMany(t => t.TaskAllocations)
                      .HasForeignKey(e => e.TaskId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Staff)
                      .WithMany(u => u.TaskAllocations)
                      .HasForeignKey(e => e.StaffId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // BookingLog mapping
            modelBuilder.Entity<BookingLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserFullName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ActionDescription).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Booking)
                      .WithMany(b => b.BookingLogs)
                      .HasForeignKey(e => e.BookingId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Seed Data
            SeedInitialData(modelBuilder);
        }

        private void SeedInitialData(ModelBuilder modelBuilder)
        {
            var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("123456");

            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, FullName = "System Admin", Email = "admin@example.com", PasswordHash = defaultPasswordHash, Role = "ADMIN", CreatedAt = new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) },
                new User { Id = 2, FullName = "John Staff", Email = "staff@example.com", PasswordHash = defaultPasswordHash, Role = "STAFF", CreatedAt = new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) },
                new User { Id = 3, FullName = "Alice User", Email = "alice@example.com", PasswordHash = defaultPasswordHash, Role = "USER", CreatedAt = new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) },
                new User { Id = 4, FullName = "Bob User", Email = "bob@example.com", PasswordHash = defaultPasswordHash, Role = "USER", CreatedAt = new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) }
            );

            // Seed SpaceAssets
            modelBuilder.Entity<SpaceAsset>().HasData(
                new SpaceAsset { Id = 1, LocationName = "Lầu 1", AssetName = "Hot Desk 101", AssetType = "Hot_Desk", BasePrice = 50000m, Capacity = 1, Dimensions = "1.2m x 0.8m", AreaM2 = 0.96m, IsActive = true },
                new SpaceAsset { Id = 2, LocationName = "Lầu 2", AssetName = "Meeting Room A", AssetType = "Meeting_Room", BasePrice = 300000m, Capacity = 10, Dimensions = "5m x 4m", AreaM2 = 20.00m, IsActive = true }
            );

            // Seed AddOnServices
            modelBuilder.Entity<AddOnService>().HasData(
                new AddOnService { Id = 1, ServiceName = "Trà đá & Cà phê", ChargeMethod = "Fixed", UnitPrice = 20000m, IsAvailable = true },
                new AddOnService { Id = 2, ServiceName = "Projector", ChargeMethod = "By_Hour", UnitPrice = 50000m, IsAvailable = true }
            );

            // Seed RoomLayouts
            modelBuilder.Entity<RoomLayout>().HasData(
                new RoomLayout { Id = 1, AssetId = 2, LayoutName = "Chữ U", MaxCapacity = 8, SetupDurationMinutes = 15, PriceModifier = 50000m },
                new RoomLayout { Id = 2, AssetId = 2, LayoutName = "Lớp học", MaxCapacity = 10, SetupDurationMinutes = 20, PriceModifier = 0m }
            );

            // Seed Bookings
            modelBuilder.Entity<Booking>().HasData(
                new Booking { Id = 1, UserId = 3, AssetId = 1, LayoutId = 1, StartTime = DateTime.UtcNow.AddDays(1), EndTime = DateTime.UtcNow.AddDays(1).AddHours(2), BookingStatus = "Awaiting_Payment", SnapshotBasePrice = 50000m, SnapshotPriceModifier = 0m, PaymentDeadline = DateTime.UtcNow.AddMinutes(10), CreatedAt = DateTime.UtcNow },
                new Booking { Id = 2, UserId = 4, AssetId = 2, LayoutId = 1, StartTime = DateTime.UtcNow.AddDays(2), EndTime = DateTime.UtcNow.AddDays(2).AddHours(4), BookingStatus = "Confirmed", SnapshotBasePrice = 1200000m, SnapshotPriceModifier = 50000m, CreatedAt = DateTime.UtcNow },
                new Booking { Id = 3, UserId = 3, AssetId = 2, LayoutId = 2, StartTime = DateTime.UtcNow.AddHours(-1), EndTime = DateTime.UtcNow.AddHours(2), BookingStatus = "Checked_In", SnapshotBasePrice = 900000m, SnapshotPriceModifier = 0m, CreatedAt = DateTime.UtcNow }
            );

            // Seed Tasks
            modelBuilder.Entity<InternalTask>().HasData(
                new InternalTask { Id = 1, BookingId = 2, TaskCategory = "LOGISTICS", TaskDescription = "Setup Chữ U cho Booking #2 (Bob)", RequiredStaffCount = 1, TaskStatus = "Unassigned", CreatedAt = DateTime.UtcNow },
                new InternalTask { Id = 2, BookingId = 3, TaskCategory = "CLEANING", TaskDescription = "Dọn phòng sau khi Booking #3 (Alice) checkout", RequiredStaffCount = 1, TaskStatus = "Unassigned", CreatedAt = DateTime.UtcNow }
            );
        }
    }
}
