import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('access_token');

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
    setLoading(true); setError(null);
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
      setSuccess(`Ticket ${res.data.ticket_number} created! Check your email for confirmation.`);
      setForm({ subject: '', description: '', priority: 'Low', category_id: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto pb-12">
      <div className="glass-card p-8 sm:p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-2">Raise a Support Request</h2>
          <p className="text-[var(--text-secondary)] text-sm">Describe your issue and our team will get back to you shortly.</p>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[var(--text-primary)] text-sm font-medium mb-1.5">Subject <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="Brief description of the issue"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-[var(--text-primary)] text-sm font-medium mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea
              required
              rows={5}
              placeholder="Describe your issue in detail..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field resize-none py-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[var(--text-primary)] text-sm font-medium mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="input-field"
              >
                <option value="Low" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">🟢 Low</option>
                <option value="Medium" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">🟡 Medium</option>
                <option value="High" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">🔴 High</option>
                <option value="Critical" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">🚨 Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-primary)] text-sm font-medium mb-1.5">Category</label>
              <select
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                className="input-field"
              >
                <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{c.category_name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-4"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Submit Request'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
