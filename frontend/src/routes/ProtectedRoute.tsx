import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  const { isAuthenticated, loading } = auth;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0c0c14',
        color: '#00e1d9',
        fontSize: '1.2rem',
        fontWeight: '600'
      }}>
        Loading session...
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
