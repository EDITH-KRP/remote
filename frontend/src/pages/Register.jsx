import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight, Zap, Sparkles, Briefcase } from 'lucide-react';

const fields = [
  { key: 'full_name',       label: 'Full Name',             type: 'text',     placeholder: 'Jane Smith',       Icon: User,      required: true  },
  { key: 'employee_id',     label: 'Employee ID',           type: 'text',     placeholder: 'EMP123',           Icon: Briefcase, required: true  },
  { key: 'email',           label: 'Email Address',         type: 'email',    placeholder: 'jane@company.com', Icon: Mail,      required: true  },
  { key: 'alternate_email', label: 'Alternate Email',       type: 'email',    placeholder: 'jane.alt@gmail.com', Icon: Mail,    required: true  },
  { key: 'password',        label: 'Password',              type: 'password', placeholder: '••••••••',         Icon: Lock,      required: true,  hint: 'Minimum 8 characters' },
  { key: 'phone',           label: 'Phone Number',          type: 'tel',      placeholder: '+91 98765 43210',  Icon: Phone,     required: true },
];

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ full_name: '', employee_id: '', email: '', alternate_email: '', password: '', phone: '' });
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
      {/* Subtle background canvas glow */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        width: '560px', height: '560px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(53,122,112,0.03) 0%, transparent 70%)',
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
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
            style={{
              width: '58px', height: '58px',
              background: 'linear-gradient(135deg, #357a70, #81b3b8)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 4px 12px rgba(53,122,112,0.3)',
            }}
          >
            <Zap size={26} color="#fff" fill="#fff" />
          </motion.div>

          <h1 style={{
            fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.2,
            color: 'var(--text-1)',
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
          <div style={{
            position: 'relative', zIndex: 1,
            background: 'var(--bg-2)',
            border: '1px solid rgba(53,122,112,0.25)',
            borderRadius: 'var(--r-md)',
            padding: '2rem 2.25rem 2.25rem',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            boxShadow: 'var(--shadow-lg)',
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
              {fields.map(({ key, label, type, placeholder, Icon, required, hint }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <label className="input-label" htmlFor={`reg-${key}`}>{label} <span style={{ color: '#f87171' }}>*</span></label>
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
                  {hint && (
                    <p style={{ fontSize: '0.75rem', color: '#81b3b8', marginTop: '0.35rem', marginLeft: '0.25rem' }}>
                      {hint}
                    </p>
                  )}
                </motion.div>
              ))}

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                id="register-submit"
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem', background: '#357a70', border: '1px solid rgba(129,179,184,0.2)', boxShadow: '0 4px 12px rgba(53,122,112,0.3)' }}
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
            color: '#81b3b8',
            textDecoration: 'underline',
          }}>
            Sign in →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
