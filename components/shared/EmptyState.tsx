'use client';

import React from 'react';
import { HelpCircle, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-10 bg-[#0B1220] border border-[#1E293B] rounded-xl text-center select-none max-w-md mx-auto my-4", className)}>
      <div className="p-3.5 bg-[#101827] border border-slate-800 rounded-full text-slate-400 mb-3.5 shadow-md">
        <HelpCircle size={26} />
      </div>
      <h3 className="text-xs font-bold text-slate-250 mb-1 font-display uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-xs text-[#94A3B8] leading-relaxed mb-5 max-w-xs">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0061A4] hover:bg-[#0061A4]/90 text-xs font-semibold text-slate-100 rounded-lg transition-all cursor-pointer"
        >
          <Plus size={14} />
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
