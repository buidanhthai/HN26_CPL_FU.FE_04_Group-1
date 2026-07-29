using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Entities;

namespace backend.Data.Configurations
{
    public class TaskLogConfiguration : IEntityTypeConfiguration<TaskLog>
    {
        public void Configure(EntityTypeBuilder<TaskLog> builder)
        {
            builder.ToTable("Task_Log");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.UserFullName).IsRequired().HasMaxLength(100);
            builder.Property(e => e.ActionDescription).IsRequired().HasMaxLength(500);
            builder.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.HasOne(e => e.Task)
                  .WithMany(t => t.TaskLogs)
                  .HasForeignKey(e => e.TaskId)
                  .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
