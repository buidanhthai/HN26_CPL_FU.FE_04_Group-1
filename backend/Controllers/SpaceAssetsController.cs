using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Entities;
using backend.DTOs;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using backend.Application.SpaceAssets.Queries.GetSpaceAssets;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/space-assets")]
    [Authorize]
    public class SpaceAssetsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMediator _mediator;

        public SpaceAssetsController(AppDbContext context, IMediator mediator)
        {
            _context = context;
            _mediator = mediator;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var query = new GetSpaceAssetsQuery();
            var assets = await _mediator.Send(query);
            return Ok(assets);
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Create([FromBody] CreateSpaceAssetDto dto)
        {
            var asset = new SpaceAsset
            {
                LocationName = dto.LocationName,
                AssetName = dto.AssetName,
                AssetType = dto.AssetType,
                Capacity = dto.Capacity,
                Dimensions = dto.Dimensions,
                AreaM2 = dto.AreaM2,
                BasePrice = dto.BasePrice,
                IsActive = true,
                Description = dto.Description,
                MapTop = dto.MapTop,
                MapLeft = dto.MapLeft,
                MapWidth = dto.MapWidth,
                MapHeight = dto.MapHeight
            };

            _context.SpaceAssets.Add(asset);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = asset.Id }, new SpaceAssetDto
            {
                Id = asset.Id,
                LocationName = asset.LocationName,
                AssetName = asset.AssetName,
                AssetType = asset.AssetType,
                Capacity = asset.Capacity,
                Dimensions = asset.Dimensions,
                AreaM2 = asset.AreaM2,
                BasePrice = asset.BasePrice,
                IsActive = asset.IsActive,
                Description = asset.Description,
                MapTop = asset.MapTop,
                MapLeft = asset.MapLeft,
                MapWidth = asset.MapWidth,
                MapHeight = asset.MapHeight
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateSpaceAssetDto dto)
        {
            var asset = await _context.SpaceAssets.FindAsync(id);
            if (asset == null) return NotFound();

            asset.LocationName = dto.LocationName;
            asset.AssetName = dto.AssetName;
            asset.AssetType = dto.AssetType;
            asset.Capacity = dto.Capacity;
            asset.Dimensions = dto.Dimensions;
            asset.AreaM2 = dto.AreaM2;
            asset.BasePrice = dto.BasePrice;
            asset.Description = dto.Description;
            asset.MapTop = dto.MapTop;
            asset.MapLeft = dto.MapLeft;
            asset.MapWidth = dto.MapWidth;
            asset.MapHeight = dto.MapHeight;

            await _context.SaveChangesAsync();

            return Ok(new SpaceAssetDto
            {
                Id = asset.Id,
                LocationName = asset.LocationName,
                AssetName = asset.AssetName,
                AssetType = asset.AssetType,
                Capacity = asset.Capacity,
                Dimensions = asset.Dimensions,
                AreaM2 = asset.AreaM2,
                BasePrice = asset.BasePrice,
                IsActive = asset.IsActive,
                Description = asset.Description,
                MapTop = asset.MapTop,
                MapLeft = asset.MapLeft,
                MapWidth = asset.MapWidth,
                MapHeight = asset.MapHeight
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            var asset = await _context.SpaceAssets.FindAsync(id);
            if (asset == null) return NotFound();

            _context.SpaceAssets.Remove(asset);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
