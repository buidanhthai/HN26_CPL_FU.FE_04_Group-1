import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface RoleProtectedRouteProps {
  allowedRoles: Array<'ADMIN' | 'STAFF' | 'USER'>;
  redirectTo?: string;
}

/**
 * Bảo vệ route theo Role. Nếu user không có role phù hợp → redirect.
 * Dùng trong AppRoutes để phân tách quyền STAFF/ADMIN vs USER.
 */
const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
  redirectTo = '/dashboard'
}) => {
  const auth = useContext(AuthContext);

  if (!auth || !auth.user) {
    return <Navigate to="/login" replace />;
  }

  if (auth.loading) {
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

  const hasAccess = allowedRoles.includes(auth.user.role);
  return hasAccess ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default RoleProtectedRoute;
