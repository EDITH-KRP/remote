import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Loader2, X, Clock, Tag, MessageSquare, Star, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('access_token');

const statusBadge = {
  Open:         'badge badge-blue',
  Assigned:     'badge badge-yellow',
  'In Progress':'badge badge-purple',
  Resolved:     'badge badge-green',
  Closed:       'badge badge-gray',
};

const priorityBadge = {
  Low:      'badge badge-green',
  Medium:   'badge badge-yellow',
  High:     'badge badge-red',
  Critical: 'badge badge-red',
};

const StarRating = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
          fontSize: '1.5rem', lineHeight: 1,
          opacity: n <= value ? 1 : 0.25,
          filter: n <= value ? 'none' : 'grayscale(1)',
          transform: 'scale(1)',
          transition: 'transform 0.15s ease, opacity 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        ⭐
      </button>
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

  const closeModal = () => setSelected(null);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '5rem' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '3rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="section-title">My Tickets</h1>
        <p className="section-sub">{tickets.length} support request{tickets.length !== 1 ? 's' : ''}</p>
      </div>

      {/* List */}
      {tickets.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            No tickets yet. Raise your first support request!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tickets.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              onClick={() => fetchDetail(ticket.id)}
              className="card"
              style={{ padding: '1.125rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                    {ticket.ticket_number}
                  </span>
                  <span className={statusBadge[ticket.status] || 'badge badge-gray'}>{ticket.status}</span>
                  <span className={priorityBadge[ticket.priority] || 'badge badge-gray'}>{ticket.priority}</span>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ticket.subject}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ticket.description}
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              className="card"
              style={{ width: '100%', maxWidth: '540px', maxHeight: '88vh', overflowY: 'auto', padding: '1.75rem' }}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '0.4rem' }}>
                    {selected.ticket_number}
                  </span>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {selected.subject}
                  </h2>
                </div>
                <button className="btn-icon" onClick={closeModal} aria-label="Close" style={{ flexShrink: 0 }}>
                  <X size={18} />
                </button>
              </div>

              {/* Status & Priority */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <span className={statusBadge[selected.status] || 'badge badge-gray'}>{selected.status}</span>
                <span className={priorityBadge[selected.priority] || 'badge badge-gray'}>{selected.priority}</span>
              </div>

              {/* Description */}
              <div style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {selected.description}
                </p>
              </div>

              {/* Activity Log */}
              {selected.logs?.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} /> Activity Log
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selected.logs.map(log => (
                      <div key={log.id} style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.625rem 0.875rem',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start',
                      }}>
                        <MessageSquare size={14} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{log.action}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {selected.status === 'Resolved' && !feedbackSent && (
                <div style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginTop: '0.5rem',
                }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Star size={15} /> Leave Feedback
                  </h3>
                  <StarRating value={feedback.rating} onChange={r => setFeedback({ ...feedback, rating: r })} />
                  <textarea
                    rows={3}
                    placeholder="Any comments? (optional)"
                    value={feedback.comments}
                    onChange={e => setFeedback({ ...feedback, comments: e.target.value })}
                    className="input-field"
                    style={{ marginTop: '0.875rem', marginBottom: '0.875rem', resize: 'none' }}
                  />
                  <button onClick={submitFeedback} className="btn-primary" style={{ width: '100%' }}>
                    Submit Feedback
                  </button>
                </div>
              )}

              {feedbackSent && selected.status === 'Resolved' && (
                <div className="alert alert-success" style={{ marginTop: '0.75rem' }}>
                  Feedback submitted — thank you!
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
