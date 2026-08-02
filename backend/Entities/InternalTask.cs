using System;
using System.Collections.Generic;

namespace backend.Entities
{
    public class InternalTask
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public int? SpaceAssetId { get; set; }
        public string TaskCategory { get; set; } = string.Empty; // FRONT_DESK, TECHNICAL, F_B, LOGISTICS
        public string? TaskDescription { get; set; }
        public int RequiredStaffCount { get; set; } = 1;
        public string TaskStatus { get; set; } = "Unassigned"; // Unassigned, In_Progress, Completed, Forced_Completed
        public string Priority { get; set; } = "MEDIUM"; // URGENT, HIGH, MEDIUM, LOW
        public DateTime? Deadline { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Booking? Booking { get; set; }
        public SpaceAsset? SpaceAsset { get; set; }
        public ICollection<TaskAllocation> TaskAllocations { get; set; } = new List<TaskAllocation>();
        public ICollection<TaskLog> TaskLogs { get; set; } = new List<TaskLog>();
    }
}
