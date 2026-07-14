using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Data.Configurations
{
    public class TaskAllocationConfiguration : IEntityTypeConfiguration<TaskAllocation>
    {
        public void Configure(EntityTypeBuilder<TaskAllocation> builder)
        {
            builder.ToTable("Task_Allocations");
            builder.HasKey(e => new { e.TaskId, e.StaffId });
            builder.Property(e => e.JoinedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.HasOne(e => e.InternalTask)
                  .WithMany(t => t.TaskAllocations)
                  .HasForeignKey(e => e.TaskId)
                  .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.Staff)
                  .WithMany(u => u.TaskAllocations)
                  .HasForeignKey(e => e.StaffId)
                  .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
