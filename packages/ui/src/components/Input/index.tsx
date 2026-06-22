import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      {label && <label style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{label}</label>}
      <input className={`forge-input ${className}`} {...props} />
      {error && <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  );
};
