import React from 'react';
import { BookingAddonsSection } from './BookingAddonsSection';

interface AddonService {
  id: number;
  serviceName: string;
  unitPrice: number;
  chargeMethod: string;
  isAvailable: boolean;
}

interface AddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  addonServices: AddonService[];
  selectedQuantities: Record<number, number>;
  onQuantityChange: (serviceId: number, qty: number) => void;
}

export const AddonsModal: React.FC<AddonsModalProps> = ({
  isOpen,
  onClose,
  addonServices,
  selectedQuantities,
  onQuantityChange,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1100,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        backgroundColor: 'var(--surface-color)',
        padding: '28px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        width: '90%',
        maxWidth: '750px',
        maxHeight: '85vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
      }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '1.6rem',
            cursor: 'pointer',
            color: 'var(--secondary-text)'
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: 'var(--primary-text)' }}>
            🍔 Thực đơn Dịch vụ & Đồ uống
          </h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
            Chọn đồ uống hoặc các thiết bị tiện ích đi kèm khi sử dụng phòng họp.
          </p>
        </div>

        <div style={{ border: 'none', padding: 0 }}>
          <BookingAddonsSection
            addonServices={addonServices}
            selectedQuantities={selectedQuantities}
            onQuantityChange={onQuantityChange}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-card"
            style={{
              padding: '10px 24px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              width: 'auto'
            }}
          >
            Hoàn tất & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
