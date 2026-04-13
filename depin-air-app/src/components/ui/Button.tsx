'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-accent-green text-white hover:brightness-110 shadow-lg shadow-accent-green/20',
    secondary: 'bg-bg-tertiary text-text-primary border border-border-primary hover:bg-white/5',
    outline: 'bg-transparent border border-border-primary text-text-secondary hover:text-text-primary hover:bg-white/5',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/10',
    danger: 'bg-accent-red text-white hover:brightness-110 shadow-lg shadow-accent-red/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
