import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/cards/KpiCard';
import { Timeline } from '@/components/shared/Timeline';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { useIncidentStore } from '@/store/ui/incidents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';



// Top KPI static data
const topKpis = [
  { title: 'Active Incidents', value: '3', unit: '', icon: 'AlertCircle' },
  { title: 'Critical Incidents', value: '1', unit: '', icon: 'AlertTriangle' },
  { title: 'Medical Response Time', value: '2.4', unit: 'min', icon: 'HeartPulse' },
  { title: 'Avg Resolution Time', value: '12', unit: 'min', icon: 'Clock' },
  { title: 'Volunteer Dispatches', value: '5', unit: '', icon: 'UserCheck' },
  { title: 'Operational Readiness', value: '96%', unit: '', icon: 'CheckCircle' },
];

export default function IncidentCommanderPage() {
  const {
    incidents,
    selectedIncidentId,
    filters,
    selectIncident,
    setSearch,
    toggleSeverity,
    toggleCategory,
    toggleStatus,
    approvePlan,
    modifyPlan,
    rejectPlan,
    dispatchTeam,
    requestBackup,
    broadcastAlert,
    markResolved,
    escalateIncident,
  } = useIncidentStore();

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || null;

  // Simple filtered list based on search and toggles
  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = filters.search
      ? i.id.includes(filters.search) || i.category.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    const matchesSeverity = filters.severity.length ? filters.severity.includes(i.severity) : true;
    const matchesCategory = filters.category.length ? filters.category.includes(i.category) : true;
    const matchesStatus = filters.status.length ? filters.status.includes(i.status) : true;
    return matchesSearch && matchesSeverity && matchesCategory && matchesStatus;
  });

  // Operator control handlers that just forward to store actions
  const handleControl = (action: () => void) => () => {
    action();
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#0B1220] text-white p-6 space-y-6">
      {/* Header */}
      <PageHeader title="Incident Commander" description="Operational workspace for detection, assessment and resolution of stadium incidents" />

      {/* Top KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {topKpis.map(k => (
          <KpiCard key={k.title} label={k.title} value={k.unit ? `${k.value} ${k.unit}` : k.value} iconName={k.icon} />
        ))}
      </section>

      {/* Main three‑column layout */}
      <section className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* LEFT: Incident Queue */}
        <div className="lg:w-1/3 flex flex-col space-y-4">
          {/* Search & Filters */}
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search incidents…"
              value={filters.search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[#101827] text-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Severity filter buttons */}
            {(['low', 'medium', 'high', 'critical'] as const).map(sev => (
              <Button
                key={sev}
                variant={filters.severity.includes(sev) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSeverity(sev)}
              >
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </Button>
            ))}
            {/* Category filters */}
            {(['Security', 'Medical', 'Crowd'] as const).map(cat => (
              <Button
                key={cat}
                variant={filters.category.includes(cat) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </Button>
            ))}
            {/* Status filters */}
            {(['detected', 'in-progress', 'resolved', 'escalated'] as const).map(st => (
              <Button
                key={st}
                variant={filters.status.includes(st) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleStatus(st)}
              >
                {st}
              </Button>
            ))}
          </div>
          {/* Incident list */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredIncidents.map(inc => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                selected={inc.id === selectedIncidentId}
                onSelect={selectIncident}
              />
            ))}
          </div>
        </div>

        {/* CENTER: Incident Details + AI Action Plan + Controls */}
        <div className="lg:w-1/3 flex flex-col space-y-4">
          {/* Incident Details */}
          <Card className="bg-[#101827] border-none flex-1">
            <CardHeader>
              <CardTitle>{selectedIncident ? `Incident ${selectedIncident.id}` : 'Select an incident'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {selectedIncident ? (
                <>
                  <p><strong>Category:</strong> {selectedIncident.category}</p>
                  <p><strong>Severity:</strong> {selectedIncident.severity}</p>
                  <p><strong>Location:</strong> {selectedIncident.location}</p>
                  <p><strong>Detected:</strong> {selectedIncident.detectionTime}</p>
                  <p><strong>Assigned Team:</strong> {selectedIncident.assignedTeam}</p>
                  <p><strong>Status:</strong> {selectedIncident.status}</p>
                  <p><strong>Summary:</strong> {selectedIncident.summary}</p>
                  <p><strong>Affected Zone:</strong> {selectedIncident.affectedZone}</p>
                  <p><strong>Crowd Impact:</strong> {selectedIncident.crowdImpact}</p>
                </>
              ) : (
                <p className="text-gray-400">Click an incident on the left to view details.</p>
              )}
            </CardContent>
          </Card>

          {/* AI Operational Action Plan */}
          <Card className="bg-[#101827] border-none flex-1">
            <CardHeader>
              <CardTitle>AI Operational Action Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {/* Placeholder static content – would be generated by AI in a real system */}
              <p><strong>Current Situation:</strong> {selectedIncident ? selectedIncident.summary : 'N/A'}</p>
              <p><strong>Root Cause:</strong> {selectedIncident?.category ?? 'N/A'}</p>
              <p><strong>Priority:</strong> {selectedIncident?.severity ?? 'N/A'}</p>
              <p><strong>Recommended Actions:</strong> Monitor, Deploy security, Notify medical staff.</p>
              <p><strong>Resources Required:</strong> 2 security teams, 1 medical unit.</p>
              <p><strong>Estimated Resolution Time:</strong> 15 min</p>
              <p><strong>Expected Risk Reduction:</strong> 80%</p>
              <p><strong>Confidence Score:</strong> 92%</p>
            </CardContent>
          </Card>

          {/* Operator Controls */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={handleControl(approvePlan)} disabled={!selectedIncident}>Approve Plan</Button>
            <Button onClick={handleControl(modifyPlan)} disabled={!selectedIncident}>Modify Plan</Button>
            <Button onClick={handleControl(rejectPlan)} disabled={!selectedIncident}>Reject Plan</Button>
            <Button onClick={handleControl(dispatchTeam)} disabled={!selectedIncident}>Dispatch Team</Button>
            <Button onClick={handleControl(requestBackup)} disabled={!selectedIncident}>Request Backup</Button>
            <Button onClick={handleControl(broadcastAlert)} disabled={!selectedIncident}>Broadcast Alert</Button>
            <Button onClick={handleControl(markResolved)} disabled={!selectedIncident}>Mark Resolved</Button>
            <Button onClick={handleControl(escalateIncident)} disabled={!selectedIncident}>Escalate</Button>
          </div>
        </div>

        {/* RIGHT: Execution Tracker */}
        <div className="lg:w-1/3 flex flex-col space-y-4">
          <Card className="bg-[#101827] border-none flex-1">
            <CardHeader>
              <CardTitle>Execution Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {/* Mock execution data */}
              <p><strong>Assigned Teams:</strong> {selectedIncident?.assignedTeam ?? '—'}</p>
              <p><strong>Current Task:</strong> {selectedIncident?.status === 'in-progress' ? 'Resolving incident' : 'Waiting'}</p>
              <p><strong>ETA:</strong> {selectedIncident?.status === 'in-progress' ? '10 min' : '—'}</p>
              <p><strong>Progress:</strong> {selectedIncident?.status === 'in-progress' ? '45%' : '0%'}</p>
              <p><strong>Checklist:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Assess situation</li>
                <li>Deploy resources</li>
                <li>Monitor crowd impact</li>
                <li>Close incident</li>
              </ul>
              <p><strong>Completion:</strong> {selectedIncident?.status === 'resolved' ? '100%' : selectedIncident?.status === 'in-progress' ? '45%' : '0%'}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bottom Timeline */}
      <section className="mt-6">
        <Card className="bg-[#101827] border-none">
          <CardHeader>
            <CardTitle>Incident Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline
              events={[
                { id: 'evt-1', title: 'Detection',      description: 'Incident detected',            timestamp: '08:12', category: 'incident', severity: 'danger'  },
                { id: 'evt-2', title: 'AI Analysis',    description: 'AI model analysis started',    timestamp: '08:15', category: 'ai',       severity: 'info'    },
                { id: 'evt-3', title: 'Recommendation', description: 'AI recommendation generated',  timestamp: '08:20', category: 'ai',       severity: 'info'    },
                { id: 'evt-4', title: 'Approval',       description: 'Response plan approved',       timestamp: '08:25', category: 'system',   severity: 'primary' },
                { id: 'evt-5', title: 'Dispatch',       description: 'Resources dispatched',         timestamp: '08:30', category: 'incident', severity: 'warning' },
                { id: 'evt-6', title: 'Monitoring',     description: 'Situation being monitored',    timestamp: '08:45', category: 'system',   severity: 'info'    },
                { id: 'evt-7', title: 'Resolution',     description: 'Incident resolved',            timestamp: '09:00', category: 'incident', severity: 'success' },
              ]}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
