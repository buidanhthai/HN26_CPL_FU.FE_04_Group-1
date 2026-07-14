using System;

namespace backend.Entities
{
    public class BookingLog
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string ActionDescription { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Booking? Booking { get; set; }
    }
}
