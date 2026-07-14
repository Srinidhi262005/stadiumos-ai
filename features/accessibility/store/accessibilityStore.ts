import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AccessibilityRequest, AccessibilityResource } from '@/features/accessibility/types/accessibility';

export interface AccessibilityState {
  requests: AccessibilityRequest[];
  resources: AccessibilityResource[];
  selectedRequestId: string | null;
  filters: {
    search: string;
    priority: string[]; // low, medium, high, critical
    category: string[]; // wheelchair, visual, etc.
    status: string[]; // open, in-progress, completed, escalated
  };
  // actions
  selectRequest: (id: string) => void;
  setSearch: (term: string) => void;
  togglePriority: (p: string) => void;
  toggleCategory: (c: string) => void;
  toggleStatus: (s: string) => void;
  assignVolunteer: (requestId: string, volunteerId: string) => void;
  changeRoute: (requestId: string) => void;
  markCompleted: (requestId: string) => void;
  escalatePriority: (requestId: string) => void;
}

// Mock data
const mockRequests: AccessibilityRequest[] = [
  {
    id: 'AR-001',
    spectatorName: 'John Smith',
    category: 'wheelchair',
    priority: 'high',
    location: 'North Stand',
    assignedVolunteerId: undefined,
    status: 'open',
    need: 'Wheelchair assistance to seat',
    preferredLanguage: 'English',
    destination: 'Seat 12A',
    estimatedDistance: '200m',
  },
  {
    id: 'AR-002',
    spectatorName: 'Maria Garcia',
    category: 'visual',
    priority: 'medium',
    location: 'East Stand',
    assignedVolunteerId: 'V001',
    status: 'in-progress',
    need: 'Guided escort to restroom',
    preferredLanguage: 'Spanish',
    destination: 'Restroom',
    estimatedDistance: '120m',
  },
  {
    id: 'AR-003',
    spectatorName: 'Li Wei',
    category: 'senior',
    priority: 'low',
    location: 'Food Court',
    assignedVolunteerId: undefined,
    status: 'open',
    need: 'Seat with easy access',
    preferredLanguage: 'Chinese',
    destination: 'Seat 34B',
    estimatedDistance: '80m',
  },
];

const mockResources: AccessibilityResource[] = [
  { id: 'R-WC-01', type: 'wheelchair', status: 'available', location: 'Storage' },
  { id: 'R-ESC-01', type: 'escort', status: 'available' },
  { id: 'R-ELEV-01', type: 'elevator', status: 'in-use', location: 'North Tower' },
  { id: 'R-REST-01', type: 'restroom', status: 'available', location: 'West Wing' },
  { id: 'R-RAMP-01', type: 'ramp', status: 'available', location: 'Gate A' },
];

export const useAccessibilityStore = create<AccessibilityState>()(
  devtools((set, get) => ({
    requests: mockRequests,
    resources: mockResources,
    selectedRequestId: null,
    filters: { search: '', priority: [], category: [], status: [] },
    selectRequest: (id) => set({ selectedRequestId: id }),
    setSearch: (term) => set(state => ({ filters: { ...state.filters, search: term } })),
    togglePriority: (p) =>
      set(state => {
        const arr = state.filters.priority.includes(p)
          ? state.filters.priority.filter(v => v !== p)
          : [...state.filters.priority, p];
        return { filters: { ...state.filters, priority: arr } };
      }),
    toggleCategory: (c) =>
      set(state => {
        const arr = state.filters.category.includes(c)
          ? state.filters.category.filter(v => v !== c)
          : [...state.filters.category, c];
        return { filters: { ...state.filters, category: arr } };
      }),
    toggleStatus: (s) =>
      set(state => {
        const arr = state.filters.status.includes(s)
          ? state.filters.status.filter(v => v !== s)
          : [...state.filters.status, s];
        return { filters: { ...state.filters, status: arr } };
      }),
    assignVolunteer: (requestId, volunteerId) =>
      set(state => {
        const requests = state.requests.map(r =>
          r.id === requestId ? { ...r, assignedVolunteerId: volunteerId, status: 'in-progress' } : r
        );
        return { requests };
      }),
    changeRoute: (requestId) => {
      console.log('Route changed for', requestId);
    },
    markCompleted: (requestId) =>
      set(state => {
        const requests = state.requests.map(r =>
          r.id === requestId ? { ...r, status: 'completed' } : r
        );
        return { requests };
      }),
    escalatePriority: (requestId) =>
      set(state => {
        const requests = state.requests.map(r =>
          r.id === requestId ? { ...r, priority: 'critical' } : r
        );
        return { requests };
      }),
  }))
);
