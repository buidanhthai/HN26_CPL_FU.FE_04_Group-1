import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) return null;

  const { user, logout } = authContext;

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--surface-color)',
      height: '70px',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            CozySpace Workspace Portal
          </span>
        </Link>
      </div>


      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--secondary-text)' }}>
            Xin chào, <strong style={{ color: 'var(--primary-text)' }}>{user.fullName}</strong>
          </span>
          <button
            onClick={logout}
            className="btn btn-danger hover-lift"
            style={{ 
              padding: '6px 14px', 
              fontSize: '0.8rem', 
              borderRadius: '8px', 
              backgroundColor: '#e07a5f',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;

