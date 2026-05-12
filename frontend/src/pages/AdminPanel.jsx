import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Ticket, Users, BarChart2, Trash2, UserCheck, ShieldCheck, ChevronDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('access_token');

const statusBadge = {
  Open:          'badge badge-blue',
  Assigned:      'badge badge-yellow',
  'In Progress': 'badge badge-purple',
  Resolved:      'badge badge-green',
  Closed:        'badge badge-gray',
};

const roleBadge = {
  admin:   'badge badge-red',
  support: 'badge badge-purple',
  user:    'badge badge-cyan',
};

const statConfig = [
  { key: 'total_tickets', label: 'Total Tickets',   icon: Ticket,     gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', glow: '0 8px 28px rgba(99,102,241,0.45)',    glowBg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)' },
  { key: 'open_tickets',  label: 'Open Tickets',    icon: BarChart2,  gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: '0 8px 28px rgba(245,158,11,0.45)',   glowBg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)' },
  { key: 'resolved_tickets', label: 'Resolved',     icon: UserCheck,  gradient: 'linear-gradient(135deg, #10b981, #059669)', glow: '0 8px 28px rgba(16,185,129,0.45)',   glowBg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function AdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tickets');

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, uRes, rRes] = await Promise.all([
        axios.get(`${API_URL}/tickets`,       { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`${API_URL}/admin/users`,   { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`${API_URL}/admin/reports`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      setTickets(tRes.data);
      setUsers(uRes.data);
      setReports(rRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (ticketId, status) => {
    await axios.put(`${API_URL}/tickets/${ticketId}`, { status }, { headers: { Authorization: `Bearer ${getToken()}` } });
    load();
  };

  const assignStaff = async (ticketId, staffId) => {
    if (!staffId) return;
    await axios.post(`${API_URL}/admin/assign-ticket`, { ticket_id: ticketId, staff_id: staffId }, { headers: { Authorization: `Bearer ${getToken()}` } });
    load();
  };

  const deleteTicket = async (ticketId) => {
    if (!window.confirm('Delete this ticket?')) return;
    await axios.delete(`${API_URL}/tickets/${ticketId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
    load();
  };

  const supportStaff = users.filter(u => u.role === 'support' || u.role === 'admin');

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ position: 'relative' }}>
        <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '3px' }} />
        <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '1px solid rgba(99,102,241,0.2)', animation: 'spin-slow 3s linear infinite reverse' }} />
      </div>
      <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Loading admin panel…</p>
    </div>
  );

  const tabs = [
    { id: 'tickets', label: 'Tickets', icon: <Ticket size={14} />,    count: tickets.length },
    { id: 'users',   label: 'Users',   icon: <Users size={14} />,     count: users.length },
  ];

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <ShieldCheck size={16} style={{ color: '#f87171' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Admin
          </span>
        </div>
        <h1 className="page-title">Control Center</h1>
        <p className="page-sub">Manage tickets, users, and monitor system activity.</p>
      </motion.div>

      {/* Stats */}
      {reports && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid-stats"
          style={{ marginBottom: '2rem' }}
        >
          {statConfig.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.key}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: `0 20px 40px rgba(0,0,0,0.5), ${s.glow}`, borderColor: s.border }}
                style={{
                  background: 'rgba(10,12,22,0.8)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: 'var(--r-lg)',
                  padding: '1.375rem 1.5rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  backdropFilter: 'blur(20px)',
                  cursor: 'default',
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: '90px', height: '90px',
                  background: `radial-gradient(circle at top right, ${s.glowBg} 0%, transparent 70%)`,
                  borderRadius: '50%', transform: 'translate(30%, -30%)',
                }} />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 6 }}
                  style={{
                    width: '50px', height: '50px', borderRadius: 'var(--r-md)',
                    background: s.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: s.glow, flexShrink: 0,
                  }}
                >
                  <Icon size={22} color="#fff" />
                </motion.div>
                <div>
                  <div style={{ fontSize: '2.125rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--text-1)' }}>
                    {reports[s.key] ?? 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', fontWeight: 500, marginTop: '3px' }}>{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'inline-flex', gap: '4px',
        padding: '5px',
        background: 'rgba(10,12,22,0.8)',
        border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: 'var(--r-md)',
        marginBottom: '1.5rem',
        backdropFilter: 'blur(16px)',
      }}>
        {tabs.map(t => (
          <motion.button
            key={t.id}
            onClick={() => setTab(t.id)}
            whileTap={{ scale: 0.96 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '0.45rem 1.1rem',
              borderRadius: 'var(--r-sm)',
              fontSize: '0.85rem', fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              background: tab === t.id
                ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))'
                : 'transparent',
              color: tab === t.id ? 'var(--p3)' : 'var(--text-2)',
              boxShadow: tab === t.id ? '0 2px 12px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
            }}
          >
            {t.icon} {t.label}
            <span style={{
              padding: '1px 7px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800,
              background: tab === t.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              color: tab === t.id ? 'var(--p3)' : 'var(--text-3)',
            }}>
              {t.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Tickets */}
      <AnimatePresence mode="wait">
        {tab === 'tickets' && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
            >
              {tickets.map(ticket => (
                <motion.div
                  key={ticket.id}
                  variants={itemVariants}
                  style={{
                    background: 'rgba(10,12,22,0.8)',
                    border: '1px solid rgba(99,102,241,0.12)',
                    borderRadius: 'var(--r-lg)',
                    padding: '1.25rem 1.5rem',
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.25s ease',
                  }}
                  whileHover={{ borderColor: 'rgba(99,102,241,0.3)', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.25rem', flexWrap: 'wrap' }}>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span className="ticket-chip">{ticket.ticket_number}</span>
                        <span className={statusBadge[ticket.status] || 'badge badge-gray'}>{ticket.status}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                          by <strong style={{ color: 'var(--text-2)' }}>{ticket.author_name || 'Unknown'}</strong>
                        </span>
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-1)', marginBottom: '4px' }}>
                        {ticket.subject}
                      </h3>
                      <p style={{
                        fontSize: '0.8125rem', color: 'var(--text-3)',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        lineHeight: 1.6,
                      }}>
                        {ticket.description}
                      </p>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                      {/* Assign */}
                      <div style={{ position: 'relative' }}>
                        <select
                          defaultValue=""
                          onChange={e => assignStaff(ticket.id, e.target.value)}
                          className="input"
                          style={{ width: 'auto', fontSize: '0.8rem', padding: '0.45rem 2rem 0.45rem 0.75rem', cursor: 'pointer' }}
                        >
                          <option value="">Assign staff…</option>
                          {supportStaff.map(u => (
                            <option key={u.id} value={u.id} style={{ background: '#0c0f1d' }}>{u.full_name}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
                      </div>

                      {/* Status */}
                      <div style={{ position: 'relative' }}>
                        <select
                          value={ticket.status}
                          onChange={e => updateStatus(ticket.id, e.target.value)}
                          className="input"
                          style={{ width: 'auto', fontSize: '0.8rem', padding: '0.45rem 2rem 0.45rem 0.75rem', cursor: 'pointer' }}
                        >
                          {['Open','Assigned','In Progress','Resolved','Closed'].map(s => (
                            <option key={s} style={{ background: '#0c0f1d' }}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
                      </div>

                      {/* Delete */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteTicket(ticket.id)}
                        className="btn-danger btn-sm"
                        title="Delete ticket"
                        style={{ padding: '0.45rem 0.65rem', borderRadius: 'var(--r-sm)' }}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {tickets.length === 0 && (
                <div style={{
                  background: 'rgba(10,12,22,0.8)',
                  border: '1px solid rgba(99,102,241,0.12)',
                  borderRadius: 'var(--r-lg)',
                  padding: '3.5rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.9rem',
                }}>
                  No tickets found.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'rgba(10,12,22,0.8)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 'var(--r-lg)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => {
                    const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                              background: `linear-gradient(135deg, ${
                                user.role === 'admin' ? '#ef4444, #dc2626' :
                                user.role === 'support' ? '#8b5cf6, #7c3aed' :
                                '#6366f1, #4f46e5'
                              })`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '0.72rem', fontWeight: 800,
                              boxShadow: user.role === 'admin' ? '0 4px 12px rgba(239,68,68,0.35)' :
                                         user.role === 'support' ? '0 4px 12px rgba(139,92,246,0.35)' :
                                         '0 4px 12px rgba(99,102,241,0.35)',
                            }}>
                              {initials}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: '0.875rem' }}>
                              {user.full_name}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{user.email}</td>
                        <td><span className={roleBadge[user.role] || 'badge badge-gray'}>{user.role}</span></td>
                        <td style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>{user.phone || '—'}</td>
                      </motion.tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '3rem' }}>No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
