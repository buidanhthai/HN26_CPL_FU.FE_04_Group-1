using System.Collections.Generic;

namespace backend.Entities
{
    public class SpaceAsset
    {
        public int Id { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty; // Hot_Desk, Meeting_Room, Workshop_Space
        public decimal BasePrice { get; set; }
        public int Capacity { get; set; }
        public string Dimensions { get; set; } = string.Empty;
        public decimal AreaM2 { get; set; }
        public bool IsActive { get; set; } = true;
        public string? Description { get; set; }
        public string? MapTop { get; set; }
        public string? MapLeft { get; set; }
        public string? MapWidth { get; set; }
        public string? MapHeight { get; set; }

        // Navigation properties
        public ICollection<RoomLayout> RoomLayouts { get; set; } = new List<RoomLayout>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
