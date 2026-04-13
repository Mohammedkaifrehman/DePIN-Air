'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export const Card = ({ children, className = '', onClick, hoverable = false, style }: CardProps) => {
  return (
    <div 
      onClick={onClick}
      style={style}
      className={`
        bg-bg-secondary border border-border-primary rounded-xl overflow-hidden
        ${hoverable ? 'card-hover cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`px-4 py-3 border-b border-border-primary flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);
