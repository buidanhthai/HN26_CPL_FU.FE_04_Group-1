import React, { useState } from 'react';
import { bookingService } from '../services/bookingService';
import { BookingAddonsSection } from '../pages/Bookings/components/BookingAddonsSection';

interface ServiceMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: number;
  addonServices: any[];
  onOrderSuccess?: () => void;
  viewOnly?: boolean;
}

export const ServiceMenuModal: React.FC<ServiceMenuModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  addonServices,
  onOrderSuccess,
  viewOnly = false,
}) => {
  // Store quantities for each service: { [serviceId: number]: quantity }
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleQuantityAbsoluteChange = (serviceId: number, qty: number) => {
    if (viewOnly) return;
    setQuantities((prev) => ({
      ...prev,
      [serviceId]: qty,
    }));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Calculate items to order
  const orderItems = Object.entries(quantities)
    .map(([idStr, qty]) => ({
      serviceId: Number(idStr),
      quantity: qty,
      service: addonServices.find((s) => s.id === Number(idStr)),
    }))
    .filter((item) => item.quantity > 0 && item.service);

  const totalItemsCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = orderItems.reduce((sum, item) => sum + item.service!.unitPrice * item.quantity, 0);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0 || !bookingId) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      await bookingService.orderAddonServices(
        bookingId,
        orderItems.map((item) => ({ serviceId: item.serviceId, quantity: item.quantity }))
      );

      setSuccessMsg('Gọi dịch vụ thành công! Các món đã được thêm vào hóa đơn của bạn.');
      setQuantities({}); // Reset quantities
      
      // Delay closing modal slightly so they can see success message
      setTimeout(() => {
        onOrderSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error ordering addon services:', err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi gọi dịch vụ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ width: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-title)', color: 'var(--nature-accent)', fontWeight: 'bold' }}>
            🍽️ Thực đơn dịch vụ Cozy Space
          </h3>
          <button
            onClick={onClose}
            className="btn-link-danger"
            style={{
              fontSize: '1.25rem',
              color: 'var(--secondary-text)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', marginBottom: '16px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: '0 0 16px 0' }}>
            Vui lòng chọn các dịch vụ tiện ích và đồ uống bên dưới. Chi phí dịch vụ gọi thêm sẽ được tự động cộng vào hóa đơn cuối cùng khi checkout.
          </p>

          {errorMsg && (
            <div
              style={{
                backgroundColor: '#FDF2F2',
                border: '1px solid #F8D7DA',
                color: '#D9534F',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '15px',
              }}
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                backgroundColor: '#F0F9EB',
                border: '1px solid #E1F3D8',
                color: '#67C23A',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '15px',
              }}
            >
              {successMsg}
            </div>
          )}

          <BookingAddonsSection
            addonServices={addonServices}
            selectedQuantities={quantities}
            onQuantityChange={handleQuantityAbsoluteChange}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {viewOnly ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', fontStyle: 'italic' }}>
              💡 Bắt đầu đặt phòng và check-in để gọi thêm các dịch vụ bổ sung này.
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>Tổng giá trị lựa chọn:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--nature-accent)' }}>
                {formatCurrency(totalCost)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            {viewOnly ? (
              <button
                onClick={onClose}
                style={{
                  backgroundColor: 'var(--accent-color)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Đóng thực đơn
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  disabled={submitting}
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', borderRadius: '8px' }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleOrderSubmit}
                  disabled={submitting || totalItemsCount === 0}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    opacity: submitting || totalItemsCount === 0 ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {submitting ? 'Đang gọi dịch vụ...' : `Gọi dịch vụ (${totalItemsCount})`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
