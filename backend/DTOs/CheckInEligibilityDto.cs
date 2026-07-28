namespace backend.DTOs
{
    public class CheckInEligibilityDto
    {
        public bool CanCheckIn { get; set; }
        public string ReasonCode { get; set; } = "SUCCESS"; // SUCCESS, INVALID_STATUS, TASK_NOT_COMPLETED, TOO_EARLY, EXPIRED, NOT_ARRIVED, MAINTENANCE_LOCK, UNPAID_DEBT
        public string UserFriendlyMessage { get; set; } = string.Empty;
        public string RequiredActionRole { get; set; } = "None"; // Staff, Admin, User, None
        public int? ActionTaskHintId { get; set; }
    }
}
