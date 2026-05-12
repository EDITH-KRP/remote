import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Ticket, Clock, CheckCircle, Activity, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusMap = {
  Open:      { color: 'text-blue-500',   bg: 'bg-blue-500/10',   label: 'Open' },
  'In Progress': { color: 'text-violet-500', bg: 'bg-violet-500/10', label: 'In Progress' },
  Resolved:  { color: 'text-green-500',  bg: 'bg-green-500/10',  label: 'Resolved' },
  Closed:    { color: 'text-gray-400',   bg: 'bg-gray-400/10',   label: 'Closed' },
};

const getStatusBadgeClass = (status) => {
  const m = {
    Open:         'badge badge-blue',
    Assigned:     'badge badge-yellow',
    'In Progress':'badge badge-purple',
    Resolved:     'badge badge-green',
    Closed:       'badge badge-gray',
  };
  return m[status] || 'badge badge-gray';
};

const getPriorityBadgeClass = (p) => {
  const m = { Low: 'badge badge-green', Medium: 'badge badge-yellow', High: 'badge badge-red', Critical: 'badge badge-red' };
  return m[p] || 'badge badge-gray';
};

const statCards = (tickets) => [
  {
    label: 'Total Tickets',
    value: tickets.length,
    icon: Ticket,
    iconBg: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    shadow: 'rgba(99,102,241,0.2)',
  },
  {
    label: 'Open',
    value: tickets.filter(t => t.status === 'Open').length,
    icon: Clock,
    iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    shadow: 'rgba(245,158,11,0.2)',
  },
  {
    label: 'In Progress',
    value: tickets.filter(t => t.status === 'In Progress').length,
    icon: Activity,
    iconBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    shadow: 'rgba(139,92,246,0.2)',
  },
  {
    label: 'Resolved',
    value: tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
    icon: CheckCircle,
    iconBg: 'linear-gradient(135deg, #10b981, #059669)',
    shadow: 'rgba(16,185,129,0.2)',
  },
];

const chartData = [
  { name: 'Mon', tickets: 4 },
  { name: 'Tue', tickets: 3 },
  { name: 'Wed', tickets: 7 },
  { name: 'Thu', tickets: 5 },
  { name: 'Fri', tickets: 8 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card" style={{ padding: '0.625rem 1rem', fontSize: '0.8125rem' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
        <p style={{ color: 'var(--primary)' }}>{payload[0].value} tickets</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets')
      .then(res => setTickets(res.data))
      .catch(err => console.error('Failed to fetch tickets', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
      </div>
    );
  }

  const stats = statCards(tickets);
  const recentTickets = tickets.slice(0, 5);

  return (
    <div style={{ paddingBottom: '3rem' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-sub">
            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.full_name}</strong>
          </p>
        </div>
        {user?.role === 'user' && (
          <Link to="/raise-ticket" className="btn-primary">
            <Plus size={16} /> New Ticket
          </Link>
        )}
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="stat-card"
            >
              <div className="stat-icon" style={{ background: s.iconBg, boxShadow: `0 6px 20px ${s.shadow}` }}>
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

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}
        className="lg:grid-cols-3">

        {/* Recent Tickets table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="card lg:col-span-2"
          style={{ overflow: 'hidden' }}
        >
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Recent Tickets
            </h2>
            <Link to="/my-tickets" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No tickets yet. Raise your first one!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {ticket.ticket_number}
                        </span>
                      </td>
                      <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {ticket.subject}
                      </td>
                      <td><span className={getStatusBadgeClass(ticket.status)}>{ticket.status}</span></td>
                      <td><span className={getPriorityBadgeClass(ticket.priority)}>{ticket.priority}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          className="card"
          style={{ padding: '1.25rem 1.5rem' }}
        >
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
            Weekly Activity
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-tertiary)', radius: 4 }} />
              <Bar dataKey="tickets" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
