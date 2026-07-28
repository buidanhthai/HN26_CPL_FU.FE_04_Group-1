using System;

namespace backend.Entities
{
    public class AssetUnavailability
    {
        public int Id { get; set; }
        public int AssetId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Reason { get; set; } = string.Empty;

        // Navigation properties
        public SpaceAsset? SpaceAsset { get; set; }
    }
}
