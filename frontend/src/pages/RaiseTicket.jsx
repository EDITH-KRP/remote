import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Send, Tag, AlertCircle, CheckCircle2,
  Flame, ChevronDown, FileText, AlignLeft
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('access_token');

const priorities = [
  { value: 'Low',      label: 'Low',      color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  dot: '🟢' },
  { value: 'Medium',   label: 'Medium',   color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  dot: '🟡' },
  { value: 'High',     label: 'High',     color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)',  dot: '🟠' },
  { value: 'Critical', label: 'Critical', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', dot: '🔴' },
];

export default function RaiseTicket({ onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'Low', category_id: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    axios.get(`${API_URL}/tickets/categories`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { subject: form.subject, description: form.description, priority: form.priority };
      if (form.category_id) payload.category_id = form.category_id;
      const res = await axios.post(`${API_URL}/tickets/create`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSuccess(`Ticket ${res.data.ticket_number} submitted!`);
      setForm({ subject: '', description: '', priority: 'Low', category_id: '' });
      setCharCount(0);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    }
    setLoading(false);
  };

  const currentPriority = priorities.find(p => p.value === form.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '4rem' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Flame size={16} style={{ color: '#fb923c' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Support Request
          </span>
        </div>
        <h1 className="page-title">Raise a Ticket</h1>
        <p className="page-sub">Describe your issue and we'll get back to you promptly.</p>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            className="alert alert-success"
            style={{ marginBottom: '1.5rem' }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="alert alert-error"
            style={{ marginBottom: '1.5rem' }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card */}
      <div style={{ position: 'relative' }}>
        {/* Gradient border */}
        <div style={{
          position: 'absolute', inset: '-1px',
          borderRadius: 'calc(var(--r-xl) + 1px)',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2), rgba(6,182,212,0.1))',
          zIndex: -1, filter: 'blur(1px)',
        }} />

        <div style={{
          background: 'rgba(10, 12, 22, 0.9)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 'var(--r-xl)',
          padding: '2.5rem',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* Subject */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <label className="input-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={12} /> Subject <span style={{ color: '#f87171' }}>*</span>
                </span>
              </label>
              <input
                id="ticket-subject"
                type="text"
                required
                placeholder="Brief summary of your issue…"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="input"
                style={{ fontSize: '1rem' }}
              />
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.27 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.45rem' }}>
                <label className="input-label" style={{ margin: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlignLeft size={12} /> Description <span style={{ color: '#f87171' }}>*</span>
                  </span>
                </label>
                <span style={{ fontSize: '0.72rem', color: charCount > 900 ? '#f87171' : 'var(--text-3)', fontWeight: 500 }}>
                  {charCount}/1000
                </span>
              </div>
              <textarea
                id="ticket-description"
                required
                rows={6}
                maxLength={1000}
                placeholder="Describe the problem in detail — what happened, what you expected, any error messages…"
                value={form.description}
                onChange={e => { setForm({ ...form, description: e.target.value }); setCharCount(e.target.value.length); }}
                className="input"
                style={{ resize: 'vertical', lineHeight: 1.7, minHeight: '140px' }}
              />
            </motion.div>

            {/* Priority & Category */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.34 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}
            >
              <div>
                <label className="input-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={12} /> Priority
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="ticket-priority"
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="input"
                    style={{ paddingRight: '2rem', cursor: 'pointer' }}
                  >
                    {priorities.map(p => (
                      <option key={p.value} value={p.value} style={{ background: '#0c0f1d' }}>
                        {p.dot} {p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    pointerEvents: 'none', color: 'var(--text-3)',
                  }} />
                </div>
                {/* Live priority indicator */}
                <motion.div
                  key={form.priority}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    marginTop: '8px',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '3px 10px', borderRadius: '99px',
                    background: currentPriority.bg,
                    border: `1px solid ${currentPriority.border}`,
                    color: currentPriority.color,
                    fontSize: '0.72rem', fontWeight: 700,
                  }}
                >
                  <Tag size={10} /> {currentPriority.label} Priority
                </motion.div>
              </div>

              <div>
                <label className="input-label">Category</label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="ticket-category"
                    value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                    className="input"
                    style={{ paddingRight: '2rem', cursor: 'pointer' }}
                  >
                    <option value="" style={{ background: '#0c0f1d' }}>— Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#0c0f1d' }}>{c.category_name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    pointerEvents: 'none', color: 'var(--text-3)',
                  }} />
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <hr className="sep" />

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                id="ticket-submit"
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ minWidth: '200px' }}
              >
                {loading
                  ? <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Submitting…</>
                  : <><Send size={16} /> Submit Request</>
                }
              </motion.button>
            </motion.div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
