import React from 'react';

// Simplified toast layer skeleton. Real implementation would map over Zustand store toasts.
export const GlobalToastLayer: React.FC = () => {
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* <div className="forge-card" style={{ padding: '12px 16px', backgroundColor: 'var(--color-success)' }}>
        Project deployed successfully!
      </div> */}
    </div>
  );
};
