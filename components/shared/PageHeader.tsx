'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E293B] pb-6 mb-6 select-none">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
          {title}
        </h1>
        {description && (
          <p className="text-xs md:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
