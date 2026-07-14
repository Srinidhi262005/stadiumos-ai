'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotificationStore } from '../store/notificationStore';
import { AlertCircle, CheckCircle, Info, Sparkles, X } from 'lucide-react';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { notifications, clearNotification } = useNotificationStore();
  
  // Display only active unread notifications as toasts (cap at 3)
  const activeToasts = notifications.filter(n => !n.read).slice(0, 3);

  return (
    <>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {activeToasts.map((toast) => {
            let Icon = Info;
            let iconColor = 'text-blue-500';
            let borderColor = 'border-slate-800';
            let glowColor = '';

            if (toast.severity === 'success') {
              Icon = CheckCircle;
              iconColor = 'text-[#00C853]';
            } else if (toast.severity === 'warning') {
              Icon = AlertCircle;
              iconColor = 'text-[#FFB300]';
            } else if (toast.severity === 'danger') {
              Icon = AlertCircle;
              iconColor = 'text-[#E53935]';
            }

            if (toast.category === 'ai') {
              Icon = Sparkles;
              iconColor = 'text-[#00F2FE]';
              borderColor = 'border-[#0061A4]/40';
              glowColor = 'shadow-[0_0_15px_rgba(0,97,164,0.15)]';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg bg-[#0B1220]/95 border ${borderColor} ${glowColor} shadow-2xl backdrop-blur-md`}
              >
                <div className={`mt-0.5 ${iconColor}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                    {toast.category === 'ai' && (
                      <span className="text-[9px] bg-[#0061A4]/30 text-[#00F2FE] px-1.5 py-0.2 rounded border border-[#0061A4]/50 tracking-wider uppercase font-mono">
                        AI Insight
                      </span>
                    )}
                    {toast.title}
                  </span>
                  <span className="text-[11px] text-slate-400 leading-normal">{toast.description}</span>
                </div>
                <button
                  onClick={() => clearNotification(toast.id)}
                  className="text-slate-500 hover:text-slate-300 transition-colors pointer-events-auto"
                  aria-label="Dismiss toast"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}

export default ToastProvider;
