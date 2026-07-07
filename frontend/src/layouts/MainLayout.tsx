import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background-color)', color: 'var(--primary-text)' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '40px 8%', overflowY: 'auto', boxSizing: 'border-box' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
