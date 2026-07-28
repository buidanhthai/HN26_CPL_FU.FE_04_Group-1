import { useState, useEffect } from 'react';
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

// 2. Ma trận tọa độ (%) khớp chuẩn theo vị trí các phòng trên ảnh
const ROOM_LAYOUTS: Record<number, { top: string; left: string; width: string; height: string }> = {
  // LẦU 1
  1: { top: '65%', left: '26%', width: '22%', height: '24%' }, 
  2: { top: '75%', left: '54%', width: '16%', height: '17%' }, 
  3: { top: '75%', left: '71%', width: '21%', height: '17%' }, 

  // LẦU 2
  4: { top: '40%', left: '23%', width: '12%', height: '14%' }, 
  5: { top: '44%', left: '36%', width: '12%', height: '12%' }, 
  6: { top: '44%', left: '67%', width: '11%', height: '13%' }, 
  7: { top: '44%', left: '79%', width: '12%', height: '13%' }, 

  // LẦU 3
  8: { top: '12%', left: '23%', width: '13%', height: '15%' }, 
  9: { top: '16%', left: '38%', width: '10%', height: '12%' }, 
  10: { top: '17%', left: '60%', width: '14%', height: '15%' }, 
  11: { top: '19%', left: '77%', width: '14%', height: '14%' }
};

