import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './routes/AppRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

// Core Styles
import '@forge/ui/src/styles/theme.css';
import '@forge/ui/src/styles/components.css';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppRouter />
  </QueryClientProvider>
);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
