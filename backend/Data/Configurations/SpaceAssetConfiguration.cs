using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Data.Configurations
{
    public class SpaceAssetConfiguration : IEntityTypeConfiguration<SpaceAsset>
    {
        public void Configure(EntityTypeBuilder<SpaceAsset> builder)
        {
            builder.ToTable("Space_Asset");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.LocationName).IsRequired().HasMaxLength(100);
            builder.Property(e => e.AssetName).IsRequired().HasMaxLength(100);
            builder.Property(e => e.AssetType).IsRequired().HasMaxLength(50);
            builder.Property(e => e.BasePrice).HasPrecision(12, 2);
            builder.Property(e => e.Dimensions).IsRequired().HasMaxLength(50);
            builder.Property(e => e.AreaM2).HasPrecision(6, 2);
            builder.Property(e => e.IsActive).HasDefaultValue(true);
            builder.Property(e => e.MapTop).HasMaxLength(20);
            builder.Property(e => e.MapLeft).HasMaxLength(20);
            builder.Property(e => e.MapWidth).HasMaxLength(20);
            builder.Property(e => e.MapHeight).HasMaxLength(20);

            builder.HasData(SeedData.GetSpaceAssets());
        }
    }
}
