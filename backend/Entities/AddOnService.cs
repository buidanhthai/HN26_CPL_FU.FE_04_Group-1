using System.Collections.Generic;

namespace backend.Entities
{
    public class AddOnService
    {
        public int Id { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string ChargeMethod { get; set; } = string.Empty; // Fixed, By_Hour, By_Quantity
        public decimal UnitPrice { get; set; }
        public bool IsAvailable { get; set; } = true;

        // Navigation properties
        public ICollection<BookingServiceDetail> BookingServiceDetails { get; set; } = new List<BookingServiceDetail>();
    }
}
