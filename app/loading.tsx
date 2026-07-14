import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#02050D] text-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#0061A4] opacity-20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-[#00F2FE] animate-spin" />
          <div className="absolute inset-2 rounded-full bg-[#0061A4]/35 opacity-40 animate-ping" />
        </div>
        <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#94A3B8] animate-pulse">
          Establishing Telemetry Tunnel
        </span>
      </div>
    </div>
  );
}
