import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Incident } from '@/types/incidents/incident';

export interface IncidentState {
  incidents: Incident[];
  selectedIncidentId: string | null;
  filters: {
    search: string;
    severity: string[]; // e.g., ['low','medium','high','critical']
    category: string[];
    status: string[];
  };
  selectIncident: (id: string) => void;
  setSearch: (term: string) => void;
  toggleSeverity: (sev: string) => void;
  toggleCategory: (cat: string) => void;
  toggleStatus: (stat: string) => void;
  // actions for UI state updates (mock)
  approvePlan: () => void;
  modifyPlan: () => void;
  rejectPlan: () => void;
  dispatchTeam: () => void;
  requestBackup: () => void;
  broadcastAlert: () => void;
  markResolved: () => void;
  escalateIncident: () => void;
}

// Mock static incidents data
const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    category: 'Security',
    severity: 'high',
    location: 'North Stand',
    detectionTime: '08:12',
    assignedTeam: 'Team Alpha',
    status: 'in-progress',
    summary: 'Unauthorized access detected near gate.',
    affectedZone: 'North Stand',
    crowdImpact: 'Potential congestion',
  },
  {
    id: 'INC-002',
    category: 'Medical',
    severity: 'critical',
    location: 'Medical Center',
    detectionTime: '08:45',
    assignedTeam: 'Medical Team',
    status: 'detected',
    summary: 'Ambulance arrival required for minor injury.',
    affectedZone: 'Medical Center',
    crowdImpact: 'Low',
  },
  {
    id: 'INC-003',
    category: 'Crowd',
    severity: 'medium',
    location: 'East Stand',
    detectionTime: '09:05',
    assignedTeam: 'Team Beta',
    status: 'in-progress',
    summary: 'Queue forming near concession.',
    affectedZone: 'East Stand',
    crowdImpact: 'Moderate',
  },
];

export const useIncidentStore = create<IncidentState>()(
  devtools((set) => ({
    incidents: mockIncidents,
    selectedIncidentId: null,
    filters: {
      search: '',
      severity: [],
      category: [],
      status: [],
    },
    selectIncident: (id) => set({ selectedIncidentId: id }),
    setSearch: (term) => set(state => ({ filters: { ...state.filters, search: term } })),
    toggleSeverity: (sev) =>
      set(state => {
        const arr = state.filters.severity.includes(sev)
          ? state.filters.severity.filter(s => s !== sev)
          : [...state.filters.severity, sev];
        return { filters: { ...state.filters, severity: arr } };
      }),
    toggleCategory: (cat) =>
      set(state => {
        const arr = state.filters.category.includes(cat)
          ? state.filters.category.filter(c => c !== cat)
          : [...state.filters.category, cat];
        return { filters: { ...state.filters, category: arr } };
      }),
    toggleStatus: (stat) =>
      set(state => {
        const arr = state.filters.status.includes(stat)
          ? state.filters.status.filter(s => s !== stat)
          : [...state.filters.status, stat];
        return { filters: { ...state.filters, status: arr } };
      }),
    // Mock actions – simply log to console for now
    approvePlan: () => console.log('Plan approved'),
    modifyPlan: () => console.log('Plan modified'),
    rejectPlan: () => console.log('Plan rejected'),
    dispatchTeam: () => console.log('Team dispatched'),
    requestBackup: () => console.log('Backup requested'),
    broadcastAlert: () => console.log('Alert broadcast'),
    markResolved: () => console.log('Incident marked resolved'),
    escalateIncident: () => console.log('Incident escalated'),
  }))
);
