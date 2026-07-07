import React, { useContext } from 'react';
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
      padding: '0 30px',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 2px 8px rgba(60, 42, 33, 0.04)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        fontFamily: 'var(--font-title)', 
        fontWeight: 'bold', 
        fontSize: '1.6rem', 
        color: 'var(--primary-text)' 
      }}>
        CozySpace.
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--secondary-text)' }}>
            Xin chào, <strong style={{ color: 'var(--primary-text)' }}>{user.username}</strong> ({user.role})
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
