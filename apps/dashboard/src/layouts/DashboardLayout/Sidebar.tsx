import React from 'react';
import { useAppStore } from '../../../stores/useAppStore';

export const Sidebar: React.FC = () => {
  const { sidebarExpanded } = useAppStore();

  if (!sidebarExpanded) return null; // Simplified toggle

  return (
    <aside style={{ width: '250px', borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', height: '100%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: 'var(--color-card)' }}>Dashboard</div>
      <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Projects</div>
      <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Deployments</div>
      <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Databases</div>
      <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Settings</div>
    </aside>
  );
};
