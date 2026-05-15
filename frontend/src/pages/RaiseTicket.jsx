import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Send, Tag, AlertCircle, CheckCircle2, Flame, ChevronDown, FileText, AlignLeft, User, Briefcase, Mail, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('access_token');

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
    impact: 'Low',
    urgency: 'Low'
  });
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

  useEffect(() => {
    if (form.category_id) {
      axios.get(`${API_URL}/tickets/sub-categories?category_id=${form.category_id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      }).then(r => setSubCategories(r.data)).catch(() => {});
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
      formData.append('impact', form.impact);
      formData.append('urgency', form.urgency);
      if (form.category_id) formData.append('category_id', form.category_id);
      if (form.sub_category_id) formData.append('sub_category_id', form.sub_category_id);
      if (attachment) formData.append('attachment', attachment);

      const res = await axios.post(`${API_URL}/tickets/create`, formData, {
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess(`Ticket ${res.data.ticket_number} submitted successfully!`);
      setForm({ 
        ticket_type: 'Incident', subject: '', short_description: '', 
        description: '', note: '', category_id: '', sub_category_id: '', 
        impact: 'Low', urgency: 'Low' 
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

            {/* Profile Autofill Readonly */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="input-label"><User size={11} style={{display:'inline'}}/> Name</label>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-1)', fontWeight: 500 }}>{user?.full_name}</div>
              </div>
              <div>
                <label className="input-label"><Briefcase size={11} style={{display:'inline'}}/> Employee ID</label>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>{user?.employee_id || '—'}</div>
              </div>
              <div>
                <label className="input-label"><Mail size={11} style={{display:'inline'}}/> Email</label>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>{user?.email}</div>
              </div>
              <div>
                <label className="input-label"><Mail size={11} style={{display:'inline'}}/> Alternate Email</label>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>{user?.alternate_email || '—'}</div>
              </div>
              <div>
                <label className="input-label"><Clock size={11} style={{display:'inline'}}/> Date & Time</label>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>{new Date().toLocaleString()}</div>
              </div>
            </div>

            {/* Ticket Type */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <label className="input-label">Ticket Type</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-1)', cursor: 'pointer' }}>
                  <input type="radio" name="ticket_type" value="Incident" checked={form.ticket_type === 'Incident'} onChange={e => setForm({...form, ticket_type: e.target.value})} /> Incident
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-1)', cursor: 'pointer' }}>
                  <input type="radio" name="ticket_type" value="Request" checked={form.ticket_type === 'Request'} onChange={e => setForm({...form, ticket_type: e.target.value})} /> Request
                </label>
              </div>
            </motion.div>

            {/* Subject and Short Description */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label" htmlFor="t-subject" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FileText size={11} /> Subject <span style={{ color: '#f87171', marginLeft: '1px' }}>*</span>
                </label>
                <input id="t-subject" type="text" required placeholder="Brief summary" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="input" />
              </div>
              <div>
                <label className="input-label" htmlFor="t-sdesc">Short Description</label>
                <input id="t-sdesc" type="text" placeholder="One sentence summary" value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} className="input" />
              </div>
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
                rows={4}
                maxLength={1000}
                placeholder="Describe the problem in detail — what happened, what you expected, any error messages…"
                value={form.description}
                onChange={e => { setForm({ ...form, description: e.target.value }); setCharCount(e.target.value.length); }}
                className="input"
                style={{ resize: 'vertical', lineHeight: 1.7, minHeight: '100px' }}
              />
            </motion.div>

            {/* Note */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 }}>
              <label className="input-label" htmlFor="t-note">Additional Note (Optional)</label>
              <textarea
                id="t-note"
                rows={2}
                placeholder="Any extra context or troubleshooting already done..."
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                className="input"
                style={{ resize: 'vertical', minHeight: '60px' }}
              />
            </motion.div>

            {/* Categories & Urgency/Impact row */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.26 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}
            >
              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="input-label" htmlFor="t-category">Category</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="t-category"
                      value={form.category_id}
                      onChange={e => setForm({ ...form, category_id: e.target.value, sub_category_id: '' })}
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

                <div>
                  <label className="input-label" htmlFor="t-sub-category">Sub Category</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="t-sub-category"
                      value={form.sub_category_id}
                      onChange={e => setForm({ ...form, sub_category_id: e.target.value })}
                      className="input"
                      style={{ paddingRight: '2rem', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
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

              {/* Impact / Urgency */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="input-label" htmlFor="t-impact">Impact</label>
                    <div style={{ position: 'relative' }}>
                      <select id="t-impact" value={form.impact} onChange={e => setForm({...form, impact: e.target.value})} className="input" style={{ paddingRight: '2rem', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
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
                      <select id="t-urgency" value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})} className="input" style={{ paddingRight: '2rem', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
                        <option value="Low" style={{ background: '#0c0f1d' }}>Low</option>
                        <option value="Medium" style={{ background: '#0c0f1d' }}>Medium</option>
                        <option value="High" style={{ background: '#0c0f1d' }}>High</option>
                      </select>
                      <ChevronDown size={13} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="input-label">Auto-Priority</label>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={curPriorityValue}
                      initial={{ opacity: 0, scale: 0.88, y: 4 }}
                      animate={{ opacity: 1, scale: 1,    y: 0 }}
                      exit={{   opacity: 0, scale: 0.88, y: 4 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px', borderRadius: '99px',
                        background: curPriority.bg,
                        border: `1px solid ${curPriority.border}`,
                        color: curPriority.color,
                        fontSize: '0.8rem', fontWeight: 700,
                      }}
                    >
                      <Tag size={12} /> {curPriority.value} Priority
                    </motion.span>
                  </AnimatePresence>
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
