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

import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

// Scroll ke atas di setiap route
const ScrollToTop = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
};

// Proteksi route
const RequireAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Layout wrapper */}
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />

            {/* Protected route */}
            <Route element={<RequireAuth />}>
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
