'use client';
import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/cards/KpiCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccessibilityStore, type AccessibilityFormValues } from '@/store/accessibilityStore';
import { RequestStatus, RequestPriority, RequestCategory } from '@/features/accessibility/types/accessibility';

const priorityColor: Record<string, string> = {
  low: 'text-slate-400',
  medium: 'text-amber-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};
const statusColor: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400',
  'in-progress': 'bg-amber-500/20 text-amber-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  escalated: 'bg-red-500/20 text-red-400',
};

const initialFormState: AccessibilityFormValues = {
  spectatorName: '',
  category: RequestCategory.WHEELCHAIR,
  priority: RequestPriority.MEDIUM,
  location: 'North Stand',
  status: RequestStatus.OPEN,
  preferredLanguage: 'English',
  need: '',
  destination: 'Assigned area',
};

export default function AccessibilityPage() {
  const {
    requests,
    resources,
    selectedRequestId,
    volunteerLookup,
    filters,
    loading,
    error,
    isSubmitting,
    selectRequest,
    setSearch,
    togglePriority,
    toggleCategory,
    toggleStatus,
    loadRequests,
    retryLoadRequests,
    createRequest,
    updateRequestPriority,
    updateRequestStatus,
    assignVolunteer,
    markCompleted,
    escalatePriority,
    deleteRequest,
  } = useAccessibilityStore();

  const [draft, setDraft] = useState<AccessibilityFormValues>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const selectedRequest = useMemo(() => requests.find((request) => request.id === selectedRequestId) ?? null, [requests, selectedRequestId]);

  const filtered = useMemo(() => requests.filter((request) => {
    const q = filters.search.toLowerCase();
    const matchSearch = !q || request.spectatorName.toLowerCase().includes(q) || request.location.toLowerCase().includes(q);
    const matchPriority = !filters.priority.length || filters.priority.includes(request.priority);
    const matchStatus = !filters.status.length || filters.status.includes(request.status);
    return matchSearch && matchPriority && matchStatus;
  }), [filters.priority, filters.search, filters.status, requests]);

  const openCount = requests.filter((request) => request.status === RequestStatus.OPEN).length;
  const inProgressCount = requests.filter((request) => request.status === RequestStatus.IN_PROGRESS).length;
  const availableResources = resources.filter((resource) => resource.status === 'available').length;

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.spectatorName.trim() || !draft.location.trim()) {
      setFormError('Please enter a spectator name and location.');
      return;
    }
    setFormError(null);
    await createRequest({ ...draft, need: draft.need || `Accessibility support for ${draft.category}` });
    setDraft(initialFormState);
  };

  return (
    <main className="flex flex-col space-y-6">
      <PageHeader title="Accessibility" description="Accessible seating and route monitoring" />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Open Requests" value={String(openCount)} iconName="Accessibility" />
        <KpiCard label="In Progress" value={String(inProgressCount)} iconName="UserCheck" />
        <KpiCard label="Available Resources" value={String(availableResources)} iconName="CheckCircle" />
        <KpiCard label="Total Requests" value={String(requests.length)} iconName="List" />
      </section>

      <section className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/2 flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search requests..."
              value={filters.search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-[#101827] border-[#1E293B] text-slate-200"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {([RequestPriority.LOW, RequestPriority.MEDIUM, RequestPriority.HIGH, RequestPriority.CRITICAL] as const).map((priority) => (
              <Button key={priority} size="sm" variant={filters.priority.includes(priority) ? 'default' : 'outline'} onClick={() => togglePriority(priority)}>
                {priority}
              </Button>
            ))}
            {([RequestStatus.OPEN, RequestStatus.IN_PROGRESS, RequestStatus.COMPLETED] as const).map((status) => (
              <Button key={status} size="sm" variant={filters.status.includes(status) ? 'default' : 'outline'} onClick={() => toggleStatus(status)}>
                {status}
              </Button>
            ))}
          </div>

          <Card className="bg-[#101827] border-[#1E293B]">
            <CardHeader>
              <CardTitle>Create request</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleCreate}>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Spectator name"
                    value={draft.spectatorName}
                    onChange={(event) => setDraft((current) => ({ ...current, spectatorName: event.target.value }))}
                  />
                  <Input
                    placeholder="Location"
                    value={draft.location}
                    onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
                  />
                  <select
                    className="rounded-md border border-[#1E293B] bg-[#0F172A] px-3 py-2 text-sm text-slate-200"
                    value={draft.category}
                    onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as RequestCategory }))}
                  >
                    {Object.values(RequestCategory).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    className="rounded-md border border-[#1E293B] bg-[#0F172A] px-3 py-2 text-sm text-slate-200"
                    value={draft.priority}
                    onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as RequestPriority }))}
                  >
                    {Object.values(RequestPriority).map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                <Input
                  placeholder="Need"
                  value={draft.need}
                  onChange={(event) => setDraft((current) => ({ ...current, need: event.target.value }))}
                />
                {formError ? <p className="text-sm text-red-400">{formError}</p> : null}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Create request'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-2 overflow-y-auto max-h-96">
            {loading ? (
              <p className="text-slate-500 text-sm text-center py-6">Loading accessibility requests…</p>
            ) : null}
            {!loading && error ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                <p>{error}</p>
                <Button className="mt-2" size="sm" onClick={() => void retryLoadRequests()}>
                  Retry
                </Button>
              </div>
            ) : null}
            {!loading && !error && filtered.map((request) => (
              <button
                key={request.id}
                onClick={() => selectRequest(request.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${request.id === selectedRequestId ? 'bg-[#0061A4]/20 border-[#0061A4]/50' : 'bg-[#101827] border-[#1E293B] hover:border-[#0061A4]/30'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-100">{request.spectatorName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[request.status]}`}>{request.status}</span>
                </div>
                <div className="text-xs text-slate-400">{request.category} · {request.location}</div>
                <div className={`text-xs font-medium mt-1 ${priorityColor[request.priority]}`}>{request.priority} priority</div>
                <div className="text-xs text-slate-500 mt-1">Assigned: {request.assignedVolunteerId ? volunteerLookup[request.assignedVolunteerId] ?? 'Volunteer' : 'Unassigned'}</div>
              </button>
            ))}
            {!loading && !error && filtered.length === 0 && requests.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No accessibility requests yet.</p>
            ) : null}
            {!loading && !error && filtered.length === 0 && requests.length > 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No requests match filters.</p>
            ) : null}
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-col gap-4">
          <Card className="bg-[#101827] border-[#1E293B]">
            <CardHeader>
              <CardTitle>{selectedRequest ? `${selectedRequest.spectatorName} — Details` : 'Select a Request'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {selectedRequest ? (
                <>
                  <p><strong>Need:</strong> {selectedRequest.need}</p>
                  <p><strong>Category:</strong> {selectedRequest.category}</p>
                  <p><strong>Location:</strong> {selectedRequest.location} → {selectedRequest.destination}</p>
                  <p><strong>Distance:</strong> {selectedRequest.estimatedDistance}</p>
                  <p><strong>Language:</strong> {selectedRequest.preferredLanguage}</p>
                  <p><strong>Status:</strong> <span className={`px-2 py-0.5 rounded text-xs ${statusColor[selectedRequest.status]}`}>{selectedRequest.status}</span></p>
                  <p><strong>Assigned Volunteer:</strong> {selectedRequest.assignedVolunteerId ? volunteerLookup[selectedRequest.assignedVolunteerId] ?? 'Volunteer' : 'Unassigned'}</p>
                </>
              ) : (
                <p className="text-slate-500">Select a request to view details.</p>
              )}
            </CardContent>
          </Card>

          {selectedRequest ? (
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded-md border border-[#1E293B] bg-[#0F172A] px-3 py-2 text-sm text-slate-200"
                value={selectedRequest.priority}
                onChange={(event) => void updateRequestPriority(selectedRequest.id, event.target.value as RequestPriority)}
              >
                {Object.values(RequestPriority).map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
              <select
                className="rounded-md border border-[#1E293B] bg-[#0F172A] px-3 py-2 text-sm text-slate-200"
                value={selectedRequest.status}
                onChange={(event) => void updateRequestStatus(selectedRequest.id, event.target.value as RequestStatus)}
              >
                {Object.values(RequestStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                className="rounded-md border border-[#1E293B] bg-[#0F172A] px-3 py-2 text-sm text-slate-200"
                value={selectedRequest.assignedVolunteerId ?? ''}
                onChange={(event) => void assignVolunteer(selectedRequest.id, event.target.value)}
              >
                <option value="">Unassigned</option>
                {Object.entries(volunteerLookup).map(([volunteerId, volunteerName]) => (
                  <option key={volunteerId} value={volunteerId}>{volunteerName}</option>
                ))}
              </select>
              <Button size="sm" onClick={() => void markCompleted(selectedRequest.id)} disabled={selectedRequest.status === RequestStatus.COMPLETED}>Mark Complete</Button>
              <Button size="sm" onClick={() => void escalatePriority(selectedRequest.id)} variant="outline">Escalate Priority</Button>
              <Button size="sm" variant="outline" onClick={() => void deleteRequest(selectedRequest.id)}>
                Delete
              </Button>
            </div>
          ) : null}

          <Card className="bg-[#101827] border-[#1E293B]">
            <CardHeader><CardTitle>Resources</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {resources.map((resource) => (
                  <div key={resource.id} className={`p-2 rounded-lg border text-xs ${resource.status === 'available' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : resource.status === 'in-use' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-slate-500/10 border-slate-500/30 text-slate-400'}`}>
                    <div className="font-semibold capitalize">{resource.type}</div>
                    <div className="opacity-70">{resource.status}{resource.location ? ` · ${resource.location}` : ''}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
