'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  label?: string;
}

export function FilterBar({ options, selectedValue, onChange, label }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 select-none overflow-x-auto py-1 scrollbar-none">
      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold flex-shrink-0">
        <SlidersHorizontal size={12} />
        {label && <span>{label}:</span>}
      </div>
      <div className="flex items-center gap-1">
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "px-2.5 py-1 text-[9px] font-bold border rounded-md transition-all cursor-pointer whitespace-nowrap tracking-wider uppercase font-mono",
                isSelected
                  ? "bg-[#0061A4]/15 border-[#0061A4] text-slate-100"
                  : "bg-[#02050D] hover:bg-[#101827] border-[#1E293B] text-[#94A3B8] hover:text-slate-200"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FilterBar;
