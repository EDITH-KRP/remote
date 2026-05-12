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

const statusGlow = {
  Open:          'rgba(59,130,246,0.2)',
  Assigned:      'rgba(245,158,11,0.2)',
  'In Progress': 'rgba(139,92,246,0.2)',
  Resolved:      'rgba(16,185,129,0.2)',
  Closed:        'rgba(107,114,128,0.15)',
};

const StarRating = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '6px' }}>
    {[1,2,3,4,5].map(n => (
      <motion.button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.9 }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '1.6rem', lineHeight: 1, padding: 0,
          filter: n <= value ? 'drop-shadow(0 0 6px rgba(251,191,36,0.7))' : 'grayscale(1)',
          opacity: n <= value ? 1 : 0.3,
          transition: 'filter 0.2s, opacity 0.2s',
        }}
      >
        ⭐
      </motion.button>
    ))}
  </div>
);

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 5, comments: '' });
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/tickets`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then(r => { setTickets(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fetchDetail = async (id) => {
    const res = await axios.get(`${API_URL}/tickets/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    setSelected(res.data);
    setFeedbackSent(!!res.data.feedback);
  };

  const submitFeedback = async () => {
    await axios.post(`${API_URL}/tickets/${selected.id}/feedback`, feedback, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    setFeedbackSent(true);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <TicketIcon size={16} style={{ color: 'var(--p3)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--p3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            My Requests
          </span>
        </div>
        <h1 className="page-title">Support Tickets</h1>
        <p className="page-sub">
          {tickets.length > 0
            ? `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} — click any to view details`
            : 'No tickets yet'
          }
        </p>
      </motion.div>

      {/* Empty state */}
      {tickets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(10,12,22,0.8)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 'var(--r-xl)',
            padding: '5rem 2rem', textAlign: 'center',
            backdropFilter: 'blur(20px)',
          }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ fontSize: '4rem', marginBottom: '1.25rem' }}
          >
            🎫
          </motion.div>
          <p style={{ color: 'var(--text-2)', fontSize: '1rem', fontWeight: 500 }}>
            No support requests yet.
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Raise your first ticket to get help from our team.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
        >
          {tickets.map(ticket => (
            <motion.div
              key={ticket.id}
              variants={{
                hidden: { opacity: 0, x: -20 },
                show:   { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              onClick={() => fetchDetail(ticket.id)}
              style={{
                background: 'rgba(10,12,22,0.8)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 'var(--r-lg)',
                padding: '1.25rem 1.375rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '1rem',
                backdropFilter: 'blur(20px)',
                transition: 'all 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1), ${statusGlow[ticket.status] || '0 0 20px rgba(99,102,241,0.1)'} `;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Left accent */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                background: ticket.status === 'Resolved' ? 'linear-gradient(180deg, #10b981, #059669)' :
                            ticket.status === 'In Progress' ? 'linear-gradient(180deg, #8b5cf6, #7c3aed)' :
                            ticket.status === 'Open' ? 'linear-gradient(180deg, #3b82f6, #2563eb)' :
                            'rgba(107,114,128,0.5)',
                borderRadius: '0 2px 2px 0',
              }} />

              <div style={{ flex: 1, minWidth: 0, paddingLeft: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  <span className="ticket-chip">{ticket.ticket_number}</span>
                  <span className={statusBadge[ticket.status] || 'badge badge-gray'}>{ticket.status}</span>
                  <span className={priorityBadge[ticket.priority] || 'badge badge-gray'}>{ticket.priority}</span>
                </div>
                <h3 style={{
                  fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-1)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: '3px',
                }}>
                  {ticket.subject}
                </h3>
                <p style={{
                  fontSize: '0.8125rem', color: 'var(--text-3)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {ticket.description}
                </p>
              </div>

              <ChevronRight size={18} style={{ color: 'var(--text-3)', flexShrink: 0, transition: 'color 0.2s', marginRight: '-2px' }} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'relative' }}
            >
              {/* Gradient border glow */}
              <div style={{
                position: 'absolute', inset: '-1px',
                borderRadius: 'calc(var(--r-xl) + 1px)',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.3), transparent)',
                zIndex: -1, filter: 'blur(2px)',
              }} />

              <div style={{
                width: '100%', maxWidth: '560px', maxHeight: '88vh', overflowY: 'auto',
                background: 'rgba(8,11,20,0.97)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 'var(--r-xl)',
                padding: '2rem',
                backdropFilter: 'blur(32px)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(99,102,241,0.1)',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div>
                    <span className="ticket-chip" style={{ marginBottom: '6px', display: 'inline-block' }}>
                      {selected.ticket_number}
                    </span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
                      {selected.subject}
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelected(null)}
                    className="btn-icon"
                    style={{ flexShrink: 0, marginLeft: '1rem' }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <span className={statusBadge[selected.status] || 'badge badge-gray'}>{selected.status}</span>
                  <span className={priorityBadge[selected.priority] || 'badge badge-gray'}>{selected.priority}</span>
                </div>

                {/* Description */}
                <div style={{
                  background: 'rgba(99,102,241,0.04)',
                  border: '1px solid rgba(99,102,241,0.12)',
                  borderRadius: 'var(--r-md)',
                  padding: '1.125rem',
                  marginBottom: '1.5rem',
                }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>
                    {selected.description}
                  </p>
                </div>

                {/* Activity Log */}
                {selected.logs?.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                      <Clock size={13} style={{ color: 'var(--text-3)' }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Activity Log
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selected.logs.map((log, i) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          style={{
                            background: 'rgba(99,102,241,0.04)',
                            border: '1px solid rgba(99,102,241,0.1)',
                            borderRadius: 'var(--r-sm)',
                            padding: '0.625rem 0.875rem',
                            display: 'flex', gap: '10px', alignItems: 'flex-start',
                          }}
                        >
                          <MessageSquare size={13} style={{ color: 'var(--p2)', marginTop: '2px', flexShrink: 0 }} />
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
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(251,191,36,0.05)',
                      border: '1px solid rgba(251,191,36,0.2)',
                      borderRadius: 'var(--r-lg)',
                      padding: '1.375rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                      <Star size={16} style={{ color: '#fbbf24' }} />
                      <span style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: '0.9375rem' }}>
                        How was your experience?
                      </span>
                    </div>
                    <StarRating value={feedback.rating} onChange={r => setFeedback({ ...feedback, rating: r })} />
                    <textarea
                      rows={3}
                      placeholder="Any additional comments? (optional)"
                      value={feedback.comments}
                      onChange={e => setFeedback({ ...feedback, comments: e.target.value })}
                      className="input"
                      style={{ marginTop: '1rem', marginBottom: '1rem', resize: 'none' }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
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
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="alert alert-success"
                    style={{ marginTop: '1rem' }}
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
