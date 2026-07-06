namespace backend.Entities
{
    public class BookingServiceDetail
    {
        public int BookingId { get; set; }
        public int ServiceId { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal SnapshotUnitPrice { get; set; }
        public bool IsIncurred { get; set; } = false;
        public string PaymentStatus { get; set; } = "Unpaid"; // Paid, Unpaid

        // Navigation properties
        public Booking? Booking { get; set; }
        public AddOnService? AddOnService { get; set; }
    }
}
