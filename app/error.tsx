'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Unhandled Application Error Boundary triggered:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#02050D] text-slate-100 p-6">
      <div className="flex flex-col items-center max-w-md text-center p-8 bg-[#0B1220] border border-slate-800 rounded-xl shadow-2xl">
        <div className="p-3 text-[#E53935] bg-[#E53935]/10 rounded-full border border-[#E53935]/20 mb-6">
          <AlertOctagon size={36} />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight mb-2">System Error Triggered</h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          StadiumOS AI encountered an unexpected interruption. Telemetry pipelines have been paused.
        </p>
        
        {error.digest && (
          <div className="w-full text-left p-3 mb-6 bg-[#02050D] border border-slate-900 rounded font-mono text-[10px] text-slate-500 select-all truncate">
            DIGEST_ID: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0061A4] hover:bg-[#0061A4]/90 text-sm font-semibold transition-all w-full cursor-pointer"
          >
            <RefreshCw size={16} className="animate-spin-slow" />
            Retry Connection
          </button>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#162235] hover:bg-[#1E293B] border border-slate-850 text-sm font-semibold text-slate-300 transition-all w-full"
          >
            <Home size={16} />
            Operations Root
          </Link>
        </div>
      </div>
    </div>
  );
}
