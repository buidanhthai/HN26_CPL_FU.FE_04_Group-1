using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using backend.Data;
using backend.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class BookingSetupTaskService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BookingSetupTaskService> _logger;

        public BookingSetupTaskService(IServiceProvider serviceProvider, ILogger<BookingSetupTaskService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Booking Setup Task Background Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await GenerateSetupTasks();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing GenerateSetupTasks.");
                }

                // Run every 1 minute
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }

            _logger.LogInformation("Booking Setup Task Background Service is stopping.");
        }

        private async Task GenerateSetupTasks()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
                var targetTimeLocal = nowLocal.AddHours(2);

                // Get bookings: Confirmed, starting within the next 2 hours, and not started yet.
                var bookingsNeedSetup = await dbContext.Bookings
                    .Include(b => b.RoomLayout)
                    .Where(b => b.BookingStatus == "Confirmed" 
                                && b.StartTime <= targetTimeLocal 
                                && b.StartTime > nowLocal)
                    .ToListAsync();

                bool changed = false;
                foreach (var booking in bookingsNeedSetup)
                {
                    var existingTask = await dbContext.InternalTasks
                        .AnyAsync(t => t.BookingId == booking.Id && t.TaskCategory == "LOGISTICS");

                    if (!existingTask)
                    {
                        var layoutName = booking.RoomLayout?.LayoutName ?? "Standard";
                        var task = new InternalTask
                        {
                            BookingId = booking.Id,
                            TaskCategory = "LOGISTICS",
                            TaskDescription = $"Chuẩn bị phòng theo sơ đồ {layoutName} cho Booking #{booking.BookingCode}",
                            RequiredStaffCount = 1,
                            TaskStatus = "Unassigned",
                            CreatedAt = backend.Helpers.TimeHelper.GetVietnamTime()
                        };

                        dbContext.InternalTasks.Add(task);
                        _logger.LogInformation($"Created Setup Task (LOGISTICS) for Booking {booking.BookingCode} (ID: {booking.Id})");
                        changed = true;
                    }
                }

                if (changed)
                {
                    await dbContext.SaveChangesAsync();
                }
            }
        }
    }
}
