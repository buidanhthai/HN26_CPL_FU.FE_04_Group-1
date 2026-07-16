using System.Collections.Generic;

namespace backend.DTOs
{
    public class CalculateEstimateDto
    {
        public int AssetId { get; set; }
        public int LayoutId { get; set; }
        public int Duration { get; set; }
        public List<int> SelectedAddonIds { get; set; } = new();
    }

    public class EstimateResultDto
    {
        public decimal SpaceCost { get; set; }
        public decimal AddonsCost { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
