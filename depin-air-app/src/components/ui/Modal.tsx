'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-2xl' }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <div 
        className={`relative w-full ${maxWidth} bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl overflow-hidden fade-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border-primary flex items-center justify-between">
          {title ? <h2 className="text-lg font-bold text-text-primary">{title}</h2> : <div />}
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1 cursor-pointer">
            ✕
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 bg-bg-primary/50 border-t border-border-primary">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
