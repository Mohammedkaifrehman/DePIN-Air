'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge = ({ children, variant = 'default', className = '', style }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-[0.2em] transition-all';
  
  const variants = {
    default: 'bg-white/5 text-text-secondary border border-white/10',
    success: 'bg-accent-green/20 text-accent-green border border-accent-green/40 shadow-[0_0_10px_rgba(0,245,255,0.1)]',
    warning: 'bg-accent-amber/20 text-accent-amber border border-accent-amber/40 shadow-[0_0_10px_rgba(255,214,0,0.1)]',
    danger: 'bg-accent-red/20 text-accent-red border border-accent-red/40 shadow-[0_0_10px_rgba(255,61,0,0.1)]',
    info: 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40 shadow-[0_0_10px_rgba(0,209,255,0.1)]',
    premium: 'bg-accent-purple/20 text-accent-purple border border-accent-purple/40 shadow-[0_0_10px_rgba(176,38,255,0.1)]',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} style={style}>
      {children}
    </span>
  );
};
