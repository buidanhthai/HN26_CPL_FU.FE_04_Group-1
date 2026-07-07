import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    color: isActive ? 'var(--primary-text)' : 'var(--secondary-text)',
    textDecoration: 'none',
    fontWeight: isActive ? '600' : '500',
    backgroundColor: isActive ? 'rgba(212, 163, 115, 0.15)' : 'transparent',
    borderLeft: isActive ? '4px solid var(--accent-color)' : '4px solid transparent',
    transition: 'var(--transition)',
    fontSize: '0.95rem'
  });

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--surface-color)',
      minHeight: 'calc(100vh - 70px)',
      borderRight: '1px solid var(--border-color)',
      paddingTop: '25px',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <NavLink to="/" end style={linkStyle}>
          📊 Bảng điều khiển
        </NavLink>
        <NavLink to="/bookings" style={linkStyle}>
          📅 Lịch đặt chỗ
        </NavLink>
        <NavLink to="/tasks" style={linkStyle}>
          📋 Công việc của tôi
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
