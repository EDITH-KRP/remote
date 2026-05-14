import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Zap, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login }   = useContext(AuthContext);
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Fills the visible viewport below the 86px navbar */
    <div style={{
      minHeight: 'calc(100vh - 86px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      {/* Ambient glow behind card */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        width: '520px',
        height: '520px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}
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
              animation: 'float 4s ease-in-out infinite',
            }}
          >
            <Zap size={26} color="#fff" fill="#fff" />
          </motion.div>

          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.2,
            background: 'linear-gradient(135deg, #eef0fb 30%, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.375rem',
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
            Sign in to your SupportDesk account
          </p>
        </div>

        {/* ── Card ────────────────────────────── */}
        <div style={{ position: 'relative' }}>
          {/* Gradient border */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: '-1px',
            borderRadius: 'calc(var(--r-xl) + 1px)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.45), rgba(139,92,246,0.3), rgba(6,182,212,0.2))',
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

            {/* Error */}
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

              {/* Email */}
              <div>
                <label className="input-label" htmlFor="login-email">Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-3)', pointerEvents: 'none',
                    zIndex: 1,
                  }} />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="input-label" htmlFor="login-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-3)', pointerEvents: 'none',
                    zIndex: 1,
                  }} />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Forgot password */}
              <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                <Link to="/forgot-password" style={{
                  fontSize: '0.8rem', fontWeight: 600,
                  color: 'var(--p3)', textDecoration: 'none',
                }}>
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                id="login-submit"
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={submitting}
              >
                {submitting
                  ? <><div className="spinner" style={{ width: '17px', height: '17px' }} /> Signing in…</>
                  : <><Sparkles size={15} /> Sign In <ArrowRight size={15} /></>
                }
              </motion.button>

            </form>
          </div>
        </div>

        {/* Footer link */}
        <p style={{
          textAlign: 'center', marginTop: '1.5rem',
          fontSize: '0.875rem', color: 'var(--text-2)',
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none',
          }}>
            Create one free →
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
