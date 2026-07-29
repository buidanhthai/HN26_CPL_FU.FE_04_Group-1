using System;

namespace backend.Entities
{
    public class TaskLog
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string ActionDescription { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public InternalTask? Task { get; set; }
    }
}
