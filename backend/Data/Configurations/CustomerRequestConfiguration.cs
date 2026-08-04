using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Data.Configurations
{
    public class CustomerRequestConfiguration : IEntityTypeConfiguration<CustomerRequest>
    {
        public void Configure(EntityTypeBuilder<CustomerRequest> builder)
        {
            builder.ToTable("CustomerRequests");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.RequestType).IsRequired().HasMaxLength(50).HasDefaultValue("SERVICE");
            builder.Property(e => e.Title).IsRequired().HasMaxLength(255);
            builder.Property(e => e.RoomName).IsRequired().HasMaxLength(255);
            builder.Property(e => e.Status).IsRequired().HasMaxLength(50).HasDefaultValue("Pending");
            builder.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.HasOne(e => e.User)
                   .WithMany()
                   .HasForeignKey(e => e.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
