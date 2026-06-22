import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', isLoading, children, className = '', ...props }) => {
  const baseClass = `forge-btn forge-btn-${variant} forge-btn-${size} ${className}`;
  return (
    <button className={baseClass} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
