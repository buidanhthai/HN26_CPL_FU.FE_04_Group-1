import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import UserDashboard from './components/UserDashboard';
import AdminStaffDashboard from './components/AdminStaffDashboard';

const Dashboard: React.FC = () => {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { user } = auth;

  if (user?.role === 'USER') {
    return <UserDashboard userFullName={user.fullName} userRole={user.role} />;
  }

  return <AdminStaffDashboard userFullName={user?.fullName ?? ''} userRole={user?.role ?? ''} />;
};

export default Dashboard;
