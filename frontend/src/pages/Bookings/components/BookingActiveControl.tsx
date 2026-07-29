import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../../../types/booking.types';

interface BookingActiveControlProps {
  selectedBooking?: Booking;
  spaceAssets: any[];
  onCheckout: (booking: Booking) => void;
}

export const BookingActiveControl: React.FC<BookingActiveControlProps> = ({
  selectedBooking,
  spaceAssets,
  onCheckout
}) => {
  const navigate = useNavigate();

  if (!selectedBooking || selectedBooking.bookingStatus !== 'Checked_In') {
    return null;
  }

  const asset = spaceAssets.find(a => a.id === selectedBooking.assetId || a.Id === selectedBooking.assetId);
  const roomName = asset?.assetName || `Phòng #${selectedBooking.assetId}`;

  return (
    <div style={{
      backgroundColor: 'rgba(79, 163, 209, 0.08)',
      border: '2px solid rgba(79, 163, 209, 0.4)',
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '15px',
      boxShadow: 'var(--shadow)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.8rem' }}>🛎️</span>
        <div>
          <h4 style={{ margin: 0, color: 'var(--primary-text)', fontSize: '1rem', fontWeight: 'bold' }}>
            Đang vận hành: <span style={{ color: '#4fa3d1' }}>{roomName}</span> ({selectedBooking.bookingCode})
          </h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
            Phiên sử dụng đang hoạt động. Khách hàng đang trong phòng họp.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => navigate('/service-requests')}
          className="btn btn-secondary"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            borderColor: '#4fa3d1',
            color: '#4fa3d1',
            cursor: 'pointer'
          }}
        >
          🍽️ Gọi thêm dịch vụ / Báo sự cố
        </button>

        <button
          onClick={() => onCheckout(selectedBooking)}
          className="btn btn-primary"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            backgroundColor: '#e07a5f',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          🚪 Trả phòng &amp; Thanh toán
        </button>
      </div>
    </div>
  );
};
export default BookingActiveControl;
