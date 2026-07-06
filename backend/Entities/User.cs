using System;
using System.Collections.Generic;

namespace backend.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "USER"; // ADMIN, STAFF, USER
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<TaskAllocation> TaskAllocations { get; set; } = new List<TaskAllocation>();
    }
}
