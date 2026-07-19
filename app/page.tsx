'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export default function RootPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const t = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/dashboard');
        return;
      }

      if (typeof window !== 'undefined' && localStorage.getItem('demo-auth') === 'true') {
        router.replace('/dashboard');
        return;
      }

      router.replace('/login');
    }, 120);
    return () => clearTimeout(t);
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#050B14] via-[#071422] to-[#0E1D2D] px-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800/80 bg-slate-950/70 p-8 shadow-2xl backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">StadiumOS AI</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Preparing your live operations command center…</h1>
        <p className="mt-3 text-sm text-slate-300">
          The platform is restoring your session and routing you to the most relevant view for the demo.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400" />
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400/70" />
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400/40" />
        </div>
      </div>
    </div>
  );
}
