import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Send, Tag, AlertCircle, CheckCircle2, Flame, ChevronDown, FileText, AlignLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('access_token');

const priorities = [
  { value: 'Low',      dot: '🟢', color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)'  },
  { value: 'Medium',   dot: '🟡', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
  { value: 'High',     dot: '🟠', color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)'  },
  { value: 'Critical', dot: '🔴', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
];

export default function RaiseTicket({ onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'Low', category_id: '' });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(null);
  const [error, setError]       = useState(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    axios.get(`${API_URL}/tickets/categories`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('subject', form.subject);
      formData.append('description', form.description);
      formData.append('priority', form.priority);
      if (form.category_id) formData.append('category_id', form.category_id);
      if (attachment) formData.append('attachment', attachment);

      const res = await axios.post(`${API_URL}/tickets/create`, formData, {
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess(`Ticket ${res.data.ticket_number} submitted successfully!`);
      setForm({ subject: '', description: '', priority: 'Low', category_id: '' });
      setAttachment(null);
      setCharCount(0);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    }
    setLoading(false);
  };

  const curPriority = priorities.find(p => p.value === form.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '4rem' }}
    >
      {/* Page header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
          <Flame size={14} style={{ color: '#fb923c' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Support Request
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-1)', marginBottom: '4px' }}>
          Raise a Ticket
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
          Describe your issue and our team will respond promptly.
        </p>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="alert alert-success"
            style={{ marginBottom: '1.25rem' }}
          >
            <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="alert alert-error"
            style={{ marginBottom: '1.25rem' }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card */}
      <div style={{ position: 'relative' }}>
        {/* Gradient border */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: '-1px',
          borderRadius: 'calc(var(--r-xl) + 1px)',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.22), rgba(6,182,212,0.12))',
          zIndex: 0,
        }} />

        <div style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(9,11,22,0.92)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 'var(--r-xl)',
          padding: '2rem 2.25rem 2.25rem',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.65)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Subject */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
              <label className="input-label" htmlFor="t-subject" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FileText size={11} /> Subject <span style={{ color: '#f87171', marginLeft: '1px' }}>*</span>
              </label>
              <input
                id="t-subject"
                type="text"
                required
                placeholder="Brief summary of the issue"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="input"
              />
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.19 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.4rem' }}>
                <label className="input-label" htmlFor="t-desc" style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
                  <AlignLeft size={11} /> Description <span style={{ color: '#f87171', marginLeft: '1px' }}>*</span>
                </label>
                <span style={{ fontSize: '0.72rem', color: charCount > 900 ? '#f87171' : 'var(--text-3)', fontWeight: 500 }}>
                  {charCount}/1000
                </span>
              </div>
              <textarea
                id="t-desc"
                required
                rows={6}
                maxLength={1000}
                placeholder="Describe the problem in detail — what happened, what you expected, any error messages…"
                value={form.description}
                onChange={e => { setForm({ ...form, description: e.target.value }); setCharCount(e.target.value.length); }}
                className="input"
                style={{ resize: 'vertical', lineHeight: 1.7, minHeight: '130px' }}
              />
            </motion.div>

            {/* Priority + Category row */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.26 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}
            >
              {/* Priority */}
              <div>
                <label className="input-label" htmlFor="t-priority" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Flame size={11} /> Priority
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="t-priority"
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="input"
                    style={{ paddingRight: '2rem', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    {priorities.map(p => (
                      <option key={p.value} value={p.value} style={{ background: '#0c0f1d' }}>
                        {p.dot} {p.value}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
                </div>
                {/* Animated priority pill */}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={form.priority}
                    initial={{ opacity: 0, scale: 0.88, y: 4 }}
                    animate={{ opacity: 1, scale: 1,    y: 0 }}
                    exit={{   opacity: 0, scale: 0.88, y: 4 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      marginTop: '8px',
                      padding: '3px 10px', borderRadius: '99px',
                      background: curPriority.bg,
                      border: `1px solid ${curPriority.border}`,
                      color: curPriority.color,
                      fontSize: '0.72rem', fontWeight: 700,
                    }}
                  >
                    <Tag size={10} /> {curPriority.value} Priority
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Category */}
              <div>
                <label className="input-label" htmlFor="t-category">Category</label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="t-category"
                    value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                    className="input"
                    style={{ paddingRight: '2rem', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="" style={{ background: '#0c0f1d' }}>— Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#0c0f1d' }}>{c.category_name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
                </div>
              </div>
            </motion.div>

            {/* Attachment */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FileText size={11} /> Attachment (Optional)
              </label>
              <input
                type="file"
                className="input"
                style={{ padding: '0.5rem' }}
                onChange={e => setAttachment(e.target.files[0])}
              />
            </motion.div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(99,102,241,0.1)', margin: '0 0 0.25rem' }} />

            {/* Submit — right-aligned */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                id="ticket-submit"
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ minWidth: '190px' }}
              >
                {loading
                  ? <><div className="spinner" style={{ width: '17px', height: '17px' }} /> Submitting…</>
                  : <><Send size={15} /> Submit Request</>
                }
              </motion.button>
            </motion.div>

          </form>
        </div>
      </div>
    </motion.div>
  );
}
