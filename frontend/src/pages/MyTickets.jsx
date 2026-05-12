import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { X, Clock, MessageSquare, Star, ChevronRight, TicketIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('access_token');

const statusBadge = {
  Open:          'badge badge-blue',
  Assigned:      'badge badge-yellow',
  'In Progress': 'badge badge-purple',
  Resolved:      'badge badge-green',
  Closed:        'badge badge-gray',
};
const priorityBadge = {
  Low: 'badge badge-green', Medium: 'badge badge-yellow',
  High: 'badge badge-red',  Critical: 'badge badge-red',
};
const statusAccent = {
  Open:          '#3b82f6',
  Assigned:      '#f59e0b',
  'In Progress': '#8b5cf6',
  Resolved:      '#10b981',
  Closed:        'rgba(107,114,128,0.5)',
};

const StarRating = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
    {[1,2,3,4,5].map(n => (
      <motion.button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        whileHover={{ scale: 1.25 }}
        whileTap={{ scale: 0.9 }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '1.5rem', lineHeight: 1, padding: '2px',
          filter: n <= value ? 'drop-shadow(0 0 5px rgba(251,191,36,0.7))' : 'grayscale(1)',
          opacity: n <= value ? 1 : 0.25,
          transition: 'filter 0.15s, opacity 0.15s',
        }}
      >⭐</motion.button>
    ))}
  </div>
);

