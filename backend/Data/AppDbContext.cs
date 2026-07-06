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

        public DbSet<User> Users { get; set; }
        public DbSet<SpaceAsset> SpaceAssets { get; set; }
        public DbSet<AddOnService> AddOnServices { get; set; }
        public DbSet<RoomLayout> RoomLayouts { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingServiceDetail> BookingServiceDetails { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InternalTask> InternalTasks { get; set; }
        public DbSet<TaskAllocation> TaskAllocations { get; set; }

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

            // Seed Data
            SeedInitialData(modelBuilder);
        }

        private void SeedInitialData(ModelBuilder modelBuilder)
        {
            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, FullName = "System Admin", Email = "admin@example.com", PasswordHash = "admin_pwd_hash", Role = "ADMIN", CreatedAt = new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) },
                new User { Id = 2, FullName = "John Staff", Email = "staff@example.com", PasswordHash = "staff_pwd_hash", Role = "STAFF", CreatedAt = new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) },
                new User { Id = 3, FullName = "Alice User", Email = "alice@example.com", PasswordHash = "user_pwd_hash", Role = "USER", CreatedAt = new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) }
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
        }
    }
}
