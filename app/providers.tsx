
'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '../providers/ThemeProvider';
import { ToastProvider } from '../providers/ToastProvider';
import { Shell } from '../components/layout/Shell';
import { useAuthStore } from '../store/authStore';
import type { UserProfile } from '../types/auth';
import { getCookie } from '../lib/cookies';
import { AuthService } from '../services/api/auth';
import { useRealtimeInitialization } from '../lib/useRealtimeInitialization';
import { useNotificationStore } from '../store/notificationStore';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Initialize realtime connection
  useRealtimeInitialization();

  useEffect(() => {
    async function restoreSession() {
      const isBrowser = typeof window !== 'undefined';

      const isDemo =
        isBrowser &&
        localStorage.getItem('demo-auth') === 'true';

      // -------------------------
      // DEMO SESSION
      // -------------------------
      if (isDemo) {
        try {
          const savedUser = localStorage.getItem('stadium_user');

          if (savedUser) {
            const user = JSON.parse(savedUser) as UserProfile;

            useAuthStore.setState({
              isAuthenticated: true,
              token: 'demo-token',
              user,
            });
          }

          return;
        } catch (err) {
          console.error('Failed to restore demo session:', err);

          useAuthStore.setState({
            isAuthenticated: false,
            token: null,
            user: null,
          });

          return;
        }
      }

      // -------------------------
      // REAL SESSION
      // -------------------------
      const savedToken = getCookie('stadium_session');

      if (savedToken && !token) {
        try {
          useAuthStore.setState({
            token: savedToken,
          });

          const userResult =
            await AuthService.getCurrentUser();

          if (userResult.success) {
            useAuthStore.setState({
              isAuthenticated: true,
              token: savedToken,
              user: userResult.data,
            });

            try {
              await useNotificationStore
                .getState()
                .loadNotifications();
            } catch (err) {
              console.error(
                'Notification loading failed:',
                err
              );
            }
          }
        } catch (err) {
          console.error(
            'Failed to restore session:',
            err
          );

          useAuthStore.setState({
            isAuthenticated: false,
            token: null,
            user: null,
          });
        }
      }
    }

    restoreSession();
  }, [token]);

  useEffect(() => {
    const isDemo =
      typeof window !== 'undefined' &&
      localStorage.getItem('demo-auth') === 'true';

    if (!isDemo && isAuthenticated) {
      useNotificationStore
        .getState()
        .loadNotifications()
        .catch((err) =>
          console.error(
            'Notification loading failed:',
            err
          )
        );
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLoginPage = pathname === '/login';

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthInitializer>
          {isLoginPage ? (
            children
          ) : (
            <Shell>{children}</Shell>
          )}
        </AuthInitializer>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default Providers;