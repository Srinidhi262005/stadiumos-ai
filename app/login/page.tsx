'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Lock, Mail, ShieldAlert } from 'lucide-react';
import { loginSchema } from '../../lib/validators';
import { AuthService } from '../../services/api/auth';
import { useNotificationStore } from '../../store/notificationStore';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addNotification = useNotificationStore(state => state.addNotification);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Field-level error messages
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  // Restore email if "Remember Me" was previously selected
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('stadium_remember_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validate inputs with Zod
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: typeof errors = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.login({ email, password });
      
      if (response.success) {
        // Save email if "Remember Me" is checked, otherwise clear it
        if (rememberMe) {
          localStorage.setItem('stadium_remember_email', email);
        } else {
          localStorage.removeItem('stadium_remember_email');
        }

        addNotification({
          title: 'Authentication Successful',
          description: `Welcome back, ${response.data.user.name}. Entering the Decision Command Center.`,
          category: 'system',
          severity: 'success',
        });

        // Redirect to requested URL or dashboard
        const redirectUrl = searchParams.get('from') || '/dashboard';
        router.push(redirectUrl);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrors({
        general: err.message || 'Invalid enterprise credentials or server connectivity issue.',
      });
      
      addNotification({
        title: 'Authentication Failed',
        description: err.message || 'Verification of security token credentials failed.',
        category: 'system',
        severity: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050B14] overflow-hidden select-none">
      
      {/* Background Neon Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#0061A4]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[#00F2FE]/10 blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md p-8 bg-[#0B1220]/80 border border-[#1E293B] rounded-2xl shadow-2xl backdrop-blur-md z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-xl bg-[#0061A4]/25 border border-[#0061A4]/50 text-[#00F2FE] mb-3">
            <Brain size={32} className="animate-pulse" />
          </div>
          <h1 className="font-display font-bold text-2xl tracking-wide text-slate-100 uppercase">
            StadiumOS AI
          </h1>
          <span className="text-[10px] text-[#00F2FE] font-mono tracking-wider uppercase">
            Mega Event Operational Control
          </span>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-2.5 p-3.5 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-normal"
          >
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </motion.div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={12} />
              Enterprise Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ops@stadiumos.com"
              className={`bg-[#02050D] border-[#1E293B] text-slate-200 placeholder-slate-600 focus:border-[#0061A4] ${
                errors.email ? 'border-red-500/50 focus:border-red-500' : ''
              }`}
              required
            />
            {errors.email && (
              <span className="text-[10px] text-red-400 font-medium block mt-0.5">{errors.email}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={12} />
              Security Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`bg-[#02050D] border-[#1E293B] text-slate-200 placeholder-slate-600 focus:border-[#0061A4] ${
                errors.password ? 'border-red-500/50 focus:border-red-500' : ''
              }`}
              required
            />
            {errors.password && (
              <span className="text-[10px] text-red-400 font-medium block mt-0.5">{errors.password}</span>
            )}
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#1E293B] bg-[#02050D] text-[#0061A4] focus:ring-[#0061A4]/30"
              />
              <span className="text-xs text-slate-400 font-medium">Remember email</span>
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-6 bg-[#0061A4] hover:bg-[#0061A4]/80 text-white font-semibold flex items-center justify-center gap-2 border-none shadow-[0_0_15px_rgba(0,97,164,0.3)] hover:shadow-[0_0_20px_rgba(0,97,164,0.5)] transition-all cursor-pointer rounded-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Verify & Access Console'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-[#1E293B]/60 pt-4">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Protected System // FIFA-26 SECURE PORTAL
          </p>
        </div>
      </motion.div>
    </div>
  );
}
