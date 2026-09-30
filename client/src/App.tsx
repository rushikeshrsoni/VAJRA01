import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';

import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { FarmsPage } from './pages/FarmsPage.js';
import { DiagnosePage } from './pages/DiagnosePage.js';
import { DiagnosisDetailPage } from './pages/DiagnosisDetailPage.js';
import { AdvicePage } from './pages/AdvicePage.js';
import { AdviceDetailPage } from './pages/AdviceDetailPage.js';
import { ChatPage } from './pages/ChatPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { useAuth } from './context/AuthContext.js';

// Dedicated Logout route
const LogoutRoute = () => {
  const { logout } = useAuth();
  React.useEffect(() => {
    logout();
  }, [logout]);
  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/logout" element={<LogoutRoute />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farms"
              element={
                <ProtectedRoute>
                  <FarmsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farms/new"
              element={
                <ProtectedRoute>
                  <FarmsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farms/:id/edit"
              element={
                <ProtectedRoute>
                  <FarmsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/diagnose"
              element={
                <ProtectedRoute>
                  <DiagnosePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/diagnose/:id"
              element={
                <ProtectedRoute>
                  <DiagnosisDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/advice"
              element={
                <ProtectedRoute>
                  <AdvicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/advice/:id"
              element={
                <ProtectedRoute>
                  <AdviceDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
