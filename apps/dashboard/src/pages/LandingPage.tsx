import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@forge/ui';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // In a real app, this would trigger an Auth flow. 
    // Here we just navigate directly to the dashboard.
    navigate('/dashboard');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glowing orb */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ zIndex: 1, textAlign: 'center', maxWidth: '800px' }}
      >
        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: 800, 
          marginBottom: '24px',
          background: 'linear-gradient(to right, #FAFAFA, #A1A1AA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Build the Future with <span style={{ color: 'var(--color-primary)', WebkitTextFillColor: 'var(--color-primary)' }}>ForgeCloud</span>
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--color-text-secondary)', 
          marginBottom: '48px',
          lineHeight: 1.6 
        }}>
          The ultimate enterprise development framework. Deploy faster, scale infinitely, and manage your entire cloud infrastructure from a single premium dashboard.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Button variant="primary" size="lg" onClick={handleLogin} style={{ padding: '0 32px', height: '56px' }}>
            Get Started (Login)
          </Button>
          <Button variant="secondary" size="lg" style={{ padding: '0 32px', height: '56px' }}>
            Read the Docs
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
