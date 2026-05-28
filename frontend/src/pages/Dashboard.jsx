import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Ticket, Clock, CheckCircle, Activity, Plus, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import socket from '../services/socket';

/* ── helpers ─────────────────────────────────── */
const statusBadge = {
  Open:           'badge badge-blue',
  Assigned:       'badge badge-yellow',
  'In Progress':  'badge badge-purple',
  Resolved:       'badge badge-green',
  Closed:         'badge badge-gray',
};
const priorityBadge = {
  Low: 'badge badge-green', Medium: 'badge badge-yellow',
  High: 'badge badge-red',  Critical: 'badge badge-red',
};

// Data will be fetched from API


const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(9,11,22,0.97)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: '12px',
      padding: '10px 14px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      minWidth: '130px',
    }}>
      <p style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: '0.8rem', marginBottom: '6px' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ fontSize: '0.78rem', color: p.dataKey === 'created' ? '#818cf8' : '#34d399', marginBottom: '2px' }}>
          <span style={{ opacity: 0.7 }}>{p.dataKey === 'created' ? 'Created' : 'Resolved'}:</span> {p.value}
        </p>
      ))}
    </div>
  );
};

/* ── stat config ─────────────────────────────── */
const makeStats = (tickets) => [
  {
    label: 'Total', value: tickets.length, icon: Ticket,
    gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    glow: '0 6px 24px rgba(99,102,241,0.45)', glowBg: 'rgba(99,102,241,0.1)',
    accent: 'rgba(99,102,241,0.3)',
  },
  {
    label: 'Open', value: tickets.filter(t => t.status === 'Open').length, icon: Clock,
    gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
    glow: '0 6px 24px rgba(245,158,11,0.4)',  glowBg: 'rgba(245,158,11,0.08)',
    accent: 'rgba(245,158,11,0.25)',
  },
  {
    label: 'In Progress', value: tickets.filter(t => t.status === 'In Progress').length, icon: Activity,
    gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    glow: '0 6px 24px rgba(139,92,246,0.4)',  glowBg: 'rgba(139,92,246,0.08)',
    accent: 'rgba(139,92,246,0.25)',
  },
  {
    label: 'Resolved', value: tickets.filter(t => ['Resolved','Closed'].includes(t.status)).length, icon: CheckCircle,
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    glow: '0 6px 24px rgba(16,185,129,0.4)',  glowBg: 'rgba(16,185,129,0.08)',
    accent: 'rgba(16,185,129,0.25)',
  },
];

