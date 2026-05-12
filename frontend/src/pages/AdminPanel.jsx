import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('access_token');

const statusColors = {
  'Open': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'Assigned': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  'In Progress': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  'Resolved': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  'Closed': 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
};

export default function AdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tickets');

  const load = async () => {
    setLoading(true);
    const [tRes, uRes, rRes] = await Promise.all([
      axios.get(`${API_URL}/tickets`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      axios.get(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      axios.get(`${API_URL}/admin/reports`, { headers: { Authorization: `Bearer ${getToken()}` } }),
    ]);
    setTickets(tRes.data);
    setUsers(uRes.data);
    setReports(rRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (ticketId, status) => {
    await axios.put(`${API_URL}/tickets/${ticketId}`, { status }, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    load();
  };

  const assignStaff = async (ticketId, staffId) => {
    if (!staffId) return;
    await axios.post(`${API_URL}/admin/assign-ticket`, { ticket_id: ticketId, staff_id: staffId }, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    load();
  };

  const deleteTicket = async (ticketId) => {
    if (!window.confirm('Delete this ticket?')) return;
    await axios.delete(`${API_URL}/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    load();
  };

  const supportStaff = users.filter(u => u.role === 'support' || u.role === 'admin');

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-6">Admin Panel</h2>

      {/* Stats */}
      {reports && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Tickets', value: reports.total_tickets, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Open', value: reports.open_tickets, color: 'text-yellow-600 dark:text-yellow-400' },
            { label: 'Resolved', value: reports.resolved_tickets, color: 'text-green-600 dark:text-green-400' },
          ].map(s => (
            <div key={s.label} className="glass-card p-6 flex flex-col justify-between items-start">
              <p className="text-[var(--text-secondary)] text-sm font-medium">{s.label}</p>
              <p className={`text-4xl font-bold mt-2 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--border-color)] pb-4">
        {['tickets', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-[var(--text-primary)] text-[var(--bg-color)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}>
            {t === 'tickets' ? '🎫 All Tickets' : '👥 All Users'}
          </button>
        ))}
      </div>

      {tab === 'tickets' && (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <motion.div key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-card p-5 hover:bg-[var(--bg-secondary)] transition-colors">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[250px]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[var(--accent)] text-xs font-mono font-medium">{ticket.ticket_number}</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusColors[ticket.status] || statusColors['Open']}`}>{ticket.status}</span>
                    <span className="text-xs text-[var(--text-secondary)]">by <span className="font-medium text-[var(--text-primary)]">{ticket.author_name || 'Unknown'}</span></span>
                  </div>
                  <h3 className="text-[var(--text-primary)] font-semibold mb-1">{ticket.subject}</h3>
                  <p className="text-[var(--text-secondary)] text-sm line-clamp-2">{ticket.description}</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Assign Staff */}
                  <select
                    defaultValue=""
                    onChange={e => assignStaff(ticket.id, e.target.value)}
                    className="input-field !w-auto !py-1.5 !px-3 text-sm"
                  >
                    <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Assign staff...</option>
                    {supportStaff.map(u => (
                      <option key={u.id} value={u.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{u.full_name}</option>
                    ))}
                  </select>

                  {/* Update Status */}
                  <select
                    value={ticket.status}
                    onChange={e => updateStatus(ticket.id, e.target.value)}
                    className="input-field !w-auto !py-1.5 !px-3 text-sm"
                  >
                    <option className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Open</option>
                    <option className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Assigned</option>
                    <option className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">In Progress</option>
                    <option className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Resolved</option>
                    <option className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Closed</option>
                  </select>

                  {/* Delete */}
                  <button onClick={() => deleteTicket(ticket.id)}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    title="Delete Ticket"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {tickets.length === 0 && (
            <div className="text-center py-12 text-[var(--text-secondary)]">No tickets found.</div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <tr className="text-[var(--text-secondary)]">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{user.full_name}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                        user.role === 'admin' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' :
                        user.role === 'support' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{user.phone || '—'}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-[var(--text-secondary)]">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
