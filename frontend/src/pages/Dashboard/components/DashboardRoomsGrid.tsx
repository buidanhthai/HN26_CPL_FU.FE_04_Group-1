import React from 'react';

interface SpaceAsset {
  id: number;
  assetName: string;
  assetType: string;
  capacity: number;
  basePrice: number;
  isActive: boolean;
  isMaintenance: boolean;
  locationName: string;
}

interface Booking {
  id: number;
  assetId: number;
  bookingStatus: string;
}

interface DashboardRoomsGridProps {
  spaceAssets: SpaceAsset[];
  activeBookings: Booking[];
  loading: boolean;
}

export const DashboardRoomsGrid: React.FC<DashboardRoomsGridProps> = ({
  spaceAssets,
  activeBookings,
  loading
}) => {
  const getRoomStatus = (room: SpaceAsset) => {
    if (room.isMaintenance) {
      return { text: 'Bảo trì', color: '#ffb703', bgColor: 'rgba(255, 183, 3, 0.15)' };
    }
    const isOccupied = activeBookings.some(b => b.assetId === room.id && b.bookingStatus === 'Checked_In');
    if (isOccupied) {
      return { text: 'Đang sử dụng', color: '#e07a5f', bgColor: 'rgba(224, 122, 95, 0.15)' };
    }
    return { text: 'Trống', color: '#6bbf7e', bgColor: 'rgba(107, 191, 126, 0.15)' };
  };

  if (loading) {
    return <div style={{ color: 'var(--secondary-text)', fontStyle: 'italic' }}>Đang tải trạng thái phòng...</div>;
  }

  return (
    <div style={{ marginBottom: '30px' }}>
      <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', color: 'var(--primary-text)', marginBottom: '16px' }}>
        🏢 Trạng thái các phòng họp hiện tại
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {spaceAssets.map((room) => {
          const status = getRoomStatus(room);
          return (
            <div
              key={room.id}
              style={{
                backgroundColor: 'var(--surface-color)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '110px'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary-text)' }}>
                  {room.assetName}
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                  Tầng: {room.locationName} | Sức chứa: {room.capacity} người
                </p>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-hover)' }}>
                  {room.basePrice.toLocaleString('vi-VN')} đ/h
                </span>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  backgroundColor: status.bgColor,
                  color: status.color
                }}>
                  {status.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DashboardRoomsGrid;
