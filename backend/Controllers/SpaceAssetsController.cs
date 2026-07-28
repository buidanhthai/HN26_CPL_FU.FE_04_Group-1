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

        [HttpPost("{id}/maintenance-check")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CheckMaintenanceConflicts(int id, [FromBody] MaintenanceCheckDto dto)
        {
            var asset = await _context.SpaceAssets.FindAsync(id);
            if (asset == null) return NotFound(new { message = "Không tìm thấy không gian." });

            var conflicts = await _context.Bookings
                .Where(b => b.AssetId == id && b.BookingStatus != "Cancelled" && b.BookingStatus != "Checked_Out")
                .Where(b => b.StartTime < dto.EndTime && dto.StartTime < b.EndTime)
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    AssetId = b.AssetId,
                    LayoutId = b.LayoutId,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    BookingStatus = b.BookingStatus,
                    CustomerName = b.CustomerName,
                    CustomerPhone = b.CustomerPhone,
                    BookingCode = b.BookingCode,
                    SnapshotBasePrice = b.SnapshotBasePrice,
                    SnapshotPriceModifier = b.SnapshotPriceModifier,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            return Ok(conflicts);
        }

        [HttpPost("{id}/maintenance-lock")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> LockForMaintenance(int id, [FromBody] MaintenanceLockDto dto)
        {
            var asset = await _context.SpaceAssets.FindAsync(id);
            if (asset == null) return NotFound(new { message = "Không tìm thấy không gian." });

            using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            try
            {
                // Thêm lịch bảo trì
                var unavailability = new AssetUnavailability
                {
                    AssetId = id,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    Reason = dto.Reason
                };
                _context.AssetUnavailabilities.Add(unavailability);

                // Xử lý các tranh chấp lịch
                foreach (var res in dto.Resolutions)
                {
                    var booking = await _context.Bookings.FindAsync(res.BookingId);
                    if (booking == null) continue;

                    if (res.Action == "Cancel")
                    {
                        decimal totalPaid = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
                        booking.RefundAmount = totalPaid; // Hoàn tiền 100%
                        booking.CancellationReason = $"Phòng họp bảo trì đột xuất: {dto.Reason}";
                        booking.BookingStatus = "Cancelled";
                        booking.PaymentDeadline = null;

                        // Tạo log
                        var log = new BookingLog
                        {
                            BookingId = booking.Id,
                            UserFullName = "Hệ thống (Bảo trì)",
                            ActionDescription = $"Đơn đặt chỗ tự động hủy chuyển hoàn tiền do phòng họp bảo trì đột xuất. Lý do bảo trì: {dto.Reason}.",
                            Timestamp = backend.Helpers.TimeHelper.GetVietnamTime()
                        };
                        _context.BookingLogs.Add(log);
                    }
                    else if (res.Action == "Switch" && res.NewAssetId.HasValue && res.NewLayoutId.HasValue)
                    {
                        var newAsset = await _context.SpaceAssets.FindAsync(res.NewAssetId.Value);
                        var newLayout = await _context.RoomLayouts.FindAsync(res.NewLayoutId.Value);

                        if (newAsset != null && newLayout != null)
                        {
                            var oldAssetId = booking.AssetId;
                            booking.AssetId = res.NewAssetId.Value;
                            booking.LayoutId = res.NewLayoutId.Value;

                            // Cập nhật giá nếu có
                            booking.SnapshotBasePrice = newAsset.BasePrice;
                            booking.SnapshotPriceModifier = newLayout.PriceModifier;

                            // Tạo log
                            var log = new BookingLog
                            {
                                BookingId = booking.Id,
                                UserFullName = "Hệ thống (Bảo trì)",
                                ActionDescription = $"Đơn đặt chỗ tự động chuyển đổi không gian từ phòng ID {oldAssetId} sang phòng {newAsset.AssetName} do bảo trì.",
                                Timestamp = backend.Helpers.TimeHelper.GetVietnamTime()
                            };
                            _context.BookingLogs.Add(log);
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Khóa bảo trì không gian thành công." });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    public class MaintenanceCheckDto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class MaintenanceLockDto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Reason { get; set; } = string.Empty;
        public System.Collections.Generic.List<ConflictResolutionItemDto> Resolutions { get; set; } = new();
    }

    public class ConflictResolutionItemDto
    {
        public int BookingId { get; set; }
        public string Action { get; set; } = "Cancel"; // Cancel or Switch
        public int? NewAssetId { get; set; }
        public int? NewLayoutId { get; set; }
    }
}
