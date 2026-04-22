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
  const baseStyles = 'inline-flex items-center justify-center rounded-sm font-bold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-gradient-to-br from-accent-purple to-[#7000FF] text-white hover:brightness-125 shadow-xl shadow-accent-purple/20 uppercase tracking-[0.2em] text-[13px] font-black',
    secondary: 'bg-white/5 backdrop-blur-md text-text-primary border border-white/10 hover:bg-white/10 uppercase tracking-[0.2em] text-[13px] font-black',
    outline: 'bg-transparent border border-border-primary text-text-secondary hover:text-text-primary hover:border-accent-green/50 uppercase tracking-[0.2em] text-[13px] font-black',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5 uppercase tracking-[0.2em] text-[13px] font-black',
    danger: 'bg-accent-red text-white hover:brightness-110 shadow-lg shadow-accent-red/20 uppercase tracking-[0.2em] text-[13px] font-black',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-[12px]',
    lg: 'px-14 py-6 text-[15px]',
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
