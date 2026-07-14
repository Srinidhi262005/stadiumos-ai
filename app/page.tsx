'use client';
import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import KpiCard from "@/components/cards/KpiCard";
import MetricCard from "@/components/cards/MetricCard";
import Timeline from "@/components/shared/Timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Static data for the AI Command Center
const kpis = [
  { title: "Attendance", value: "78,432", unit: "spectators", icon: "Users" },
  { title: "Operational Readiness", value: "96%", unit: "", icon: "CheckCircle" },
  { title: "Risk Score", value: "2.3", unit: "/10", icon: "AlertTriangle" },
  { title: "Weather", value: "22°C, Clear", icon: "Sun" },
  { title: "Volunteer Status", value: "124 Active", icon: "UserCheck" },
  { title: "Medical Status", value: "3 Cases", icon: "HeartPulse" },
  { title: "Sustainability", value: "Eco‑Score 89%", icon: "Leaf" },
  { title: "Crowd Status", value: "Normal Flow", icon: "Users" },
];

const quickActions = [
  { label: "Open Incident Report", onClick: () => {} },
  { label: "Broadcast Message", onClick: () => {} },
  { label: "Adjust Lighting", onClick: () => {} },
];

const timelineEvents = [
  { time: "08:00", description: "Stadium gates opened" },
  { time: "09:30", description: "Security sweep completed" },
  { time: "10:15", description: "AI predictive model updated" },
  { time: "11:45", description: "Volunteer shift change" },
];

const notifications = [
  "⚠️  Risk score increased to 2.5",
  "✅  Weather conditions optimal",
  "🚑  Medical team responded to minor injury",
];

export default function AICommandCenterPage() {
  return (
    <main className="flex min-h-screen flex-col space-y-8 p-8 bg-[#0B1220] text-white">
      <PageHeader
        title="AI Command Center"
        description="Real‑time operational overview for StadiumOS AI"
      />

      {/* AI Insight Card */}
      <Card className="bg-[#101827] border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">AI Operational Brief</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Predictive capacity at 96%. All critical systems nominal. Expected crowd density peaks at 78 % capacity during halftime.
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <section className="flex space-x-4">
        {quickActions.map((action, idx) => (
          <Button key={idx} variant="outline" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            label={kpi.title}
            value={kpi.unit ? `${kpi.value} ${kpi.unit}` : kpi.value}
            iconName={kpi.icon}
          />
        ))}
      </section>

      {/* Operational Timeline */}
      <section>
        <MetricCard title="Operational Timeline" value="" />
        <Timeline events={timelineEvents.map(event => ({ id: `${event.time}-${event.description}`, title: event.description, description: event.description, timestamp: event.time, category: 'system', severity: 'info' }))} />
      </section>

      {/* Risk Gauge */}
      <section>
        <MetricCard title="Risk Score" value="2.3 /10" />
      </section>

      {/* Recent Notifications */}
      <section>
        <MetricCard title="Recent Notifications" value="" />
        <ul className="list-disc pl-5 space-y-1">
          {notifications.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      </section>

      {/* AI Command Console */}
      <section className="space-y-2">
        <MetricCard title="AI Command Console" value="" />
        <Input placeholder="Enter AI command…" className="bg-[#101827] text-white" />
        <Button disabled>Execute</Button>
      </section>
    </main>
  );
}
