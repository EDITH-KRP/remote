import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Loader2, Send, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('access_token');

const priorities = [
  { value: 'Low',      label: 'Low',      color: '#10b981', dot: '🟢' },
  { value: 'Medium',   label: 'Medium',   color: '#f59e0b', dot: '🟡' },
  { value: 'High',     label: 'High',     color: '#f97316', dot: '🟠' },
  { value: 'Critical', label: 'Critical', color: '#ef4444', dot: '🔴' },
];

export default function RaiseTicket({ onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'Low', category_id: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

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
      const payload = {
        subject: form.subject,
        description: form.description,
        priority: form.priority,
      };
      if (form.category_id) payload.category_id = form.category_id;

      const res = await axios.post(`${API_URL}/tickets/create`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSuccess(`Ticket ${res.data.ticket_number} submitted successfully!`);
      setForm({ subject: '', description: '', priority: 'Low', category_id: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ticket. Please try again.');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '3rem' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="section-title">Raise a Request</h1>
        <p className="section-sub">Describe your issue and our team will respond promptly.</p>
      </div>

      {/* Alerts */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="alert alert-success"
          style={{ marginBottom: '1.25rem' }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{success}</span>
        </motion.div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Subject */}
          <div>
            <label className="input-label">Subject <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              id="ticket-subject"
              type="text"
              required
              placeholder="Brief summary of the issue"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Description */}
          <div>
            <label className="input-label">Description <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea
              id="ticket-description"
              required
              rows={6}
              placeholder="Describe the problem in detail — what happened, what you expected, any error messages…"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field"
              style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* Priority & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="input-label">Priority</label>
              <select
                id="ticket-priority"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="input-field"
              >
                {priorities.map(p => (
                  <option key={p.value} value={p.value}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    {p.dot} {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Category</label>
              <select
                id="ticket-category"
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                className="input-field"
              >
                <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  — Select category
                </option>
                {categories.map(c => (
                  <option key={c.id} value={c.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority indicator pill */}
          {form.priority && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '0.375rem 0.875rem',
              borderRadius: '99px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              alignSelf: 'flex-start',
              marginTop: '-0.5rem',
            }}>
              <Tag size={13} />
              Priority set to <strong style={{ color: 'var(--text-primary)' }}>{form.priority}</strong>
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-color)' }} />

          <button
            id="ticket-submit"
            type="submit"
            disabled={loading}
            className="btn-primary btn-lg"
            style={{ alignSelf: 'flex-end', minWidth: '180px' }}
          >
            {loading
              ? <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Submitting…</>
              : <><Send size={16} /> Submit Request</>
            }
          </button>
        </form>
      </div>
    </motion.div>
  );
}
