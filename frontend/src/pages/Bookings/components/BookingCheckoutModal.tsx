import React, { useState } from 'react';
import type { Booking } from '../../../types/booking.types';

interface BookingCheckoutModalProps {
  details: {
    booking: Booking;
    services: any[];
    invoice: any;
  } | null;
  onClose: () => void;
  onConfirmCheckout: () => Promise<void>;
  onPayFinal: () => Promise<void>;
  spaceAssets: any[];
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  details,
  onClose,
  onConfirmCheckout,
  onPayFinal,
  spaceAssets
}) => {
  const [loading, setLoading] = useState(false);

  if (!details) return null;

  const { booking, services, invoice } = details;

  const handlePay = async () => {
    try {
      setLoading(true);
      await onPayFinal();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      await onConfirmCheckout();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '500px' }}>
        <h3 className="modal-title">
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
            <p className="page-desc" style={{ margin: '0' }}>Không phát sinh dịch vụ.</p>
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
            <span className={`badge ${invoice.paymentStatus === 'Paid' ? 'badge-completed' : 'badge-unassigned'}`}>
              {invoice.paymentStatus === 'Paid' ? 'Đã Thanh Toán Xong' : 'Chưa Thanh Toán'}
            </span>
          </div>
        </div>

        {/* Dynamic warning if unpaid */}
        {invoice.paymentStatus !== 'Paid' && (
          <div className="badge-unassigned" style={{ display: 'block', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.8rem', fontWeight: '500', textAlign: 'left' }}>
            ⚠️ Yêu cầu thanh toán hóa đơn cuối trước khi hoàn tất Checkout.
          </div>
        )}

        {/* Actions Button Panel */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            disabled={loading}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.9rem' }}
          >
            Đóng
          </button>

          {invoice.paymentStatus !== 'Paid' && (
            <button
              onClick={handlePay}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.9rem' }}
            >
              {loading ? 'Đang xử lý...' : 'Thanh toán (Giả lập)'}
            </button>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading || invoice.paymentStatus !== 'Paid'}
            className={`btn ${invoice.paymentStatus === 'Paid' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              cursor: invoice.paymentStatus === 'Paid' ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem'
            }}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};
