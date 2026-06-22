import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div className={`forge-card ${className}`} {...props}>
      {children}
    </div>
  );
};
