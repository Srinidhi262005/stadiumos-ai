import { create } from 'zustand';
import { Incident, IncidentSeverity, IncidentStatus } from '../types/incident';

interface IncidentStoreState {
  incidents: Incident[];
  selectedSeverity: IncidentSeverity | 'all';
  selectedStatus: IncidentStatus | 'all';
  selectedIncidentId: string | null;
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  setSelectedSeverity: (severity: IncidentSeverity | 'all') => void;
  setSelectedStatus: (status: IncidentStatus | 'all') => void;
  setSelectedIncidentId: (id: string | null) => void;
}

export const useIncidentStore = create<IncidentStoreState>((set) => ({
  incidents: [],
  selectedSeverity: 'all',
  selectedStatus: 'all',
  selectedIncidentId: null,
  setIncidents: (incidents) => set({ incidents }),
  addIncident: (incident) => set((state) => ({ incidents: [incident, ...state.incidents] })),
  updateIncidentStatus: (id, status) => set((state) => ({
    incidents: state.incidents.map(inc => inc.id === id ? { ...inc, status, resolvedAt: status === 'resolved' ? new Date().toISOString() : inc.resolvedAt } : inc)
  })),
  setSelectedSeverity: (selectedSeverity) => set({ selectedSeverity }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
  setSelectedIncidentId: (selectedIncidentId) => set({ selectedIncidentId })
}));
export default useIncidentStore;
