import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyBookingStateProps {
  onOpenServiceMenu: () => void;
}

const EmptyBookingState: React.FC<EmptyBookingStateProps> = ({ onOpenServiceMenu }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-color)',
        padding: '40px 30px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        textAlign: 'center',
        boxShadow: 'var(--shadow)',
        maxWidth: '600px',
        margin: '40px auto 0 auto',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '15px' }}>☕</div>
      <h3
        style={{
          fontFamily: 'var(--font-title)',
          color: 'var(--primary-text)',
          fontSize: '1.4rem',
          margin: '0 0 12px 0',
        }}
      >
        Bạn chưa bắt đầu phiên làm việc nào
      </h3>
      <p
        style={{
          color: 'var(--secondary-text)',
          margin: '0 0 24px 0',
          fontSize: '0.95rem',
          lineHeight: '1.6',
        }}
      >
        Bạn không có lịch đặt phòng/bàn làm việc nào đang trong khung giờ hoạt động (đã
        check-in). Hãy đặt ngay một không gian yên tĩnh và ấm áp tại Cozy Space nhé!
      </p>
      <div
        style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}
      >
        <Link
          to="/bookings"
          style={{
            display: 'inline-block',
            backgroundColor: 'var(--accent-color)',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            transition: 'var(--transition)',
            boxShadow: '0 4px 6px -1px rgba(212, 163, 115, 0.4)',
            textDecoration: 'none',
          }}
          className="hover-lift"
        >
          Đặt chỗ ngay
        </Link>
        <button
          onClick={onOpenServiceMenu}
          style={{
            display: 'inline-block',
            backgroundColor: 'var(--surface-color)',
            color: 'var(--primary-text)',
            border: '1px solid var(--border-color)',
            padding: '12px 28px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            transition: 'var(--transition)',
            cursor: 'pointer',
          }}
          className="hover-lift"
        >
          🍽️ Xem thực đơn dịch vụ
        </button>
      </div>
    </div>
  );
};

export default EmptyBookingState;
