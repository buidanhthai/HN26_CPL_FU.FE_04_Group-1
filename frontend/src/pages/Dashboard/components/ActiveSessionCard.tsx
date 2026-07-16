import React from 'react';
import { bookingService } from '../../../services/bookingService';
import type { ActiveBookingResponse } from '../../../types/booking.types';

interface ActiveSessionCardProps {
  activeBooking: ActiveBookingResponse;
  formatCurrency: (val: number) => string;
  onRefresh: () => void;
}

const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({
  activeBooking,
  formatCurrency,
  onRefresh,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-color)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '6px',
          height: '100%',
          backgroundColor: 'var(--nature-accent)',
        }}
      />

      {/* Header: status badge + booking id + check-in code */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              backgroundColor: 'var(--nature-accent)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              padding: '4px 10px',
              borderRadius: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              animation: 'pulse 2s infinite',
            }}
          >
            Đang hoạt động
          </span>
          <span
            style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', fontWeight: 'bold' }}
          >
            Mã booking: {activeBooking.booking.bookingCode}
          </span>
        </div>
      </div>

      {/* Room info */}
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '1.5rem',
          color: 'var(--primary-text)',
          fontFamily: 'var(--font-title)',
        }}
      >
        🏢 {activeBooking.spaceAsset.assetName}
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          fontSize: '0.9rem',
          color: 'var(--secondary-text)',
          marginBottom: '16px',
        }}
      >
        <div>📍 <strong>Vị trí:</strong> {activeBooking.spaceAsset.locationName}</div>
        <div>📐 <strong>Kích thước:</strong> {activeBooking.spaceAsset.dimensions} ({activeBooking.spaceAsset.areaM2} m²)</div>
        <div>👥 <strong>Sức chứa tối đa:</strong> {activeBooking.spaceAsset.capacity} người</div>
        <div>🛋️ <strong>Sơ đồ bày trí:</strong> {activeBooking.roomLayout.layoutName}</div>
      </div>

      {/* Time range */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.9rem',
          color: 'var(--primary-text)',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          🕒 <strong>Bắt đầu:</strong>{' '}
          {new Date(activeBooking.booking.startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          ({new Date(activeBooking.booking.startTime).toLocaleDateString()})
        </div>
        <div>
          🕒 <strong>Kết thúc:</strong>{' '}
          {new Date(activeBooking.booking.endTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          ({new Date(activeBooking.booking.endTime).toLocaleDateString()})
        </div>
      </div>

      {/* Checkout Actions Panel */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          marginTop: '16px',
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {activeBooking.booking.bookingStatus === 'Checked_In' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
              Bạn có thể gửi yêu cầu checkout khi kết thúc buổi làm việc.
            </span>
            <button
              onClick={async () => {
                if (window.confirm('Bạn có chắc chắn muốn gửi yêu cầu Checkout phòng?')) {
                  try {
                    await bookingService.requestCheckout(activeBooking.booking.id);
                    alert('Gửi yêu cầu Checkout thành công!');
                    onRefresh();
                  } catch (e: any) {
                    alert(e.response?.data?.message || 'Lỗi khi yêu cầu Checkout');
                  }
                }
              }}
              className="btn btn-danger hover-lift"
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}
            >
              🔔 Yêu cầu Checkout
            </button>
          </div>
        )}

        {activeBooking.booking.bookingStatus === 'Awaiting_Checkout' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                backgroundColor: 'rgba(212, 163, 115, 0.12)',
                border: '1px solid var(--accent-color)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.85rem',
                color: 'var(--primary-text)',
              }}
            >
              📌 <strong>Trạng thái: Chờ Checkout.</strong>
              {activeBooking.incurredUnpaidTotal > 0 ? (
                <span>
                  {' '}Vui lòng thực hiện thanh toán hóa đơn cuối cho các dịch vụ phát sinh để
                  nhân viên xác nhận Checkout.
                </span>
              ) : (
                <span>
                  {' '}Bạn đã hoàn tất các khoản thanh toán. Vui lòng chờ nhân viên kiểm tra và
                  xác nhận Checkout để giải phóng phòng.
                </span>
              )}
            </div>

            {activeBooking.incurredUnpaidTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={async () => {
                    try {
                      await bookingService.payFinal(activeBooking.booking.id);
                      alert('Thanh toán hóa đơn cuối (Giả lập) thành công!');
                      onRefresh();
                    } catch (e: any) {
                      alert(e.response?.data?.message || 'Lỗi khi thanh toán');
                    }
                  }}
                  className="btn btn-primary hover-lift"
                  style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
                >
                  💳 Thanh toán cuối ({formatCurrency(activeBooking.incurredUnpaidTotal)})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(122, 134, 106, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(122, 134, 106, 0); }
          100% { box-shadow: 0 0 0 0 rgba(122, 134, 106, 0); }
        }
      `}</style>
    </div>
  );
};

export default ActiveSessionCard;
