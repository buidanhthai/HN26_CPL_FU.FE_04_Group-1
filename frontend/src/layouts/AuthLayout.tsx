import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0c0c14',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#151521',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        padding: '30px',
        boxSizing: 'border-box',
        border: '1px solid #2d2d3f'
      }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
