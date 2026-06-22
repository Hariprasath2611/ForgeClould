import React from 'react';
import { Outlet } from 'react-router';
import { TopNavigation } from './TopNavigation';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../../features/core/components/CommandPalette';
import { GlobalToastLayer } from '../../features/core/components/GlobalToastLayer';

export const DashboardLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <TopNavigation />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
      <CommandPalette />
      <GlobalToastLayer />
    </div>
  );
};
