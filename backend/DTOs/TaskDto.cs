using System;

namespace backend.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public int? SpaceAssetId { get; set; }
        public string? RoomNumber { get; set; } // Số phòng (LocationName + AssetName)
        public string TaskCategory { get; set; } = string.Empty;
        public string? TaskDescription { get; set; }
        public int RequiredStaffCount { get; set; }
        public string TaskStatus { get; set; } = "Unassigned";
        public string Priority { get; set; } = "MEDIUM";
        public DateTime? Deadline { get; set; }
        public DateTime CreatedAt { get; set; }
        public AssignedStaffDto? AssignedStaff { get; set; }
        public System.Collections.Generic.List<TaskLogDto> TaskLogs { get; set; } = new();
    }

    public class TaskLogDto
    {
        public int Id { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string ActionDescription { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class AssignedStaffDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
    }

    public class CreateTaskDto
    {
        public int BookingId { get; set; }
        public int? SpaceAssetId { get; set; }
        public string TaskCategory { get; set; } = string.Empty;
        public string? TaskDescription { get; set; }
        public int RequiredStaffCount { get; set; } = 1;
        public string Priority { get; set; } = "MEDIUM";
        public DateTime? Deadline { get; set; }
    }

    public class UpdateTaskDto
    {
        public string? TaskCategory { get; set; }
        public string? TaskDescription { get; set; }
        public int? RequiredStaffCount { get; set; }
        public string? TaskStatus { get; set; }
        public string? Priority { get; set; }
        public DateTime? Deadline { get; set; }
        public int? SpaceAssetId { get; set; }
    }

    public class CompleteTaskDto
    {
        public string? CompletionNote { get; set; }
        public string? EvidenceImageUrl { get; set; }
    }
}
