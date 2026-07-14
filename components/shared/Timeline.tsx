'use client';

import React from 'react';
import { OperationTimelineEvent } from '../../types/common';
import { formatTimeAgo } from '../../lib/date';
import { StatusBadge } from './StatusBadge';
import { Brain, Info, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

interface TimelineProps {
  events: OperationTimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative border-l border-slate-800 pl-4 ml-3 space-y-5 select-none">
      {events.map((event) => {
        let Icon = Info;
        let iconBg = 'bg-[#101827] text-[#94A3B8] border-slate-850';

        if (event.category === 'ai') {
          Icon = Brain;
          iconBg = 'bg-[#0061A4]/20 text-[#00F2FE] border-[#0061A4]/40';
        } else if (event.category === 'incident') {
          Icon = Shield;
          iconBg = 'bg-[#E53935]/15 text-[#E53935] border-[#E53935]/30';
        } else if (event.severity === 'warning') {
          Icon = AlertTriangle;
          iconBg = 'bg-[#FFB300]/15 text-[#FFB300] border-[#FFB300]/30';
        } else if (event.severity === 'success') {
          Icon = CheckCircle;
          iconBg = 'bg-[#00C853]/15 text-[#00C853] border-[#00C853]/30';
        }

        return (
          <div key={event.id} className="relative group">
            {/* Timeline Dot Indicator */}
            <div className={`absolute -left-[27px] top-1.5 w-5 h-5 rounded-full border flex items-center justify-center ${iconBg} shadow-md transition-all group-hover:scale-110 z-10`}>
              <Icon size={10} />
            </div>

            {/* Content Card */}
            <div className="p-3.5 bg-[#101827] border border-[#1E293B] hover:border-slate-800 rounded-lg transition-colors flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-slate-100 transition-colors">
                  {event.title}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {formatTimeAgo(event.timestamp)}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-normal">
                {event.description}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusBadge status={event.category} severity={event.severity} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Timeline;
