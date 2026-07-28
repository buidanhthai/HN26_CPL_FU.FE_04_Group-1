import React from 'react';
import type { Booking } from '../../../types/booking.types';

interface RoomPriceDetailProps {
  booking: Booking;
  invoice: any;
}

export const RoomPriceDetail: React.FC<RoomPriceDetailProps> = ({ booking, invoice }) => {
  const overtimeFee = invoice.overtimeFee || invoice.OvertimeFee || 0;

  return (
    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
      <h4 style={{ fontSize: '0.95rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>Chi phí phòng thuê</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
        <span>Giá cơ bản:</span>
        <span>{booking.snapshotBasePrice.toLocaleString()}đ</span>
      </div>
      {booking.snapshotPriceModifier > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
          <span>Phí phụ trội sơ đồ bàn ghế:</span>
          <span>{booking.snapshotPriceModifier.toLocaleString()}đ</span>
        </div>
      )}
      {overtimeFee > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#e07a5f', fontWeight: '600' }}>
          <span>Phụ thu quá giờ (Overtime 1.5x):</span>
          <span>{overtimeFee.toLocaleString()}đ</span>
        </div>
      )}
    </div>
  );
};
