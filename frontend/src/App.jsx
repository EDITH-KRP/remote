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

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen relative text-[var(--text-primary)]">
            <div className="bg-minimal"></div>
            <Navbar />
            <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto py-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/raise-ticket" element={<PrivateRoute><RaiseTicket /></PrivateRoute>} />
                <Route path="/my-tickets" element={<PrivateRoute><MyTickets /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute adminOnly><AdminPanel /></PrivateRoute>} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
