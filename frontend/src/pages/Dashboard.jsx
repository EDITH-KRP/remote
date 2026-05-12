import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Ticket, Clock, CheckCircle, Activity, Plus, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusBadge = {
  Open:          'badge badge-blue',
  Assigned:      'badge badge-yellow',
  'In Progress': 'badge badge-purple',
  Resolved:      'badge badge-green',
  Closed:        'badge badge-gray',
};

const priorityBadge = {
  Low:      'badge badge-green',
  Medium:   'badge badge-yellow',
  High:     'badge badge-red',
  Critical: 'badge badge-red',
};

const chartData = [
  { name: 'Mon', tickets: 4, resolved: 2 },
  { name: 'Tue', tickets: 7, resolved: 5 },
  { name: 'Wed', tickets: 3, resolved: 3 },
  { name: 'Thu', tickets: 9, resolved: 6 },
  { name: 'Fri', tickets: 6, resolved: 4 },
  { name: 'Sat', tickets: 2, resolved: 2 },
  { name: 'Sun', tickets: 5, resolved: 3 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,12,22,0.95)',
      border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: '12px',
      padding: '10px 14px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <p style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: '6px', fontSize: '0.8125rem' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontSize: '0.8rem', color: p.name === 'tickets' ? '#818cf8' : '#34d399' }}>
          {p.name === 'tickets' ? '📋' : '✅'} {p.value} {p.name}
        </p>
      ))}
    </div>
  );
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const StatCard = ({ stat, index }) => {
  const Icon = stat.icon;
  return (
    <motion.div
      variants={itemVariants}
      className="shine"
      style={{
        background: 'rgba(12, 15, 29, 0.8)',
        border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: 'var(--r-lg)',
        padding: '1.375rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        backdropFilter: 'blur(20px)',
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
      whileHover={{
        y: -4,
        boxShadow: `0 20px 40px rgba(0,0,0,0.5), ${stat.glow}`,
        borderColor: stat.borderColor,
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '100px', height: '100px',
        background: `radial-gradient(circle at top right, ${stat.glowBg} 0%, transparent 70%)`,
        borderRadius: '50%', transform: 'translate(30%, -30%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        whileHover={{ scale: 1.1, rotate: 8 }}
        style={{
          width: '50px', height: '50px', borderRadius: 'var(--r-md)',
          background: stat.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: stat.glow, flexShrink: 0,
        }}
      >
        <Icon size={22} color="#fff" />
      </motion.div>

      <div style={{ position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          style={{ fontSize: '2.125rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--text-1)' }}
        >
          {stat.value}
        </motion.div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', fontWeight: 500, marginTop: '3px' }}>
          {stat.label}
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets')
      .then(res => setTickets(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '3px' }} />
          <div style={{
            position: 'absolute', inset: '-8px', borderRadius: '50%',
            border: '1px solid rgba(99,102,241,0.2)',
            animation: 'spin-slow 3s linear infinite reverse',
          }} />
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Loading your dashboard…</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Tickets', value: tickets.length, icon: Ticket,
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      glow: '0 8px 24px rgba(99,102,241,0.5)',
      glowBg: 'rgba(99,102,241,0.15)',
      borderColor: 'rgba(99,102,241,0.4)',
    },
    {
      label: 'Open', value: tickets.filter(t => t.status === 'Open').length, icon: Clock,
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      glow: '0 8px 24px rgba(245,158,11,0.5)',
      glowBg: 'rgba(245,158,11,0.12)',
      borderColor: 'rgba(245,158,11,0.3)',
    },
    {
      label: 'In Progress', value: tickets.filter(t => t.status === 'In Progress').length, icon: Activity,
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      glow: '0 8px 24px rgba(139,92,246,0.5)',
      glowBg: 'rgba(139,92,246,0.12)',
      borderColor: 'rgba(139,92,246,0.3)',
    },
    {
      label: 'Resolved', value: tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length, icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      glow: '0 8px 24px rgba(16,185,129,0.5)',
      glowBg: 'rgba(16,185,129,0.12)',
      borderColor: 'rgba(16,185,129,0.3)',
    },
  ];

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.25rem', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <TrendingUp size={18} style={{ color: 'var(--p3)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--p3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Overview
            </span>
          </div>
          <h1 className="page-title">
            Good morning,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {user?.full_name?.split(' ')[0]} 👋
            </span>
          </h1>
          <p className="page-sub">Here's what's happening with your support tickets today.</p>
        </div>

        {user?.role === 'user' && (
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link to="/raise-ticket" className="btn btn-primary">
              <Plus size={16} /> New Ticket
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid-stats"
        style={{ marginBottom: '2rem' }}
      >
        {stats.map((stat, i) => <StatCard key={i} stat={stat} index={i} />)}
      </motion.div>

      {/* Charts + Table */}
      <div className="grid-main">
        {/* Tickets table */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          style={{
            background: 'rgba(10, 12, 22, 0.8)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 'var(--r-lg)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(99,102,241,0.1)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(99,102,241,0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', boxShadow: '0 0 8px rgba(99,102,241,0.8)' }} />
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                Recent Tickets
              </h2>
            </div>
            <Link to="/my-tickets" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--p3)', textDecoration: 'none' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {tickets.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>No tickets yet.</p>
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
                  {tickets.slice(0, 6).map((ticket, i) => (
                    <motion.tr
                      key={ticket.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                    >
                      <td><span className="ticket-chip">{ticket.ticket_number}</span></td>
                      <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-2)' }}>
                        {ticket.subject}
                      </td>
                      <td><span className={statusBadge[ticket.status] || 'badge badge-gray'}>{ticket.status}</span></td>
                      <td><span className={priorityBadge[ticket.priority] || 'badge badge-gray'}>{ticket.priority}</span></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          style={{
            background: 'rgba(10, 12, 22, 0.8)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 'var(--r-lg)',
            backdropFilter: 'blur(20px)',
            padding: '1.25rem 1.5rem',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg, #34d399, #10b981)', boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
              Weekly Activity
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(99,102,241,0.08)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="tickets"  stroke="#6366f1" strokeWidth={2} fill="url(#gradTickets)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }} />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fill="url(#gradResolved)" dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '8px' }}>
            {[{ color: '#6366f1', label: 'Tickets' }, { color: '#10b981', label: 'Resolved' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                <div style={{ width: '10px', height: '3px', borderRadius: '99px', background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
