using System;
using System.Collections.Generic;

namespace backend.Entities
{
    public class Booking
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int AssetId { get; set; }
        public int LayoutId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string BookingStatus { get; set; } = "Pending"; // Pending, Awaiting_Payment, Confirmed, Checked_In, Checked_Out, Cancelled
        public DateTime? PaymentDeadline { get; set; }
        public string? CustomSetupNote { get; set; }
        public decimal SnapshotBasePrice { get; set; }
        public decimal SnapshotPriceModifier { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? User { get; set; }
        public SpaceAsset? SpaceAsset { get; set; }
        public RoomLayout? RoomLayout { get; set; }
        public ICollection<BookingServiceDetail> BookingServiceDetails { get; set; } = new List<BookingServiceDetail>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        public ICollection<InternalTask> InternalTasks { get; set; } = new List<InternalTask>();
    }
}
