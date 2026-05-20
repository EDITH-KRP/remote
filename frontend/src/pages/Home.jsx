import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, ArrowRight, LifeBuoy, Clock, Users } from 'lucide-react';

const features = [
  { icon: LifeBuoy, title: '24/7 Priority Support', desc: 'Get your issues resolved anytime, day or night with our dedicated team.' },
  { icon: Clock, title: 'Lightning Fast Resolution', desc: 'Average response time under 15 minutes for critical infrastructure issues.' },
  { icon: Users, title: 'Expert IT Professionals', desc: 'Access a network of certified technicians across Network & Windows departments.' },
  { icon: ShieldCheck, title: 'Enterprise-Grade Security', desc: 'Your data is protected with end-to-end encryption and strict access controls.' }
];

export default function Home() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 86px)' }}>
      <div className="spinner" style={{ width: '44px', height: '44px', borderWidth: '3px' }} />
    </div>
  );

  return (
    <div style={{
      minHeight: 'calc(100vh - 86px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
      position: 'relative'
    }}>
      {/* Background glow */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', maxWidth: '800px', position: 'relative', zIndex: 1, marginTop: '4rem' }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 12px 36px rgba(99,102,241,0.4)',
          }}
        >
          <Zap size={30} color="#fff" fill="#fff" />
        </motion.div>

        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          background: 'linear-gradient(135deg, #ffffff 20%, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
        }}>
          Next-Generation <br/> IT Support Desk
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Streamline your workflow with our advanced ITIL-compliant ticketing system. Fast, secure, and incredibly efficient.
        </p>

        {user ? (
          <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ padding: '0.75rem 2rem', fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Go to Dashboard <ArrowRight size={18} />
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ padding: '0.75rem 2rem', fontSize: '1.05rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ padding: '0.75rem 2rem', fontSize: '1.05rem' }}>
              Create Account
            </Link>
          </div>
        )}
      </motion.div>

      {/* Features Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '1120px', marginTop: '6rem', position: 'relative', zIndex: 1 }}>
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
              style={{
                background: 'rgba(10,12,22,0.7)',
                border: '1px solid rgba(99,102,241,0.12)',
                borderRadius: 'var(--r-lg)',
                padding: '2rem',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '12px',
                background: 'rgba(99,102,241,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Icon size={22} color="#818cf8" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