export default function MyTickets() {
  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [feedback, setFeedback]     = useState({ rating: 5, comments: '' });
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/tickets`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then(r => { setTickets(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fetchDetail = async (id) => {
    const r = await axios.get(`${API_URL}/tickets/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    setSelected(r.data);
    setFeedbackSent(!!r.data.feedback);
  };

  const submitFeedback = async () => {
    await axios.post(`${API_URL}/tickets/${selected.id}/feedback`, feedback, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    setFeedbackSent(true);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '55vh' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '4rem' }}>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.75rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
          <TicketIcon size={14} style={{ color: 'var(--p3)' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--p3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            My Requests
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-1)', marginBottom: '4px' }}>
          Support Tickets
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
          {tickets.length > 0
            ? `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} — click any row to view details`
            : 'No support tickets yet'}
        </p>
      </motion.div>

      {/* Empty */}
      {tickets.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(10,12,22,0.82)',
            border: '1px solid rgba(99,102,241,0.12)',
            borderRadius: 'var(--r-xl)',
            padding: '5rem 2rem', textAlign: 'center',
            backdropFilter: 'blur(20px)',
          }}
        >
          <motion.div animate={{ y: [0,-10,0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎫</motion.div>
          <p style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: '1rem' }}>No support requests yet.</p>
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginTop: '0.4rem' }}>Raise your first ticket to get help from our team.</p>
        </motion.div>
      )}

      {/* Ticket list */}
      {tickets.length > 0 && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055 } } }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {tickets.map(ticket => (
            <motion.div
              key={ticket.id}
              variants={{ hidden: { opacity: 0, x: -18 }, show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.16,1,0.3,1] } } }}
              onClick={() => fetchDetail(ticket.id)}
              style={{
                background: 'rgba(10,12,22,0.82)',
                border: '1px solid rgba(99,102,241,0.12)',
                borderRadius: 'var(--r-lg)',
                padding: '1.125rem 1.25rem 1.125rem 1.375rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '1rem',
                backdropFilter: 'blur(20px)',
                transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
                e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.12)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Left status accent */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                background: statusAccent[ticket.status] || 'rgba(107,114,128,0.4)',
                borderRadius: '0 2px 2px 0',
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Top row: chip + badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  <span className="ticket-chip">{ticket.ticket_number}</span>
                  <span className={statusBadge[ticket.status] || 'badge badge-gray'}>{ticket.status}</span>
                  <span className={priorityBadge[ticket.priority] || 'badge badge-gray'}>{ticket.priority}</span>
                </div>
                {/* Subject */}
                <h3 style={{
                  fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-1)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: '2px',
                }}>
                  {ticket.subject}
                </h3>
                {/* Description preview */}
                <p style={{
                  fontSize: '0.8125rem', color: 'var(--text-3)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {ticket.description}
                </p>
              </div>

              <ChevronRight size={17} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Detail Modal ───────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.5rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 22 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{   opacity: 0, scale: 0.94, y: 22  }}
              transition={{ duration: 0.28, ease: [0.16,1,0.3,1] }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'relative', width: '100%', maxWidth: '540px' }}
            >
              {/* Gradient border */}
              <div aria-hidden="true" style={{
                position: 'absolute', inset: '-1px',
                borderRadius: 'calc(var(--r-xl) + 1px)',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.45), rgba(139,92,246,0.3), transparent)',
                zIndex: 0,
              }} />

              <div style={{
                position: 'relative', zIndex: 1,
                maxHeight: '88vh', overflowY: 'auto',
                background: 'rgba(8,10,20,0.97)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 'var(--r-xl)',
                padding: '1.875rem',
                backdropFilter: 'blur(32px)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
              }}>

                {/* Modal header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.125rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <span className="ticket-chip" style={{ marginBottom: '6px', display: 'inline-block' }}>{selected.ticket_number}</span>
                    <h2 style={{ fontSize: '1.175rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1.3 }}>
                      {selected.subject}
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelected(null)}
                    className="btn-icon"
                    style={{ flexShrink: 0 }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>

                {/* Status + Priority */}
                <div style={{ display: 'flex', gap: '7px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <span className={statusBadge[selected.status] || 'badge badge-gray'}>{selected.status}</span>
                  <span className={priorityBadge[selected.priority] || 'badge badge-gray'}>{selected.priority}</span>
                </div>

                {/* Description box */}
                <div style={{
                  background: 'rgba(99,102,241,0.04)',
                  border: '1px solid rgba(99,102,241,0.1)',
                  borderRadius: 'var(--r-md)',
                  padding: '1rem 1.125rem',
                  marginBottom: '1.375rem',
                }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>
                    {selected.description}
                  </p>
                </div>

                {/* Activity log */}
                {selected.logs?.length > 0 && (
                  <div style={{ marginBottom: '1.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.625rem' }}>
                      <Clock size={12} style={{ color: 'var(--text-3)' }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Activity Log
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {selected.logs.map((log, i) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          style={{
                            background: 'rgba(99,102,241,0.04)',
                            border: '1px solid rgba(99,102,241,0.09)',
                            borderRadius: 'var(--r-sm)',
                            padding: '0.6rem 0.875rem',
                            display: 'flex', gap: '9px', alignItems: 'flex-start',
                          }}
                        >
                          <MessageSquare size={12} style={{ color: 'var(--p2)', marginTop: '3px', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-1)' }}>{log.action}</p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '2px' }}>
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {selected.status === 'Resolved' && !feedbackSent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(251,191,36,0.05)',
                      border: '1px solid rgba(251,191,36,0.18)',
                      borderRadius: 'var(--r-lg)',
                      padding: '1.25rem 1.375rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '0.875rem' }}>
                      <Star size={15} style={{ color: '#fbbf24' }} />
                      <span style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: '0.9375rem' }}>
                        How was your experience?
                      </span>
                    </div>
                    <StarRating value={feedback.rating} onChange={r => setFeedback({ ...feedback, rating: r })} />
                    <textarea
                      rows={3}
                      placeholder="Additional comments (optional)"
                      value={feedback.comments}
                      onChange={e => setFeedback({ ...feedback, comments: e.target.value })}
                      className="input"
                      style={{ marginTop: '0.875rem', marginBottom: '0.875rem', resize: 'none' }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={submitFeedback}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      Submit Feedback
                    </motion.button>
                  </motion.div>
                )}

                {feedbackSent && selected.status === 'Resolved' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="alert alert-success"
                    style={{ marginTop: '0.75rem' }}
                  >
                    🎉 Feedback submitted — thank you!
                  </motion.div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
