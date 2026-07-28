# CozySpace System Development Rules & Architecture Guidelines

## 1. PHÂN QUYỀN VÀ BẢO MẬT API (SECURITY & AUTHORIZATION)
- **RBAC Strict Policy:** 
  - Các API dành cho Dashboard Vận hành (như `GetActiveBookings`, `GetOverdueList`, `CheckoutBooking`, `GetStaffTasks`) BẮT BUỘC phải được bảo vệ bằng attribute `[Authorize(Roles = "Staff,Admin")]`.
  - API danh mục công khai (Menu, Danh sách phòng trống) dùng `[AllowAnonymous]`.
  - Không bao giờ được trả về danh sách Booking toàn hệ thống qua các API công khai của Customer (`[AllowAnonymous]`).
  - Tất cả DTO trả về cho Staff phải lọc bỏ thông tin nhạy cảm của khách hàng (như mật khẩu, lịch sử thanh toán cá nhân ngoài booking này) trừ các thông tin vận hành cần thiết (Tên, SĐT, Vị trí phòng).

---

## 2. KIẾN TRÚC BACKEND & KÍCH THƯỚC FILE (BACKEND ARCHITECTURE)
- **Program.cs Immutability:** 
  - File `Program.cs` CHỈ dùng để đăng ký Dependency Injection, Middleware và Startup Config. 
  - TUYỆT ĐỐI KHÔNG viết logic query DB (`DbContext`), logic nghiệp vụ hay các khối `using (var scope = ...)` trực tiếp trong `Program.cs`.
- **Centralized & Modular Data Seeding:**
  - Logic Seed/Reset dữ liệu thời gian thực BẮT BUỘC phải nằm trong `backend.Data.DataSeeder.cs`.
  - File `DataSeeder.cs` đóng vai trò điều phối chính (`SeedLiveDemoDataAsync`). Mỗi kịch bản dữ liệu mẫu (như Dashboard Active, Overdue Checkout) BẮT BUỘC phải tách thành một `private static async Task` riêng biệt.
  - Cấu trúc Mở rộng DataSeeder: Khi số lượng kịch bản Demo tăng lên, các kịch bản phải được tách thành các file riêng biệt trong thư mục `Data/Seeders/` (Ví dụ: `DashboardSeeder.cs`, `BookingOverdueSeeder.cs`) thay vì nhồi nhét chung vào một file `DataSeeder.cs` duy nhất.
- **Backend File Limit:** Controller hoặc Service Backend nếu vượt quá **250 dòng** bắt buộc phải tách thành `Partial Class` hoặc phân rã thành các Query/Command Handler nhỏ hơn (sử dụng Pattern MediatR CQRS).

---

## 3. KIẾN TRÚC FRONTEND REACT (FRONTEND ARCHITECTURE)
- **Component Decomposition (<150 Lines):** 
  - Mỗi UI Component chỉ đảm nhận 1 nhiệm vụ duy nhất (SRP). Nếu Component vượt quá **150 dòng**, BẮT BUỘC phải tách thành các Sub-components nhỏ hơn.
- **Feature-Based Structure:** Tổ chức code theo thư mục tính năng:
  `src/features/[feature-name]/{components, hooks, services, index.tsx}`
- **Config Separation:** Các hằng số layout, tọa độ map (`mapLayouts.ts`) phải nằm ở file config riêng, không hardcode lặp lại trong UI Component.

---

