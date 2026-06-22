import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Card, Input, Button } from '@forge/ui';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
// In a real app we'd use signInWithEmailAndPassword from firebase/auth here.

export const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API / Firebase call
    setTimeout(() => {
      setLoading(false);
      setUser({ uid: 'mock-user-id', email } as any, 'mock-jwt-token');
      navigate('/dashboard');
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>Welcome Back</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>Sign in to continue to ForgeCloud</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '14px', color: 'var(--color-primary)', textDecoration: 'none' }}>Forgot?</Link>
              </div>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={loading} style={{ marginTop: '8px' }}>
              Sign In
            </Button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
