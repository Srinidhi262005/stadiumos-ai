'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/PageHeader';
import KpiCard from '@/components/cards/KpiCard';
import MetricCard from '@/components/cards/MetricCard';
import Timeline from '@/components/shared/Timeline';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNotificationStore } from '@/store/notificationStore';
import { useDashboardStore } from '@/store/dashboardStore';

export default function DashboardPage() {
  const router = useRouter();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { stats, timeline, loading, error, loadDashboardData } = useDashboardStore((state) => ({
    stats: state.stats,
    timeline: state.timeline,
    loading: state.loading,
    error: state.error,
    loadDashboardData: state.loadDashboardData,
  }));

  useEffect(() => {
    void loadDashboardData();

    const timer = setTimeout(() => {
      addNotification({
        title: 'AI Insight: Crowd Surge Predicted',
        description: 'Gate 4 expected 15% above capacity in 20 min. Recommend rerouting.',
        category: 'ai',
        severity: 'warning',
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [addNotification, loadDashboardData]);

  const kpis = stats
    ? [
        { title: 'Active Incidents', value: stats.active_incidents, icon: 'AlertTriangle' as const },
        { title: 'Critical Incidents', value: stats.critical_incidents, icon: 'Shield' as const },
        { title: 'Volunteer Coverage', value: `${stats.volunteer_coverage_pct}%`, icon: 'UserCheck' as const },
        { title: 'Accessibility Score', value: `${stats.accessibility_score_pct}%`, icon: 'Accessibility' as const },
        { title: 'Operational Readiness', value: `${stats.operational_readiness_pct}%`, icon: 'CheckCircle' as const },
        { title: 'Medical Response', value: `${stats.medical_response_time_min.toFixed(1)} min`, icon: 'HeartPulse' as const },
        { title: 'Open Accessibility Requests', value: stats.open_accessibility_requests, icon: 'Accessibility' as const },
        { title: 'Active Match', value: stats.active_match, icon: 'Users' as const },
      ]
    : [];

  const timelineEvents = timeline.map((event) => ({
    ...event,
    category: event.category as 'system' | 'incident' | 'crowd' | 'volunteer' | 'ai',
    severity: event.severity as 'success' | 'warning' | 'danger' | 'primary' | 'info',
  }));

  const scenarioSummary = stats
    ? `Operational readiness is ${stats.operational_readiness_pct}%. ${stats.active_match} is active and ${stats.critical_incidents} critical incidents remain under monitoring.`
    : 'Loading live operational data from the backend…';

  return (
    <main className="flex flex-col space-y-6">
      <PageHeader
        title="AI Command Center"
        description="Real-time operational overview for StadiumOS AI"
      />

      <Card className="border border-[#1E293B] bg-[#101827] shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-100">Live Demo Narrative</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-300">{scenarioSummary}</p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">Gate A crowd surge</span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">Medical response prepared</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">Volunteer coverage steady</span>
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => router.push('/incidents')}>Open Incident Report</Button>
        <Button variant="outline" onClick={() => router.push('/crowd')}>View Crowd Flow</Button>
        <Button variant="outline" onClick={() => router.push('/volunteers')}>Manage Volunteers</Button>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading && <div className="col-span-full rounded-lg border border-slate-800 bg-[#101827] p-4 text-sm text-slate-300">Loading dashboard data…</div>}
        {error && <div className="col-span-full rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">{error}</div>}
        {!loading && !error && !stats && <div className="col-span-full rounded-lg border border-slate-800 bg-[#101827] p-4 text-sm text-slate-300">No dashboard data available yet.</div>}
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            label={kpi.title}
            value={kpi.value}
            iconName={kpi.icon}
          />
        ))}
      </section>

      <section>
        <MetricCard title="Operational Timeline" value="" />
        {timelineEvents.length > 0 ? <Timeline events={timelineEvents} /> : !loading && <p className="mt-3 text-sm text-slate-400">No timeline events were returned by the backend.</p>}
      </section>

      <section>
        <MetricCard title="Risk Summary" value={stats ? `${stats.critical_incidents} critical / ${stats.active_incidents} active` : '--'} />
      </section>
    </main>
  );
}
