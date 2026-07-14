'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Brain } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { NAV_ITEMS } from '../../constants/navigation';
import { ICONS } from '../../constants/icons';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? '64px' : '260px' }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-full bg-[#0B1220] border-r border-[#1E293B] select-none relative"
      aria-label="Primary Navigation"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[#1E293B] overflow-hidden">
        <div className="p-1.5 rounded-lg bg-[#0061A4]/15 text-[#00F2FE] border border-[#0061A4]/35 flex-shrink-0">
          <Brain size={20} className="animate-pulse" />
        </div>
        <motion.div
          animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col flex-shrink-0"
        >
          <span className="font-display font-bold text-sm tracking-wide text-slate-100 uppercase">
            StadiumOS AI
          </span>
          <span className="text-[9px] text-[#00F2FE] font-mono tracking-wider uppercase">
            Decision Intel
          </span>
        </motion.div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = ICONS[item.iconName as keyof typeof ICONS] || Brain;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={sidebarCollapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative group cursor-pointer",
                isActive 
                  ? "bg-[#0061A4]/20 text-slate-100 border-l-2 border-[#0061A4]" 
                  : "text-[#94A3B8] hover:bg-[#101827] hover:text-slate-200"
              )}
            >
              <Icon 
                size={18} 
                className={cn(
                  "flex-shrink-0",
                  isActive ? "text-[#00F2FE]" : "text-[#94A3B8]"
                )}
              />
              <motion.span
                animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap font-medium overflow-hidden"
              >
                {item.name}
              </motion.span>

              {/* Hover tooltip for collapsed sidebar */}
              {sidebarCollapsed && (
                <div className="absolute left-14 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 bg-[#101827] border border-[#1E293B] text-xs px-2.5 py-1.5 rounded-md shadow-xl text-slate-100 font-medium whitespace-nowrap pointer-events-none">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Collapse Button */}
      <div className="p-3 border-t border-[#1E293B] flex items-center justify-between overflow-hidden h-14">
        {!sidebarCollapsed && (
          <span className="text-[10px] text-slate-500 font-mono">
            V1.0.0 (FIFA-26)
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg border border-[#1E293B] bg-[#101827] hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center cursor-pointer ml-auto"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
