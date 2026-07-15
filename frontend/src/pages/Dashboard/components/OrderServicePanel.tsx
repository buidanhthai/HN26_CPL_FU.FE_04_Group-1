import React from 'react';

interface OrderServicePanelProps {
  onOpenServiceMenu: () => void;
}

const OrderServicePanel: React.FC<OrderServicePanelProps> = ({ onOpenServiceMenu }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-color)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow)',
        position: 'sticky',
        top: '20px',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>☕</span>
      <h3
        style={{
          margin: '0 0 10px 0',
          fontSize: '1.2rem',
          color: 'var(--primary-text)',
          fontFamily: 'var(--font-title)',
        }}
      >
        Gọi thêm dịch vụ
      </h3>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--secondary-text)',
          margin: '0 0 20px 0',
          lineHeight: '1.6',
        }}
      >
        Thêm cà phê thơm ngon, trà mát lạnh hoặc thuê thêm máy chiếu, các thiết bị hỗ trợ ngay
        trong phòng để nâng cao năng suất làm việc của bạn.
      </p>

      <button
        onClick={onOpenServiceMenu}
        style={{
          width: '100%',
          backgroundColor: 'var(--accent-color)',
          color: '#fff',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '0.95rem',
          cursor: 'pointer',
          transition: 'var(--transition)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        className="hover-lift"
      >
        🍽️ Mở thực đơn dịch vụ
      </button>
    </div>
  );
};

export default OrderServicePanel;
