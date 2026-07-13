import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Định nghĩa kiểu dữ liệu phòng nhận từ API MySQL
interface MeetingRoom {
  Id: number;
  LocationName: string;
  AssetName: string;
  AssetType: string;
  BasePrice: number;
  Capacity: number;
  Dimensions: string;
  AreaM2: number;
  IsActive: number;
}

// 2. Ma trận tọa độ (%) khớp chuẩn theo vị trí các phòng trên ảnh thebuilding.png
const ROOM_LAYOUTS: Record<number, { top: string; left: string; width: string; height: string }> = {
  // LAU 1 (Phần đáy dưới cùng của tòa nhà)
  1: { top: '65%', left: '26%', width: '22%', height: '24%' }, 
  2: { top: '75%', left: '54%', width: '16%', height: '17%' }, 
  3: { top: '75%', left: '71%', width: '21%', height: '17%' }, 

  // LAU 2 (Tầng nằm ở chính giữa ảnh)
  4: { top: '40%', left: '23%', width: '12%', height: '14%' }, 
  5: { top: '44%', left: '36%', width: '12%', height: '12%' }, 
  6: { top: '44%', left: '67%', width: '11%', height: '13%' }, 
  7: { top: '44%', left: '79%', width: '12%', height: '13%' }, 

  // LAU 3 (Tầng nằm ở trên cùng của ảnh)
  8: { top: '12%', left: '23%', width: '13%', height: '15%' }, 
  9: { top: '16%', left: '38%', width: '10%', height: '12%' }, 
  10: { top: '17%', left: '60%', width: '14%', height: '15%' }, 
  11: { top: '19%', left: '77%', width: '14%', height: '14%' }
};