export default function FloorSelection() {
  const navigate = useNavigate();
  
  // SỬA ĐỔI: Khởi tạo state là 'Tổng quan' để lúc mới vào hiện ảnh tòa nhà ban đầu
  const [currentFloor, setCurrentFloor] = useState<string>('Tổng quan');
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // State quản lý phòng đang được chỏ chuột vào và tọa độ của con trỏ để hiện Tooltip
  const [hoveredRoom, setHoveredRoom] = useState<MeetingRoom | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setLoading(true);
    setSelectedRoom(null); // Reset phòng khi chuyển tầng
    setHoveredRoom(null);  // Reset phòng khi chuyển tầng

    const mockDBRooms = [
      // Lầu 1
      { Id: 1, LocationName: 'Lầu 1', AssetName: 'Hội Trường Lớn 101', AssetType: 'Meeting_Room', BasePrice: 300000, Capacity: 15, Dimensions: '6m x 5m', AreaM2: 30, IsActive: 1 },
      { Id: 2, LocationName: 'Lầu 1', AssetName: 'Họp Chiến Lược 102', AssetType: 'Meeting_Room', BasePrice: 250000, Capacity: 10, Dimensions: '5m x 4m', AreaM2: 20, IsActive: 1 },
      { Id: 3, LocationName: 'Lầu 1', AssetName: 'Tiếp Khách VIP 103', AssetType: 'Meeting_Room', BasePrice: 200000, Capacity: 6, Dimensions: '4m x 4m', AreaM2: 16, IsActive: 1 },
      
      // Lầu 2
      { Id: 4, LocationName: 'Lầu 2', AssetName: 'Phòng Dự Án 201', AssetType: 'Meeting_Room', BasePrice: 150000, Capacity: 6, Dimensions: '4m x 3m', AreaM2: 12, IsActive: 1 },
      { Id: 5, LocationName: 'Lầu 2', AssetName: 'Phòng Dự Án 202', AssetType: 'Meeting_Room', BasePrice: 150000, Capacity: 6, Dimensions: '4m x 3m', AreaM2: 12, IsActive: 1 },
      { Id: 6, LocationName: 'Lầu 2', AssetName: 'Phòng Phỏng Vấn 203', AssetType: 'Meeting_Room', BasePrice: 100000, Capacity: 4, Dimensions: '3m x 3m', AreaM2: 9, IsActive: 1 },
      { Id: 7, LocationName: 'Lầu 2', AssetName: 'Phòng Nghiên Cứu 204', AssetType: 'Meeting_Room', BasePrice: 200000, Capacity: 8, Dimensions: '4m x 4m', AreaM2: 16, IsActive: 1 },
      
      // Lầu 3
      { Id: 8, LocationName: 'Lầu 3', AssetName: 'Họp Nhóm A', AssetType: 'Meeting_Room', BasePrice: 120000, Capacity: 5, Dimensions: '3.5m x 3m', AreaM2: 10.5, IsActive: 1 },
      { Id: 9, LocationName: 'Lầu 3', AssetName: 'Họp Nhóm B', AssetType: 'Meeting_Room', BasePrice: 120000, Capacity: 5, Dimensions: '3.5m x 3m', AreaM2: 10.5, IsActive: 1 },
      { Id: 10, LocationName: 'Lầu 3', AssetName: 'Hội Thảo 303', AssetType: 'Meeting_Room', BasePrice: 250000, Capacity: 12, Dimensions: '5m x 5m', AreaM2: 25, IsActive: 1 },
      { Id: 11, LocationName: 'Lầu 3', AssetName: 'Đào Tạo 304', AssetType: 'Meeting_Room', BasePrice: 400000, Capacity: 20, Dimensions: '8m x 5m', AreaM2: 40, IsActive: 1 }
    ];

    // Lọc ra các phòng thuộc lầu đang chọn. 
    // Nếu là 'Tổng quan' thì mảng rỗng để không vẽ hitbox đè lên ảnh tổng
    const filtered = currentFloor === 'Tổng quan' 
      ? [] 
      : mockDBRooms.filter(room => room.LocationName === currentFloor);
    
    setRooms(filtered);
    setLoading(false);
  }, [currentFloor]);


  // Hàm xác định ảnh hiển thị dựa trên tầng đang chọn
  const getFloorImage = () => {
    switch (currentFloor) {
      case 'Lầu 1': return "/src/assets/tang1.png";
      case 'Lầu 2': return "/src/assets/tang2.png";
      case 'Lầu 3': return "/src/assets/tang3.png";
      default: return "/src/assets/thebuilding.png"; // Ảnh ban đầu
    }
  };

  return (
    <div className="profile-container" style={{ maxWidth: '1300px' }}>
      
      {/* Header điều hướng */}
      <div className="flex justify-between items-center mb-4" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>Sơ Đồ Chọn Phòng Họp Trực Quan</h2>
        <button 
          onClick={() => navigate('/bookings')}
          className="btn btn-secondary"
          style={{ padding: '10px 15px', fontWeight: 'bold' }}
        >
          📜 Xem Lịch Sử Đặt Phòng
        </button>
      </div>

      {/* Bộ nút chuyển đổi tầng - Bổ sung thêm nút Tổng quan */}
      <div className="mb-4 mt-4">
        {['Tổng quan', 'Lầu 1', 'Lầu 2', 'Lầu 3'].map((floor) => (
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
        <div className="floor-map-container">
          
          {/* CỘT TRÁI */}
          <div className="floor-map-left">
            
            {/* SỬA ĐỔI: Ảnh thay đổi tự động dựa vào hàm getFloorImage */}
            <img 
              src={getFloorImage()} 
              alt={`Mặt bằng ${currentFloor}`} 
              className="floor-map-image" 
            />

            {/* Render Hitbox các phòng */}
            {rooms.map((room) => {
              const layout = ROOM_LAYOUTS[room.Id];
              if (!layout) return null; 

              const isCurrentSelected = selectedRoom?.Id === room.Id;

              return (
                <div
                  key={room.Id}
                  onClick={() => setSelectedRoom(room)}
                  className="floor-map-hitbox"
                  style={{
                    top: layout.top,
                    left: layout.left,
                    width: layout.width,
                    height: layout.height,
                    backgroundColor: isCurrentSelected ? 'rgba(0, 86, 179, 0.35)' : 'transparent',
                    border: isCurrentSelected ? '2px solid #0056b3' : '2px dashed transparent'
                  }}
                  onMouseEnter={(e) => {
                    setHoveredRoom(room);
                    if (!isCurrentSelected) {
                      e.currentTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
                      e.currentTarget.style.borderColor = '#28a745';
                    }
                  }}
                  onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={(e) => {
                    setHoveredRoom(null);
                    if (!isCurrentSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  {(hoveredRoom?.Id === room.Id || isCurrentSelected) && (
                    <span className="floor-map-hitbox-label">
                      {room.AssetName}
                    </span>
                  )}
                </div>
              );
            })}

          </div>

          {/* CỘT PHẢI */}
          <div className="floor-map-right">
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Chi Tiết Phòng Đang Chọn</h3>
            {selectedRoom ? (
              <div className="flex-col gap-2 text-sm">
                <p><strong>Tên phòng:</strong> {selectedRoom.AssetName}</p>
                <p><strong>Vị trí:</strong> {selectedRoom.LocationName}</p>
                <p><strong>Sức chứa:</strong> {selectedRoom.Capacity} người</p>
                <p><strong>Kích thước:</strong> {selectedRoom.Dimensions} ({selectedRoom.AreaM2} m²)</p>
                <p><strong>Giá thuê:</strong> <span style={{ color: '#d9534f', fontWeight: 'bold' }}>{selectedRoom.BasePrice.toLocaleString()} đ/h</span></p>
                
                <button
                  onClick={() => alert(`Đã tạo đơn đăng ký thành công cho phòng: ${selectedRoom.AssetName}`)}
                  className="btn btn-primary mt-3"
                  style={{ width: '100%', padding: '12px' }}
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

      {/* POPUP TOOLTIP */}
      {hoveredRoom && (
        <div 
          className="floor-map-tooltip"
          style={{
            position: 'fixed',
            top: mousePos.y + 15,
            left: mousePos.x + 15,
          }}
        >
          <b>🏢 {hoveredRoom.AssetName}</b>
          <hr />
          <p>📍 <strong>Vị trí:</strong> {hoveredRoom.LocationName}</p>
          <p>👥 <strong>Sức chứa:</strong> {hoveredRoom.Capacity} người</p>
          <p>📐 <strong>Diện tích:</strong> {hoveredRoom.AreaM2} m² ({hoveredRoom.Dimensions})</p>
          <p style={{ marginTop: '4px' }}>
            💰 <strong>Giá thuê:</strong> <span style={{ color: '#ffdd57', fontWeight: 'bold' }}>{hoveredRoom.BasePrice.toLocaleString()} đ/h</span>
          </p>
        </div>
      )}

    </div>
  );
}