// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from './components/HomePage';
import LoginPage from './LoginPage';
import MainLayout from './components/MainLayout';
import SettingsPage from './components/SettingsPage';

// Tambahkan import halaman reset password
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';


// (opsional) komponen kecil agar halaman scroll ke atas saat route berubah
const ScrollToTop: React.FC = () => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  return null;
};

// Route guard sederhana: cek token di localStorage
const RequireAuth: React.FC = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />; // render child routes
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>

        <Routes>
          {/* Halaman tanpa layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Halaman dengan layout (Header/Footer/Outlet) */}
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />               {/* "/" */}

            {/* Group yang butuh auth */}
            <Route element={<RequireAuth />}>
              <Route path="settings" element={<SettingsPage />} /> {/* "/settings" */}
            </Route>
          </Route>

          {/* Fallback: ke beranda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </Suspense>
    </Router>
  );
}
