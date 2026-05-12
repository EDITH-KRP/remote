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

const priorityColors = {
  'Low': 'text-green-500 dark:text-green-400',
  'Medium': 'text-yellow-500 dark:text-yellow-400',
  'High': 'text-orange-500 dark:text-orange-400',
  'Critical': 'text-red-500 dark:text-red-400',
};

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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-6">My Support Tickets</h2>

      {tickets.length === 0 ? (
        <div className="glass-card p-12 text-center text-[var(--text-secondary)]">
          <p className="text-5xl mb-4">🎫</p>
          <p className="text-lg">No tickets yet. Raise your first support request!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => fetchDetail(ticket.id)}
              className="glass-card p-5 cursor-pointer hover:bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[var(--accent)] text-sm font-mono font-medium">{ticket.ticket_number}</span>
                  <h3 className="text-[var(--text-primary)] font-semibold mt-1">{ticket.subject}</h3>
                  <p className="text-[var(--text-secondary)] text-sm mt-1 line-clamp-1">{ticket.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusColors[ticket.status] || statusColors['Open']}`}>
                    {ticket.status}
                  </span>
                  <span className={`text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                    ● {ticket.priority}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card p-6 md:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[var(--accent)] font-mono text-sm font-medium mb-1">{selected.ticket_number}</p>
                <h3 className="text-[var(--text-primary)] text-xl font-bold">{selected.subject}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-md hover:bg-[var(--bg-secondary)]">
                ✕
              </button>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 mb-6">
              <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">{selected.description}</p>
            </div>

            <div className="flex gap-3 mb-6">
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusColors[selected.status] || statusColors['Open']}`}>{selected.status}</span>
              <span className={`text-xs font-semibold self-center ${priorityColors[selected.priority]}`}>● {selected.priority}</span>
            </div>

            {/* Logs */}
            {selected.logs?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-[var(--text-primary)] font-semibold mb-3 text-sm">Activity Log</h4>
                <div className="space-y-2">
                  {selected.logs.map(log => (
                    <div key={log.id} className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 flex items-start gap-2">
                      <span>📋</span>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{log.action}</p>
                        <p className="mt-0.5 opacity-70">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {selected.status === 'Resolved' && !feedbackSent && (
              <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-lg p-5 mt-6">
                <h4 className="text-[var(--text-primary)] font-semibold mb-3 text-sm">⭐ Leave Feedback</h4>
                <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map(r => (
                    <button key={r} onClick={() => setFeedback({...feedback, rating: r})}
                      className={`text-2xl transition-transform hover:scale-110 ${r <= feedback.rating ? 'opacity-100 grayscale-0' : 'opacity-30 grayscale'}`}>⭐</button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  placeholder="Any comments? (Optional)"
                  value={feedback.comments}
                  onChange={e => setFeedback({...feedback, comments: e.target.value})}
                  className="input-field resize-none mb-4"
                />
                <button onClick={submitFeedback}
                  className="w-full btn-primary">
                  Submit Feedback
                </button>
              </div>
            )}
            {feedbackSent && selected.status === 'Resolved' && (
              <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-lg text-sm text-center">
                ✅ Feedback submitted. Thank you!
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
