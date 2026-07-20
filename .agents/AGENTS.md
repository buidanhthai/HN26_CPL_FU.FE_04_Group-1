# Project Architectural Rules

## PROJECT ARCHITECTURE RULES - DATA SEEDING

1. PROGRAM.CS IMMUTABILITY RULE:
   - File `Program.cs` CHỈ dùng để khai báo Middleware, Dependency Injection và App Startup Configuration.
   - TUYỆT ĐỐI KHÔNG viết logic truy vấn DB (`DbContext`), logic nghiệp vụ, hoặc các khối `using (var scope = ...)` trực tiếp trong `Program.cs`.

2. CENTRALIZED DATA SEEDING PATTERN:
   - Tất cả dữ liệu khởi tạo (Static Seed) hoặc cập nhật động theo thời gian thực (Live Reset) BẮT BUỘC phải nằm trong class `backend.Data.DataSeeder`.
   - Mỗi kịch bản dữ liệu demo (Ví dụ: Dashboard Active Booking, Overdue Checkout, Expired Payment...) BẮT BUỘC phải được tách thành một `private static async Task` riêng biệt trong `DataSeeder.cs`.

3. EXTENSION / APPEND REQUIREMENT:
   - Khi được yêu cầu bổ sung/sửa đổi dữ liệu demo cho bất kỳ màn hình nào, AI CHỈ ĐƯỢC PHÉP chỉnh sửa file `DataSeeder.cs` bằng cách tạo Method kịch bản mới và gọi nó trong `SeedLiveDemoDataAsync`.
