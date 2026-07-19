import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { IncidentService } from '@/services/api/incident';
import { useNotificationStore } from '@/store/notificationStore';
import { Incident } from '@/types/incidents/incident';

export interface IncidentState {
  incidents: Incident[];
  selectedIncidentId: string | null;
  filters: {
    search: string;
    severity: string[];
    category: string[];
    status: string[];
  };
  loading: boolean;
  error: string | null;
  isRealtimeConnected: boolean;
  selectIncident: (id: string) => void;
  setSearch: (term: string) => void;
  toggleSeverity: (sev: string) => void;
  toggleCategory: (cat: string) => void;
  toggleStatus: (stat: string) => void;
  loadIncidents: () => Promise<void>;
  refreshIncidents: () => Promise<void>;
  approvePlan: () => Promise<void>;
  modifyPlan: () => Promise<void>;
  rejectPlan: () => Promise<void>;
  dispatchTeam: () => Promise<void>;
  requestBackup: () => Promise<void>;
  broadcastAlert: () => Promise<void>;
  markResolved: () => Promise<void>;
  escalateIncident: () => Promise<void>;
  setRealtimeConnected: (connected: boolean) => void;
  addIncident: (incident: any) => void;
  updateIncidentRealtime: (incident: any) => void;
  deleteIncidentRealtime: (id: string) => void;
}

type IncidentLike = Partial<Incident> & Record<string, unknown>;

