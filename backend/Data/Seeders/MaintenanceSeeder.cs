using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Entities;

namespace backend.Data.Seeders
{
    public static class MaintenanceSeeder
    {
        public static async Task SeedMaintenanceDataAsync(AppDbContext context)
        {
            var now = DateTime.UtcNow;

            // Đặt không gian số 5 sang trạng thái bảo trì IsMaintenance = true
            var asset = await context.SpaceAssets.FirstOrDefaultAsync(a => a.Id == 5);
            if (asset != null)
            {
                asset.IsMaintenance = true;
            }

            // Ghi nhận bản ghi khóa bảo trì chi tiết nếu chưa tồn tại
            var unavailExists = await context.AssetUnavailabilities.AnyAsync(u => u.AssetId == 5);
            if (!unavailExists)
            {
                context.AssetUnavailabilities.Add(new AssetUnavailability
                {
                    AssetId = 5,
                    StartTime = now.AddDays(-1),
                    EndTime = now.AddDays(2),
                    Reason = "Đang bảo trì định kỳ hệ thống điều hòa và thay thế thảm trải sàn."
                });
            }
        }
    }
}