export default function FloorSelection() {
  const navigate = useNavigate();
  const [currentFloor, setCurrentFloor] = useState<string>('Lầu 1');
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // State quản lý phòng đang được chỏ chuột vào và tọa độ của con trỏ để hiện Tooltip
  const [hoveredRoom, setHoveredRoom] = useState<MeetingRoom | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 3. Gọi API Backend lấy danh sách phòng từ MySQL theo Lầu
    // 3. Sử dụng dữ liệu giả lập (Mock Data) để hiển thị hitbox và test tính năng hover
  useEffect(() => {
    setLoading(true);
    setSelectedRoom(null); // Reset phòng khi chuyển tầng
    setHoveredRoom(null);  // Reset phòng khi chuyển tầng

    // Mảng dữ liệu giả lập giống hệt cấu trúc MySQL để test vị trí
    const mockDBRooms = [
      // Lầu 1 (Gồm 3 phòng ứng với ID từ 1 đến 3)
      { Id: 1, LocationName: 'Lầu 1', AssetName: 'Hội Trường Lớn 101', AssetType: 'Meeting_Room', BasePrice: 300000, Capacity: 15, Dimensions: '6m x 5m', AreaM2: 30, IsActive: 1 },
      { Id: 2, LocationName: 'Lầu 1', AssetName: 'Họp Chiến Lược 102', AssetType: 'Meeting_Room', BasePrice: 250000, Capacity: 10, Dimensions: '5m x 4m', AreaM2: 20, IsActive: 1 },
      { Id: 3, LocationName: 'Lầu 1', AssetName: 'Tiếp Khách VIP 103', AssetType: 'Meeting_Room', BasePrice: 200000, Capacity: 6, Dimensions: '4m x 4m', AreaM2: 16, IsActive: 1 },
      
      // Lầu 2 (Gồm 4 phòng ứng với ID từ 4 đến 7)
      { Id: 4, LocationName: 'Lầu 2', AssetName: 'Phòng Dự Án 201', AssetType: 'Meeting_Room', BasePrice: 150000, Capacity: 6, Dimensions: '4m x 3m', AreaM2: 12, IsActive: 1 },
      { Id: 5, LocationName: 'Lầu 2', AssetName: 'Phòng Dự Án 202', AssetType: 'Meeting_Room', BasePrice: 150000, Capacity: 6, Dimensions: '4m x 3m', AreaM2: 12, IsActive: 1 },
      { Id: 6, LocationName: 'Lầu 2', AssetName: 'Phòng Phỏng Vấn 203', AssetType: 'Meeting_Room', BasePrice: 100000, Capacity: 4, Dimensions: '3m x 3m', AreaM2: 9, IsActive: 1 },
      { Id: 7, LocationName: 'Lầu 2', AssetName: 'Phòng Nghiên Cứu 204', AssetType: 'Meeting_Room', BasePrice: 200000, Capacity: 8, Dimensions: '4m x 4m', AreaM2: 16, IsActive: 1 },
      
      // Lầu 3 (Gồm 4 phòng ứng với ID từ 8 đến 11)
      { Id: 8, LocationName: 'Lầu 3', AssetName: 'Họp Nhóm A', AssetType: 'Meeting_Room', BasePrice: 120000, Capacity: 5, Dimensions: '3.5m x 3m', AreaM2: 10.5, IsActive: 1 },
      { Id: 9, LocationName: 'Lầu 3', AssetName: 'Họp Nhóm B', AssetType: 'Meeting_Room', BasePrice: 120000, Capacity: 5, Dimensions: '3.5m x 3m', AreaM2: 10.5, IsActive: 1 },
      { Id: 10, LocationName: 'Lầu 3', AssetName: 'Hội Thảo 303', AssetType: 'Meeting_Room', BasePrice: 250000, Capacity: 12, Dimensions: '5m x 5m', AreaM2: 25, IsActive: 1 },
      { Id: 11, LocationName: 'Lầu 3', AssetName: 'Đào Tạo 304', AssetType: 'Meeting_Room', BasePrice: 400000, Capacity: 20, Dimensions: '8m x 5m', AreaM2: 40, IsActive: 1 }
    ];

    // Lọc ra các phòng thuộc lầu đang chọn
    const filtered = mockDBRooms.filter(room => room.LocationName === currentFloor);
    
    setRooms(filtered);
    setLoading(false);
  }, [currentFloor]);


  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif', maxWidth: '1300px', margin: '0 auto' }}>
      
      {/* Header điều hướng */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h2>Sơ Đồ Chọn Phòng Họp Trực Quan</h2>
        <button 
          onClick={() => navigate('/bookings')}
          style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          📜 Xem Lịch Sử Đặt Phòng
        </button>
      </div>

      {/* Bộ nút chuyển đổi tầng */}
      <div style={{ margin: '20px 0' }}>
        {['Lầu 1', 'Lầu 2', 'Lầu 3'].map((floor) => (
          <button
            key={floor}
            onClick={() => setCurrentFloor(floor)}
            style={{
              padding: '10px 24px',
              marginRight: '12px',
              backgroundColor: currentFloor === floor ? '#0056b3' : '#f8f9fa',
              color: currentFloor === floor ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            {floor}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Đang đồng bộ dữ liệu sơ đồ...</p>
      ) : (
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* CỘT TRÁI: Hiển thị ảnh tòa nhà và xử lý vùng hitbox tương tác */}
          <div style={{ position: 'relative', width: '70%', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            
            {/* Ảnh phối cảnh tổng thể được gọi từ mục assets của bạn */}
            <img 
              src="/src/assets/thebuilding.png" 
              alt="Mặt bằng Alpha Tower" 
              style={{ width: '100%', display: 'block', height: 'auto' }} 
            />

            {/* Vòng lặp vẽ các phòng thuộc Lầu đang chọn dựa trên ID */}
            {/* Vòng lặp vẽ các phòng thuộc Lầu đang chọn dựa trên ID */}
            {rooms.map((room) => {
              const layout = ROOM_LAYOUTS[room.Id];
              if (!layout) return null; 

              const isCurrentSelected = selectedRoom?.Id === room.Id;

              return (
                <div
                  key={room.Id}
                  onClick={() => setSelectedRoom(room)}
                  style={{
                    position: 'absolute',
                    top: layout.top,
                    left: layout.left,
                    width: layout.width,
                    height: layout.height,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    borderRadius: '4px',
                    
                    // NẾU ĐANG HOVER HOẶC ĐÃ CLICK CHỌN THÌ MỚI HIỆN MÀU VÀ VIỀN
                    // BAN ĐẦU SẼ HOÀN TOÀN TRONG SUỐT (ẨN ĐI)
                    backgroundColor: isCurrentSelected ? 'rgba(0, 86, 179, 0.35)' : 'transparent',
                    border: isCurrentSelected ? '2px solid #0056b3' : '2px dashed transparent'
                  }}
                  // BẮT SỰ KIỆN DI CHUỘT ĐỂ HIỆN HITBOX VÀ POPUP THÔNG TIN
                  onMouseEnter={(e) => {
                    setHoveredRoom(room);
                    // Khi dí chuột vào thì đổi màu nền và hiện viền xanh lá của phòng đó lên
                    if (!isCurrentSelected) {
                      e.currentTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
                      e.currentTarget.style.borderColor = '#28a745';
                    }
                  }}
                  onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={(e) => {
                    setHoveredRoom(null);
                    // Khi rời chuột ra thì ẩn màu nền và viền đi (trả về trong suốt)
                    if (!isCurrentSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  {/* NHÃN TÊN PHÒNG: BAN ĐẦU CŨNG ẨN, CHỈ HIỆN KHI HOVER HOẶC ĐÃ CHỌN */}
                  {(hoveredRoom?.Id === room.Id || isCurrentSelected) && (
                    <span style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#111',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      animation: 'fadeIn 0.2s ease-in-out' // Hiệu ứng hiện hình mượt mà
                    }}>
                      {room.AssetName}
                    </span>
                  )}
                </div>
              );
            })}

          </div>

          {/* CỘT PHẢI: Panel chi tiết thông tin phòng khi click */}
          <div style={{ width: '30%', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Chi Tiết Phòng Đang Chọn</h3>
            {selectedRoom ? (
              <div>
                <p><strong>Tên phòng:</strong> {selectedRoom.AssetName}</p>
                <p><strong>Vị trí:</strong> {selectedRoom.LocationName}</p>
                <p><strong>Sức chứa:</strong> {selectedRoom.Capacity} người</p>
                <p><strong>Kích thước:</strong> {selectedRoom.Dimensions} ({selectedRoom.AreaM2} m²)</p>
                <p><strong>Giá thuê:</strong> <span style={{ color: '#d9534f', fontWeight: 'bold' }}>{selectedRoom.BasePrice.toLocaleString()} đ/h</span></p>
                
                <button
                  onClick={() => alert(`Đã tạo đơn đăng ký thành công cho phòng: ${selectedRoom.AssetName}`)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    cursor: 'pointer',
                    marginTop: '15px'
                  }}
                >
                  Xác Nhận Đặt Phòng
                </button>
              </div>
            ) : (
              <p style={{ color: '#777', fontStyle: 'italic' }}>Rê chuột vào sơ đồ tòa nhà để xem nhanh thông tin phòng, bấm click chuột để chọn phòng cần đăng ký.</p>
            )}
          </div>

        </div>
      )}

      {/* POPUP TOOLTIP HIỂN THỊ THÔNG TIN KHI DÍ CHUỘT VÀO VÙNG HITBOX */}
      {hoveredRoom && (
        <div style={{
          position: 'fixed',
          top: mousePos.y + 15,    // Hiển thị phía dưới con trỏ chuột 15px
          left: mousePos.x + 15,   // Hiển thị lệch sang phải con trỏ chuột 15px
          backgroundColor: 'rgba(23, 23, 23, 0.95)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '13px',
          zIndex: 9999,
          pointerEvents: 'none',   // Chống việc popup cản trở sự kiện di chuột thực tế
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          lineHeight: '1.6',
          minWidth: '220px'
        }}>
          <b style={{ color: '#4ba35b', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
            🏢 {hoveredRoom.AssetName}
          </b>
          <div style={{ borderBottom: '1px solid #444', marginBottom: '8px' }}></div>
          <p style={{ margin: '2px 0' }}>📍 <strong>Vị trí:</strong> {hoveredRoom.LocationName}</p>
          <p style={{ margin: '2px 0' }}>👥 <strong>Sức chứa:</strong> {hoveredRoom.Capacity} người</p>
          <p style={{ margin: '2px 0' }}>📐 <strong>Diện tích:</strong> {hoveredRoom.AreaM2} m² ({hoveredRoom.Dimensions})</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
            💰 <strong>Giá thuê:</strong> <span style={{ color: '#ffdd57', fontWeight: 'bold' }}>{hoveredRoom.BasePrice.toLocaleString()} đ/h</span>
          </p>
        </div>
      )}

    </div>
  );
}
