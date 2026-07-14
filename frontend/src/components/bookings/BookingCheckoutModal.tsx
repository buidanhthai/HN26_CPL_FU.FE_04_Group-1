import React from 'react';
import type { Booking } from '../../types/booking.types';

interface BookingCheckoutModalProps {
  details: {
    booking: Booking;
    services: any[];
    invoice: any;
  } | null;
  onClose: () => void;
  spaceAssets: any[];
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  details,
  onClose,
  spaceAssets
}) => {
  if (!details) return null;

  const { booking, services, invoice } = details;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'var(--surface-color)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        width: '500px',
        maxWidth: '95%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        color: 'var(--primary-text)',
      }}>
        <h3 style={{
          fontSize: '1.4rem',
          margin: '0 0 20px 0',
          fontFamily: 'var(--font-title)',
          textAlign: 'center',
          color: 'var(--nature-accent)',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '10px'
        }}>
          CHI TIẾT HÓA ĐƠN THANH TOÁN
        </h3>

        {/* Room Info */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
            <span style={{ fontWeight: '600' }}>Phòng đặt:</span>
            <span>{spaceAssets.find(a => a.id === booking.assetId)?.assetName || `Phòng #${booking.assetId}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
            <span style={{ fontWeight: '600' }}>Thời gian:</span>
            <span>
              {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({new Date(booking.startTime).toLocaleDateString()})
            </span>
          </div>
        </div>

        {/* Room Price Detail */}
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
        </div>

        {/* Services Detail */}
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
          <h4 style={{ fontSize: '0.95rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>Dịch vụ phát sinh trong quá trình sử dụng</h4>
          {services.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: '0' }}>Không phát sinh dịch vụ.</p>
          ) : (
            services.map((s: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>{s.serviceName} (SL: {s.quantity})</span>
                <span>{(s.snapshotUnitPrice * s.quantity).toLocaleString()}đ</span>
              </div>
            ))
          )}
        </div>

        {/* Payment Summary */}
        <div style={{ backgroundColor: 'rgba(122, 134, 106, 0.08)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
            <span>Tổng chi phí:</span>
            <span style={{ fontWeight: '600' }}>{invoice.totalAmount.toLocaleString()}đ</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
            <span>Đã cọc/trả trước:</span>
            <span>-{invoice.paidUpfront.toLocaleString()}đ</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginBottom: '8px' }}>
            <span>Phải thu thêm:</span>
            <span style={{ color: '#e07a5f' }}>{invoice.finalDue.toLocaleString()}đ</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
            <span>Trạng thái hóa đơn:</span>
            <span style={{
              fontWeight: 'bold',
              color: invoice.paymentStatus === 'Paid' ? 'var(--nature-accent)' : '#e07a5f'
            }}>
              {invoice.paymentStatus === 'Paid' ? 'Đã Thanh Toán Xong' : 'Chưa Thanh Toán'}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'var(--nature-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 24px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            Đóng & Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};
