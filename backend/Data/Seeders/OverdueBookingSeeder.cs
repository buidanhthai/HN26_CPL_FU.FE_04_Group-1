using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Entities;

namespace backend.Data.Seeders
{
    public static class OverdueBookingSeeder
    {
        public static async Task SeedOverdueBookingAsync(AppDbContext context)
        {
            var now = DateTime.UtcNow;

            // Seed một đơn đặt chỗ quá hạn 25 phút nhưng khách hàng vẫn chưa checkout
            var overdueBooking = await context.Bookings.FirstOrDefaultAsync(b => b.BookingCode == "BK-OVERDUE-25M");
            if (overdueBooking == null)
            {
                overdueBooking = new Booking
                {
                    UserId = 3,
                    CustomerName = "Trần Văn B",
                    AssetId = 3,
                    LayoutId = 1,
                    StartTime = now.AddHours(-2),
                    EndTime = now.AddMinutes(-25), // Quá hạn 25 phút
                    BookingStatus = "Checked_In",
                    BookingCode = "BK-OVERDUE-25M",
                    SnapshotBasePrice = 300000m,
                    SnapshotPriceModifier = 0m,
                    CreatedAt = now.AddHours(-3),
                    Arrived = true
                };
                context.Bookings.Add(overdueBooking);
                await context.SaveChangesAsync();
            }
            else
            {
                overdueBooking.EndTime = now.AddMinutes(-25);
                overdueBooking.BookingStatus = "Checked_In";
            }
        }
    }
}
