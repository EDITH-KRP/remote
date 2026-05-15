import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { User, Phone, Lock, Save, Briefcase, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, login } = useContext(AuthContext); // Can use login/reload auth if needed, but let's just refresh page or keep state
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    employee_id: user?.employee_id || '',
    alternate_email: user?.alternate_email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/auth/profile', form);
      toast.success('Profile updated successfully');
      setForm({ ...form, currentPassword: '', newPassword: '' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '600px', margin: '0 auto' }}
    >
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Your Profile</h1>
      
      <div className="glass" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="input-label"><User size={12} style={{ display: 'inline', marginRight: '4px' }} /> Full Name</label>
            <input 
              type="text" 
              className="input" 
              value={form.full_name}
              onChange={e => setForm({...form, full_name: e.target.value})}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="input-label"><Briefcase size={12} style={{ display: 'inline', marginRight: '4px' }} /> Employee ID</label>
              <input 
                type="text" 
                className="input" 
                value={form.employee_id}
                onChange={e => setForm({...form, employee_id: e.target.value})}
              />
            </div>
            <div>
              <label className="input-label"><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} /> Alternate Email</label>
              <input 
                type="email" 
                className="input" 
                value={form.alternate_email}
                onChange={e => setForm({...form, alternate_email: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="input-label"><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} /> Phone Number</label>
            <input 
              type="text" 
              className="input" 
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})}
            />
          </div>
          <div className="sep" style={{ margin: '1rem 0' }}></div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Change password (leave blank to keep current)</p>
          <div>
            <label className="input-label"><Lock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Current Password</label>
            <input 
              type="password" 
              className="input" 
              value={form.currentPassword}
              onChange={e => setForm({...form, currentPassword: e.target.value})}
            />
          </div>
          <div>
            <label className="input-label"><Lock size={12} style={{ display: 'inline', marginRight: '4px' }} /> New Password</label>
            <input 
              type="password" 
              className="input" 
              value={form.newPassword}
              onChange={e => setForm({...form, newPassword: e.target.value})}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Saving...' : <><Save size={15} /> Save Changes</>}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
