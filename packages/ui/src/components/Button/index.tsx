import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', isLoading, children, className = '', ...props }) => {
  const baseClass = `forge-btn forge-btn-${variant} forge-btn-${size} ${className}`;
  
  return (
    <motion.button 
      className={baseClass} 
      disabled={isLoading || props.disabled}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.1)', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          Loading...
        </div>
      ) : children}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.button>
  );
};
