'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge = ({ children, variant = 'default', className = '', style }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors';
  
  const variants = {
    default: 'bg-bg-tertiary text-text-secondary border border-border-primary',
    success: 'bg-accent-green/15 text-accent-green border border-accent-green/30',
    warning: 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30',
    danger: 'bg-accent-red/15 text-accent-red border border-accent-red/30',
    info: 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} style={style}>
      {children}
    </span>
  );
};
