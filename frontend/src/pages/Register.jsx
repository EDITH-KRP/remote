import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2, User, Mail, Lock, Phone, ArrowRight, TicketIcon } from 'lucide-react';

const fields = [
  { key: 'full_name', label: 'Full Name',          type: 'text',     placeholder: 'Jane Smith',          icon: User,  required: true  },
  { key: 'email',     label: 'Email Address',       type: 'email',    placeholder: 'jane@company.com',    icon: Mail,  required: true  },
  { key: 'password',  label: 'Password',            type: 'password', placeholder: '••••••••',            icon: Lock,  required: true  },
  { key: 'phone',     label: 'Phone (optional)',    type: 'tel',      placeholder: '+91 98765 43210',     icon: Phone, required: false },
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
          }}>
            <TicketIcon size={24} color="#fff" />
          </div>
          <h1 style={{
            fontSize: '1.625rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.04em',
            marginBottom: '0.375rem',
          }}>
            Create account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Join SupportDesk and manage your requests
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {fields.map(field => {
              const Icon = field.icon;
              return (
                <div key={field.key}>
                  <label className="input-label">{field.label}</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute', inset: '0 auto 0 0',
                      display: 'flex', alignItems: 'center',
                      paddingLeft: '0.75rem', pointerEvents: 'none',
                      color: 'var(--text-muted)',
                    }}>
                      <Icon size={15} />
                    </div>
                    <input
                      id={`register-${field.key}`}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      required={field.required}
                      className="input-field"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
              );
            })}

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.25rem' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Creating account…</>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
