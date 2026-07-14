using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Data.Configurations
{
    public class RoomLayoutConfiguration : IEntityTypeConfiguration<RoomLayout>
    {
        public void Configure(EntityTypeBuilder<RoomLayout> builder)
        {
            builder.ToTable("Room_Layout");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.LayoutName).IsRequired().HasMaxLength(50);
            builder.Property(e => e.PriceModifier).HasPrecision(12, 2).HasDefaultValue(0);

            builder.HasOne(e => e.SpaceAsset)
                  .WithMany(s => s.RoomLayouts)
                  .HasForeignKey(e => e.AssetId)
                  .OnDelete(DeleteBehavior.Restrict);

            builder.HasData(SeedData.GetRoomLayouts());
        }
    }
}
