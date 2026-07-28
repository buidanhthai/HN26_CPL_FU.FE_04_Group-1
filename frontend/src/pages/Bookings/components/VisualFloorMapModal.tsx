import React, { useState } from 'react';
import theBuildingImg from '../../../assets/thebuilding.png';

const ROOM_LAYOUTS: Record<number, { top: string; left: string; width: string; height: string }> = {
  1: { top: '65%', left: '26%', width: '22%', height: '24%' }, 
  2: { top: '65%', left: '52%', width: '22%', height: '24%' },
  3: { top: '65%', left: '77%', width: '13%', height: '24%' }, 
  4: { top: '44%', left: '26%', width: '12%', height: '14%' }, 
  5: { top: '44%', left: '42%', width: '12%', height: '14%' }, 
  6: { top: '44%', left: '67%', width: '11%', height: '13%' }, 
  7: { top: '44%', left: '79%', width: '12%', height: '13%' }, 
  8: { top: '12%', left: '23%', width: '13%', height: '15%' }, 
  9: { top: '16%', left: '38%', width: '10%', height: '12%' }, 
  10: { top: '17%', left: '60%', width: '14%', height: '15%' }, 
  11: { top: '19%', left: '77%', width: '14%', height: '14%' }
};

interface VisualFloorMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceAssets: any[];
  onSelectRoom: (room: any) => void;
}

export const VisualFloorMapModal: React.FC<VisualFloorMapModalProps> = ({
  isOpen,
  onClose,
  spaceAssets,
  onSelectRoom
}) => {
  const [mapCurrentFloor, setMapCurrentFloor] = useState('Lầu 1');
  const [mapSelectedRoom, setMapSelectedRoom] = useState<any | null>(null);
  const [mapHoveredRoom, setMapHoveredRoom] = useState<any | null>(null);
  const [mapMousePos, setMapMousePos] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '1000px' }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
          <h3 className="panel-title text-primary" style={{ margin: 0 }}>
            🗺️ Chọn không gian qua sơ đồ
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="btn-link-danger"
            style={{ fontSize: '1.5rem', color: 'var(--secondary-text)' }}
          >
            &times;
          </button>
        </div>

        {/* Floor selector buttons */}
        <div className="flex gap-2 mb-4">
          {['Lầu 1', 'Lầu 2', 'Lầu 3'].map((floor) => (
            <button
              key={floor}
              type="button"
              onClick={() => setMapCurrentFloor(floor)}
              style={{
                padding: '8px 16px',
                backgroundColor: mapCurrentFloor === floor ? 'var(--accent-color)' : 'transparent',
                color: mapCurrentFloor === floor ? '#fff' : 'var(--primary-text)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'var(--transition)'
              }}
            >
              {floor}
            </button>
          ))}
        </div>

        <div className="floor-map-container">
          {/* Left Column: Interactive Map */}
          <div className="floor-map-left">
            <img 
              src={theBuildingImg} 
              alt="Sơ đồ Cozy Space" 
              className="floor-map-image" 
            />
            
            {spaceAssets
              .filter(asset => asset.locationName === mapCurrentFloor)
              .map((asset) => {
                const layout = ROOM_LAYOUTS[asset.id];
                if (!layout) return null;

                const isCurrentSelected = mapSelectedRoom?.id === asset.id;

                return (
                  <div
                    key={asset.id}
                    onClick={() => setMapSelectedRoom(asset)}
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
                      setMapHoveredRoom(asset);
                      if (!isCurrentSelected) {
                        e.currentTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
                        e.currentTarget.style.borderColor = '#28a745';
                      }
                    }}
                    onMouseMove={(e) => {
                      setMapMousePos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={(e) => {
                      setMapHoveredRoom(null);
                      if (!isCurrentSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    {(mapHoveredRoom?.id === asset.id || isCurrentSelected) && (
                      <span className="floor-map-hitbox-label">
                        {asset.assetName}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Right Column: Selected Room Details & Confirm Button */}
          <div className="floor-map-right">
            <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontFamily: 'var(--font-title)' }}>
              Chi tiết phòng chọn
            </h4>
            
            {mapSelectedRoom ? (
              <div className="flex-col gap-2 text-sm">
                <p style={{ margin: 0 }}><strong>Tên phòng:</strong> {mapSelectedRoom.assetName}</p>
                <p style={{ margin: 0 }}><strong>Vị trí:</strong> {mapSelectedRoom.locationName}</p>
                <p style={{ margin: 0 }}><strong>Sức chứa:</strong> {mapSelectedRoom.capacity} người</p>
                <p style={{ margin: 0 }}><strong>Kích thước:</strong> {mapSelectedRoom.dimensions || 'N/A'} ({mapSelectedRoom.areaM2 || 'N/A'} m²)</p>
                <p style={{ margin: 0 }}><strong>Giá thuê:</strong> <span style={{ color: '#e07a5f', fontWeight: 'bold' }}>{(mapSelectedRoom.basePrice ?? 0).toLocaleString()}đ/h</span></p>

                <button
                  type="button"
                  onClick={() => {
                    onSelectRoom(mapSelectedRoom);
                    onClose();
                  }}
                  className="btn btn-primary mt-3"
                  style={{ width: '100%', padding: '10px' }}
                >
                  Xác nhận chọn phòng
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--secondary-text)', fontStyle: 'italic', margin: 0, fontSize: '0.85rem' }}>
                Rê chuột vào sơ đồ và click để chọn phòng.
              </p>
            )}
          </div>
        </div>

        {/* Floating Hover Tooltip */}
        {mapHoveredRoom && (
          <div 
            className="floor-map-tooltip"
            style={{
              top: mapMousePos.y + 15,
              left: mapMousePos.x + 15,
            }}
          >
            <b>🏢 {mapHoveredRoom.assetName}</b>
            <hr />
            <p>📍 <strong>Vị trí:</strong> {mapHoveredRoom.locationName}</p>
            <p>👥 <strong>Sức chứa:</strong> {mapHoveredRoom.capacity} người</p>
            <p>📐 <strong>Diện tích:</strong> {mapHoveredRoom.areaM2} m² ({mapHoveredRoom.dimensions})</p>
            <p style={{ marginTop: '4px' }}>
              💰 <strong>Giá thuê:</strong> <span style={{ color: '#ffdd57', fontWeight: 'bold' }}>{(mapHoveredRoom.basePrice ?? 0).toLocaleString()}đ/h</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
