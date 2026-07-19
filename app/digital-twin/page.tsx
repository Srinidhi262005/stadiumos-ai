'use client';
import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/cards/KpiCard';
import { MetricCard } from '@/components/cards/MetricCard';
import { Timeline } from '@/components/shared/Timeline';
import { StadiumMap } from '@/components/digitalTwin/StadiumMap';
import { useDigitalTwinStore } from '@/store/digitalTwinStore';

// Top KPI row data (static)
const topKpis = [
  { title: 'Overall Risk', value: '2.3', unit: '/10', icon: 'AlertTriangle' },
  { title: 'Attendance', value: '78,432', unit: 'spectators', icon: 'Users' },
  { title: 'Medical Readiness', value: 'Excellent', unit: '', icon: 'HeartPulse' },
  { title: 'Volunteer Coverage', value: '92%', unit: '', icon: 'UserCheck' },
  { title: 'Accessibility Score', value: '88%', unit: '', icon: 'Accessibility' },
  { title: 'Operational Readiness', value: '96%', unit: '', icon: 'CheckCircle' },
];

// Bottom timeline mock steps
const bottomSteps = [
  { time: '08:15', label: 'Detection' },
  { time: '08:30', label: 'Analysis' },
  { time: '08:45', label: 'Recommendation' },
  { time: '09:00', label: 'Dispatch' },
  { time: '09:30', label: 'Resolution' },
];

export default function DigitalTwinPage() {
  const { selectedSector, sectorMetrics, sectorStatus, setSectorStatus } = useDigitalTwinStore();

  const metrics = selectedSector ? sectorMetrics[selectedSector] : null;

  const handleAction = (action?: string) => {
    // mock state change: toggle critical status of selected sector for demo
    if (selectedSector) {
      const current = sectorStatus[selectedSector];
      const next = current === 'critical' ? 'normal' : 'critical';
      setSectorStatus(selectedSector, next);
    }
    // In a real app, would trigger AI analysis etc.
    console.log(`Executing AI Twin action: ${action}`);
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#0B1220] text-white p-6">
      <PageHeader title="Stadium Digital Twin" description="Live operational visualization of the stadium" />

      {/* Top KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 my-4">
        {topKpis.map(k => (
          <KpiCard key={k.title} label={k.title} value={k.unit ? `${k.value} ${k.unit}` : k.value} iconName={k.icon} />
        ))}
      </section>

      {/* Main three column layout */}
      <section className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* Left: Stadium Map */}
        <div className="lg:w-1/3 flex items-center justify-center bg-[#101827] rounded-lg p-4">
          <StadiumMap />
        </div>

        {/* Center: Selected Zone Details */}
        <div className="lg:w-1/3 flex flex-col space-y-4">
          <Card className="bg-[#101827] border-none flex-1">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedSector ? `${selectedSector} Details` : 'Select a sector'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics ? (
                <ul className="space-y-2 list-disc list-inside">
                  <li>Attendance: {metrics.attendance}</li>
                  <li>Current Density: {metrics.currentDensity}</li>
                  <li>Predicted Density: {metrics.predictedDensity}</li>
                  <li>Queue Length: {metrics.queueLength}</li>
                  <li>Volunteer Coverage: {metrics.volunteerCoverage}</li>
                  <li>Medical Coverage: {metrics.medicalCoverage}</li>
                  <li>Accessibility: {metrics.accessibilityStatus}</li>
                  <li>Sustainability: {metrics.sustainabilityStatus}</li>
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No sector selected.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: AI Operational Analysis */}
        <div className="lg:w-1/3 flex flex-col space-y-4">
          <Card className="bg-[#101827] border-none flex-1">
            <CardHeader>
              <CardTitle className="text-lg">AI Insight Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Current Situation:</strong> Normal operation.</p>
              <p><strong>Root Cause:</strong> N/A.</p>
              <p><strong>Predicted Impact:</strong> Stable.</p>
              <p><strong>Confidence Score:</strong> 98%</p>
              <p><strong>Recommended Actions:</strong> Monitor.</p>
              <p><strong>Estimated Resolution Time:</strong> N/A</p>
            </CardContent>
          </Card>
          <div className="flex flex-col space-y-2">
            <Button onClick={() => handleAction('explain')} variant="outline">Explain Situation</Button>
            <Button onClick={() => handleAction('plan')} variant="outline">Generate Action Plan</Button>
            <Button onClick={() => handleAction('dispatch')} variant="outline">Dispatch Volunteers</Button>
            <Button onClick={() => handleAction('report')} variant="outline">Generate Incident Report</Button>
          </div>
        </div>
      </section>

      {/* Bottom Timeline */}
      <section className="mt-6">
        <MetricCard title="Live Operational Timeline" value="" />
        <Timeline events={bottomSteps.map(step => ({
  id: `${step.time}-${step.label}`,
  title: step.label,
  description: step.label,
  timestamp: step.time,
  category: 'system',
  severity: 'info'
}))} />
      </section>
    </main>
  );
}
