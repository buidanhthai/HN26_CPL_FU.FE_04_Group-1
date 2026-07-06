import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) return null;

  const { user, logout } = authContext;

  return (
    <nav style={{
      height: '60px',
      backgroundColor: '#1e1e2d',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      borderBottom: '1px solid #2d2d3f',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#00e1d9' }}>
        Antigravity Portal
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>Welcome, <strong>{user.username}</strong> ({user.role})</span>
          <button 
            onClick={logout}
            style={{
              backgroundColor: '#ff5c75',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e04b61')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff5c75')}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
