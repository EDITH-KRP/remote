import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Home from './pages/Home';
import ServiceNowLayout from './components/ServiceNowLayout';
import { Toaster } from 'react-hot-toast';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = React.useContext(AuthContext);
  const location = useLocation();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner" style={{ width: '44px', height: '44px', borderWidth: '3px' }} />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;

  const isMissingFields = !user.employee_id || !user.alternate_email || !user.phone;
  if (isMissingFields && location.pathname !== '/profile') {
    return <Navigate to="/profile" state={{ message: "Please complete your profile to continue." }} />;
  }

  // Wrap authenticated workspace in the ServiceNow layout framework
  return <ServiceNowLayout>{children}</ServiceNowLayout>;
};

function AppContent() {
  const { user } = React.useContext(AuthContext);
  const location = useLocation();

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isPublicHome = location.pathname === '/';
  
  // Render old navbar ONLY for logged out public landing pages
  const showNavbar = !user && (isPublicHome || isAuthPage);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', color: 'var(--text-1)' }}>
      {/* Dynamic Animated Mesh background strictly for public homepage */}
      {showNavbar && (
        <div className="mesh-bg">
          <div className="mesh-grid" />
          <div className="mesh-orb" />
        </div>
      )}

      {showNavbar && <Navbar />}
      
      <div style={{
        paddingTop: showNavbar ? '86px' : '0px',
        paddingBottom: showNavbar ? '2rem' : '0px',
        maxWidth: showNavbar ? '1280px' : 'none',
        margin: '0 auto',
        paddingLeft: showNavbar ? '1.5rem' : '0px',
        paddingRight: showNavbar ? '1.5rem' : '0px',
      }}>
        <Routes>
          <Route path="/"             element={user ? <PrivateRoute><Home /></PrivateRoute> : <Home />} />
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
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
          <Toaster position="bottom-right" toastOptions={{
            style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(99,102,241,0.2)' }
          }} />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
