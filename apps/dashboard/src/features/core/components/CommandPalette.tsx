import React, { useEffect } from 'react';
import { useAppStore } from '../../../stores/useAppStore';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', paddingTop: '100px' }} onClick={() => setCommandPaletteOpen(false)}>
      <div style={{ width: '600px', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-overlay)' }} onClick={(e) => e.stopPropagation()}>
        <input type="text" placeholder="Search projects, deployments, settings..." autoFocus style={{ width: '100%', padding: '12px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)' }} />
        <div style={{ marginTop: '16px', color: 'var(--color-text-secondary)' }}>
          <small>Use ⬆ ⬇ to navigate. Press Enter to select.</small>
        </div>
      </div>
    </div>
  );
};
