using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Entities;
using backend.DTOs;
using System.Threading.Tasks;
using System.Linq;
using System;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Collections.Generic;

namespace backend.Controllers
{
    public partial class BookingsController : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetBookings()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var query = _context.Bookings.AsQueryable();

            if (string.Equals(userRole, "USER", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(b => b.UserId == userId);
            }

            var bookings = await query
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    AssetId = b.AssetId,
                    LayoutId = b.LayoutId,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    BookingStatus = b.BookingStatus,
                    PaymentDeadline = b.PaymentDeadline,
                    CustomSetupNote = b.CustomSetupNote,
                    SnapshotBasePrice = b.SnapshotBasePrice,
                    SnapshotPriceModifier = b.SnapshotPriceModifier,
                    CreatedAt = b.CreatedAt,
                    BookingCode = b.BookingCode,
                    CustomerName = b.CustomerName,
                    CustomerPhone = b.CustomerPhone,
                    CreatedByUserId = b.CreatedByUserId,
                    SetupTaskStatus = b.InternalTasks.FirstOrDefault(t => t.TaskCategory == "LOGISTICS").TaskStatus
                }).ToListAsync();

            return Ok(bookings);
        }

        [HttpGet("active")]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> GetActiveBooking([FromQuery] int? bookingId = null)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            var query = _context.Bookings
                .Include(b => b.SpaceAsset)
                .Include(b => b.RoomLayout)
                .Include(b => b.InternalTasks)
                .Include(b => b.BookingServiceDetails)
                    .ThenInclude(sd => sd.AddOnService)
                .AsQueryable();

            Booking? booking = null;

            if (bookingId.HasValue)
            {
                booking = await query.FirstOrDefaultAsync(b => b.Id == bookingId.Value && b.UserId == currentUserId);
            }
            else
            {
                booking = await query
                    .Where(b => b.UserId == currentUserId && b.BookingStatus == "Checked_In")
                    .FirstOrDefaultAsync();

                if (booking == null)
                {
                    booking = await query
                        .Where(b => b.UserId == currentUserId && b.BookingStatus != "Cancelled" && b.BookingStatus != "Checked_Out")
                        .OrderBy(b => b.StartTime)
                        .FirstOrDefaultAsync();
                }
            }

            if (booking == null)
            {
                return Ok(null);
            }

            var prepaidFee = booking.SnapshotBasePrice + booking.SnapshotPriceModifier + 
                             booking.BookingServiceDetails
                                 .Where(sd => !sd.IsIncurred)
                                 .Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);

            var services = booking.BookingServiceDetails.Select(sd => new
            {
                sd.ServiceId,
                ServiceName = sd.AddOnService?.ServiceName ?? "Dịch vụ",
                sd.Quantity,
                sd.SnapshotUnitPrice,
                sd.PaymentStatus,
                sd.IsIncurred
            }).ToList();

            var incurredUnpaidTotal = booking.BookingServiceDetails
                .Where(sd => sd.IsIncurred && sd.PaymentStatus == "Unpaid")
                .Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);

            var incurredPaidTotal = booking.BookingServiceDetails
                .Where(sd => sd.IsIncurred && sd.PaymentStatus == "Paid")
                .Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);

            var totalAmount = prepaidFee + incurredUnpaidTotal + incurredPaidTotal;

            bool isOverdue = booking.BookingStatus == "Checked_In" && backend.Helpers.TimeHelper.GetVietnamTime() > booking.EndTime;
            int overdueMinutes = isOverdue ? (int)(backend.Helpers.TimeHelper.GetVietnamTime() - booking.EndTime).TotalMinutes : 0;

            return Ok(new
            {
                booking = new BookingDto
                {
                    Id = booking.Id,
                    UserId = booking.UserId,
                    AssetId = booking.AssetId,
                    LayoutId = booking.LayoutId,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    BookingStatus = booking.BookingStatus,
                    PaymentDeadline = booking.PaymentDeadline,
                    CustomSetupNote = booking.CustomSetupNote,
                    SnapshotBasePrice = booking.SnapshotBasePrice,
                    SnapshotPriceModifier = booking.SnapshotPriceModifier,
                    CreatedAt = booking.CreatedAt,
                    BookingCode = booking.BookingCode,
                    SetupTaskStatus = booking.InternalTasks.FirstOrDefault(t => t.TaskCategory == "LOGISTICS")?.TaskStatus
                },
                spaceAsset = new
                {
                    booking.SpaceAsset?.AssetName,
                    booking.SpaceAsset?.LocationName,
                    booking.SpaceAsset?.Capacity,
                    booking.SpaceAsset?.Dimensions,
                    booking.SpaceAsset?.AreaM2,
                    booking.SpaceAsset?.AssetType
                },
                roomLayout = new
                {
                    booking.RoomLayout?.LayoutName,
                    booking.RoomLayout?.SetupDurationMinutes
                },
                services,
                prepaidFee,
                incurredUnpaidTotal,
                totalAmount,
                isOverdue,
                overdueMinutes
            });
        }

        [HttpGet("{id}/details")]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> GetBookingDetails(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.SpaceAsset)
                .Include(b => b.RoomLayout)
                .Include(b => b.InternalTasks)
                .Include(b => b.BookingServiceDetails)
                    .ThenInclude(sd => sd.AddOnService)
                .Include(b => b.BookingLogs)
                .Include(b => b.Invoices)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            int currentUserId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

            bool isStaffOrAdmin = string.Equals(userRole, "STAFF", StringComparison.OrdinalIgnoreCase) || 
                                   string.Equals(userRole, "ADMIN", StringComparison.OrdinalIgnoreCase);

            if (!isStaffOrAdmin && booking.UserId != currentUserId)
            {
                return Forbid();
            }

            var services = booking.BookingServiceDetails.Select(sd => new
            {
                sd.ServiceId,
                ServiceName = sd.AddOnService?.ServiceName ?? "Dịch vụ",
                sd.Quantity,
                sd.SnapshotUnitPrice,
                sd.PaymentStatus,
                sd.IsIncurred
            }).ToList();

            var logs = booking.BookingLogs
                .OrderBy(l => l.Timestamp)
                .Select(l => new
                {
                    l.Id,
                    l.UserFullName,
                    l.ActionDescription,
                    l.Timestamp
                }).ToList();

            var invoices = new List<object>();
            var dbUpfrontInvoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Upfront");
            if (dbUpfrontInvoice != null)
            {
                invoices.Add(new
                {
                    Id = dbUpfrontInvoice.Id,
                    TotalAmount = dbUpfrontInvoice.TotalAmount,
                    PaidUpfront = dbUpfrontInvoice.PaidUpfront,
                    FinalDue = dbUpfrontInvoice.FinalDue,
                    InvoiceType = dbUpfrontInvoice.InvoiceType,
                    PaymentStatus = dbUpfrontInvoice.PaymentStatus,
                    CreatedAt = dbUpfrontInvoice.CreatedAt
                });
            }
            else
            {
                decimal roomCost = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
                decimal upfrontServiceCost = booking.BookingServiceDetails
                    .Where(sd => !sd.IsIncurred)
                    .Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);
                decimal upfrontTotal = roomCost + upfrontServiceCost;

                bool isPaidStatus = (booking.BookingStatus == "Confirmed" || 
                                     booking.BookingStatus == "Checked_In" || 
                                     booking.BookingStatus == "Awaiting_Checkout" || 
                                     booking.BookingStatus == "Checked_Out");

                invoices.Add(new
                {
                    Id = 0,
                    TotalAmount = upfrontTotal,
                    PaidUpfront = isPaidStatus ? upfrontTotal : 0m,
                    FinalDue = isPaidStatus ? 0m : upfrontTotal,
                    InvoiceType = "Upfront",
                    PaymentStatus = isPaidStatus ? "Paid" : "Unpaid",
                    CreatedAt = booking.CreatedAt
                });
            }

            var dbFinalInvoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Final");
            if (dbFinalInvoice != null)
            {
                invoices.Add(new
                {
                    Id = dbFinalInvoice.Id,
                    TotalAmount = dbFinalInvoice.TotalAmount,
                    PaidUpfront = dbFinalInvoice.PaidUpfront,
                    FinalDue = dbFinalInvoice.FinalDue,
                    InvoiceType = dbFinalInvoice.InvoiceType,
                    PaymentStatus = dbFinalInvoice.PaymentStatus,
                    CreatedAt = dbFinalInvoice.CreatedAt
                });
            }
            else if (booking.BookingStatus == "Checked_In" || booking.BookingStatus == "Awaiting_Checkout")
            {
                decimal roomCost = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
                decimal upfrontServiceCost = booking.BookingServiceDetails
                    .Where(sd => !sd.IsIncurred)
                    .Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);
                decimal upfrontTotal = roomCost + upfrontServiceCost;

                decimal overtimeFee = 0m;
                var actualCheckoutTime = backend.Helpers.TimeHelper.GetVietnamTime();
                if (actualCheckoutTime > booking.EndTime)
                {
                    var overtimeDuration = actualCheckoutTime - booking.EndTime;
                    double overtimeMinutes = overtimeDuration.TotalMinutes;

                    if (overtimeMinutes > 15.0)
                    {
                        decimal baseHourlyRate = booking.SpaceAsset?.BasePrice ?? 0m;
                        decimal penaltyMultiplier = 1.5m;
                        decimal calculatedMinutes = (decimal)Math.Ceiling(overtimeMinutes);

                        decimal totalOvertimeAmount = (baseHourlyRate * calculatedMinutes * penaltyMultiplier) / 60.0m;
                        overtimeFee = Math.Round(totalOvertimeAmount, 0);
                    }
                }

                decimal incurredTotal = booking.BookingServiceDetails
                    .Where(s => s.IsIncurred && s.PaymentStatus == "Unpaid")
                    .Sum(s => s.SnapshotUnitPrice * s.Quantity);

                decimal finalTotalAmount = upfrontTotal + overtimeFee + incurredTotal;
                decimal finalDue = overtimeFee + incurredTotal;

                invoices.Add(new
                {
                    Id = 0,
                    TotalAmount = finalTotalAmount,
                    PaidUpfront = upfrontTotal,
                    FinalDue = finalDue,
                    InvoiceType = "Final",
                    PaymentStatus = finalDue > 0 ? "Unpaid" : "Paid",
                    CreatedAt = backend.Helpers.TimeHelper.GetVietnamTime()
                });
            }

            var invoiceDetail = new ItemizedInvoiceDto();
            var activeInvoice = dbFinalInvoice ?? dbUpfrontInvoice;
            
            invoiceDetail.InvoiceId = activeInvoice?.Id ?? 0;
            invoiceDetail.BasePricePerHour = booking.SnapshotBasePrice;
            
            double scheduledHours = (booking.EndTime - booking.StartTime).TotalHours;
            scheduledHours = Math.Round(scheduledHours * 2.0) / 2.0;
            if (scheduledHours <= 0) scheduledHours = 0.5;
            invoiceDetail.ScheduledHours = scheduledHours;
            
            invoiceDetail.LayoutName = booking.RoomLayout?.LayoutName ?? (booking.LayoutId == 1 ? "Chữ U" : "Lớp học");
            invoiceDetail.LayoutSetupFee = booking.SnapshotPriceModifier;
            
            invoiceDetail.Services = services.Select(s => new InvoiceServiceItemDto
            {
                ServiceId = s.ServiceId,
                ServiceName = s.ServiceName,
                Quantity = s.Quantity,
                UnitPrice = s.SnapshotUnitPrice,
                IsIncurred = s.IsIncurred,
                PaymentStatus = s.PaymentStatus
            }).ToList();
            
            double overtimeHours = 0;
            decimal calculatedOvertimeFee = 0m;
            var checkoutTime = backend.Helpers.TimeHelper.GetVietnamTime();
            
            if ((booking.BookingStatus == "Checked_Out" || booking.BookingStatus == "Awaiting_Checkout") && dbFinalInvoice != null)
            {
                checkoutTime = dbFinalInvoice.CreatedAt;
            }
            
            if ((booking.BookingStatus == "Checked_In" || booking.BookingStatus == "Awaiting_Checkout" || booking.BookingStatus == "Checked_Out")
                && checkoutTime > booking.EndTime)
            {
                var duration = checkoutTime - booking.EndTime;
                if (duration.TotalMinutes > 15.0)
                {
                    overtimeHours = duration.TotalHours;
                    overtimeHours = Math.Round(overtimeHours, 2);
                    
                    decimal calculatedMinutes = (decimal)Math.Ceiling(duration.TotalMinutes);
                    calculatedOvertimeFee = Math.Round((booking.SnapshotBasePrice * calculatedMinutes * 1.5m) / 60.0m, 0);
                }
            }
            
            invoiceDetail.OvertimeHours = overtimeHours;
            invoiceDetail.TotalAmount = invoiceDetail.RoomSubtotal + invoiceDetail.LayoutSetupFee + 
                                       invoiceDetail.Services.Sum(s => s.Subtotal) + calculatedOvertimeFee;
                                       
            decimal roomCostDetail = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
            decimal upfrontServiceCostDetail = booking.BookingServiceDetails
                .Where(sd => !sd.IsIncurred)
                .Sum(sd => sd.SnapshotUnitPrice * sd.Quantity);
            decimal upfrontTotalDetail = roomCostDetail + upfrontServiceCostDetail;
            
            bool isUpfrontPaid = (booking.BookingStatus == "Confirmed" || 
                                 booking.BookingStatus == "Checked_In" || 
                                 booking.BookingStatus == "Awaiting_Checkout" || 
                                 booking.BookingStatus == "Checked_Out");
                                 
            invoiceDetail.PaidUpfront = isUpfrontPaid ? upfrontTotalDetail : 0m;
            invoiceDetail.FinalDue = Math.Max(0m, invoiceDetail.TotalAmount - invoiceDetail.PaidUpfront);
            
            if (dbFinalInvoice != null)
            {
                invoiceDetail.PaymentStatus = dbFinalInvoice.PaymentStatus;
                invoiceDetail.IssuedAt = dbFinalInvoice.CreatedAt;
            }
            else
            {
                invoiceDetail.PaymentStatus = invoiceDetail.FinalDue > 0 ? "Unpaid" : "Paid";
                invoiceDetail.IssuedAt = activeInvoice?.CreatedAt ?? booking.CreatedAt;
            }

            object? userInfo = null;
            if (userRole != "USER")
            {
                userInfo = new
                {
                    FullName = booking.User?.FullName,
                    Email = booking.User?.Email
                };
            }

            return Ok(new
            {
                booking = new BookingDto
                {
                    Id = booking.Id,
                    UserId = booking.UserId,
                    AssetId = booking.AssetId,
                    LayoutId = booking.LayoutId,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    BookingStatus = booking.BookingStatus,
                    PaymentDeadline = booking.PaymentDeadline,
                    CustomSetupNote = booking.CustomSetupNote,
                    SnapshotBasePrice = booking.SnapshotBasePrice,
                    SnapshotPriceModifier = booking.SnapshotPriceModifier,
                    CreatedAt = booking.CreatedAt,
                    BookingCode = booking.BookingCode,
                    SetupTaskStatus = booking.InternalTasks.FirstOrDefault(t => t.TaskCategory == "LOGISTICS")?.TaskStatus
                },
                spaceAsset = new
                {
                    booking.SpaceAsset?.AssetName,
                    booking.SpaceAsset?.LocationName,
                    booking.SpaceAsset?.Capacity,
                    booking.SpaceAsset?.Dimensions,
                    booking.SpaceAsset?.AreaM2,
                    booking.SpaceAsset?.AssetType
                },
                roomLayout = new
                {
                    booking.RoomLayout?.LayoutName,
                    booking.RoomLayout?.SetupDurationMinutes
                },
                user = userInfo,
                services,
                logs,
                invoices,
                invoiceDetail,
                isOverdue = booking.BookingStatus == "Checked_In" && backend.Helpers.TimeHelper.GetVietnamTime() > booking.EndTime,
                overdueMinutes = (booking.BookingStatus == "Checked_In" && backend.Helpers.TimeHelper.GetVietnamTime() > booking.EndTime) ? (int)(backend.Helpers.TimeHelper.GetVietnamTime() - booking.EndTime).TotalMinutes : 0,
                overtimeFee = (booking.BookingStatus == "Checked_In" && backend.Helpers.TimeHelper.GetVietnamTime() > booking.EndTime && (backend.Helpers.TimeHelper.GetVietnamTime() - booking.EndTime).TotalMinutes > 15.0) 
                    ? Math.Round(((booking.SpaceAsset?.BasePrice ?? 0m) * (decimal)Math.Ceiling((backend.Helpers.TimeHelper.GetVietnamTime() - booking.EndTime).TotalMinutes) * 1.5m) / 60.0m, 0)
                    : 0m
            });
        }

        [HttpGet("{id}/checkout-preview")]
        [Authorize(Roles = "USER,STAFF,ADMIN")]
        public async Task<IActionResult> GetCheckoutPreview(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingServiceDetails)
                    .ThenInclude(sd => sd.AddOnService)
                .Include(b => b.Invoices)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();

            if (booking.BookingStatus != "Checked_In" && booking.BookingStatus != "Awaiting_Checkout")
            {
                return BadRequest(new { message = "Chỉ có thể xem trước checkout cho đơn đang sử dụng hoặc chờ checkout." });
            }

            var nowLocal = backend.Helpers.TimeHelper.GetVietnamTime();
            decimal overtimeFee = CalculateOvertimeFee(booking, nowLocal);

            var invoice = booking.Invoices.FirstOrDefault(i => i.InvoiceType == "Final");
            
            var services = booking.BookingServiceDetails.Select(sd => new
            {
                sd.ServiceId,
                ServiceName = sd.AddOnService?.ServiceName ?? "Dịch vụ",
                sd.Quantity,
                sd.SnapshotUnitPrice,
                sd.PaymentStatus,
                sd.IsIncurred
            }).ToList();

            if (invoice == null)
            {
                decimal incurredTotal = booking.BookingServiceDetails
                    .Where(s => s.IsIncurred && s.PaymentStatus == "Unpaid")
                    .Sum(s => s.SnapshotUnitPrice * s.Quantity);

                decimal upfrontTotal = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;

                invoice = new Invoice
                {
                    BookingId = booking.Id,
                    TotalAmount = upfrontTotal + incurredTotal + overtimeFee,
                    PaidUpfront = upfrontTotal,
                    FinalDue = incurredTotal + overtimeFee,
                    InvoiceType = "Final",
                    PaymentStatus = (incurredTotal + overtimeFee) > 0 ? "Unpaid" : "Paid"
                };
            }
            else
            {
                decimal incurredTotal = booking.BookingServiceDetails
                    .Where(s => s.IsIncurred && s.PaymentStatus == "Unpaid")
                    .Sum(s => s.SnapshotUnitPrice * s.Quantity);
                decimal upfrontTotal = booking.SnapshotBasePrice + booking.SnapshotPriceModifier;
                overtimeFee = Math.Max(0m, invoice.TotalAmount - upfrontTotal - incurredTotal);
            }

            return Ok(new
            {
                booking = new BookingDto
                {
                    Id = booking.Id,
                    UserId = booking.UserId,
                    AssetId = booking.AssetId,
                    LayoutId = booking.LayoutId,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    BookingStatus = booking.BookingStatus,
                    SnapshotBasePrice = booking.SnapshotBasePrice,
                    SnapshotPriceModifier = booking.SnapshotPriceModifier
                },
                services,
                invoice = new
                {
                    invoice.Id,
                    invoice.TotalAmount,
                    invoice.PaidUpfront,
                    invoice.FinalDue,
                    invoice.InvoiceType,
                    invoice.PaymentStatus,
                    OvertimeFee = overtimeFee
                }
            });
        }
    }
}
