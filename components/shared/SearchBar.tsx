'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ placeholder = "Filter items...", value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full select-none">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
        <Search size={14} />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 text-xs bg-[#02050D] hover:bg-[#101827] focus:bg-[#0B1220] text-slate-200 placeholder-slate-500 border border-[#1E293B] rounded-lg transition-all outline-none"
      />
    </div>
  );
}

export default SearchBar;
