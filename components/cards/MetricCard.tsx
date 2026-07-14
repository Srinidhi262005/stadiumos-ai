'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  onClick?: () => void;
  className?: string;
}

export function MetricCard({ title, value, subtext, onClick, className }: MetricCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01, y: -2 } : undefined}
      className={cn(
        "p-4 rounded-lg bg-[#0B1220] border border-[#1E293B] shadow flex flex-col gap-1 select-none group",
        onClick && "cursor-pointer hover:border-slate-800",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-[#94A3B8] font-medium truncate">{title}</span>
        {onClick && <ArrowUpRight size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" />}
      </div>
      <span className="text-lg font-bold text-slate-200 font-display mt-0.5">{value}</span>
      {subtext && <span className="text-[9px] text-slate-500 leading-normal mt-0.5">{subtext}</span>}
    </motion.div>
  );
}

export default MetricCard;
