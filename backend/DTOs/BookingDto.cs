using System;

namespace backend.DTOs
{
    public class BookingDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int AssetId { get; set; }
        public int LayoutId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string BookingStatus { get; set; } = "Pending";
        public DateTime? PaymentDeadline { get; set; }
        public string? CustomSetupNote { get; set; }
        public decimal SnapshotBasePrice { get; set; }
        public decimal SnapshotPriceModifier { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CheckInVerificationCode { get; set; }
    }

    public class CreateBookingDto
    {
        public int UserId { get; set; }
        public int AssetId { get; set; }
        public int LayoutId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? CustomSetupNote { get; set; }
        public decimal SnapshotBasePrice { get; set; }
        public decimal SnapshotPriceModifier { get; set; }
    }
}
