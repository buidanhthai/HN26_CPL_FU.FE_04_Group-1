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

          {/* USER → trang gửi yêu cầu dịch vụ */}
          {user.role === 'USER' && (
            <NavLink
              to="/my-requests"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              📩 Yêu cầu của tôi
            </NavLink>
          )}

          {/* STAFF / ADMIN → trang điều phối nội bộ & giải quyết khiếu nại/yêu cầu */}
          {(user.role === 'STAFF' || user.role === 'ADMIN') && (
            <>
              <NavLink
                to="/tasks"
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                📋 Công việc
              </NavLink>
              <NavLink
                to="/user-requests"
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                🎧 Yêu cầu khách hàng
              </NavLink>
              <NavLink
                to="/space-assets"
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                🏢 Quản lý Tài sản
              </NavLink>
            </>
          )}

          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            👤 Hồ sơ
          </NavLink>
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
