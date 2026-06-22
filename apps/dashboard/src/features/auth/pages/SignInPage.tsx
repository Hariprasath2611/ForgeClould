import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Card, Input, Button } from '@forge/ui';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { AuthAdapter } from '../services/AuthAdapter';

export const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await AuthAdapter.loginWithEmail(email, password);
      setUser(result.credential.user, await result.credential.user.getIdToken());
      navigate('/dashboard');
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await AuthAdapter.loginWithGoogle();
      setUser(result.credential.user, await result.credential.user.getIdToken());
      navigate('/dashboard');
    } catch (error) {
      alert(error);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const result = await AuthAdapter.loginWithGithub();
      setUser(result.credential.user, await result.credential.user.getIdToken());
      navigate('/dashboard');
    } catch (error) {
      alert(error);
    }
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

          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            <span style={{ padding: '0 12px' }}>Or continue with</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <Button variant="secondary" onClick={handleGoogleLogin} style={{ width: '100%' }}>
              Google
            </Button>
            <Button variant="secondary" onClick={handleGithubLogin} style={{ width: '100%' }}>
              GitHub
            </Button>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
