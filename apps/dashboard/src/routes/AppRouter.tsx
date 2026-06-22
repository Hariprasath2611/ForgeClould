import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ErrorBoundary } from '../features/core/components/ErrorBoundary';
import { LandingPage } from '../pages/LandingPage';

// Dummy Playground for verification
import { Button, Card, Input } from '@forge/ui';
import { motion } from 'framer-motion';

const Playground: React.FC = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.5 }}
  >
    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Dashboard Overview</h1>
    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>Welcome back. Here is your cloud infrastructure status.</p>
    
    <Card style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Quick Start Deployment</h2>
      <Input label="Project Name" placeholder="e.g. my-awesome-api" />
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <Button variant="primary">Deploy Project</Button>
        <Button variant="secondary">View Settings</Button>
      </div>
    </Card>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <Card>
        <h3 style={{ color: 'var(--color-text-secondary)' }}>Total Projects</h3>
        <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '8px 0', color: 'var(--color-primary)' }}>12</p>
      </Card>
      <Card>
        <h3 style={{ color: 'var(--color-text-secondary)' }}>Active Deployments</h3>
        <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '8px 0', color: 'var(--color-primary)' }}>8</p>
      </Card>
    </div>
  </motion.div>
);

import { CustomCursor } from '../features/core/components/CustomCursor';
import { AnimatedGridBackground } from '../features/core/components/AnimatedGridBackground';
import { SignInPage } from '../features/auth/pages/SignInPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { useAuthStore } from '../features/auth/store/useAuthStore';

// Simple Route Guard for authenticated areas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Route Guard to prevent logged-in users from seeing login pages
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

import { ProjectsListPage } from '../pages/ProjectsListPage';
import { ProjectDashboardPage } from '../pages/ProjectDashboardPage';

export const AppRouter: React.FC = () => {
  return (
    <ErrorBoundary>
      <CustomCursor />
      <AnimatedGridBackground />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><SignInPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><SignUpPage /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<ProjectsListPage />} />
            <Route path="projects/:projectId" element={<ProjectDashboardPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
