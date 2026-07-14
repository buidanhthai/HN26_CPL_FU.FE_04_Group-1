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
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}
