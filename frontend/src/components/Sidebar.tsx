import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
      width: '260px',
      minWidth: '260px',
      backgroundColor: 'var(--surface-color)',
      minHeight: '100vh',
      borderRight: '1px solid var(--border-color)',
      paddingTop: '25px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <Link to="/" style={{
          display: 'block',
          padding: '0 24px 20px 24px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '20px',
          textDecoration: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem',
              boxShadow: 'var(--shadow)'
            }}>
              ☕
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontFamily: 'var(--font-title)',
                fontSize: '1.35rem',
                fontWeight: 'bold',
                color: 'var(--primary-text)',
                lineHeight: 1.1
              }}>
                CozySpace<span style={{ color: 'var(--accent-hover)' }}>.</span>
              </h2>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                color: 'var(--secondary-text)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Workspace Portal
              </p>
            </div>
          </div>
        </Link>


        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <NavLink to="/dashboard" end style={linkStyle}>
            <span>📊</span> Tổng quan
          </NavLink>
          <NavLink to="/bookings" style={linkStyle}>
            <span>📅</span> Quản lý Đơn đặt
          </NavLink>
          <NavLink to="/service-requests" style={linkStyle}>
            <span>🛎️</span> Dịch vụ & Hỗ trợ
          </NavLink>
          <NavLink to="/history-reviews" style={linkStyle}>
            <span>⭐</span> Lịch sử & Đánh giá
          </NavLink>
          <NavLink to="/profile" style={linkStyle}>
            <span>👤</span> Tài khoản
          </NavLink>

          {/* STAFF & ADMIN routes */}
          {user && (user.role === 'STAFF' || user.role === 'ADMIN') && (
            <div style={{ marginTop: '20px' }}>
              <div style={{
                padding: '0 24px 8px 24px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'var(--secondary-text)',
                letterSpacing: '0.5px'
              }}>
                Vận hành nội bộ
              </div>
              <NavLink to="/tasks" style={linkStyle}>
                <span>📋</span> Quản lý công việc
              </NavLink>
              <NavLink to="/space-assets" style={linkStyle}>
                <span>🏢</span> Thiết lập tài sản
              </NavLink>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
        <span>Đang đăng nhập: </span>
        <div style={{ fontWeight: 'bold', color: 'var(--primary-text)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.fullName || 'Khách'}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

