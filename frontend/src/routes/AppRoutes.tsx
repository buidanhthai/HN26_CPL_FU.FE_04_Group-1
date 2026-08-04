import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Bookings from '../pages/Bookings';
import Tasks from '../pages/Tasks';
import Profile from '../pages/Profile';
import SpaceAssets from '../pages/SpaceAssets';
import ServiceRequests from '../pages/ServiceRequests';
import HistoryReviews from '../pages/HistoryReviews';

// Guards
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<Home />} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Main Routes - Tất cả role đều vào được */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/service-requests" element={<ServiceRequests />} />
          <Route path="/history-reviews" element={<HistoryReviews />} />
          <Route path="/profile" element={<Profile />} />

          {/* STAFF & ADMIN: Trang điều phối công việc nội bộ */}
          <Route element={<RoleProtectedRoute allowedRoles={['STAFF', 'ADMIN']} redirectTo="/dashboard" />}>
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/user-requests" element={<UserRequestsManagement />} />
            <Route path="/space-assets" element={<SpaceAssets />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
