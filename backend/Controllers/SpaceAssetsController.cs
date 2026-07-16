using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Entities;
using backend.DTOs;
using System.Threading.Tasks;
using System.Linq;

using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/space-assets")]
    [Authorize]
    public class SpaceAssetsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SpaceAssetsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var assets = await _context.SpaceAssets
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
                    Description = a.Description
                })
                .ToListAsync();

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
                Description = dto.Description
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
                Description = asset.Description
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
                Description = asset.Description
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
