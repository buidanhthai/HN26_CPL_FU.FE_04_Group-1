import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--surface-color)',
      color: 'var(--primary-text)',
      fontFamily: 'var(--font-ui)',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--background-color)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow)',
        padding: '40px 30px',
        boxSizing: 'border-box',
        border: '1px solid var(--border-color)',
        transition: 'var(--transition)'
      }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
