using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    public class BookingDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int AssetId { get; set; }
        public int LayoutId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string BookingStatus { get; set; } = "Pending";
        public DateTime? PaymentDeadline { get; set; }
        public string? CustomSetupNote { get; set; }
        public decimal SnapshotBasePrice { get; set; }
        public decimal SnapshotPriceModifier { get; set; }
        public DateTime CreatedAt { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public int? CreatedByUserId { get; set; }
        public string? SetupTaskStatus { get; set; }
    }

    public class CreateBookingDto
    {
        public int UserId { get; set; }
        public int AssetId { get; set; }
        public int LayoutId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? CustomSetupNote { get; set; }
        public decimal SnapshotBasePrice { get; set; }
        public decimal SnapshotPriceModifier { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public int? CreatedByUserId { get; set; }
    }

    public class BookingDetailDto
    {
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        
        public int AssetId { get; set; }
        public string AssetName { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty;
        
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CheckedInAt { get; set; }
        public DateTime? CheckedOutAt { get; set; }
        
        public string BookingStatus { get; set; } = string.Empty;
        public string BookingCode { get; set; } = string.Empty;
        
        public ItemizedInvoiceDto InvoiceDetail { get; set; } = new();
    }

    public class ItemizedInvoiceDto
    {
        public int InvoiceId { get; set; }
        
        public decimal BasePricePerHour { get; set; }
        public double ScheduledHours { get; set; }
        public decimal RoomSubtotal => BasePricePerHour * (decimal)ScheduledHours;

        public string LayoutName { get; set; } = string.Empty;
        public decimal LayoutSetupFee { get; set; }

        public List<InvoiceServiceItemDto> Services { get; set; } = new();

        public double OvertimeHours { get; set; }
        public decimal OvertimeRatePerHour => BasePricePerHour * 1.5m;
        public decimal OvertimeSubtotal => OvertimeRatePerHour * (decimal)OvertimeHours;

        public decimal TotalAmount { get; set; }
        public decimal PaidUpfront { get; set; }
        public decimal FinalDue { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public DateTime? IssuedAt { get; set; }
    }

    public class InvoiceServiceItemDto
    {
        public int ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal => Quantity * UnitPrice;
        public bool IsIncurred { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
    }
}
