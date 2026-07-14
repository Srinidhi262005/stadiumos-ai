'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, LogOut, Sparkles, Info, ChevronDown } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { formatTimeAgo } from '../../lib/date';

export function TopNav() {
  const { setSearchOpen, setMobileMenuOpen } = useUiStore();
  const { notifications, markAllAsRead } = useNotificationStore();
  const { user, logout } = useAuthStore();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[#0B1220] border-b border-[#1E293B] flex items-center justify-between px-4 z-40 relative select-none">
      
      {/* Left: Mobile Menu Trigger + Route Identifier */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-1.5 rounded-lg border border-[#1E293B] hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu size={18} />
        </button>
        <span className="text-xs font-semibold tracking-[0.1em] font-display text-[#94A3B8] uppercase hidden sm:inline-block">
          Stadium Operations Control
        </span>
      </div>

      {/* Middle/Right: Actions */}
      <div className="flex items-center gap-4 ml-auto">
        
        {/* Global Search trigger button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1E293B] bg-[#02050D] hover:bg-[#101827] text-slate-400 hover:text-slate-300 text-xs transition-all w-40 sm:w-56 select-none cursor-pointer"
        >
          <Search size={13} />
          <span>Global Search...</span>
          <span className="ml-auto font-mono text-[9px] text-slate-650 bg-[#101827] border border-[#1E293B] px-1 rounded">
            Ctrl+K
          </span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg border border-[#1E293B] bg-[#02050D] hover:bg-[#101827] text-[#94A3B8] hover:text-slate-200 transition-all relative cursor-pointer"
            aria-label="System notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E53935] text-[9px] font-bold text-slate-100 rounded-full flex items-center justify-center border border-[#0B1220]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg bg-[#0B1220] border border-[#1E293B] shadow-2xl z-50 p-1 flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E293B]">
                <span className="text-xs font-semibold text-slate-200 font-display">System Feed</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[10px] text-[#00F2FE] hover:underline cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto py-1 divide-y divide-[#1E293B] scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-[#94A3B8]">
                    No active warnings or reports.
                  </div>
                ) : (
                  notifications.map((notif) => {
                    let Icon = Info;
                    let iconColor = 'text-blue-500';
                    if (notif.severity === 'warning') iconColor = 'text-[#FFB300]';
                    if (notif.severity === 'danger') iconColor = 'text-[#E53935]';
                    if (notif.category === 'ai') {
                      Icon = Sparkles;
                      iconColor = 'text-[#00F2FE]';
                    }

                    return (
                      <div key={notif.id} className="p-3 hover:bg-[#101827] flex gap-2.5 transition-colors">
                        <Icon size={14} className={`flex-shrink-0 mt-0.5 ${iconColor}`} />
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-[11px] font-semibold text-slate-200 truncate flex items-center gap-1.5">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-[#94A3B8] leading-relaxed break-words">{notif.description}</span>
                          <span className="text-[8px] text-slate-500 font-mono mt-1">{formatTimeAgo(notif.timestamp)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg border border-[#1E293B] bg-[#02050D] hover:bg-[#101827] text-slate-400 hover:text-slate-200 transition-all cursor-pointer select-none"
            aria-label="User menu"
          >
            <div className="w-6 h-6 rounded bg-[#0061A4] text-slate-100 flex items-center justify-center font-bold text-xs uppercase">
              {user ? user.name[0] : 'O'}
            </div>
            <span className="text-xs font-medium text-slate-350 hidden md:inline-block pr-1">
              {user ? user.name : 'Ops Console'}
            </span>
            <ChevronDown size={12} className="text-[#94A3B8] hidden md:inline-block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#0B1220] border border-[#1E293B] shadow-2xl z-50 p-1 flex flex-col">
              <div className="px-3 py-2 border-b border-[#1E293B] flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {user ? user.name : 'Operations Room'}
                </span>
                <span className="text-[9px] text-[#94A3B8] font-mono tracking-wider truncate uppercase">
                  Role: {user ? user.role : 'Operations'}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 px-3 py-2 text-xs text-[#E53935] hover:bg-[#E53935]/10 rounded-md transition-colors w-full text-left cursor-pointer"
              >
                <LogOut size={12} />
                Sign Out Terminal
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default TopNav;
