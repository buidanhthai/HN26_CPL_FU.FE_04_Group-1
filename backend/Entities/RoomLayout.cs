using System.Collections.Generic;

namespace backend.Entities
{
    public class RoomLayout
    {
        public int Id { get; set; }
        public int AssetId { get; set; }
        public string LayoutName { get; set; } = string.Empty;
        public int MaxCapacity { get; set; }
        public int SetupDurationMinutes { get; set; }
        public decimal PriceModifier { get; set; }

        // Navigation properties
        public SpaceAsset? SpaceAsset { get; set; }
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
