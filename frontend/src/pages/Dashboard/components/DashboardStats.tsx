import React from 'react';

interface DashboardStatsProps {
  activeCount: number;
  upcomingCount: number;
  pastCount: number;
  activeTab: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  onTabChange: (tab: 'ACTIVE' | 'UPCOMING' | 'COMPLETED') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  activeCount,
  upcomingCount,
  pastCount,
  activeTab,
  onTabChange
}) => {
  const getCardStyle = (tab: 'ACTIVE' | 'UPCOMING' | 'COMPLETED') => {
    const isSelected = activeTab === tab;
    return {
      backgroundColor: 'var(--surface-color)',
      padding: '20px',
      borderRadius: '12px',
      border: isSelected ? '2px solid var(--accent-hover)' : '2px solid transparent',
      outline: isSelected ? 'none' : '1px solid var(--border-color)',
      boxShadow: 'var(--shadow)',
      flex: 1,
      minWidth: '180px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      cursor: 'pointer',
      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      transition: 'var(--transition)',
    };
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      marginBottom: '30px'
    }}>
      <div 
        onClick={() => onTabChange('ACTIVE')} 
        style={getCardStyle('ACTIVE')}
        title="Bấm để xem các đơn đặt chỗ đang hoạt động"
      >
        <span style={{ fontSize: '2rem' }}>🛎️</span>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--secondary-text)', letterSpacing: '0.5px' }}>
            Đang hoạt động
          </h4>
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4fa3d1', display: 'block', marginTop: '4px' }}>
            {activeCount}
          </span>
        </div>
      </div>

      <div 
        onClick={() => onTabChange('UPCOMING')} 
        style={getCardStyle('UPCOMING')}
        title="Bấm để xem danh sách phòng sắp tới (Đã đặt)"
      >
        <span style={{ fontSize: '2rem' }}>📅</span>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--secondary-text)', letterSpacing: '0.5px' }}>
            Sắp tới (Đã đặt)
          </h4>
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-color)', display: 'block', marginTop: '4px' }}>
            {upcomingCount}
          </span>
        </div>
      </div>

      <div 
        onClick={() => onTabChange('COMPLETED')} 
        style={getCardStyle('COMPLETED')}
        title="Bấm để xem lịch sử và đánh giá (Đã hoàn thành)"
      >
        <span style={{ fontSize: '2rem' }}>✅</span>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--secondary-text)', letterSpacing: '0.5px' }}>
            Đã hoàn thành
          </h4>
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#6bbf7e', display: 'block', marginTop: '4px' }}>
            {pastCount}
          </span>
        </div>
      </div>
    </div>
  );
};
export default DashboardStats;

