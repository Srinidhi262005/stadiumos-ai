'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { StatusSeverity } from '../../types/common';

interface StatusBadgeProps {
  status: string;
  severity?: StatusSeverity;
}

export function StatusBadge({ status, severity = 'info' }: StatusBadgeProps) {
  const stylesMap: Record<StatusSeverity, string> = {
    success: 'bg-[#00C853]/10 text-[#00C853] border-[#00C853]/20',
    warning: 'bg-[#FFB300]/10 text-[#FFB300] border-[#FFB300]/20',
    danger: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20',
    primary: 'bg-[#0061A4]/20 text-[#00F2FE] border-[#0061A4]/30',
    info: 'bg-[#101827] text-[#94A3B8] border-slate-800',
  };

  const dotStylesMap: Record<StatusSeverity, string> = {
    success: 'bg-[#00C853]',
    warning: 'bg-[#FFB300]',
    danger: 'bg-[#E53935]',
    primary: 'bg-[#00F2FE]',
    info: 'bg-[#94A3B8]',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider border uppercase select-none font-mono",
        stylesMap[severity]
      )}
    >
      <span className={cn("w-1 h-1 rounded-full", dotStylesMap[severity])} />
      {status}
    </span>
  );
}

export default StatusBadge;
