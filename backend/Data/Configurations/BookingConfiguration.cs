using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Data.Configurations
{
    public class BookingConfiguration : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder.ToTable("Booking");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.BookingStatus).IsRequired().HasMaxLength(25).HasDefaultValue("Pending");
            builder.Property(e => e.SnapshotBasePrice).HasPrecision(12, 2);
            builder.Property(e => e.SnapshotPriceModifier).HasPrecision(12, 2).HasDefaultValue(0);
            builder.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(e => e.CheckInVerificationCode).HasMaxLength(10);

            builder.HasOne(e => e.User)
                  .WithMany(u => u.Bookings)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.SpaceAsset)
                  .WithMany(s => s.Bookings)
                  .HasForeignKey(e => e.AssetId)
                  .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.RoomLayout)
                  .WithMany(r => r.Bookings)
                  .HasForeignKey(e => e.LayoutId)
                  .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.CheckedInByAdmin)
                  .WithMany()
                  .HasForeignKey(e => e.CheckedInByAdminId)
                  .OnDelete(DeleteBehavior.Restrict);

            builder.HasData(SeedData.GetBookings());
        }
    }
}
