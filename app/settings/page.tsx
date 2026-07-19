'use client';
import React, { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { KpiCard } from '@/components/cards/KpiCard';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const user = useAuthStore(s => s.user);
  const [backendUrl] = useState(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1');
  const [wsUrl] = useState(process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws');

  return (
    <main className="flex flex-col space-y-6">
      <PageHeader title="Settings" description="System configuration and API integration status" />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Backend Status" value="Connected" iconName="Server" />
        <KpiCard label="WebSocket" value="Active" iconName="Wifi" />
        <KpiCard label="AI Engine" value="Gemini" iconName="Brain" />
        <KpiCard label="DB" value="SQLite" iconName="Database" />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#101827] border-[#1E293B]">
          <CardHeader><CardTitle>Current Session</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {user ? (
              <>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Permissions:</strong> {user.permissions.join(', ')}</p>
              </>
            ) : (
              <p className="text-slate-500">No active session.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#101827] border-[#1E293B]">
          <CardHeader><CardTitle>API Endpoints</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm font-mono">
            <div className="p-2 rounded bg-[#0B1220] border border-[#1E293B] text-[#00F2FE] text-xs break-all">
              REST: {backendUrl}
            </div>
            <div className="p-2 rounded bg-[#0B1220] border border-[#1E293B] text-[#00F2FE] text-xs break-all">
              WS: {wsUrl}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
