import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register'; // Đã import Register chuẩn
import Dashboard from '../pages/Dashboard';
import Bookings from '../pages/Bookings';
import Tasks from '../pages/Tasks';

// Guards
import ProtectedRoute from './ProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes - Cả Login và Register đều dùng chung AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* <--- Đã đưa vào đây hợp lệ */}
      </Route>

      {/* Protected Main Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/tasks" element={<Tasks />} />
        </Route>
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;