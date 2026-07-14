import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) return null;

  const { user, logout } = authContext;

  return (
    <nav style={{
      height: '70px',
      backgroundColor: 'var(--background-color)',
      color: 'var(--primary-text)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 8%',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 2px 8px rgba(60, 42, 33, 0.04)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxSizing: 'border-box'
    }}>
      <NavLink to="/" style={{ 
        fontFamily: 'var(--font-title)', 
        fontWeight: 'bold', 
        fontSize: '1.6rem', 
        color: 'var(--primary-text)',
        textDecoration: 'none'
      }}>
        CozySpace.
      </NavLink>

      {user && (
        <div style={{ display: 'flex', gap: '30px', listStyle: 'none' }}>
          <NavLink 
            to="/dashboard" 
            end 
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500',
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary-text)' : 'var(--secondary-text)',
              borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
              padding: '6px 0',
              transition: 'var(--transition)'
            })}
            onMouseOver={(e) => {
              if (e.currentTarget.style.color !== 'var(--primary-text)') {
                e.currentTarget.style.color = 'var(--accent-color)';
              }
            }}
            onMouseOut={(e) => {
              if (e.currentTarget.style.borderBottomColor === 'transparent') {
                e.currentTarget.style.color = 'var(--secondary-text)';
              } else {
                e.currentTarget.style.color = 'var(--primary-text)';
              }
            }}
          >
            📊 Bảng điều khiển
          </NavLink>
          <NavLink 
            to="/bookings" 
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500',
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary-text)' : 'var(--secondary-text)',
              borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
              padding: '6px 0',
              transition: 'var(--transition)'
            })}
            onMouseOver={(e) => {
              if (e.currentTarget.style.color !== 'var(--primary-text)') {
                e.currentTarget.style.color = 'var(--accent-color)';
              }
            }}
            onMouseOut={(e) => {
              if (e.currentTarget.style.borderBottomColor === 'transparent') {
                e.currentTarget.style.color = 'var(--secondary-text)';
              } else {
                e.currentTarget.style.color = 'var(--primary-text)';
              }
            }}
          >
            📅 Lịch đặt chỗ
          </NavLink>
          <NavLink 
            to="/tasks" 
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500',
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary-text)' : 'var(--secondary-text)',
              borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
              padding: '6px 0',
              transition: 'var(--transition)'
            })}
            onMouseOver={(e) => {
              if (e.currentTarget.style.color !== 'var(--primary-text)') {
                e.currentTarget.style.color = 'var(--accent-color)';
              }
            }}
            onMouseOut={(e) => {
              if (e.currentTarget.style.borderBottomColor === 'transparent') {
                e.currentTarget.style.color = 'var(--secondary-text)';
              } else {
                e.currentTarget.style.color = 'var(--primary-text)';
              }
            }}
          >
            📋 Công việc
          </NavLink>
          <NavLink 
            to="/profile" 
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500',
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary-text)' : 'var(--secondary-text)',
              borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
              padding: '6px 0',
              transition: 'var(--transition)'
            })}
            onMouseOver={(e) => {
              if (e.currentTarget.style.color !== 'var(--primary-text)') {
                e.currentTarget.style.color = 'var(--accent-color)';
              }
            }}
            onMouseOut={(e) => {
              if (e.currentTarget.style.borderBottomColor === 'transparent') {
                e.currentTarget.style.color = 'var(--secondary-text)';
              } else {
                e.currentTarget.style.color = 'var(--primary-text)';
              }
            }}
          >
            👤 Hồ sơ
          </NavLink>
          {(user.role === 'ADMIN' || user.role === 'STAFF') && (
            <NavLink 
              to="/space-assets" 
              style={({ isActive }) => ({
                textDecoration: 'none',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.95rem',
                color: isActive ? 'var(--primary-text)' : 'var(--secondary-text)',
                borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
                padding: '6px 0',
                transition: 'var(--transition)'
              })}
              onMouseOver={(e) => {
                if (e.currentTarget.style.color !== 'var(--primary-text)') {
                  e.currentTarget.style.color = 'var(--accent-color)';
                }
              }}
              onMouseOut={(e) => {
                if (e.currentTarget.style.borderBottomColor === 'transparent') {
                  e.currentTarget.style.color = 'var(--secondary-text)';
                } else {
                  e.currentTarget.style.color = 'var(--primary-text)';
                }
              }}
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
            style={{
              backgroundColor: '#e07a5f',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#c65f45')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#e07a5f')}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
