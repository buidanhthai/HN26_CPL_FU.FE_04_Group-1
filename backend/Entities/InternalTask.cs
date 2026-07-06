using System;
using System.Collections.Generic;

namespace backend.Entities
{
    public class InternalTask
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public string TaskCategory { get; set; } = string.Empty; // FRONT_DESK, TECHNICAL, F_B, LOGISTICS
        public string? TaskDescription { get; set; }
        public int RequiredStaffCount { get; set; } = 1;
        public string TaskStatus { get; set; } = "Unassigned"; // Unassigned, In_Progress, Completed, Forced_Completed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Booking? Booking { get; set; }
        public ICollection<TaskAllocation> TaskAllocations { get; set; } = new List<TaskAllocation>();
    }
}
