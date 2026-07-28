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



          {/* STAFF / ADMIN → trang điều phối nội bộ */}
          {(user.role === 'STAFF' || user.role === 'ADMIN') && (
            <>
              <NavLink
                to="/tasks"
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                📋 Công việc
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
        <div className="flex items-center gap-3 text-sm">
          <span className="text-secondary">
            Xin chào, <strong className="text-primary">{user.fullName}</strong>
          </span>
          <button
            onClick={logout}
            className="btn btn-danger hover-lift text-sm"
            style={{ padding: '8px 16px' }}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
