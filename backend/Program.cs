using Microsoft.EntityFrameworkCore;
using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FluentValidation;
using MediatR;
using backend.Application.Common.Behaviors;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register FluentValidation
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

// Register MediatR & behaviors
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
    cfg.AddOpenBehavior(typeof(TransactionBehavior<,>));
});

builder.Services.AddHostedService<backend.Services.BookingTimeoutService>();
builder.Services.AddHostedService<backend.Services.BookingSetupTaskService>();

// Configure EF Core MySQL Database Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString)
);

// Cấu hình JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new ArgumentNullException("JWT Key is missing");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// Configure CORS for React Vite Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

// Global Exception Handler Middleware
app.UseMiddleware<backend.Infrastructure.Middleware.ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

// ĐẶT TRƯỚC UseAuthorization
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

// Đảm bảo dữ liệu demo luôn có hiệu lực cho việc demo dashboard
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<backend.Data.AppDbContext>();
    try
    {
        context.Database.Migrate();

        var activeBooking = context.Bookings.FirstOrDefault(b => b.Id == 3);
        if (activeBooking != null)
        {
            var now = backend.Helpers.TimeHelper.GetVietnamTime();
            activeBooking.StartTime = now.AddHours(-1);
            activeBooking.EndTime = now.AddHours(2);
            activeBooking.BookingStatus = "Checked_In";

            var detail1 = context.BookingServiceDetails.FirstOrDefault(d => d.BookingId == 3 && d.ServiceId == 1);
            if (detail1 == null)
            {
                context.BookingServiceDetails.Add(new backend.Entities.BookingServiceDetail
                {
                    BookingId = 3,
                    ServiceId = 1,
                    Quantity = 2,
                    SnapshotUnitPrice = 20000m,
                    IsIncurred = false,
                    PaymentStatus = "Paid"
                });
            }

            var detail2 = context.BookingServiceDetails.FirstOrDefault(d => d.BookingId == 3 && d.ServiceId == 2);
            if (detail2 == null)
            {
                context.BookingServiceDetails.Add(new backend.Entities.BookingServiceDetail
                {
                    BookingId = 3,
                    ServiceId = 2,
                    Quantity = 1,
                    SnapshotUnitPrice = 50000m,
                    IsIncurred = true,
                    PaymentStatus = "Unpaid"
                });
            }

            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error running dynamic seeding: {ex.Message}");
    }
}

app.Run();