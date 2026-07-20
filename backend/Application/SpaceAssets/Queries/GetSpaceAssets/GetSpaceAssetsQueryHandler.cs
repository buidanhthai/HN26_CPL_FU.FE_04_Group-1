using MediatR;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace backend.Application.SpaceAssets.Queries.GetSpaceAssets
{
    public class GetSpaceAssetsQueryHandler : IRequestHandler<GetSpaceAssetsQuery, List<SpaceAssetDto>>
    {
        private readonly AppDbContext _context;

        public GetSpaceAssetsQueryHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SpaceAssetDto>> Handle(GetSpaceAssetsQuery request, CancellationToken cancellationToken)
        {
            return await _context.SpaceAssets
                .AsNoTracking() // Tối ưu hiệu năng cho truy vấn đọc (Read-only)
                .Select(a => new SpaceAssetDto
                {
                    Id = a.Id,
                    LocationName = a.LocationName,
                    AssetName = a.AssetName,
                    AssetType = a.AssetType,
                    Capacity = a.Capacity,
                    Dimensions = a.Dimensions,
                    AreaM2 = a.AreaM2,
                    BasePrice = a.BasePrice,
                    IsActive = a.IsActive,
                    Description = a.Description,
                    MapTop = a.MapTop,
                    MapLeft = a.MapLeft,
                    MapWidth = a.MapWidth,
                    MapHeight = a.MapHeight
                })
                .ToListAsync(cancellationToken);
        }
    }
}
