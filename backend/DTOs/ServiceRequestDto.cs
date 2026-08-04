using System;

namespace backend.DTOs
{
    public class ServiceRequestDto
    {
        public int Id { get; set; }
        public int? BookingId { get; set; }
        public int UserId { get; set; }
        public string RequestType { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Detail { get; set; }
        public int? ServiceId { get; set; }
        public int Quantity { get; set; }
        public string RequestStatus { get; set; } = string.Empty;
        public string? ResolvedNote { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? UserFullName { get; set; }
    }
}
