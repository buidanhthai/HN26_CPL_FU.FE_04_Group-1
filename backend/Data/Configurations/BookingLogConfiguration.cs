using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Data.Configurations
{
    public class BookingLogConfiguration : IEntityTypeConfiguration<BookingLog>
    {
        public void Configure(EntityTypeBuilder<BookingLog> builder)
        {
            builder.ToTable("Booking_Log");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.UserFullName).IsRequired().HasMaxLength(100);
            builder.Property(e => e.ActionDescription).IsRequired().HasMaxLength(500);
            builder.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.HasOne(e => e.Booking)
                  .WithMany(b => b.BookingLogs)
                  .HasForeignKey(e => e.BookingId)
                  .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
