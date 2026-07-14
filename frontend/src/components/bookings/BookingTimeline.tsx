import React from 'react';
import type { Booking } from '../../types/booking.types';

interface BookingTimelineProps {
  bookings: Booking[];
  spaceAssets: any[];
  timelineDate: string;
  setTimelineDate: (date: string) => void;
  onSelectBooking: (booking: any) => void;
}

export const BookingTimeline: React.FC<BookingTimelineProps> = ({
  bookings,
  spaceAssets,
  timelineDate,
  setTimelineDate,
  onSelectBooking
}) => {

  const getOverlappingBooking = (assetId: number, hour: number) => {
    const targetStart = new Date(`${timelineDate}T${String(hour).padStart(2, '0')}:00:00Z`);
    const targetEnd = new Date(`${timelineDate}T${String(hour + 1).padStart(2, '0')}:00:00Z`);

    return bookings.find((b) => {
      if (b.assetId !== assetId || b.bookingStatus === 'Cancelled') return false;
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return bStart < targetEnd && bEnd > targetStart;
    });
  };

  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  return (
    <div className="panel-card" style={{ overflowX: 'auto' }}>
      {/* Title & Date Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="panel-title" style={{ margin: 0 }}>
          📅 Sơ đồ Timeline hoạt động
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Chọn ngày:</span>
          <input 
            type="date" 
            value={timelineDate} 
            onChange={(e) => setTimelineDate(e.target.value)}
            className="form-input"
            style={{
              padding: '8px 12px',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      {/* Grid container */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '800px' }}>
          {/* Header row representing hours */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px repeat(15, 1fr)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--secondary-text)', fontSize: '0.9rem' }}>Phòng họp / Không gian</div>
            {hours.map((h) => (
              <div key={h} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Rooms rows */}
          {spaceAssets.map((asset) => (
            <div 
              key={asset.id} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '220px repeat(15, 1fr)', 
                alignItems: 'center', 
                padding: '10px 0', 
                borderBottom: '1px solid var(--border-color)' 
              }}
            >
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                {asset.assetName} 
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--secondary-text)', fontWeight: 'normal' }}>
                  👤 Sức chứa: {asset.capacity} • {asset.locationName}
                </span>
              </div>

              {hours.map((h) => {
                const booking = getOverlappingBooking(asset.id, h);
                const isBooked = !!booking;
                
                let cellBg = 'transparent';
                let cellBorder = '1px solid var(--border-color)';
                let tooltipContent = '';

                if (booking) {
                  cellBorder = 'none';
                  const status = booking.bookingStatus;
                  
                  if (status === 'Confirmed' || status === 'Checked_In') {
                    cellBg = 'var(--nature-accent)'; 
                  } else if (status === 'Awaiting_Payment' || status === 'Pending') {
                    cellBg = 'var(--accent-color)'; 
                  } else {
                    cellBg = '#6c757d'; 
                  }

                  const guestInfo = booking.customerName ? `Khách: ${booking.customerName} (${booking.customerPhone})` : `User ID: ${booking.userId}`;
                  const creatorInfo = booking.createdByUserId ? `\n(Tạo bởi Staff ID: ${booking.createdByUserId})` : '';
                  tooltipContent = `Đơn đặt #${booking.id}\n📍 Trạng thái: ${status}\n👤 ${guestInfo}${creatorInfo}\n⏰ Giờ: ${new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\n📝 Ghi chú: ${booking.customSetupNote || 'Không có'}`;
                }

                return (
                  <div 
                    key={h}
                    title={tooltipContent}
                    style={{
                      height: '35px',
                      margin: '2px',
                      borderRadius: '4px',
                      backgroundColor: cellBg,
                      border: cellBorder,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isBooked ? '#fff' : 'transparent',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      cursor: isBooked ? 'pointer' : 'default',
                      transition: 'var(--transition)'
                    }}
                    onClick={() => {
                      if (booking) {
                        onSelectBooking({ booking, services: [], logs: [], invoices: [] });
                      }
                    }}
                  >
                    {isBooked ? `B#${booking.id}` : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend guide */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: 'var(--nature-accent)', borderRadius: '3px' }}></div>
          <span>Đã xác nhận / Đang sử dụng</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: 'var(--accent-color)', borderRadius: '3px' }}></div>
          <span>Chờ thanh toán / Chờ duyệt</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', border: '1px solid var(--border-color)', borderRadius: '3px' }}></div>
          <span>Trống</span>
        </div>
      </div>
    </div>
  );
};
