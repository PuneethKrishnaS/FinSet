import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SettingsProvider } from './context/SettingsContext';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import LogTransaction from './components/LogTransaction';
import History from './components/History';
import Budget from './components/Budget';
import Debts from './components/Debts';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import Profile from './components/Profile';
import ChitFunds from './components/ChitFunds';
import Notifications from './components/Notifications';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname.startsWith('/reset-password');
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return children;
  }

  if (isAuthPage) {
    return <div className="auth-layout">{children}</div>;
  }

  return (
    <div className="app-layout">
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <Toaster position="top-right" toastOptions={{
        style: {
          borderRadius: '12px',
          background: 'var(--bg-panel)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)',
        }
      }} />
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<AuthRoute><LandingPage /></AuthRoute>} />
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
            <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
            <Route path="/reset-password/:uid/:token" element={<AuthRoute><ResetPassword /></AuthRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/log-transaction" element={<ProtectedRoute><LogTransaction /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/budgets" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
            <Route path="/debts" element={<ProtectedRoute><Debts /></ProtectedRoute>} />
            <Route path="/chits" element={<ProtectedRoute><ChitFunds /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          </Routes>
        </AppLayout>
      </Router>
    </SettingsProvider>
  );
}

export default App;
