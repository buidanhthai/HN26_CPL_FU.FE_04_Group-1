namespace backend.DTOs
{
    public class SpaceAssetDto
    {
        public int Id { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string Dimensions { get; set; } = string.Empty;
        public decimal AreaM2 { get; set; }
        public decimal BasePrice { get; set; }
        public bool IsActive { get; set; } = true;
        public string? Description { get; set; }
        public string? MapTop { get; set; }
        public string? MapLeft { get; set; }
        public string? MapWidth { get; set; }
        public string? MapHeight { get; set; }
    }

    public class CreateSpaceAssetDto
    {
        public string LocationName { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string Dimensions { get; set; } = string.Empty;
        public decimal AreaM2 { get; set; }
        public decimal BasePrice { get; set; }
        public string? Description { get; set; }
        public string? MapTop { get; set; }
        public string? MapLeft { get; set; }
        public string? MapWidth { get; set; }
        public string? MapHeight { get; set; }
    }
}
