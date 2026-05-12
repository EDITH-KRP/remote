import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Ticket, Clock, CheckCircle, Activity, Plus } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets');
        setTickets(res.data);
      } catch (err) {
        console.error('Failed to fetch tickets', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const stats = [
    { title: 'Total Tickets', value: tickets.length, icon: Ticket, color: 'text-blue-500' },
    { title: 'Open', value: tickets.filter(t => t.status === 'Open').length, icon: Clock, color: 'text-yellow-500' },
    { title: 'In Progress', value: tickets.filter(t => t.status === 'In Progress').length, icon: Activity, color: 'text-purple-500' },
    { title: 'Resolved', value: tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length, icon: CheckCircle, color: 'text-green-500' },
  ];

  const chartData = [
    { name: 'Mon', tickets: 4 },
    { name: 'Tue', tickets: 3 },
    { name: 'Wed', tickets: 7 },
    { name: 'Thu', tickets: 5 },
    { name: 'Fri', tickets: 8 },
  ];

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Welcome back, {user?.full_name}</p>
        </div>
        {user?.role === 'user' && (
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Ticket
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="glass-card p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-[var(--text-primary)]">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold mb-6 text-[var(--text-primary)]">Recent Tickets</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="pb-3 text-sm font-medium text-[var(--text-secondary)]">Ticket ID</th>
                  <th className="pb-3 text-sm font-medium text-[var(--text-secondary)]">Subject</th>
                  <th className="pb-3 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                  <th className="pb-3 text-sm font-medium text-[var(--text-secondary)]">Priority</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="py-4 text-sm font-medium text-[var(--text-primary)]">{ticket.ticket_number}</td>
                    <td className="py-4 text-sm text-[var(--text-secondary)] truncate max-w-[200px]">{ticket.subject}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                        ticket.status === 'Open' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                        ticket.status === 'Resolved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                        'bg-blue-500/10 text-blue-600 border-blue-500/20'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-[var(--text-secondary)]">{ticket.priority}</td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-[var(--text-secondary)]">No tickets found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-6 h-[400px]">
          <h3 className="text-lg font-semibold mb-6 text-[var(--text-primary)]">Activity Overview</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
              <Tooltip cursor={{ fill: 'var(--bg-secondary)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }} />
              <Bar dataKey="tickets" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
