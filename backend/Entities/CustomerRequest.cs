using System;

namespace backend.Entities
{
    public class CustomerRequest
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string RequestType { get; set; } = "SERVICE"; // SERVICE or INCIDENT
        public string Title { get; set; } = string.Empty;
        public string Detail { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, In_Progress, Resolved
        public string? ResolvedNote { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
    }
}
