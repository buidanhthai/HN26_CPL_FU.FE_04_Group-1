import React from 'react';

interface BookingTabNavProps {
  activeTab: 'history' | 'timeline';
  onTabChange: (tab: 'history' | 'timeline') => void;
}

const BookingTabNav: React.FC<BookingTabNavProps> = ({ activeTab, onTabChange }) => {
  const tabStyle = (tab: 'history' | 'timeline'): React.CSSProperties => ({
    padding: '10px 20px',
    backgroundColor: activeTab === tab ? 'var(--accent-color)' : 'transparent',
    color: activeTab === tab ? '#fff' : 'var(--primary-text)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'var(--transition)',
  });

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '10px',
      }}
    >
      <button type="button" style={tabStyle('history')} onClick={() => onTabChange('history')}>
        📋 Lịch sử đặt chỗ
      </button>
      <button type="button" style={tabStyle('timeline')} onClick={() => onTabChange('timeline')}>
        📅 Sơ đồ Timeline hoạt động
      </button>
    </div>
  );
};

export default BookingTabNav;