## 4. QUY TẮC NGHIỆP VỤ & TƯƠNG THÍCH NGƯỢC (BUSINESS & BACKWARD COMPATIBILITY)
- **No Mock Data on Production Code:** Mọi giao diện khi bàn giao phải kết nối API thực tế qua DTO. Nếu thiếu dữ liệu, phải yêu cầu Backend cập nhật API DTO chứ không tự mock ở Client.
- **Backend-Driven Calculation:** Mọi phép tính tài chính, tiền phạt Overtime (1.5x), giờ đệm (Buffer time) BẮT BUỘC phải được tính tại Backend. Frontend chỉ hiển thị theo DTO trả về.
- **Derived Status Rule (Trạng thái ảo/dẫn xuất):** Dữ liệu quá hạn (Overdue) sẽ được so sánh thời gian thực tại FE/BE (`CurrentTime > EndTime` khi chưa trả phòng) để bật Cảnh báo UI (Overdue Badge/Red Alert) mà không làm hỏng Enum trạng thái gốc trong Database.
- **Non-Breaking Changes (Backward Compatibility):** 
  - Cấm sửa đổi API Contract cũ: Khi thêm tính năng mới, tuyệt đối không được xóa trường, đổi tên trường DTO hoặc đổi tên API Endpoint cũ đang hoạt động.
  - Mở rộng an toàn (Extend, Don't Modify): Nếu API cũ thiếu dữ liệu cho UI mới: Thêm trường mới vào DTO dưới dạng nullable hoặc bổ sung tham số optional. Nếu thay đổi quá lớn: Tạo API Endpoint version mới (ví dụ: `v2/bookings/active`) thay vì sửa đè lên v1.

---

## 5. TỔNG HỢP NGUYÊN TẮC PHÁT TRIỂN HỆ THỐNG (RULES 1 - 7)

### Quy tắc 1: Cấm Mock Dữ Liệu trên Production-Ready Code
- Dữ liệu tĩnh (Mock Data): Chỉ được phép sử dụng trong giai đoạn phác thảo UI ban đầu.
- Yêu cầu bàn giao: Tất cả các tính năng khi hoàn thành bắt buộc phải kết nối trực tiếp với Database qua API endpoints.
- Xử lý thiếu thông tin: Yêu cầu Backend cập nhật DTO/API, tuyệt đối không tự tạo mock data làm fallback.

### Quy tắc 2: Logic Nghiệp Vụ và Tính Toán thuộc về Backend
- Xử lý tập trung tại Backend: Tính toán tài chính, giá cả, hóa đơn, giờ đệm (buffer time), xác thực điều kiện đặt chỗ (booking validation), tiền phạt Overtime (1.5x).
- Giới hạn của Frontend: Không viết hàm tính toán doanh thu/tổng tiền từ hardcoded config ở client.

### Quy tắc 3: Chuẩn Hóa RESTful API, DTO Mapping & RBAC Strict Authorization
- Cấu trúc DTO: Phản ánh chính xác nhu cầu dữ liệu Frontend (sơ đồ, tọa độ, kích thước).
- Phân quyền API (RBAC): 
  - API Dashboard Vận hành (`GetActiveBookings`, `GetOverdueList`, `CheckoutBooking`, `GetStaffTasks`...) bắt buộc bảo vệ bởi `[Authorize(Roles = "Staff,Admin")]`.
  - API danh mục công khai (Menu, danh sách phòng trống) dùng `[AllowAnonymous]`.
  - KHÔNG trả về danh sách Booking toàn hệ thống qua API công khai (`[AllowAnonymous]`).
  - DTO cho Staff phải lọc bỏ thông tin nhạy cảm của khách hàng, chỉ giữ thông tin vận hành cần thiết (Tên, SĐT, Vị trí phòng).

### Quy tắc 4: Tách Biệt Giao Diện (UI) và Logic Tọa Độ
- Quản lý cấu hình tập trung: Hằng số hiển thị (`ROOM_LAYOUTS`, hitbox) nằm ở config riêng (`src/config/mapLayouts.ts`).

### Quy tắc 5: Kiến Trúc Component React, Backend File Size Limit & Seeder Modularization
- React Component Decomposition: Mỗi file component <150 dòng (SRP). Vượt quá phải tách thành sub-components.
- Backend File Size Limit: Controller/Service >250 dòng phải tách thành Partial Class hoặc CQRS Handlers (MediatR).
- DataSeeder Modularization: `DataSeeder.cs` đóng vai trò Main Orchestrator. Các kịch bản Demo tách ra các file trong `Data/Seeders/` (ví dụ: `DashboardSeeder.cs`, `BookingOverdueSeeder.cs`).

### Quy tắc 6: Luồng Giao Tiếp Chuẩn giữa Frontend và Backend
- Client-Server Contract: Thống nhất API Contract (Swagger/JSON DTO) trước khi code.
- Helper functions: Format tiền tệ, hiển thị ngày tháng tập trung ở Utility functions.

### Quy tắc 7: Nguyên tắc Tương thích ngược (Non-Breaking Changes)
- Cấm sửa đổi API Contract cũ: Không xóa trường, đổi tên trường DTO hoặc đổi tên API Endpoint cũ đang hoạt động.
- Mở rộng an toàn: Bổ sung trường nullable/optional DTO hoặc tạo API version mới (`v2/...`).

---

## 6. QUY TẮC PHỦ KÍN HOÀN TOÀN LUỒNG NGHIỆP VỤ (FULL-PROCESS & EDGE-CASE RULES)

### Rule 8: Quản lý Trạng thái Khóa Phòng & Bảo trì (Asset Lock & Maintenance)
- Không gian vật lý (`Space_Asset`) phải hỗ trợ trạng thái `IsMaintenance` hoặc bảng `AssetUnavailabilities` (chứa `StartDate`, `EndDate`, `Reason`).
- Mọi API kiểm tra phòng trống / Render Map (`SCR_BOOK_04`) BẮT BUỘC phải loại trừ các không gian đang trong thời gian bảo trì.

### Rule 9: Đồng bộ Dịch vụ Phát sinh từ Yêu cầu Hỗ trợ (Request-to-Billing Synergy)
- Khi Staff xử lý yêu cầu loại "🛎️ Gọi dịch vụ" tại `SCR_REQ_01` và đổi trạng thái sang `Resolved`:
  - Backend BẮT BUỘC phải tự động sinh bản ghi `BookingServiceDetail` (`IsIncurred = true`, `PaymentStatus = "Unpaid"`) gắn liền với `BookingId` hiện tại của phòng đó.
  - Tuyệt đối không để xảy ra tình trạng tạo Yêu cầu hỗ trợ thành công nhưng không ghi nhận hóa đơn.

### Rule 10: Xử lý Đơn Quá Hạn & Cưỡng Chế Checkout (Force Checkout & No-Show)
- Khách không check-in sau 30 phút kể từ `StartTime`: Background Service tự động chuyển sang `No_Show` và giải phóng phòng (áp dụng chính sách giữ cọc).
- Trường hợp khách ngồi lỳ quá hạn: Cung cấp API `POST /api/bookings/{id}/force-checkout` bảo vệ bởi `[Authorize(Roles = "Staff,Admin")]`.
  - API này tự động chốt giờ hiện tại (`ActualEndTime`), tính Overtime Fee (1.5x) tại Backend, chuyển trạng thái đơn sang `Awaiting_Payment_PostUse` hoặc ghi nhận nợ, đồng thời giải phóng phòng để phục vụ khách tiếp theo.

### Rule 11: Luồng Gia Hạn & Chuyển Phòng (Extend & Switch Room)
- **Gia hạn (Extend):** API `POST /api/bookings/{id}/extend` phải kiểm tra khung giờ tiếp theo. Nếu xung đột lịch đặt khác -> Trả về `409 Conflict` kèm thông báo *"Khung giờ kế tiếp đã được đặt"*. Nếu trống -> Cập nhật `EndTime` mới và cộng tiền phát sinh vào `Final Invoice`.
- **Chuyển phòng (Switch Room):** API `POST /api/bookings/{id}/switch-asset` đóng đơn hiện tại ở thời điểm thực tế, tính chi phí sử dụng theo tỷ lệ (pro-rata), và tạo đơn mới cho phòng mới mà không thu lại cọc cơ bản.

### Rule 12: Kế hoạch Bán tự động cho AI Agent thực hiện (AI Agent Execution Rules)
- Khi refactor hoặc bổ sung feature mới, AI Agent BẮT BUỘC tuân thủ:
  1. **Kiểm tra File Size Limit:** Controller/Service < 250 dòng, UI Component < 150 dòng. Tách CQRS Handlers / Sub-components nếu vượt quá.
  2. **Backward Compatibility:** Không sửa Enum gốc trong Database, sử dụng Virtual Status / Derived Status cho các trạng thái cảnh báo trên UI.
  3. **DataSeeder Update:** Bổ sung mock scenario cho các edge-case mới (No-Show, Force Checkout, Maintenance) vào thư mục `Data/Seeders/`.

