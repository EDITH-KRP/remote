import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight, Zap, Sparkles } from 'lucide-react';

const fields = [
  { key: 'full_name', label: 'Full Name',       type: 'text',     placeholder: 'Jane Smith',       Icon: User,  required: true  },
  { key: 'email',     label: 'Email Address',   type: 'email',    placeholder: 'jane@company.com', Icon: Mail,  required: true  },
  { key: 'password',  label: 'Password',        type: 'password', placeholder: '••••••••',         Icon: Lock,  required: true  },
  { key: 'phone',     label: 'Phone (optional)',type: 'tel',      placeholder: '+91 98765 43210',  Icon: Phone, required: false },
];

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ full_name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

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
      minHeight: 'calc(100vh - 86px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        width: '560px', height: '560px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}
      >
        {/* ── Brand ──────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
            style={{
              width: '58px', height: '58px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 12px 36px rgba(99,102,241,0.45)',
              animation: 'float 4.5s ease-in-out infinite',
            }}
          >
            <Zap size={26} color="#fff" fill="#fff" />
          </motion.div>

          <h1 style={{
            fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.2,
            background: 'linear-gradient(135deg, #eef0fb 30%, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.375rem',
          }}>
            Create account
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
            Join SupportDesk — it's completely free
          </p>
        </div>

        {/* ── Card ────────────────────────────── */}
        <div style={{ position: 'relative' }}>
          {/* Gradient border */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: '-1px',
            borderRadius: 'calc(var(--r-xl) + 1px)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.28), rgba(6,182,212,0.18))',
            zIndex: 0,
          }} />

          <div style={{
            position: 'relative', zIndex: 1,
            background: 'rgba(9, 11, 22, 0.92)',
            border: '1px solid rgba(99,102,241,0.18)',
            borderRadius: 'var(--r-xl)',
            padding: '2rem 2.25rem 2.25rem',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          }}>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-error"
                style={{ marginBottom: '1.5rem' }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {fields.map(({ key, label, type, placeholder, Icon, required }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <label className="input-label" htmlFor={`reg-${key}`}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <Icon size={14} style={{
                      position: 'absolute', left: '0.875rem', top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-3)', pointerEvents: 'none', zIndex: 1,
                    }} />
                    <input
                      id={`reg-${key}`}
                      type={type}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      required={required}
                      className="input"
                      style={{ paddingLeft: '2.5rem' }}
                      autoComplete={key === 'email' ? 'email' : key === 'password' ? 'new-password' : 'off'}
                    />
                  </div>
                </motion.div>
              ))}

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                id="register-submit"
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {loading
                  ? <><div className="spinner" style={{ width: '17px', height: '17px' }} /> Creating account…</>
                  : <><Sparkles size={15} /> Create Account <ArrowRight size={15} /></>
                }
              </motion.button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center', marginTop: '1.5rem',
          fontSize: '0.875rem', color: 'var(--text-2)',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textDecoration: 'none',
          }}>
            Sign in →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
