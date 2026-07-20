import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// 1. Định nghĩa kiểu dữ liệu phòng nhận từ API
interface MeetingRoom {
  id: number;
  locationName: string;
  assetName: string;
  assetType: string;
  basePrice: number;
  capacity: number;
  dimensions: string;
  areaM2: number;
  isActive: boolean;
  description?: string;
  mapTop?: string;
  mapLeft?: string;
  mapWidth?: string;
  mapHeight?: string;
}

export default function FloorSelection() {
  const navigate = useNavigate();
  
  // Khởi tạo state là 'Tổng quan' để lúc mới vào hiện ảnh tòa nhà ban đầu
  const [currentFloor, setCurrentFloor] = useState<string>('Tổng quan');
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // State quản lý phòng đang được chỏ chuột vào và tọa độ của con trỏ để hiện Tooltip
  const [hoveredRoom, setHoveredRoom] = useState<MeetingRoom | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setSelectedRoom(null); // Reset phòng khi chuyển tầng
      setHoveredRoom(null);  // Reset phòng khi chuyển tầng
      try {
        const response = await api.get<MeetingRoom[]>('/space-assets');
        // Lọc ra các phòng thuộc lầu đang chọn, đang hoạt động và có tọa độ
        // Nếu là 'Tổng quan' thì mảng rỗng để không vẽ hitbox đè lên ảnh tổng
        const filtered = currentFloor === 'Tổng quan' 
          ? [] 
          : response.data.filter(
              room => room.locationName === currentFloor && room.isActive && room.mapTop
            );
        
        setRooms(filtered);
      } catch (error) {
        console.error('Error loading room data from backend:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
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

      {/* Bộ nút chuyển đổi tầng - Bổ dung thêm nút Tổng quan */}
      <div style={{ margin: '20px 0' }}>
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
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* CỘT TRÁI */}
          <div style={{ position: 'relative', width: '70%', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            
            {/* Ảnh thay đổi tự động dựa vào hàm getFloorImage */}
            <img 
              src={getFloorImage()} 
              alt={`Mặt bằng ${currentFloor}`} 
              style={{ width: '100%', display: 'block', height: 'auto' }} 
            />

            {/* Render Hitbox các phòng */}
            {rooms.map((room) => {
              const isCurrentSelected = selectedRoom?.id === room.id;

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  style={{
                    position: 'absolute',
                    top: room.mapTop,
                    left: room.mapLeft,
                    width: room.mapWidth,
                    height: room.mapHeight,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    borderRadius: '4px',
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
                  {(hoveredRoom?.id === room.id || isCurrentSelected) && (
                    <span style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#111',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      animation: 'fadeIn 0.2s ease-in-out'
                    }}>
                      {room.assetName}
                    </span>
                  )}
                </div>
              );
            })}

          </div>

          {/* CỘT PHẢI */}
          <div style={{ width: '30%', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Chi Tiết Phòng Đang Chọn</h3>
            {selectedRoom ? (
              <div>
                <p><strong>Tên phòng:</strong> {selectedRoom.assetName}</p>
                <p><strong>Vị trí:</strong> {selectedRoom.locationName}</p>
                <p><strong>Sức chứa:</strong> {selectedRoom.capacity} người</p>
                <p><strong>Kích thước:</strong> {selectedRoom.dimensions} ({selectedRoom.areaM2} m²)</p>
                <p><strong>Giá thuê:</strong> <span style={{ color: '#d9534f', fontWeight: 'bold' }}>{selectedRoom.basePrice.toLocaleString()} đ/h</span></p>
                
                <button
                  onClick={() => alert(`Đã tạo đơn đăng ký thành công cho phòng: ${selectedRoom.assetName}`)}
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

      {/* POPUP TOOLTIP */}
      {hoveredRoom && (
        <div style={{
          position: 'fixed',
          top: mousePos.y + 15,
          left: mousePos.x + 15,
          backgroundColor: 'rgba(23, 23, 23, 0.95)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '13px',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          lineHeight: '1.6',
          minWidth: '220px'
        }}>
          <b style={{ color: '#4ba35b', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
            🏢 {hoveredRoom.assetName}
          </b>
          <div style={{ borderBottom: '1px solid #444', marginBottom: '8px' }}></div>
          <p style={{ margin: '2px 0' }}>📍 <strong>Vị trí:</strong> {hoveredRoom.locationName}</p>
          <p style={{ margin: '2px 0' }}>👥 <strong>Sức chứa:</strong> {hoveredRoom.capacity} người</p>
          <p style={{ margin: '2px 0' }}>📐 <strong>Diện tích:</strong> {hoveredRoom.areaM2} m² ({hoveredRoom.dimensions})</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
            💰 <strong>Giá thuê:</strong> <span style={{ color: '#ffdd57', fontWeight: 'bold' }}>{hoveredRoom.basePrice.toLocaleString()} đ/h</span>
          </p>
        </div>
      )}

    </div>
  );
}