const normalizeIncident = (incident: Incident | IncidentLike): Incident => {
  const record = incident as IncidentLike;
  const severityValue = typeof record.severity === 'string' ? record.severity.toLowerCase() : 'medium';
  const statusValue = typeof record.status === 'string' ? record.status.toLowerCase() : 'detected';
  
  // Map backend status 'reported' / 'acknowledged' / 'dispatching' / 'resolved' to UI status 'detected' / 'in-progress' / 'resolved' / 'escalated'
  let mappedStatus = statusValue;
  if (statusValue === 'reported') mappedStatus = 'detected';
  if (statusValue === 'acknowledged' || statusValue === 'dispatching') mappedStatus = 'in-progress';

  const validSeverity = ['low', 'medium', 'high', 'critical'].includes(severityValue) ? severityValue : 'medium';
  const validStatus = ['detected', 'in-progress', 'resolved', 'escalated'].includes(mappedStatus) ? mappedStatus : 'detected';

  return {
    id: String(record.id ?? ''),
    category: typeof record.category === 'string' ? record.category : 'Security',
    severity: validSeverity as Incident['severity'],
    location: typeof record.location === 'string' ? record.location : 'Unspecified',
    detectionTime: typeof record.reported_at === 'string' && record.reported_at
      ? new Date(record.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : typeof record.reportedAt === 'string' && record.reportedAt
      ? new Date(record.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Unknown',
    assignedTeam: (typeof record.assigned_team === 'string' && record.assigned_team) 
      ? record.assigned_team 
      : (typeof record.assignedTeam === 'string' && record.assignedTeam)
      ? record.assignedTeam
      : 'Unassigned',
    status: validStatus as Incident['status'],
    summary: typeof record.description === 'string' && record.description 
      ? record.description 
      : typeof record.summary === 'string' && record.summary
      ? record.summary
      : 'No summary available',
    affectedZone: typeof record.affected_zone === 'string' && record.affected_zone 
      ? record.affected_zone 
      : typeof record.affectedZone === 'string' && record.affectedZone
      ? record.affectedZone
      : 'Unassigned',
    crowdImpact: typeof record.crowd_impact === 'string' && record.crowd_impact 
      ? record.crowd_impact 
      : typeof record.crowdImpact === 'string' && record.crowdImpact
      ? record.crowdImpact
      : 'Low',
    images: Array.isArray(record.images) ? record.images.filter((value): value is string => typeof value === 'string') : [],
  };
};

const buildNotification = (title: string, description: string) => ({
  title,
  description,
  category: 'system' as const,
  severity: 'info' as const,
});

export const useIncidentStore = create<IncidentState>()(
  devtools((set, get) => ({
    incidents: [],
    selectedIncidentId: null,
    filters: {
      search: '',
      severity: [],
      category: [],
      status: [],
    },
    loading: false,
    error: null,
    isRealtimeConnected: false,
    selectIncident: (id) => set({ selectedIncidentId: id }),
    setSearch: (term) => set((state) => ({ filters: { ...state.filters, search: term } })),
    toggleSeverity: (sev) =>
      set((state) => {
        const arr = state.filters.severity.includes(sev)
          ? state.filters.severity.filter((s) => s !== sev)
          : [...state.filters.severity, sev];
        return { filters: { ...state.filters, severity: arr } };
      }),
    toggleCategory: (cat) =>
      set((state) => {
        const arr = state.filters.category.includes(cat)
          ? state.filters.category.filter((c) => c !== cat)
          : [...state.filters.category, cat];
        return { filters: { ...state.filters, category: arr } };
      }),
    toggleStatus: (stat) =>
      set((state) => {
        const arr = state.filters.status.includes(stat)
          ? state.filters.status.filter((s) => s !== stat)
          : [...state.filters.status, stat];
        return { filters: { ...state.filters, status: arr } };
      }),
    loadIncidents: async () => {
      set({ loading: true, error: null });
      try {
        const response = await IncidentService.getIncidents();
        const normalized = response.map((incident) => normalizeIncident(incident));
        const selectedIncidentId = normalized[0]?.id ?? null;
        set({ 
          incidents: normalized, 
          selectedIncidentId: get().selectedIncidentId && normalized.some((item) => item.id === get().selectedIncidentId) 
            ? get().selectedIncidentId 
            : selectedIncidentId, 
          loading: false 
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load incidents';
        set({ error: message, loading: false });
      }
    },
    refreshIncidents: async () => {
      await get().loadIncidents();
    },
    approvePlan: async () => {
      const selectedIncidentId = get().selectedIncidentId;
      if (!selectedIncidentId) return;

      try {
        const updated = await IncidentService.updateIncident(selectedIncidentId, { status: 'acknowledged' });
        const normalized = normalizeIncident(updated);
        set((state) => ({ incidents: state.incidents.map((incident) => incident.id === selectedIncidentId ? normalized : incident) }));
        useNotificationStore.getState().addNotification(buildNotification('Plan approved', 'The incident response plan is now active.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to approve the plan';
        set({ error: message });
      }
    },
    modifyPlan: async () => {
      const selectedIncidentId = get().selectedIncidentId;
      if (!selectedIncidentId) return;

      try {
        const updated = await IncidentService.updateIncident(selectedIncidentId, { status: 'reported' });
        const normalized = normalizeIncident(updated);
        set((state) => ({ incidents: state.incidents.map((incident) => incident.id === selectedIncidentId ? normalized : incident) }));
        useNotificationStore.getState().addNotification(buildNotification('Plan updated', 'The response plan has been adjusted for the selected incident.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to modify the plan';
        set({ error: message });
      }
    },
    rejectPlan: async () => {
      const selectedIncidentId = get().selectedIncidentId;
      if (!selectedIncidentId) return;

      try {
        const updated = await IncidentService.updateIncident(selectedIncidentId, { status: 'reported' });
        const normalized = normalizeIncident(updated);
        set((state) => ({ incidents: state.incidents.map((incident) => incident.id === selectedIncidentId ? normalized : incident) }));
        useNotificationStore.getState().addNotification(buildNotification('Plan rejected', 'The current plan has been paused for review.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to reject the plan';
        set({ error: message });
      }
    },
    dispatchTeam: async () => {
      const selectedIncidentId = get().selectedIncidentId;
      if (!selectedIncidentId) return;

      try {
        const updated = await IncidentService.updateIncident(selectedIncidentId, { status: 'dispatching', assigned_team: 'Dispatch Team' });
        const normalized = normalizeIncident(updated);
        set((state) => ({ incidents: state.incidents.map((incident) => incident.id === selectedIncidentId ? normalized : incident) }));
        useNotificationStore.getState().addNotification(buildNotification('Team dispatched', 'Response resources have been assigned to the incident.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to dispatch the team';
        set({ error: message });
      }
    },
    requestBackup: async () => {
      const selectedIncidentId = get().selectedIncidentId;
      if (!selectedIncidentId) return;

      try {
        const updated = await IncidentService.updateIncident(selectedIncidentId, { status: 'dispatching', assigned_team: 'Backup Team' });
        const normalized = normalizeIncident(updated);
        set((state) => ({ incidents: state.incidents.map((incident) => incident.id === selectedIncidentId ? normalized : incident) }));
        useNotificationStore.getState().addNotification(buildNotification('Backup requested', 'A backup unit has been requested for the incident.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to request backup';
        set({ error: message });
      }
    },
    broadcastAlert: async () => {
      const selectedIncidentId = get().selectedIncidentId;
      if (!selectedIncidentId) return;

      try {
        const updated = await IncidentService.updateIncident(selectedIncidentId, { status: 'dispatching' });
        const normalized = normalizeIncident(updated);
        set((state) => ({ incidents: state.incidents.map((incident) => incident.id === selectedIncidentId ? normalized : incident) }));
        useNotificationStore.getState().addNotification(buildNotification('Alert broadcast', 'The incident update has been broadcast to the response team.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to broadcast the alert';
        set({ error: message });
      }
    },
    markResolved: async () => {
      const selectedIncidentId = get().selectedIncidentId;
      if (!selectedIncidentId) return;

      try {
        const updated = await IncidentService.updateIncident(selectedIncidentId, { status: 'resolved' });
        const normalized = normalizeIncident(updated);
        set((state) => ({ incidents: state.incidents.map((incident) => incident.id === selectedIncidentId ? normalized : incident) }));
        useNotificationStore.getState().addNotification(buildNotification('Incident resolved', 'The selected incident has been marked resolved.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to resolve the incident';
        set({ error: message });
      }
    },
    escalateIncident: async () => {
      const selectedIncidentId = get().selectedIncidentId;
      if (!selectedIncidentId) return;

      try {
        const updated = await IncidentService.updateIncident(selectedIncidentId, { status: 'dispatching', severity: 'critical' });
        const normalized = normalizeIncident(updated);
        set((state) => ({ incidents: state.incidents.map((incident) => incident.id === selectedIncidentId ? normalized : incident) }));
        useNotificationStore.getState().addNotification(buildNotification('Incident escalated', 'The incident has been escalated for additional support.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to escalate the incident';
        set({ error: message });
      }
    },
    setRealtimeConnected: (connected) => set({ isRealtimeConnected: connected }),
    addIncident: (incident) => set((state) => {
      const normalized = normalizeIncident(incident);
      if (state.incidents.some(i => i.id === normalized.id)) {
        return {}; // prevent duplicate
      }
      return {
        incidents: [normalized, ...state.incidents],
        selectedIncidentId: state.selectedIncidentId ?? normalized.id,
      };
    }),
    updateIncidentRealtime: (incident) => set((state) => {
      const normalized = normalizeIncident(incident);
      return {
        incidents: state.incidents.map(i => i.id === normalized.id ? normalized : i),
      };
    }),
    deleteIncidentRealtime: (id) => set((state) => ({
      incidents: state.incidents.filter(i => i.id !== id),
      selectedIncidentId: state.selectedIncidentId === id ? null : state.selectedIncidentId,
    })),
  }))
);

export default useIncidentStore;
