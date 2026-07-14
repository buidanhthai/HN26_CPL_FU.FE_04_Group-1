using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using backend.Data;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class BookingTimeoutService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BookingTimeoutService> _logger;

        public BookingTimeoutService(IServiceProvider serviceProvider, ILogger<BookingTimeoutService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Booking Timeout Background Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                await CancelExpiredBookings();
                
                // Run every 1 minute
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }

            _logger.LogInformation("Booking Timeout Background Service is stopping.");
        }

        private async Task CancelExpiredBookings()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var expiredBookings = await dbContext.Bookings
                    .Where(b => b.BookingStatus == "Awaiting_Payment" 
                                && b.PaymentDeadline.HasValue 
                                && b.PaymentDeadline.Value < backend.Helpers.TimeHelper.GetVietnamTime())
                    .ToListAsync();

                if (expiredBookings.Any())
                {
                    _logger.LogInformation($"Found {expiredBookings.Count} expired bookings. Cancelling...");

                    foreach (var booking in expiredBookings)
                    {
                        booking.BookingStatus = "Cancelled";
                    }

                    await dbContext.SaveChangesAsync();
                    _logger.LogInformation("Expired bookings have been cancelled successfully.");
                }
            }
        }
    }
}
