using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Entities;

namespace backend.Data.Seeders
{
    public static class BoundaryDataSeeder
    {
        public static async Task SeedBoundaryDataAsync(AppDbContext context)
        {
            var now = DateTime.UtcNow;

            // ==========================================
            // SCENARIO SC-07: Biên & Dữ liệu Cực hạn (Extreme Limits)
            // Mô tả kịch bản: Seed dữ liệu chứa tên siêu dài, mô tả setup note cực kỳ dài (500 ký tự), các trường null (Phone = null), 
            // số tiền cực lớn (phục vụ test format tiền tệ ở UI không bị tràn dòng).
            // ==========================================
            var boundaryCode = "BK-SIM-LIMIT-DATA";
            var boundaryBooking = await context.Bookings
                .Include(b => b.Invoices)
                .Include(b => b.BookingLogs)
                .FirstOrDefaultAsync(b => b.BookingCode == boundaryCode);

            if (boundaryBooking == null)
            {
                /* 1. Tạo bản ghi Booking chính với các thuộc tính cực hạn */
                boundaryBooking = new Booking
                {
                    UserId = 3, // Alice User
                    AssetId = 1, // Hội Trường Lớn 101
                    LayoutId = 1,
                    StartTime = now.AddHours(2), // Bắt đầu sau 2 tiếng
                    EndTime = now.AddHours(5),
                    BookingStatus = "Confirmed",
                    BookingCode = boundaryCode,
                    PaymentDeadline = now.AddHours(1),
                    // Tên khách hàng cực dài để test vỡ layout
                    CustomerName = "Nguyễn Hoàng Vương Trần Lê Phan Vũ Lâm Ngọc Huyền Trang Khánh Vy - Công ty Cổ phần Tập đoàn Đa quốc gia Thái Bình Dương Thịnh Vượng",
                    // Số điện thoại null
                    CustomerPhone = null,
                    // Note setup siêu dài 500 ký tự
                    CustomSetupNote = "LƯU Ý ĐẶC BIỆT QUAN TRỌNG: Cần chuẩn bị 100 cốc nước tinh khiết đặt sẵn ở mép góc phòng họp phía Tây Nam, ngoài ra cần mang thêm 5 máy chiếu di động mini độ sáng cao kết nối không dây, set up thêm 20 mic phát sóng tần số UHF cao tần, chuẩn bị 3 bảng vẽ kính cường lực kèm bút lông 4 màu khác nhau, chuẩn bị sạc dự phòng đa năng 50000mAh tại mỗi bàn làm việc, và lưu ý tuyệt đối giữ nhiệt độ phòng điều hòa luôn ở mức 18 độ C kèm hương tinh dầu hoa oải hương dịu nhẹ lan tỏa khắp phòng họp.",
                    // Giá trị số tiền cực lớn để kiểm tra tràn số/layout tiền tệ
                    SnapshotBasePrice = 99999999m,
                    SnapshotPriceModifier = 88888888m,
                    CreatedAt = now.AddHours(-1),
                    Arrived = false
                };
                context.Bookings.Add(boundaryBooking);
                await context.SaveChangesAsync();

                /* 2. Tạo Hóa đơn cọc trị giá cực kỳ lớn (Paid) */
                context.Invoices.Add(new Invoice
                {
                    BookingId = boundaryBooking.Id,
                    TotalAmount = 188888887m, // 99.99M + 88.88M
                    PaidUpfront = 188888887m,
                    FinalDue = 0m,
                    InvoiceType = "Upfront",
                    PaymentStatus = "Paid",
                    CreatedAt = now.AddHours(-1)
                });

                /* 3. Tạo Task chuẩn bị phòng (LOGISTICS Setup Task) ở trạng thái Unassigned */
                context.InternalTasks.Add(new InternalTask
                {
                    BookingId = boundaryBooking.Id,
                    TaskCategory = "LOGISTICS",
                    TaskDescription = "Setup phòng chuẩn bị đón đoàn khách VIP với yêu cầu siêu đặc biệt (Tên siêu dài, note siêu dài)",
                    RequiredStaffCount = 3, // Cần tới 3 nhân sự làm
                    TaskStatus = "Unassigned",
                    CreatedAt = now.AddHours(-1)
                });

                /* 4. Nhật ký logs */
                context.BookingLogs.Add(new BookingLog
                {
                    BookingId = boundaryBooking.Id,
                    UserFullName = "Alice User",
                    ActionDescription = "Đã khởi tạo đơn đặt chỗ với cấu hình biên cực lớn để kiểm tra khả năng xử lý của hệ thống.",
                    Timestamp = now.AddHours(-1)
                });

                await context.SaveChangesAsync();
            }
        }
    }
}
