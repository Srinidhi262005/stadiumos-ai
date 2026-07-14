'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Telemetry Stream Offline", 
  message = "Failed to synchronize status values with FastAPI telemetry grids. Try reconnecting.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[#101827] border border-[#1E293B] rounded-xl text-center select-none max-w-md mx-auto my-4">
      <div className="p-2.5 bg-[#E53935]/15 text-[#E53935] border border-[#E53935]/25 rounded-full mb-3">
        <AlertTriangle size={24} />
      </div>
      <h3 className="text-sm font-bold text-slate-200 mb-1.5 font-display uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-xs text-[#94A3B8] leading-relaxed mb-5 max-w-xs">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-[#162235] hover:bg-[#1E293B] border border-slate-850 text-xs font-semibold text-slate-350 rounded-lg transition-all cursor-pointer"
        >
          <RefreshCw size={12} />
          Force Reconnect
        </button>
      )}
    </div>
  );
}

export default ErrorState;
