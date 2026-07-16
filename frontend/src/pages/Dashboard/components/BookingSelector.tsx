import React from 'react';
import type { Booking } from '../../../types/booking.types';

interface BookingSelectorProps {
  allUserBookings: Booking[];
  selectedManageBookingId?: number;
  onChange: (id: number) => void;
  spaceAssets: any[];
}

export const BookingSelector: React.FC<BookingSelectorProps> = ({
  allUserBookings,
  selectedManageBookingId,
  onChange,
  spaceAssets
}) => {
  if (allUserBookings.length <= 1) return null;

  return (
    <div style={{ 
      marginBottom: '24px', 
      backgroundColor: 'var(--surface-color)', 
      padding: '16px 20px', 
      borderRadius: '12px', 
      border: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap',
      boxShadow: 'var(--shadow)'
    }}>
      <span style={{ fontWeight: 'bold', color: 'var(--primary-text)', fontSize: '0.95rem' }}>
        👉 Chọn đơn đặt chỗ cần quản lý/vận hành:
      </span>
      <select
        value={selectedManageBookingId ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          if (val) {
            onChange(Number(val));
          }
        }}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface-color)',
          color: 'var(--primary-text)',
          fontWeight: '600',
          minWidth: '280px',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        {allUserBookings.map((b) => {
          const asset = spaceAssets.find(a => a.id === b.assetId || a.Id === b.assetId);
          return (
            <option key={b.id} value={b.id}>
              Đơn #{b.id} - {asset?.assetName || `Phòng #${b.assetId}`} ({
                b.bookingStatus === 'Checked_In' ? 'Đang hoạt động' : 
                b.bookingStatus === 'Confirmed' ? 'Đã xác nhận' : 'Chờ thanh toán'
              })
            </option>
          );
        })}
      </select>
    </div>
  );
};
