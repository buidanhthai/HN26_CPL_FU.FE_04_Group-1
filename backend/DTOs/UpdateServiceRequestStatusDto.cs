namespace backend.DTOs
{
    public class UpdateServiceRequestStatusDto
    {
        public string RequestStatus { get; set; } = "Pending"; // Pending, In_Progress, Resolved
    }
}
