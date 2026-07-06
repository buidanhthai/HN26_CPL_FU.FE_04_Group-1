import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'block',
    padding: '12px 20px',
    color: isActive ? '#00e1d9' : '#a2a5b9',
    textDecoration: 'none',
    fontWeight: isActive ? '600' : '400',
    backgroundColor: isActive ? 'rgba(0, 225, 217, 0.08)' : 'transparent',
    borderLeft: isActive ? '4px solid #00e1d9' : '4px solid transparent',
    transition: 'all 0.2s',
  });

  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#151521',
      minHeight: 'calc(100vh - 60px)',
      borderRight: '1px solid #2d2d3f',
      paddingTop: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <NavLink to="/" end style={linkStyle}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/bookings" style={linkStyle}>
          📅 Bookings
        </NavLink>
        <NavLink to="/tasks" style={linkStyle}>
          ✅ Tasks
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