/* ── StatCard ────────────────────────────────── */
const StatCard = ({ s }) => {
  const Icon = s.icon;
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 20px 40px rgba(0,0,0,0.5),${s.glow}`, borderColor: s.accent }}
      style={{
        background: 'rgba(10,12,22,0.82)',
        border: '1px solid rgba(99,102,241,0.12)',
        borderRadius: 'var(--r-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Corner radial glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '80px', height: '80px',
        background: `radial-gradient(circle at top right, ${s.glowBg} 0%, transparent 70%)`,
        borderRadius: '50%', transform: 'translate(30%,-30%)',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: 6 }}
        style={{
          width: '48px', height: '48px', flexShrink: 0,
          borderRadius: 'var(--r-md)',
          background: s.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: s.glow,
        }}
      >
        <Icon size={20} color="#fff" />
      </motion.div>

      {/* Text */}
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--text-1)' }}>
          {s.value}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', fontWeight: 500, marginTop: '3px', whiteSpace: 'nowrap' }}>
          {s.label}
        </p>
      </div>
    </motion.div>
  );
};

/* ── Dashboard ───────────────────────────────── */
const Dashboard = () => {
  const { user }   = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([
      api.get('/tickets'),
      api.get('/tickets/activity?range=7')
    ]).then(([tRes, aRes]) => {
      setTickets(tRes.data);
      setActivityData(aRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    socket.on('tickets:update', loadData);
    return () => {
      socket.off('tickets:update', loadData);
    };
  }, []);

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:'1rem' }}>
      <div style={{ position:'relative' }}>
        <div className="spinner" style={{ width:'44px', height:'44px', borderWidth:'3px' }} />
        <div style={{ position:'absolute', inset:'-8px', borderRadius:'50%', border:'1px solid rgba(99,102,241,0.15)', animation:'spin-slow 3s linear infinite reverse' }} />
      </div>
      <p style={{ color:'var(--text-2)', fontSize:'0.875rem' }}>Loading dashboard…</p>
    </div>
  );

  const stats = makeStats(tickets);

  return (
    <div style={{ paddingBottom: '3rem' }}>

      {/* ── Page header ─────────────────────────── */}
      <motion.div
        initial={{ opacity:0, y:-14 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.35 }}
        style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'1.75rem', gap:'1rem', flexWrap:'wrap' }}
      >
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'4px' }}>
            <TrendingUp size={14} style={{ color:'var(--p3)' }} />
            <span style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--p3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
              Overview
            </span>
          </div>
          <h1 style={{
            fontSize:'1.75rem', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1.2,
            color:'var(--text-1)', marginBottom:'4px',
          }}>
            Dashboard
          </h1>
          <p style={{ fontSize:'0.875rem', color:'var(--text-2)' }}>
            Welcome back,{' '}
            <span style={{ fontWeight:700, background:'linear-gradient(135deg,#a78bfa,#6366f1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              {user?.full_name?.split(' ')[0]}
            </span>
          </p>
        </div>

        {user?.role === 'user' && (
          <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
            <Link to="/raise-ticket" className="btn btn-primary">
              <Plus size={15} /> New Ticket
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* ── Stat cards ──────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.07 } } }}
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem', marginBottom:'1.75rem' }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={i}
            variants={{ hidden:{ opacity:0,y:18 }, show:{ opacity:1,y:0, transition:{ duration:0.35, ease:[0.16,1,0.3,1] } } }}
          >
            <StatCard s={s} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main grid: table + chart ─────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1.25rem' }} className="lg:grid-cols-dash">

        {/* Recent tickets */}
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.3, duration:0.35 }}
          style={{
            background:'rgba(10,12,22,0.82)',
            border:'1px solid rgba(99,102,241,0.12)',
            borderRadius:'var(--r-lg)',
            backdropFilter:'blur(20px)',
            overflow:'hidden',
            gridColumn: 'span 2',
          }}
        >
          {/* Table header */}
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'1.1rem 1.5rem',
            borderBottom:'1px solid rgba(99,102,241,0.09)',
            background:'rgba(99,102,241,0.03)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#a78bfa)', boxShadow:'0 0 8px rgba(99,102,241,0.8)' }} />
              <span style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--text-1)', letterSpacing:'-0.01em' }}>
                Recent Tickets
              </span>
            </div>
            <Link to="/my-tickets" style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'0.8rem', fontWeight:600, color:'var(--p3)', textDecoration:'none' }}
              onMouseEnter={e => e.currentTarget.style.color='var(--p1)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--p3)'}
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {tickets.length === 0 ? (
            <div style={{ padding:'3.5rem', textAlign:'center' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🎫</div>
              <p style={{ color:'var(--text-2)', fontSize:'0.875rem' }}>No tickets yet.</p>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft:'1.5rem' }}>Ticket</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th style={{ paddingRight:'1.5rem' }}>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.slice(0, 6).map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity:0 }}
                      animate={{ opacity:1 }}
                      transition={{ delay:0.35 + i*0.04 }}
                    >
                      <td style={{ paddingLeft:'1.5rem' }}>
                        <span className="ticket-chip">{t.ticket_number}</span>
                      </td>
                      <td style={{ maxWidth:'260px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text-2)' }}>
                        {t.subject}
                      </td>
                      <td><span className={statusBadge[t.status] || 'badge badge-gray'}>{t.status}</span></td>
                      <td style={{ paddingRight:'1.5rem' }}>
                        <span className={priorityBadge[t.priority] || 'badge badge-gray'}>{t.priority}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.38, duration:0.35 }}
          style={{
            background:'rgba(10,12,22,0.82)',
            border:'1px solid rgba(99,102,241,0.12)',
            borderRadius:'var(--r-lg)',
            backdropFilter:'blur(20px)',
            padding:'1.25rem 1.5rem 1rem',
            gridColumn: 'span 1',
          }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'1.25rem' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'linear-gradient(135deg,#34d399,#10b981)', boxShadow:'0 0 8px rgba(52,211,153,0.8)' }} />
            <span style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--text-1)', letterSpacing:'-0.01em' }}>
              Weekly Activity
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="gCreated"  x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(99,102,241,0.07)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill:'var(--text-3)', fontSize:11 }} dy={4} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill:'var(--text-3)', fontSize:11 }} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="created"  stroke="#6366f1" strokeWidth={2} fill="url(#gCreated)"  dot={{ fill:'#6366f1', r:3, strokeWidth:0 }} activeDot={{ r:5 }} />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fill="url(#gResolved)" dot={{ fill:'#10b981', r:3, strokeWidth:0 }} activeDot={{ r:5 }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={{ display:'flex', gap:'1.25rem', justifyContent:'center', marginTop:'8px' }}>
            {[{ c:'#6366f1', l:'Created' }, { c:'#10b981', l:'Resolved' }].map(({ c, l }) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.75rem', color:'var(--text-2)' }}>
                <div style={{ width:'10px', height:'3px', borderRadius:'99px', background:c }} />
                {l}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
