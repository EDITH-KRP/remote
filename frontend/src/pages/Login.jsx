import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Zap, Sparkles } from 'lucide-react';

/* Floating particles */
const Particle = ({ style }) => (
  <div style={{
    position: 'absolute', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)',
    pointerEvents: 'none',
    animation: `float ${style.dur}s ease-in-out infinite`,
    animationDelay: style.delay,
    ...style,
  }} />
);

const particles = [
  { width: '180px', height: '180px', top: '10%',  left: '5%',  opacity: 0.15, dur: 7,  delay: '0s'    },
  { width: '100px', height: '100px', top: '70%',  left: '10%', opacity: 0.1,  dur: 9,  delay: '1s'    },
  { width: '140px', height: '140px', top: '20%',  right: '8%', opacity: 0.12, dur: 8,  delay: '0.5s'  },
  { width: '80px',  height: '80px',  bottom: '15%', right: '12%', opacity: 0.08, dur: 11, delay: '2s' },
  { width: '60px',  height: '60px',  top: '50%',  left: '50%', opacity: 0.1,  dur: 6,  delay: '1.5s'  },
];

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
    } catch {
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
      position: 'relative',
      overflow: 'hidden',
      padding: '2rem 1rem',
    }}>
      {/* Background particles */}
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* Glow behind card */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '420px', position: 'relative' }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
            borderRadius: '20px', margin: '0 auto 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 40px rgba(99,102,241,0.5), 0 4px 12px rgba(0,0,0,0.4)',
            animation: 'float 4s ease-in-out infinite',
          }}>
            <Zap size={30} color="#fff" fill="#fff" />
          </div>
          <h1 style={{
            fontSize: '2rem', fontWeight: 900,
            background: 'linear-gradient(135deg, #eef0fb, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.05em', lineHeight: 1.15, marginBottom: '0.5rem',
          }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
            Sign in to your SupportDesk account
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ position: 'relative' }}
        >
          {/* Gradient border glow */}
          <div style={{
            position: 'absolute', inset: '-1px', borderRadius: 'calc(var(--r-xl) + 1px)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.3), rgba(6,182,212,0.2))',
            zIndex: -1,
            filter: 'blur(1px)',
          }} />

          <div style={{
            background: 'rgba(10, 12, 22, 0.9)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 'var(--r-xl)',
            padding: '2.5rem',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.7), 0 8px 32px rgba(99,102,241,0.1)',
          }}>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="alert alert-error"
                style={{ marginBottom: '1.5rem' }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="input-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{
                    position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-3)', pointerEvents: 'none',
                  }} />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '2.6rem' }}
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.38 }}
              >
                <label className="input-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{
                    position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-3)', pointerEvents: 'none',
                  }} />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '2.6rem' }}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <button
                  id="login-submit"
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Signing in…</>
                  ) : (
                    <><Sparkles size={16} /> Sign In <ArrowRight size={16} /></>
                  )}
                </button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-2)' }}
        >
          Don't have an account?{' '}
          <Link to="/register" style={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textDecoration: 'none',
          }}>
            Create one free →
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
