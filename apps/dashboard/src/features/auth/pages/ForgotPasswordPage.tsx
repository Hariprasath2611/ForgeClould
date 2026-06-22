import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Card, Input, Button } from '@forge/ui';
import { motion } from 'framer-motion';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API / Firebase call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '400px', zIndex: 1 }}
      >
        <Card style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>Reset Password</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
              Enter your email and we'll send you instructions to reset your password.
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Email Address</label>
                <Input 
                  type="email" 
                  placeholder="you@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="lg" isLoading={loading} style={{ marginTop: '8px' }}>
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                ✓
              </div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Check your email</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                We've sent password reset instructions to {email}
              </p>
              <Button variant="secondary" onClick={() => navigate('/login')} style={{ width: '100%' }}>
                Return to Login
              </Button>
            </div>
          )}

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Remember your password? <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
