import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Send, Tag, AlertCircle, CheckCircle2, Flame, ChevronDown, FileText, AlignLeft, User, Briefcase, Mail, Clock } from 'lucide-react';

const priorityMatrix = {
  'High-High': 'Critical', 'High-Medium': 'High', 'High-Low': 'Medium',
  'Medium-High': 'High', 'Medium-Medium': 'Medium', 'Medium-Low': 'Low',
  'Low-High': 'Medium', 'Low-Medium': 'Low', 'Low-Low': 'Low'
};

const priorities = [
  { value: 'Low',      dot: '🟢', color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)'  },
  { value: 'Medium',   dot: '🟡', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
  { value: 'High',     dot: '🟠', color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)'  },
  { value: 'Critical', dot: '🔴', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
];

export default function RaiseTicket({ onSuccess }) {
  const { user } = React.useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [form, setForm] = useState({ 
    ticket_type: 'Incident',
    subject: '', 
    short_description: '',
    description: '', 
    note: '',
    category_id: '',
    sub_category_id: '',
    state: 'New',
    impact: 'Low',
    urgency: 'Low'
  });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(null);
  const [error, setError]       = useState(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    api.get('/tickets/categories')
      .then(r => setCategories(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (form.category_id) {
      api.get(`/tickets/sub-categories?category_id=${form.category_id}`)
        .then(r => setSubCategories(r.data))
        .catch(() => {});
    } else {
      setSubCategories([]);
    }
  }, [form.category_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('ticket_type', form.ticket_type);
      formData.append('subject', form.subject);
      formData.append('short_description', form.short_description);
      formData.append('description', form.description);
      formData.append('note', form.note);
      formData.append('state', form.state);
      formData.append('impact', form.impact);
      formData.append('urgency', form.urgency);
      if (form.category_id) formData.append('category_id', form.category_id);
      if (form.sub_category_id) formData.append('sub_category_id', form.sub_category_id);
      if (attachment) formData.append('attachment', attachment);

      const res = await api.post('/tickets/create', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess(`Ticket ${res.data.ticket_number} submitted successfully!`);
      setForm({ 
        ticket_type: 'Incident', subject: '', short_description: '', 
        description: '', note: '', category_id: '', sub_category_id: '', 
        state: 'New', impact: 'Low', urgency: 'Low' 
      });
      setAttachment(null);
      setCharCount(0);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    }
    setLoading(false);
  };

  const curPriorityValue = priorityMatrix[`${form.impact}-${form.urgency}`] || 'Low';
  const curPriority = priorities.find(p => p.value === curPriorityValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '4rem' }}
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
            {/* ── Corporate User Info Box (Two Columns) ── */}
            <div style={{
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(53,122,112,0.18)',
              borderRadius: 'var(--r-sm)',
              padding: '1.25rem',
              marginBottom: '0.5rem',
            }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                Caller Identification & Information
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {/* Left Column: Caller, Email, Employee ID, Alternate Contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label className="input-label" htmlFor="t-caller">Caller (Name)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="t-caller"
                        type="text"
                        readOnly
                        className="input"
                        value={user?.full_name || ''}
                        style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-2)', cursor: 'not-allowed', fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label" htmlFor="t-email">Email ID</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="t-email"
                        type="text"
                        readOnly
                        className="input"
                        value={user?.email || ''}
                        style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-2)', cursor: 'not-allowed', fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label" htmlFor="t-empid">Employee ID</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="t-empid"
                        type="text"
                        readOnly
                        className="input"
                        value={user?.employee_id || '—'}
                        style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-2)', cursor: 'not-allowed', fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label" htmlFor="t-altcontact">Alternate Contact Number</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="t-altcontact"
                        type="text"
                        readOnly
                        className="input"
                        value={user?.phone || '—'}
                        style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-2)', cursor: 'not-allowed', fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label className="input-label" htmlFor="t-opened">Opened Date</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="t-opened"
                        type="text"
                        readOnly
                        className="input"
                        value={new Date().toLocaleString()}
                        style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-2)', cursor: 'not-allowed', fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── State Selector (Above Grids) ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <label className="input-label" htmlFor="t-state">Incident State</label>
              <div style={{ position: 'relative' }}>
                <select
                  id="t-state"
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  className="input"
                  style={{ paddingRight: '2rem', cursor: 'pointer', fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
                >
                  <option value="New" style={{ background: '#0c0f1d' }}>New</option>
                  <option value="In Progress" style={{ background: '#0c0f1d' }}>In Progress</option>
                  <option value="On Hold" style={{ background: '#0c0f1d' }}>On Hold</option>
                  <option value="Resolved" style={{ background: '#0c0f1d' }}>Resolved</option>
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
              </div>
            </motion.div>

            {/* ── ITIL Detail Information (Two Columns Grid) ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
            >
              {/* Left Column: Categories and Sub Categories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="input-label" htmlFor="t-category">Category</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="t-category"
                      value={form.category_id}
                      onChange={e => setForm({ ...form, category_id: e.target.value, sub_category_id: '' })}
                      className="input"
                      style={{ paddingRight: '2rem', cursor: 'pointer', fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
                    >
                      <option value="" style={{ background: '#0c0f1d' }}>— Select category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id} style={{ background: '#0c0f1d' }}>{c.category_name}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
                  </div>
                </div>
                <div>
                  <label className="input-label" htmlFor="t-sub-category">Sub Category</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="t-sub-category"
                      value={form.sub_category_id}
                      onChange={e => setForm({ ...form, sub_category_id: e.target.value })}
                      className="input"
                      style={{ paddingRight: '2rem', cursor: 'pointer', fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
                      disabled={!form.category_id}
                    >
                      <option value="" style={{ background: '#0c0f1d' }}>— Select sub-category</option>
                      {subCategories.map(sc => (
                        <option key={sc.id} value={sc.id} style={{ background: '#0c0f1d' }}>{sc.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
                  </div>
                </div>
              </div>

              {/* Right Column: Priority, Impact, Urgency */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="input-label">Calculated Priority</label>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={curPriorityValue}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className="input"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        color: 'var(--text-2)',
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.825rem',
                        padding: '0.5rem 0.85rem'
                      }}
                    >
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: curPriority.bg,
                        border: `1px solid ${curPriority.border}`,
                        color: curPriority.color,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>
                        <Tag size={12} /> {curPriority.value} Priority
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div>
                  <label className="input-label" htmlFor="t-impact">Impact</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="t-impact"
                      value={form.impact}
                      onChange={e => setForm({ ...form, impact: e.target.value })}
                      className="input"
                      style={{ paddingRight: '2rem', cursor: 'pointer', fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
                    >
                      <option value="Low" style={{ background: '#0c0f1d' }}>Low</option>
                      <option value="Medium" style={{ background: '#0c0f1d' }}>Medium</option>
                      <option value="High" style={{ background: '#0c0f1d' }}>High</option>
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
                  </div>
                </div>
                <div>
                  <label className="input-label" htmlFor="t-urgency">Urgency</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="t-urgency"
                      value={form.urgency}
                      onChange={e => setForm({ ...form, urgency: e.target.value })}
                      className="input"
                      style={{ paddingRight: '2rem', cursor: 'pointer', fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
                    >
                      <option value="Low" style={{ background: '#0c0f1d' }}>Low</option>
                      <option value="Medium" style={{ background: '#0c0f1d' }}>Medium</option>
                      <option value="High" style={{ background: '#0c0f1d' }}>High</option>
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Ticket Type (Select) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.3 }}
            >
              <label className="input-label" htmlFor="t-type">Ticket Type</label>
              <div style={{ position: 'relative' }}>
                <select
                  id="t-type"
                  value={form.ticket_type}
                  onChange={e => setForm({ ...form, ticket_type: e.target.value })}
                  className="input"
                  style={{ paddingRight: '2rem', cursor: 'pointer', fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
                >
                  <option value="Incident" style={{ background: '#0c0f1d' }}>Incident</option>
                  <option value="Request" style={{ background: '#0c0f1d' }}>Request</option>
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
              </div>
            </motion.div>

            {/* Subject */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.3 }}
            >
              <label className="input-label" htmlFor="t-subject" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FileText size={11} /> Subject <span style={{ color: '#f87171', marginLeft: '1px' }}>*</span>
              </label>
              <input
                id="t-subject"
                type="text"
                required
                placeholder="Brief summary"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="input"
                style={{ fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
              />
            </motion.div>

            {/* Short Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <label className="input-label" htmlFor="t-sdesc">Short Description</label>
              <input
                id="t-sdesc"
                type="text"
                placeholder="One sentence summary"
                value={form.short_description}
                onChange={e => setForm({ ...form, short_description: e.target.value })}
                className="input"
                style={{ fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
              />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
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
                rows={4}
                maxLength={1000}
                placeholder="Describe the problem in detail — what happened, what you expected, any error messages…"
                value={form.description}
                onChange={e => { setForm({ ...form, description: e.target.value }); setCharCount(e.target.value.length); }}
                className="input"
                style={{ resize: 'vertical', lineHeight: 1.7, minHeight: '100px', fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
              />
            </motion.div>

            {/* Note */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <label className="input-label" htmlFor="t-note">Additional Note (Optional)</label>
              <textarea
                id="t-note"
                rows={2}
                placeholder="Any extra context or troubleshooting already done..."
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                className="input"
                style={{ resize: 'vertical', minHeight: '60px', fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
              />
            </motion.div>

            {/* Attachment */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            >
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FileText size={11} /> Attachment (Optional)
              </label>
              <input
                type="file"
                className="input"
                style={{ padding: '0.5rem', fontSize: '0.825rem' }}
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
