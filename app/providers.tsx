'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '../providers/ThemeProvider';
import { ToastProvider } from '../providers/ToastProvider';
import { Shell } from '../components/layout/Shell';
import { useAuthStore } from '../store/authStore';
import { getCookie } from '../lib/cookies';
import { AuthService } from '../services/api/auth';
import { useRealtimeInitialization } from '../lib/useRealtimeInitialization';
import { useNotificationStore } from '../store/notificationStore';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Initialize realtime connection after authentication
  useRealtimeInitialization();

  useEffect(() => {
    async function restoreSession() {
      const savedToken = getCookie('stadium_session');
      if (savedToken && !token) {
        try {
          useAuthStore.setState({ token: savedToken });
          const userResult = await AuthService.getCurrentUser();
          if (userResult.success) {
            useAuthStore.setState({
              isAuthenticated: true,
              token: savedToken,
              user: userResult.data,
            });
            await useNotificationStore.getState().loadNotifications();
          }
        } catch (e) {
          console.error('Failed to restore session:', e);
          useAuthStore.setState({ token: null, isAuthenticated: false, user: null });
        }
      }
    }
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      useNotificationStore.getState().loadNotifications();
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthInitializer>
          {isLoginPage ? children : <Shell>{children}</Shell>}
        </AuthInitializer>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default Providers;
