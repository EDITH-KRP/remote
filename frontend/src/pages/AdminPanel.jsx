import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Loader2, Ticket, Users, BarChart2, Trash2, UserCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('access_token');

const statusBadge = {
  Open:         'badge badge-blue',
  Assigned:     'badge badge-yellow',
  'In Progress':'badge badge-purple',
  Resolved:     'badge badge-green',
  Closed:       'badge badge-gray',
};

const roleBadge = {
  admin:   'badge badge-red',
  support: 'badge badge-purple',
  user:    'badge badge-blue',
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
        axios.get(`${API_URL}/tickets`,         { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`${API_URL}/admin/users`,     { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`${API_URL}/admin/reports`,   { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      setTickets(tRes.data);
      setUsers(uRes.data);
      setReports(rRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (ticketId, status) => {
    await axios.put(`${API_URL}/tickets/${ticketId}`, { status }, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    load();
  };

  const assignStaff = async (ticketId, staffId) => {
    if (!staffId) return;
    await axios.post(`${API_URL}/admin/assign-ticket`, { ticket_id: ticketId, staff_id: staffId }, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    load();
  };

  const deleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    await axios.delete(`${API_URL}/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    load();
  };

  const supportStaff = users.filter(u => u.role === 'support' || u.role === 'admin');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '5rem' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
      </div>
    );
  }

  const tabs = [
    { id: 'tickets', label: 'All Tickets', icon: <Ticket size={15} />, count: tickets.length },
    { id: 'users',   label: 'All Users',   icon: <Users size={15} />,  count: users.length },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="section-title">Admin Panel</h1>
        <p className="section-sub">Manage tickets, users, and monitor system activity.</p>
      </div>

      {/* Stats */}
      {reports && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Tickets', value: reports.total_tickets, icon: Ticket,    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', glow: 'rgba(99,102,241,0.2)' },
            { label: 'Open Tickets',  value: reports.open_tickets,  icon: BarChart2, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245,158,11,0.2)' },
            { label: 'Resolved',      value: reports.resolved_tickets, icon: UserCheck, gradient: 'linear-gradient(135deg, #10b981, #059669)', glow: 'rgba(16,185,129,0.2)' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="stat-card"
              >
                <div className="stat-icon" style={{ background: s.gradient, boxShadow: `0 6px 20px ${s.glow}` }}>
                  <Icon size={22} color="#fff" />
                </div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '5px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        width: 'fit-content',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: tab === t.id ? 'var(--bg-secondary)' : 'transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {t.icon}
            {t.label}
            <span style={{
              marginLeft: '2px',
              background: tab === t.id ? 'var(--primary-light)' : 'var(--border-color)',
              color: tab === t.id ? 'var(--primary)' : 'var(--text-muted)',
              borderRadius: '99px',
              padding: '0 6px',
              fontSize: '0.7rem',
              fontWeight: 700,
              minWidth: '20px',
              textAlign: 'center',
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tickets tab */}
      {tab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tickets.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="card"
              style={{ padding: '1.125rem 1.25rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Info */}
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                      {ticket.ticket_number}
                    </span>
                    <span className={statusBadge[ticket.status] || 'badge badge-gray'}>{ticket.status}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      by <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{ticket.author_name || 'Unknown'}</strong>
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {ticket.subject}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ticket.description}
                  </p>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                  <select
                    defaultValue=""
                    onChange={e => assignStaff(ticket.id, e.target.value)}
                    className="input-field"
                    style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.4rem 0.7rem' }}
                  >
                    <option value="">Assign staff…</option>
                    {supportStaff.map(u => (
                      <option key={u.id} value={u.id}
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      >
                        {u.full_name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={ticket.status}
                    onChange={e => updateStatus(ticket.id, e.target.value)}
                    className="input-field"
                    style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.4rem 0.7rem' }}
                  >
                    {['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map(s => (
                      <option key={s} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{s}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => deleteTicket(ticket.id)}
                    className="btn-danger btn-sm"
                    title="Delete ticket"
                    style={{ padding: '0.4rem 0.6rem' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {tickets.length === 0 && (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No tickets found.
            </div>
          )}
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
          style={{ overflow: 'hidden' }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                        }}>
                          {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.full_name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td><span className={roleBadge[user.role] || 'badge badge-gray'}>{user.role}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{user.phone || '—'}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
