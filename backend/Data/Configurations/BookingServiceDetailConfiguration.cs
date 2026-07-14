using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Data.Configurations
{
    public class BookingServiceDetailConfiguration : IEntityTypeConfiguration<BookingServiceDetail>
    {
        public void Configure(EntityTypeBuilder<BookingServiceDetail> builder)
        {
            builder.ToTable("Booking_Service_Detail");
            builder.HasKey(e => new { e.BookingId, e.ServiceId });
            builder.Property(e => e.Quantity).HasDefaultValue(1);
            builder.Property(e => e.SnapshotUnitPrice).HasPrecision(12, 2);
            builder.Property(e => e.IsIncurred).HasDefaultValue(false);
            builder.Property(e => e.PaymentStatus).IsRequired().HasMaxLength(20).HasDefaultValue("Unpaid");

            builder.HasOne(e => e.Booking)
                  .WithMany(b => b.BookingServiceDetails)
                  .HasForeignKey(e => e.BookingId)
                  .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.AddOnService)
                  .WithMany(s => s.BookingServiceDetails)
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
