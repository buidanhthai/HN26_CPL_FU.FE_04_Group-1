using System;
using backend.Entities;

namespace backend.Helpers
{
    public static class TaskHelper
    {
        public static (string Priority, DateTime Deadline) AssessTaskPriorityAndDeadline(Booking booking, string category, DateTime now)
        {
            if (booking.BookingStatus == "Checked_In")
            {
                // Phiên hoạt động đang diễn ra -> Cần chuẩn bị/phục vụ khẩn cấp trong vòng 15 phút
                return ("URGENT", now.AddMinutes(15));
            }

            var timeToStart = booking.StartTime - now;
            var minutesToStart = timeToStart.TotalMinutes;

            if (minutesToStart <= 30.0)
            {
                // Dưới 30 phút -> Cần làm ngay lập tức, hạn chót là giờ bắt đầu sử dụng
                return ("URGENT", booking.StartTime);
            }
            else if (minutesToStart <= 120.0)
            {
                // Từ 30 phút đến 2 tiếng -> Mức độ HIGH, hạn chót trước giờ bắt đầu 5 phút
                return ("HIGH", booking.StartTime.AddMinutes(-5));
            }
            else if (minutesToStart <= 300.0)
            {
                // Từ 2 tiếng đến 5 tiếng -> Mức độ MEDIUM, hạn chót trước giờ bắt đầu 15 phút
                return ("MEDIUM", booking.StartTime.AddMinutes(-15));
            }
            else
            {
                // Trên 5 tiếng -> Mức độ LOW, hạn chót trước giờ bắt đầu 30 phút
                return ("LOW", booking.StartTime.AddMinutes(-30));
            }
        }
    }
}
