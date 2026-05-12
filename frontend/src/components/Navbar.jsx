import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LogOut, User as UserIcon, TicketIcon, LayoutDashboard, PlusCircle, ShieldCheck, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = user ? [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { to: '/raise-ticket', label: 'Raise Ticket', icon: <PlusCircle size={16} /> },
    { to: '/my-tickets', label: 'My Tickets', icon: <TicketIcon size={16} /> },
    ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: <ShieldCheck size={16} /> }] : []),
  ] : [];

  return (
    <nav className="fixed w-full top-0 z-50 glass-card !rounded-none !border-t-0 !border-x-0 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <span className="text-[var(--accent)]">●</span> 
            <span className="text-[var(--text-primary)]">SupportPortal</span>
          </Link>

          {/* Nav Links */}
          {user && (
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to
                      ? 'bg-[var(--bg-secondary)] text-[var(--primary)] shadow-sm border border-[var(--border-color)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-4 border-l border-[var(--border-color)] pl-4">
                <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)]">
                    <UserIcon size={16} />
                  </div>
                  <span className="hidden md:block font-medium">{user.full_name}</span>
                </div>
                <button onClick={handleLogout}
                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-red-500 transition-colors"
                  title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-[var(--border-color)] pl-4">
                <Link to="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Login</Link>
                <Link to="/register" className="btn-primary !px-4 !py-1.5 !text-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
