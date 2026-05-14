import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RaiseTicket from './pages/RaiseTicket';
import MyTickets from './pages/MyTickets';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { Toaster } from 'react-hot-toast';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner" style={{ width: '44px', height: '44px', borderWidth: '3px' }} />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* Animated mesh background */}
          <div className="mesh-bg">
            <div className="mesh-grid" />
            <div className="mesh-orb" />
          </div>

          <div style={{ minHeight: '100vh', position: 'relative', color: 'var(--text-1)' }}>
            <Navbar />
            <div style={{
              paddingTop: '86px',
              paddingBottom: '2rem',
              maxWidth: '1280px',
              margin: '0 auto',
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem',
            }}>
              <Routes>
                <Route path="/"             element={<Navigate to="/dashboard" />} />
                <Route path="/login"        element={<Login />} />
                <Route path="/register"     element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/raise-ticket" element={<PrivateRoute><RaiseTicket /></PrivateRoute>} />
                <Route path="/my-tickets"   element={<PrivateRoute><MyTickets /></PrivateRoute>} />
                <Route path="/profile"      element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/admin"        element={<PrivateRoute adminOnly><AdminPanel /></PrivateRoute>} />
              </Routes>
            </div>
          </div>
          <Toaster position="bottom-right" toastOptions={{
            style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(99,102,241,0.2)' }
          }} />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
