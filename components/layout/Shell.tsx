'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useUiStore } from '../../store/uiStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Brain } from 'lucide-react';
import { NAV_ITEMS } from '../../constants/navigation';
import { useRouter } from 'next/navigation';
import { ICONS } from '../../constants/icons';

export function Shell({ children }: { children: React.ReactNode }) {
  const { 
    searchOpen, 
    setSearchOpen, 
    isMobileMenuOpen, 
    setMobileMenuOpen 
  } = useUiStore();
  
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Bind command keybinding listener: Cmd/Ctrl + K toggles search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  const filteredNavItems = NAV_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#02050D] text-slate-100 overflow-hidden font-sans">
      
      {/* 1. Desktop Layout Navigation Sidebar */}
      <Sidebar />

      {/* 2. Primary Operations Panel Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header navbar actions */}
        <TopNav />
        
        {/* Central screen content viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8 focus:outline-none">
          {children}
        </main>
      </div>

      {/* 3. Mobile Navigation Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-[#0B1220] border-r border-[#1E293B] z-50 flex flex-col p-4 md:hidden"
            >
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="text-[#00F2FE]" size={20} />
                  <span className="font-display font-bold text-sm tracking-wide text-slate-100 uppercase">
                    StadiumOS AI
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-[#1E293B] hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = ICONS[item.iconName as keyof typeof ICONS] || Brain;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#94A3B8] hover:bg-[#101827] hover:text-slate-200 w-full text-left cursor-pointer"
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 4. Global Search Modal Dialog Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-lg bg-[#0B1220] border border-[#1E293B] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Global System Search"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E293B] bg-[#02050D]">
                <Search size={16} className="text-slate-500" />
                <input
                  type="text"
                  placeholder="Type a route, section, or system key (e.g. Incidents)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 outline-none text-slate-200 placeholder-slate-500 text-sm flex-1 w-full"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded hover:bg-[#101827] text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                  aria-label="Close search"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                <div className="text-[10px] font-mono tracking-wider text-slate-500 px-3 py-1.5 uppercase font-bold">
                  Navigation Nodes
                </div>
                {filteredNavItems.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#94A3B8]">
                    No search results found.
                  </div>
                ) : (
                  filteredNavItems.map((item) => {
                    const Icon = ICONS[item.iconName as keyof typeof ICONS] || Brain;
                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          router.push(item.href);
                          setSearchOpen(false);
                        }}
                        className="flex items-start gap-3 w-full p-2.5 rounded-lg text-left hover:bg-[#101827] group transition-colors cursor-pointer"
                      >
                        <div className="p-1.5 rounded-md bg-[#02050D] border border-[#1E293B] text-slate-400 group-hover:text-[#00F2FE] group-hover:border-[#0061A4] transition-all">
                          <Icon size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-slate-100">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-[#94A3B8] leading-normal">
                            {item.description}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Shell;
