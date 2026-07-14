import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) return null;

  const { user, logout } = authContext;

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand">
        CozySpace.
      </NavLink>

      {user && (
        <div className="nav-menu">
          <NavLink 
            to="/dashboard" 
            end 
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            📊 Bảng điều khiển
          </NavLink>
          <NavLink 
            to="/bookings" 
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            📅 Lịch đặt chỗ
          </NavLink>
          <NavLink 
            to="/tasks" 
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            📋 Công việc
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            👤 Hồ sơ
          </NavLink>
          {(user.role === 'ADMIN' || user.role === 'STAFF') && (
            <NavLink 
              to="/space-assets" 
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              🏢 Quản lý Tài sản
            </NavLink>
          )}
        </div>
      )}

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--secondary-text)' }}>
            Xin chào, <strong style={{ color: 'var(--primary-text)' }}>{user.fullName}</strong>
          </span>
          <button 
            onClick={logout}
            className="btn btn-danger hover-lift"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
