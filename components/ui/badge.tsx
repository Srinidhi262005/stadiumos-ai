'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: string; // e.g., 'default', 'secondary', etc.
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, children }) => {
  const variantClasses = {
    default: 'bg-gray-200 text-gray-800',
    secondary: 'bg-gray-300 text-gray-900',
  }[variant] || '';

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variantClasses, className)}>
      {children}
    </span>
  );
};

export default Badge;
