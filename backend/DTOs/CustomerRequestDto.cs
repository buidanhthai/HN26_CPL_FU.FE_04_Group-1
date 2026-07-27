using System;

namespace backend.DTOs
{
    public class CustomerRequestDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // SERVICE or INCIDENT
        public string Title { get; set; } = string.Empty;
        public string Detail { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public string? ResolvedNote { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCustomerRequestDto
    {
        public string Type { get; set; } = "SERVICE";
        public string Title { get; set; } = string.Empty;
        public string Detail { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
    }

    public class UpdateCustomerRequestDto
    {
        public string? Status { get; set; }
        public string? ResolvedNote { get; set; }
    }
}
