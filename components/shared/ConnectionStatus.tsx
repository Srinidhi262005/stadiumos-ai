'use client';

import React from 'react';
import { useRealtimeStore } from '@/store/realtimeStore';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const isConnected = useRealtimeStore((state) => state.isConnected);
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus);

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(16,185,129,0.1)] select-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Wifi size={10} className="stroke-[2.5]" />
        <span className="hidden sm:inline">Live</span>
      </div>
    );
  }

  if (connectionStatus.connecting) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(245,158,11,0.1)] select-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span className="hidden sm:inline">Connecting</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-rose-500/20 bg-rose-500/5 text-rose-400 text-[10px] font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(244,63,94,0.1)] select-none">
      <span className="relative flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
      </span>
      <WifiOff size={10} className="stroke-[2.5]" />
      <span className="hidden sm:inline">Offline</span>
    </div>
  );
}

export default ConnectionStatus;
