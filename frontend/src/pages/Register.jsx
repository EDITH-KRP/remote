import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 sm:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Create Account</h2>
          <p className="text-[var(--text-secondary)] text-sm">Join the support portal</p>
        </div>

        {error && <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            { key: 'phone', label: 'Phone (Optional)', type: 'tel', placeholder: '+91 9876543210' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-[var(--text-primary)] text-sm font-medium mb-1.5">{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                required={field.key !== 'phone'}
                className="input-field"
              />
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="w-full btn-primary mt-6">
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Create Account'}
          </button>
        </form>

        <p className="text-[var(--text-secondary)] text-sm text-center mt-6">
          Already have an account? <Link to="/login" className="text-[var(--accent)] hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
