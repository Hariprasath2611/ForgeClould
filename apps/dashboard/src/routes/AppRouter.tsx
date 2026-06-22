import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ErrorBoundary } from '../features/core/components/ErrorBoundary';

// Dummy Playground for verification
import { Button, Card, Input } from '@forge/ui';

const Playground: React.FC = () => (
  <div>
    <h1>Playground</h1>
    <Card style={{ marginTop: '24px' }}>
      <h2>Test Components</h2>
      <Input label="Project Name" placeholder="my-awesome-project" />
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <Button variant="primary">Deploy</Button>
        <Button variant="secondary">Cancel</Button>
      </div>
    </Card>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Playground />} />
            <Route path="playground" element={<Playground />} />
            {/* Future Routes: /projects, /deployments, /billing */}
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
