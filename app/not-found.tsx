import React from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#02050D] text-slate-100 p-6">
      <div className="flex flex-col items-center max-w-md text-center p-8 bg-[#0B1220] border border-slate-800 rounded-xl shadow-2xl">
        <div className="p-3 text-slate-400 bg-[#101827] rounded-full border border-slate-850 mb-6">
          <HelpCircle size={36} />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight mb-2">Module Not Found</h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          The requested operations node does not exist or has been decommissioned from the stadium grid.
        </p>
        
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#0061A4] hover:bg-[#0061A4]/90 text-sm font-semibold transition-all w-full cursor-pointer"
        >
          Return to Command Center
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
