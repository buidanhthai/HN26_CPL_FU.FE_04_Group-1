namespace backend.DTOs
{
    public class CreateServiceRequestDto
    {
        public int? BookingId { get; set; }
        public string RequestType { get; set; } = "SERVICE"; // SERVICE, INCIDENT
        public string RoomName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Detail { get; set; }
        public int? ServiceId { get; set; }
        public int Quantity { get; set; } = 1;
    }
}
