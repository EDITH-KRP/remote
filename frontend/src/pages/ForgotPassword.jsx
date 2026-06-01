import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 86px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="page-title">Reset Password</h1>
          <p className="page-sub">Enter your email to receive a reset link</p>
        </div>
        <div style={{
          background: 'var(--bg-2)',
          border: '1px solid rgba(53,122,112,0.25)',
          borderRadius: 'var(--r-md)',
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="input-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type="email" required className="input" style={{ paddingLeft: '2.5rem' }} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary" style={{ background: '#357a70', border: '1px solid rgba(129,179,184,0.2)', boxShadow: '0 4px 12px rgba(53,122,112,0.3)' }} disabled={loading}>
              {loading ? 'Sending...' : <><ArrowRight size={15} /> Send Link</>}
            </motion.button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <Link to="/login" style={{ color: '#81b3b8', textDecoration: 'underline', fontWeight: 600 }}>← Back to Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
