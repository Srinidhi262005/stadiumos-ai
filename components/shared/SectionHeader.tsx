'use client';

import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4 select-none">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-xs font-bold tracking-wider text-slate-250 uppercase font-display">
          {title}
        </h2>
        {description && (
          <p className="text-[10px] text-[#94A3B8]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export default SectionHeader;
