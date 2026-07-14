using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Data.Configurations
{
    public class InternalTaskConfiguration : IEntityTypeConfiguration<InternalTask>
    {
        public void Configure(EntityTypeBuilder<InternalTask> builder)
        {
            builder.ToTable("Internal_Tasks");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.TaskCategory).IsRequired().HasMaxLength(30);
            builder.Property(e => e.RequiredStaffCount).HasDefaultValue(1);
            builder.Property(e => e.TaskStatus).IsRequired().HasMaxLength(25).HasDefaultValue("Unassigned");
            builder.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.HasOne(e => e.Booking)
                  .WithMany(b => b.InternalTasks)
                  .HasForeignKey(e => e.BookingId)
                  .OnDelete(DeleteBehavior.Cascade);

            builder.HasData(SeedData.GetInternalTasks());
        }
    }
}
