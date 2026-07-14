using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Data.Configurations
{
    public class AddOnServiceConfiguration : IEntityTypeConfiguration<AddOnService>
    {
        public void Configure(EntityTypeBuilder<AddOnService> builder)
        {
            builder.ToTable("Add_on_Service");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.ServiceName).IsRequired().HasMaxLength(100);
            builder.Property(e => e.ChargeMethod).IsRequired().HasMaxLength(30);
            builder.Property(e => e.UnitPrice).HasPrecision(12, 2);
            builder.Property(e => e.IsAvailable).HasDefaultValue(true);

            builder.HasData(SeedData.GetAddOnServices());
        }
    }
}
