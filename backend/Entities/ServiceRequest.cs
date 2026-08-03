using System;

namespace backend.Entities
{
    public class ServiceRequest
    {
        public int Id { get; set; }
        public int? BookingId { get; set; }
        public int UserId { get; set; }
        public string RequestType { get; set; } = "SERVICE"; // SERVICE or INCIDENT
        public string RoomName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Detail { get; set; }
        public int? ServiceId { get; set; }
        public int Quantity { get; set; } = 1;
        public string RequestStatus { get; set; } = "Pending"; // Pending, In_Progress, Resolved
        public string? ResolvedNote { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Booking? Booking { get; set; }
        public User? User { get; set; }
        public AddOnService? AddOnService { get; set; }
    }
}
