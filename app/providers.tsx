'use client';

import React from 'react';
import { ThemeProvider } from '../providers/ThemeProvider';
import { ToastProvider } from '../providers/ToastProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}

export default Providers;
