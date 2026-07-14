'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { ICONS } from '../../constants/icons';

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: number; // percentage, e.g. 5.2 or -2.1
  trend?: 'up' | 'down' | 'neutral';
  status?: 'success' | 'warning' | 'danger' | 'primary' | 'info';
  iconName?: string;
  description?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  change,
  trend,
  status = 'info',
  iconName,
  description,
  className
}: KpiCardProps) {
  const statusColors = {
    success: 'text-[#00C853] bg-[#00C853]/10 border-[#00C853]/20',
    warning: 'text-[#FFB300] bg-[#FFB300]/10 border-[#FFB300]/20',
    danger: 'text-[#E53935] bg-[#E53935]/10 border-[#E53935]/20',
    primary: 'text-[#00F2FE] bg-[#0061A4]/20 border-[#0061A4]/30',
    info: 'text-[#94A3B8] bg-[#101827] border-slate-800'
  };

  const Icon = iconName ? (ICONS[iconName as keyof typeof ICONS] || ArrowRight) : null;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        "p-5 rounded-xl bg-[#101827] border border-[#1E293B] shadow-lg flex flex-col gap-3.5 select-none relative overflow-hidden group hover:border-slate-800",
        className
      )}
    >
      {/* Background gradient accent */}
      <div className="absolute -right-12 -top-12 w-28 h-28 bg-[#0061A4]/5 rounded-full blur-2xl group-hover:bg-[#0061A4]/10 transition-colors pointer-events-none" />

      {/* Header Label + Icon */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase font-mono">
          {label}
        </span>
        {Icon && (
          <div className={cn("p-1.5 rounded-lg border", statusColors[status])}>
            <Icon size={14} />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 font-display">
          {value}
        </span>
        {change !== undefined && trend && (
          <span className={cn(
            "inline-flex items-center gap-0.5 text-[9px] font-bold font-mono px-1.5 py-0.2 rounded border uppercase",
            trend === 'up' && status === 'success' && 'text-[#00C853] bg-[#00C853]/5 border-[#00C853]/15',
            trend === 'down' && status === 'danger' && 'text-[#E53935] bg-[#E53935]/5 border-[#E53935]/15',
            trend === 'up' && status === 'danger' && 'text-[#E53935] bg-[#E53935]/5 border-[#E53935]/15',
            trend === 'down' && status === 'success' && 'text-[#00C853] bg-[#00C853]/5 border-[#00C853]/15',
            (status === 'warning' || status === 'info') && 'text-[#FFB300] bg-[#FFB300]/5 border-[#FFB300]/15'
          )}>
            {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Subtext description */}
      {description && (
        <span className="text-[10px] text-slate-500 leading-normal border-t border-slate-900 pt-2">
          {description}
        </span>
      )}
    </motion.div>
  );
}

export default KpiCard;
