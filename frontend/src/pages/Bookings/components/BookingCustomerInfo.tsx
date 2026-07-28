import React from 'react';
import type { Booking } from '../../../types/booking.types';

interface BookingCustomerInfoProps {
  booking: Booking;
  user?: { fullName: string; email: string };
}

export const BookingCustomerInfo: React.FC<BookingCustomerInfoProps> = ({ booking, user }) => {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        {booking.customerName && (
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Tên khách (Đại diện):</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{booking.customerName}</p>
          </div>
        )}
        {booking.customerPhone && (
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>SĐT khách:</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{booking.customerPhone}</p>
          </div>
        )}
        {booking.createdByUserId && (
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Nhân viên tạo yêu cầu:</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              Staff ID #{booking.createdByUserId}
            </p>
          </div>
        )}
      </div>

      {user && (
        <div style={{
          backgroundColor: 'rgba(212, 163, 115, 0.08)',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
            Thông tin khách hàng đặt
          </h4>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ fontWeight: '600' }}>Họ tên:</span> {user.fullName}
            </div>
            <div>
              <span style={{ fontWeight: '600' }}>Email:</span> {user.email}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
