import React from 'react';
import type { Booking } from '../../../types/booking.types';

interface BookingRoomInfoProps {
  booking: Booking;
  apiSpaceAsset?: any;
  dbSpaceAsset?: any;
  locationName: string;
  dimensions: string;
  areaM2: number;
  capacity: number;
  layoutName: string;
  formatToVNTime: (dateInput: string | Date | null | undefined) => string;
}

export const BookingRoomInfo: React.FC<BookingRoomInfoProps> = ({
  booking,
  apiSpaceAsset,
  dbSpaceAsset,
  locationName,
  dimensions,
  areaM2,
  capacity,
  layoutName,
  formatToVNTime
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
      <div>
        <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Phòng đặt:</span>
        <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>
          {apiSpaceAsset?.assetName ?? dbSpaceAsset?.assetName ?? dbSpaceAsset?.AssetName ?? `Phòng #${booking.assetId}`}
        </p>
      </div>
      <div>
        <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Trạng thái:</span>
        <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--nature-accent)' }}>
          {booking.bookingStatus === 'Awaiting_Payment' ? 'Chờ thanh toán' :
           booking.bookingStatus === 'Confirmed' ? 'Đã xác nhận' :
           booking.bookingStatus === 'Checked_In' ? 'Đã Check-in' :
           booking.bookingStatus === 'Checked_Out' ? 'Đã Checkout' :
           booking.bookingStatus === 'Cancelled' ? 'Đã hủy do chưa thanh toán đặt trước' : booking.bookingStatus}
        </p>
      </div>

      <div>
        <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>📍 Vị trí:</span>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', fontWeight: '500' }}>{locationName}</p>
      </div>
      <div>
        <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>📐 Kích thước:</span>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', fontWeight: '500' }}>{dimensions} ({areaM2} m²)</p>
      </div>
      <div>
        <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>👥 Sức chứa:</span>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', fontWeight: '500' }}>{capacity} người</p>
      </div>
      <div>
        <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>🛋️ Sơ đồ bày trí:</span>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', fontWeight: '500' }}>{layoutName}</p>
      </div>

      {booking.bookingCode && (
        <div style={{ gridColumn: 'span 2', backgroundColor: 'rgba(212, 163, 115, 0.12)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--accent-color)', marginBottom: '8px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Mã Đơn Đặt Chỗ (Booking Code):</span>
          <p style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-text)', letterSpacing: '2px', fontFamily: 'monospace' }}>
            {booking.bookingCode}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', fontStyle: 'italic' }}>
            * Xuất trình mã đặt chỗ này cho lễ tân khi làm thủ tục nhận phòng.
          </span>
        </div>
      )}
      <div>
        <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Thời gian bắt đầu:</span>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
          {formatToVNTime(booking.startTime)}
        </p>
      </div>
      <div>
        <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Thời gian kết thúc:</span>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
          {formatToVNTime(booking.endTime)}
        </p>
      </div>
    </div>
  );
};
