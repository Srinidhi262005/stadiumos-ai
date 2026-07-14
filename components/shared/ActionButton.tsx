'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function ActionButton({ 
  variant = 'secondary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ActionButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-1.5 font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] cursor-pointer select-none font-sans font-medium uppercase tracking-wide';
  
  const variantStyles = {
    primary: 'bg-[#0061A4] hover:bg-[#0061A4]/90 text-slate-100 border border-[#0061A4]/40 focus:ring-[#0061A4] shadow-lg shadow-[#0061A4]/15',
    secondary: 'bg-[#101827] hover:bg-[#1E293B] border border-[#1E293B] text-slate-355 hover:text-slate-100 focus:ring-slate-800',
    danger: 'bg-[#E53935] hover:bg-[#E53935]/90 text-slate-100 border border-red-700 focus:ring-[#E53935]',
    ghost: 'hover:bg-[#101827] text-[#94A3B8] hover:text-slate-200 focus:ring-slate-800'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-[9px] tracking-wider',
    md: 'px-3.5 py-2 text-[10px] tracking-wider',
    lg: 'px-5 py-2.5 text-xs'
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default ActionButton;
