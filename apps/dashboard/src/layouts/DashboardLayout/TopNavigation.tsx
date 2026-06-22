import React from 'react';
import { useAppStore } from '../../stores/useAppStore';

export const TopNavigation: React.FC = () => {
  const { setSidebarExpanded, sidebarExpanded, setCommandPaletteOpen } = useAppStore();

  return (
    <header style={{ height: '64px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', padding: '0 24px', backgroundColor: 'var(--color-surface)' }}>
      <button onClick={() => setSidebarExpanded(!sidebarExpanded)} style={{ marginRight: '16px', background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
        ☰
      </button>
      <div style={{ fontWeight: 'bold', fontSize: '18px', marginRight: '32px' }}>ForgeCloud</div>
      <div style={{ flex: 1 }}></div>
      <button 
        onClick={() => setCommandPaletteOpen(true)}
        style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer', marginRight: '16px' }}
      >
        Search... (⌘K)
      </button>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></div>
    </header>
  );
};
