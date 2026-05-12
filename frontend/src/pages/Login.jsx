import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, TicketIcon } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            Welcome back
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Sign in to your SupportDesk account
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
            {/* Email */}
            <div>
              <label className="input-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', inset: '0 auto 0 0',
                  display: 'flex', alignItems: 'center',
                  paddingLeft: '0.75rem', pointerEvents: 'none',
                  color: 'var(--text-muted)',
                }}>
                  <Mail size={16} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="input-label" style={{ margin: 0 }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', inset: '0 auto 0 0',
                  display: 'flex', alignItems: 'center',
                  paddingLeft: '0.75rem', pointerEvents: 'none',
                  color: 'var(--text-muted)',
                }}>
                  <Lock size={16} />
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.25rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            color: 'var(--primary)', fontWeight: 600, textDecoration: 'none',
          }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
