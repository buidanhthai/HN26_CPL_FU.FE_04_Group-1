using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Data.Configurations
{
    public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
    {
        public void Configure(EntityTypeBuilder<Invoice> builder)
        {
            builder.ToTable("Invoice");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.TotalAmount).HasPrecision(12, 2);
            builder.Property(e => e.PaidUpfront).HasPrecision(12, 2).HasDefaultValue(0);
            builder.Property(e => e.FinalDue).HasPrecision(12, 2);
            builder.Property(e => e.InvoiceType).IsRequired().HasMaxLength(30);
            builder.Property(e => e.PaymentStatus).IsRequired().HasMaxLength(20).HasDefaultValue("Unpaid");
            builder.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.HasOne(e => e.Booking)
                  .WithMany(b => b.Invoices)
                  .HasForeignKey(e => e.BookingId)
                  .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
