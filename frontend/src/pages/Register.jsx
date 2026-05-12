import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight, Zap, Sparkles } from 'lucide-react';

const fields = [
  { key: 'full_name', label: 'Full Name',       type: 'text',     placeholder: 'Jane Smith',       icon: User,  required: true  },
  { key: 'email',     label: 'Email Address',   type: 'email',    placeholder: 'jane@company.com', icon: Mail,  required: true  },
  { key: 'password',  label: 'Password',        type: 'password', placeholder: '••••••••',         icon: Lock,  required: true  },
  { key: 'phone',     label: 'Phone (optional)',type: 'tel',      placeholder: '+91 98765 43210',  icon: Phone, required: false },
];

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: '2rem 1rem',
    }}>
      {/* Background glow blobs */}
      {[
        { top: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', animation: 'meshDrift1 15s ease-in-out infinite alternate' },
        { bottom: '-15%', left: '-5%',  width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', animation: 'meshDrift2 20s ease-in-out infinite alternate' },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', ...s }} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '440px', position: 'relative' }}
      >
        {/* Header */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <div style={{
            width: '60px', height: '60px',
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            borderRadius: '18px', margin: '0 auto 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 36px rgba(99,102,241,0.5)',
            animation: 'float 5s ease-in-out infinite',
          }}>
            <Zap size={28} color="#fff" fill="#fff" />
          </div>
          <h1 style={{
            fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.05em',
            background: 'linear-gradient(135deg, #eef0fb, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.4rem',
          }}>
            Create account
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>
            Join SupportDesk — it's free
          </p>
        </motion.div>

        {/* Card */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: '-1px', borderRadius: 'calc(var(--r-xl) + 1px)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.25), rgba(6,182,212,0.15))',
            zIndex: -1, filter: 'blur(1px)',
          }} />

          <div style={{
            background: 'rgba(10, 12, 22, 0.9)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 'var(--r-xl)',
            padding: '2rem 2.25rem',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
          }}>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="alert alert-error"
                style={{ marginBottom: '1.25rem' }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {fields.map((field, i) => {
                const Icon = field.icon;
                return (
                  <motion.div
                    key={field.key}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.07 }}
                  >
                    <label className="input-label">{field.label}</label>
                    <div style={{ position: 'relative' }}>
                      <Icon size={14} style={{
                        position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-3)', pointerEvents: 'none',
                      }} />
                      <input
                        id={`register-${field.key}`}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        required={field.required}
                        className="input"
                        style={{ paddingLeft: '2.6rem' }}
                      />
                    </div>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {loading ? (
                    <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Creating…</>
                  ) : (
                    <><Sparkles size={15} /> Create Account <ArrowRight size={15} /></>
                  )}
                </button>
              </motion.div>
            </form>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-2)' }}
        >
          Already have an account?{' '}
          <Link to="/login" style={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textDecoration: 'none',
          }}>
            Sign in →
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
