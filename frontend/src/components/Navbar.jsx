import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, TicketIcon, LayoutDashboard,
  PlusCircle, ShieldCheck, Menu, X, Zap, Bell, User as UserIcon, Moon, Sun
} from 'lucide-react';
import api from '../services/api';
import socket from '../services/socket';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  React.useEffect(() => {
    if (user) {
      api.get('/notifications').then(res => setNotifications(res.data)).catch(() => {});
      
      const handleNotification = (data) => {
        setNotifications(prev => [{ id: Date.now(), ...data, is_read: false }, ...prev]);
      };

      socket.on(`notification:${user.id}`, handleNotification);
      return () => {
        socket.off(`notification:${user.id}`, handleNotification);
      };
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };


  const handleLogout = () => { logout(); navigate('/login'); setMobileOpen(false); };

  const navLinks = user ? [
    ...(user.role !== 'admin' ? [
      { to: '/dashboard',    label: 'Dashboard',    icon: <LayoutDashboard size={14} /> },
      { to: '/raise-ticket', label: 'New Ticket',   icon: <PlusCircle size={14} /> },
      { to: '/my-tickets',   label: 'My Tickets',   icon: <TicketIcon size={14} /> },
    ] : []),
    ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: <ShieldCheck size={14} /> }] : []),
    { to: '/profile',      label: 'Profile',      icon: <UserIcon size={14} /> },
  ] : [];

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: '#293e40',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Subtle top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(129,179,184,0.6), rgba(53,122,112,0.6), transparent)',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '62px' }}>

            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '34px', height: '34px', borderRadius: '6px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #357a70, #81b3b8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(53,122,112,0.3)',
                }}
              >
                <Zap size={17} color="#fff" fill="#fff" />
              </motion.div>
              <span style={{
                fontWeight: 800, fontSize: '1.0625rem',
                color: '#ffffff',
                letterSpacing: '-0.03em',
              }}>
                SupportDesk
              </span>
            </Link>

            {/* Desktop nav links */}
            {user && (
              <div className="hidden md:flex" style={{ alignItems: 'center', gap: '2px' }}>
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 + 0.2 }}
                  >
                    <Link
                      to={link.to}
                      className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user ? (
                <>
                  {/* Theme Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTheme}
                    className="btn-icon"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </motion.button>

                  {/* Notifications */}
                  <div style={{ position: 'relative' }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="btn-icon"
                      style={{ color: 'var(--text-2)', position: 'relative' }}
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span style={{
                          position: 'absolute', top: 2, right: 4, width: 8, height: 8,
                          background: '#f87171', borderRadius: '50%', border: '2px solid #06080f'
                        }} />
                      )}
                    </motion.button>
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          style={{
                            position: 'absolute', top: '100%', right: 0, width: '300px',
                            background: 'rgba(10,12,22,0.95)', border: '1px solid rgba(99,102,241,0.2)',
                            borderRadius: 'var(--r-md)', padding: '1rem', marginTop: '0.5rem',
                            backdropFilter: 'blur(16px)', zIndex: 50, maxHeight: '400px', overflowY: 'auto'
                          }}
                        >
                          <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-1)' }}>Notifications</h4>
                          {notifications.length === 0 ? <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>No notifications</p> : null}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {notifications.map(n => (
                              <div 
                                key={n.id} 
                                onClick={() => markRead(n.id)}
                                style={{ 
                                  padding: '0.75rem', borderRadius: '6px', cursor: 'pointer',
                                  background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.1)',
                                  border: `1px solid ${n.is_read ? 'transparent' : 'rgba(99,102,241,0.2)'}`
                                }}
                              >
                                <p style={{ fontSize: '0.8rem', color: n.is_read ? 'var(--text-2)' : 'var(--text-1)' }}>{n.message}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    paddingLeft: '12px', borderLeft: '1px solid rgba(99,102,241,0.15)',
                  }}>
                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #357a70, #81b3b8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '0.75rem', fontWeight: 800,
                        boxShadow: '0 4px 16px rgba(53,122,112,0.3)',
                        cursor: 'default',
                        border: '2px solid rgba(129,179,184,0.3)',
                      }}
                    >
                      {initials}
                    </motion.div>
                    <span className="hidden md:block" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(238,240,251,0.8)' }}>
                      {user.full_name?.split(' ')[0]}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="btn-icon"
                    title="Logout"
                    style={{ color: 'var(--text-2)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <LogOut size={16} />
                  </motion.button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
                  <Link to="/login" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
                  >
                    Sign in
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm" style={{ background: '#357a70', border: '1px solid rgba(129,179,184,0.3)', boxShadow: '0 4px 12px rgba(53,122,112,0.3)' }}>
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              {user && (
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="btn-icon md:hidden"
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                overflow: 'hidden',
                borderTop: '1px solid rgba(99,102,241,0.12)',
                background: 'rgba(6,8,15,0.95)',
              }}
            >
              <div style={{ padding: '12px 1.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                  >
                    {link.icon} {link.label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="nav-link" style={{ color: '#f87171', marginTop: '8px' }}>
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
