import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="forge-modal-overlay" onClick={onClose}>
      <div className="forge-modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
