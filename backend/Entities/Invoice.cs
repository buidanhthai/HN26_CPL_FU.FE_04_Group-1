using System;

namespace backend.Entities
{
    public class Invoice
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidUpfront { get; set; }
        public decimal FinalDue { get; set; }
        public string InvoiceType { get; set; } = string.Empty; // Upfront, Consolidated
        public string PaymentStatus { get; set; } = "Unpaid"; // Paid, Unpaid, Awaiting_Final_Payment
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Booking? Booking { get; set; }
    }
}
