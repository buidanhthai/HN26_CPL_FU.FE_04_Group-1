using System;

namespace backend.Entities
{
    public class TaskAllocation
    {
        public int TaskId { get; set; }
        public int StaffId { get; set; }
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public InternalTask? InternalTask { get; set; }
        public User? Staff { get; set; }
    }
}
