// src/App.tsx
import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import HomePage from "./components/HomePage";
import LoginPage from "./LoginPage";
import MainLayout from "./components/MainLayout";
import SettingsPage from "./components/SettingsPage";

// reset password
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

// Scroll ke atas setiap kali route berubah
const ScrollToTop: React.FC = () => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return null;
};

// Route guard
const RequireAuth: React.FC = () => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
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

          {/* Halaman dengan layout */}
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} /> {/* "/" */}

            {/* Proteksi */}
            <Route element={<RequireAuth />}>
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Fallback ke "/" */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
