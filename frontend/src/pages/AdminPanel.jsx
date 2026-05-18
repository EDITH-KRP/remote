import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Ticket, Users, BarChart2, UserCheck, ShieldCheck, Trash2, ChevronDown, Download, X } from 'lucide-react';
import io from 'socket.io-client';

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
  { key: 'total_tickets',    label: 'Total Tickets', icon: Ticket,    gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)', glow: '0 6px 24px rgba(99,102,241,0.45)',  glowBg: 'rgba(99,102,241,0.1)', accent: 'rgba(99,102,241,0.3)' },
  { key: 'open_tickets',     label: 'Open',          icon: BarChart2, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: '0 6px 24px rgba(245,158,11,0.4)',  glowBg: 'rgba(245,158,11,0.08)', accent: 'rgba(245,158,11,0.25)' },
  { key: 'resolved_tickets', label: 'Resolved',      icon: UserCheck, gradient: 'linear-gradient(135deg,#10b981,#059669)', glow: '0 6px 24px rgba(16,185,129,0.4)',  glowBg: 'rgba(16,185,129,0.08)', accent: 'rgba(16,185,129,0.25)' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16,1,0.3,1] } },
};

export default function AdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [users,   setUsers]   = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('tickets');
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [tR, uR, rR] = await Promise.all([
        axios.get(`${API_URL}/tickets`,       { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`${API_URL}/admin/users`,   { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`${API_URL}/admin/reports`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      setTickets(tR.data); setUsers(uR.data); setReports(rR.data);
    } catch (e) { console.error(e); }
    if (!silent) setLoading(false);
  };

  useEffect(() => { 
    load(); 
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000';
    const socket = io(socketUrl);
    socket.on('tickets:update', () => {
      load(true);
    });
    return () => socket.disconnect();
  }, []);

  const updateStatus = async (id, status) => {
    await axios.put(`${API_URL}/tickets/${id}`, { status }, { headers: { Authorization: `Bearer ${getToken()}` } });
    load();
  };
  const assignStaff = async (ticketId, staffId) => {
    if (!staffId) return;
    await axios.post(`${API_URL}/admin/assign-ticket`, { ticket_id: ticketId, staff_id: staffId }, { headers: { Authorization: `Bearer ${getToken()}` } });
    load();
  };
  const deleteTicket = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    await axios.delete(`${API_URL}/tickets/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (expandedTicketId === id) setExpandedTicketId(null);
    load();
  };

  const staff = users.filter(u => u.role === 'support' || u.role === 'admin');
  
  const networkDeptUsers = staff.filter(u => u.full_name?.toLowerCase().includes('prajwal'));
  const windowsDeptUsers = staff.filter(u => u.full_name?.toLowerCase().includes('thanuja'));
  const otherStaff = staff.filter(u => !u.full_name?.toLowerCase().includes('prajwal') && !u.full_name?.toLowerCase().includes('thanuja'));

  const handleExport = () => {
    window.open(`${API_URL}/admin/export?token=${getToken()}`, '_blank');
  };

  const updateUserRole = async (userId, role) => {
    await axios.patch(`${API_URL}/admin/users/${userId}/role`, { role }, { headers: { Authorization: `Bearer ${getToken()}` } });
    load();
  };

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'58vh', gap:'1rem' }}>
      <div style={{ position:'relative' }}>
        <div className="spinner" style={{ width:'44px', height:'44px', borderWidth:'3px' }} />
        <div style={{ position:'absolute', inset:'-8px', borderRadius:'50%', border:'1px solid rgba(99,102,241,0.15)', animation:'spin-slow 3s linear infinite reverse' }} />
      </div>
      <p style={{ color:'var(--text-2)', fontSize:'0.875rem' }}>Loading admin panel…</p>
    </div>
  );

  const tabs = [
    { id: 'tickets', label: 'All Tickets', icon: <Ticket size={14} />, count: tickets.length },
    { id: 'users',   label: 'All Users',   icon: <Users  size={14} />, count: users.length   },
  ];

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', paddingBottom: '4rem' }}>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.75rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
          <ShieldCheck size={14} style={{ color: '#f87171' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Admin
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-1)', marginBottom: '4px' }}>
          Control Center
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
          Manage tickets, users, and monitor activity.
        </p>
      </motion.div>

      {/* ── Stats ─────────────────────────────────── */}
      {reports && (
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.07 } } }}
          style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem', marginBottom:'1.75rem' }}
        >
          {statConfig.map(s => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.key}
                variants={cardVariants}
                whileHover={{ y:-4, boxShadow:`0 20px 40px rgba(0,0,0,0.5),${s.glow}`, borderColor: s.accent }}
                style={{
                  background:'rgba(10,12,22,0.82)',
                  border:'1px solid rgba(99,102,241,0.12)',
                  borderRadius:'var(--r-lg)',
                  padding:'1.25rem 1.5rem',
                  display:'flex', alignItems:'center', gap:'1rem',
                  backdropFilter:'blur(20px)',
                  transition:'all 0.3s cubic-bezier(0.23,1,0.32,1)',
                  position:'relative', overflow:'hidden', cursor:'default',
                }}
              >
                <div style={{
                  position:'absolute', top:0, right:0, width:'80px', height:'80px',
                  background:`radial-gradient(circle at top right, ${s.glowBg} 0%, transparent 70%)`,
                  borderRadius:'50%', transform:'translate(30%,-30%)', pointerEvents:'none',
                }} />
                <motion.div
                  whileHover={{ scale:1.08, rotate:6 }}
                  style={{
                    width:'48px', height:'48px', flexShrink:0,
                    borderRadius:'var(--r-md)',
                    background: s.gradient,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow: s.glow,
                  }}
                >
                  <Icon size={20} color="#fff" />
                </motion.div>
                <div>
                  <p style={{ fontSize:'1.875rem', fontWeight:900, letterSpacing:'-0.05em', lineHeight:1, color:'var(--text-1)' }}>
                    {reports[s.key] ?? 0}
                  </p>
                  <p style={{ fontSize:'0.78rem', color:'var(--text-2)', fontWeight:500, marginTop:'3px' }}>{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Tab bar ────────────────────────────────── */}
      <div style={{
        display:'inline-flex', gap:'4px',
        padding:'4px',
        background:'rgba(9,11,22,0.85)',
        border:'1px solid rgba(99,102,241,0.14)',
        borderRadius:'var(--r-md)',
        marginBottom:'1.375rem',
        backdropFilter:'blur(16px)',
      }}>
        {tabs.map(t => (
          <motion.button
            key={t.id}
            onClick={() => setTab(t.id)}
            whileTap={{ scale: 0.96 }}
            style={{
              display:'flex', alignItems:'center', gap:'7px',
              padding:'0.45rem 1rem',
              borderRadius:'var(--r-sm)',
              fontSize:'0.845rem', fontWeight:600,
              border:'none', cursor:'pointer', fontFamily:'inherit',
              transition:'all 0.2s ease',
              background: tab === t.id
                ? 'linear-gradient(135deg,rgba(99,102,241,0.22),rgba(139,92,246,0.14))'
                : 'transparent',
              color: tab === t.id ? 'var(--p3)' : 'var(--text-2)',
              boxShadow: tab === t.id ? '0 2px 10px rgba(99,102,241,0.18)' : 'none',
            }}
          >
            {t.icon}
            {t.label}
            <span style={{
              padding:'1px 7px', borderRadius:'99px', fontSize:'0.7rem', fontWeight:800,
              background: tab === t.id ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)',
              color: tab === t.id ? 'var(--p3)' : 'var(--text-3)',
              minWidth:'22px', textAlign:'center',
            }}>
              {t.count}
            </span>
          </motion.button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <motion.button
            onClick={handleExport}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.845rem' }}
          >
            <Download size={14} /> Export CSV
          </motion.button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Tickets tab */}
        {tab === 'tickets' && (
          <motion.div
            key="tickets"
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0  }}
            exit={{   opacity:0, y:-10 }}
            transition={{ duration:0.22 }}
          >
            <motion.div
              initial="hidden" animate="show"
              variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.05 } } }}
              style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}
            >
              {tickets.map(ticket => (
                <motion.div
                  key={ticket.id}
                  variants={cardVariants}
                  whileHover={{ borderColor:'rgba(99,102,241,0.3)', boxShadow:'0 10px 28px rgba(0,0,0,0.4)' }}
                  style={{
                    background:'rgba(10,12,22,0.82)',
                    border:'1px solid rgba(99,102,241,0.11)',
                    borderRadius:'var(--r-lg)',
                    padding:'1.125rem 1.375rem',
                    backdropFilter:'blur(20px)',
                    transition:'all 0.22s ease',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedTicketId(ticket.id)}
                >
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1.25rem', flexWrap:'wrap' }}>
                    {/* Info col */}
                    <div style={{ flex:1, minWidth:'240px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'5px', flexWrap:'wrap' }}>
                        <span className="ticket-chip">{ticket.ticket_number}</span>
                        <span className={statusBadge[ticket.status] || 'badge badge-gray'}>{ticket.status}</span>
                        <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>
                          by <strong style={{ color:'var(--text-2)', fontWeight:600 }}>{ticket.author_name || 'Unknown'}</strong>
                        </span>
                      </div>
                      <h3 style={{ fontWeight:700, fontSize:'0.9375rem', color:'var(--text-1)', marginBottom:'3px' }}>
                        {ticket.subject}
                      </h3>
                      <p style={{
                        fontSize:'0.8rem', color:'var(--text-3)', lineHeight:1.55,
                        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
                      }}>
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {tickets.length === 0 && (
                <div style={{
                  background:'rgba(10,12,22,0.82)',
                  border:'1px solid rgba(99,102,241,0.11)',
                  borderRadius:'var(--r-lg)',
                  padding:'3.5rem', textAlign:'center',
                  color:'var(--text-3)', fontSize:'0.9rem',
                }}>
                  No tickets found.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0  }}
            exit={{   opacity:0, y:-10 }}
            transition={{ duration:0.22 }}
            style={{
              background:'rgba(10,12,22,0.82)',
              border:'1px solid rgba(99,102,241,0.12)',
              borderRadius:'var(--r-lg)',
              backdropFilter:'blur(20px)',
              overflow:'hidden',
            }}
          >
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft:'1.5rem' }}>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th style={{ paddingRight:'1.5rem' }}>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const initials = u.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?';
                    const gradMap = { admin:'linear-gradient(135deg,#ef4444,#dc2626)', support:'linear-gradient(135deg,#8b5cf6,#7c3aed)', user:'linear-gradient(135deg,#6366f1,#4f46e5)' };
                    const glowMap = { admin:'0 4px 12px rgba(239,68,68,0.35)', support:'0 4px 12px rgba(139,92,246,0.35)', user:'0 4px 12px rgba(99,102,241,0.35)' };
                    return (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity:0 }}
                        animate={{ opacity:1 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <td style={{ paddingLeft:'1.5rem' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <div style={{
                              width:'32px', height:'32px', borderRadius:'50%', flexShrink:0,
                              background: gradMap[u.role] || gradMap.user,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              color:'#fff', fontSize:'0.7rem', fontWeight:800,
                              boxShadow: glowMap[u.role] || glowMap.user,
                            }}>
                              {initials}
                            </div>
                            <span style={{ fontWeight:600, color:'var(--text-1)', fontSize:'0.875rem' }}>{u.full_name}</span>
                          </div>
                        </td>
                        <td style={{ color:'var(--text-2)', fontSize:'0.875rem' }}>{u.email}</td>
                        <td>
                          <div style={{ position:'relative' }}>
                            <select
                              value={u.role}
                              onChange={e => updateUserRole(u.id, e.target.value)}
                              className="input"
                              style={{ fontSize:'0.8rem', padding:'0.3rem 2rem 0.3rem 0.5rem', width:'auto', cursor:'pointer', appearance:'none', WebkitAppearance:'none', background: 'transparent', border: '1px solid rgba(99,102,241,0.2)' }}
                            >
                              {['user','support','admin'].map(r => (
                                <option key={r} value={r} style={{ background:'#0c0f1d' }}>{r}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} style={{ position:'absolute', right:'0.5rem', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--text-3)' }} />
                          </div>
                        </td>
                        <td style={{ color:'var(--text-3)', fontSize:'0.875rem', paddingRight:'1.5rem' }}>{u.phone || '—'}</td>
                      </motion.tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign:'center', color:'var(--text-3)', padding:'2.5rem' }}>No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedTicketId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
            onClick={() => setExpandedTicketId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{
                background: 'rgba(10,12,22,0.95)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 'var(--r-lg)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '2rem', position: 'relative'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setExpandedTicketId(null)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              
              {(() => {
                const ticket = tickets.find(t => t.id === expandedTicketId);
                if (!ticket) return null;
                const authorUser = users.find(u => u.id === ticket.user_id) || {};
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                      <span className="ticket-chip">{ticket.ticket_number}</span>
                      <span className={statusBadge[ticket.status] || 'badge badge-gray'}>{ticket.status}</span>
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '1rem' }}>{ticket.subject}</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
                      {ticket.description}
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: '1.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-1)', marginBottom: '12px', fontWeight: 600 }}>Ticket Details</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}><strong style={{ color: 'var(--text-2)' }}>Priority:</strong> {ticket.priority || 'N/A'}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}><strong style={{ color: 'var(--text-2)' }}>Impact:</strong> {ticket.impact || 'N/A'}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}><strong style={{ color: 'var(--text-2)' }}>Urgency:</strong> {ticket.urgency || 'N/A'}</p>
                          {ticket.note && <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}><strong style={{ color: 'var(--text-2)' }}>Note:</strong> {ticket.note}</p>}
                        </div>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-1)', marginBottom: '12px', fontWeight: 600 }}>User Details</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}><strong style={{ color: 'var(--text-2)' }}>Name:</strong> {authorUser.full_name || ticket.author_name || 'N/A'}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}><strong style={{ color: 'var(--text-2)' }}>Email:</strong> {authorUser.email || 'N/A'}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}><strong style={{ color: 'var(--text-2)' }}>Phone:</strong> {authorUser.phone || 'N/A'}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}><strong style={{ color: 'var(--text-2)' }}>Emp ID:</strong> {authorUser.employee_id || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Controls col in Modal */}
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-1)', fontWeight: 600, marginRight: 'auto' }}>Actions</h4>
                      {/* Assign */}
                      <div style={{ position:'relative' }}>
                        <select
                          value={ticket.assigned_staff_id || ""}
                          onChange={e => assignStaff(ticket.id, e.target.value)}
                          className="input"
                          style={{ fontSize:'0.8rem', padding:'0.42rem 2rem 0.42rem 0.75rem', width:'auto', cursor:'pointer', appearance:'none', WebkitAppearance:'none' }}
                        >
                          <option value="">Assign staff…</option>
                          {networkDeptUsers.length > 0 && (
                            <optgroup label="Network Dept">
                              {networkDeptUsers.map(u => (
                                <option key={u.id} value={u.id} style={{ background:'#0c0f1d' }}>{u.full_name}</option>
                              ))}
                            </optgroup>
                          )}
                          {windowsDeptUsers.length > 0 && (
                            <optgroup label="Windows Dept">
                              {windowsDeptUsers.map(u => (
                                <option key={u.id} value={u.id} style={{ background:'#0c0f1d' }}>{u.full_name}</option>
                              ))}
                            </optgroup>
                          )}
                          {otherStaff.length > 0 && (
                            <optgroup label="Staff">
                              {otherStaff.map(u => (
                                <option key={u.id} value={u.id} style={{ background:'#0c0f1d' }}>{u.full_name}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                        <ChevronDown size={12} style={{ position:'absolute', right:'0.5rem', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--text-3)' }} />
                      </div>

                      {/* Status */}
                      <div style={{ position:'relative' }}>
                        <select
                          value={ticket.status}
                          onChange={e => updateStatus(ticket.id, e.target.value)}
                          className="input"
                          style={{ fontSize:'0.8rem', padding:'0.42rem 2rem 0.42rem 0.75rem', width:'auto', cursor:'pointer', appearance:'none', WebkitAppearance:'none' }}
                        >
                          {['Open','Assigned','In Progress','Resolved','Closed'].map(s => (
                            <option key={s} style={{ background:'#0c0f1d' }}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} style={{ position:'absolute', right:'0.5rem', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--text-3)' }} />
                      </div>

                      {/* Delete */}
                      <motion.button
                        whileHover={{ scale:1.06 }} whileTap={{ scale:0.95 }}
                        onClick={() => deleteTicket(ticket.id)}
                        className="btn-danger btn-sm"
                        title="Delete ticket"
                        style={{ padding:'0.42rem 0.65rem', borderRadius:'var(--r-sm)' }}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
