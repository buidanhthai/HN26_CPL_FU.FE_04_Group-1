import React, { useState } from 'react';
import type { Booking } from '../../../types/booking.types';
import { RoomPriceDetail } from './RoomPriceDetail';
import { IncurredServicesTable } from './IncurredServicesTable';
import { CheckoutPaymentSummary } from './CheckoutPaymentSummary';

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

        {/* Sub-components for details */}
        <RoomPriceDetail booking={booking} invoice={invoice} />
        <IncurredServicesTable services={services} />
        <CheckoutPaymentSummary invoice={invoice} />

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
