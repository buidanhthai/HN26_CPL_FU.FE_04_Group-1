using System;

namespace backend.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public string TaskCategory { get; set; } = string.Empty;
        public string? TaskDescription { get; set; }
        public int RequiredStaffCount { get; set; }
        public string TaskStatus { get; set; } = "Unassigned";
        public DateTime CreatedAt { get; set; }
    }

    public class CreateTaskDto
    {
        public int BookingId { get; set; }
        public string TaskCategory { get; set; } = string.Empty;
        public string? TaskDescription { get; set; }
        public int RequiredStaffCount { get; set; } = 1;
    }

    public class UpdateTaskDto
    {
        public string? TaskCategory { get; set; }
        public string? TaskDescription { get; set; }
        public int? RequiredStaffCount { get; set; }
        public string? TaskStatus { get; set; }
    }
}
