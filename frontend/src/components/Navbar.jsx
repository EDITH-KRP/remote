import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  LogOut, User as UserIcon, TicketIcon, LayoutDashboard,
  PlusCircle, ShieldCheck, Sun, Moon, Menu, X
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const navLinks = user ? [
    { to: '/dashboard',    label: 'Dashboard',   icon: <LayoutDashboard size={15} /> },
    { to: '/raise-ticket', label: 'Raise Ticket', icon: <PlusCircle size={15} /> },
    { to: '/my-tickets',   label: 'My Tickets',   icon: <TicketIcon size={15} /> },
    ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: <ShieldCheck size={15} /> }] : []),
  ] : [];

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'var(--glass-bg)',
          borderBottom: '1px solid var(--border-color)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                flexShrink: 0,
              }}>
                <TicketIcon size={16} color="#fff" />
              </div>
              <span style={{
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
              }}>
                SupportDesk
              </span>
            </Link>

            {/* Desktop Nav */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="btn-icon"
                aria-label="Toggle theme"
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {user ? (
                <>
                  {/* User avatar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingLeft: '8px',
                    borderLeft: '1px solid var(--border-color)',
                    marginLeft: '4px',
                  }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                      title={user.full_name}
                    >
                      {initials || <UserIcon size={14} />}
                    </div>
                    <span
                      className="hidden md:block"
                      style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}
                    >
                      {user.full_name?.split(' ')[0]}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="btn-icon"
                    title="Logout"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <LogOut size={17} />
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)', marginLeft: '4px' }}>
                  <Link to="/login" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary btn-sm">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              {user && (
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="btn-icon md:hidden"
                  aria-label="Toggle menu"
                  style={{ marginLeft: '4px' }}
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && user && (
          <div style={{
            borderTop: '1px solid var(--border-color)',
            padding: '12px 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            background: 'var(--glass-bg)',
          }}>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="nav-link"
              style={{ color: 'var(--danger)', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', marginTop: '4px' }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
