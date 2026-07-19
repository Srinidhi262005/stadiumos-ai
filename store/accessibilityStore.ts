import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AccessibilityService } from '@/services/api/accessibility';
import { useNotificationStore } from '@/store/notificationStore';
import {
  AccessibilityRequest,
  AccessibilityResource,
  RequestStatus,
  RequestPriority,
  RequestCategory,
} from '@/features/accessibility/types/accessibility';

export interface AccessibilityFormValues {
  spectatorName: string;
  category: RequestCategory;
  priority: RequestPriority;
  location: string;
  status: RequestStatus;
  preferredLanguage: string;
  need: string;
  destination: string;
}

export interface AccessibilityState {
  requests: AccessibilityRequest[];
  resources: AccessibilityResource[];
  selectedRequestId: string | null;
  volunteerLookup: Record<string, string>;
  filters: {
    search: string;
    priority: RequestPriority[];
    category: RequestCategory[];
    status: RequestStatus[];
  };
  loading: boolean;
  error: string | null;
  isSubmitting: boolean;
  isRealtimeConnected: boolean;
  selectRequest: (id: string) => void;
  setSearch: (term: string) => void;
  togglePriority: (p: RequestPriority) => void;
  toggleCategory: (c: RequestCategory) => void;
  toggleStatus: (s: RequestStatus) => void;
  loadRequests: () => Promise<void>;
  retryLoadRequests: () => Promise<void>;
  createRequest: (input: AccessibilityFormValues) => Promise<void>;
  updateRequest: (id: string, input: Partial<AccessibilityFormValues> & { priority?: RequestPriority; status?: RequestStatus }) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  updateRequestPriority: (requestId: string, priority: RequestPriority) => Promise<void>;
  updateRequestStatus: (requestId: string, status: RequestStatus) => Promise<void>;
  assignVolunteer: (requestId: string, volunteerId: string) => Promise<void>;
  changeRoute: (requestId: string) => void;
  markCompleted: (requestId: string) => Promise<void>;
  escalatePriority: (requestId: string) => Promise<void>;
  setRealtimeConnected: (connected: boolean) => void;
  updateRequestRealtime: (request: any) => void;
  deleteRequestRealtime: (id: string) => void;
}

const buildNotification = (title: string, description: string) => ({
  title,
  description,
  category: 'system' as const,
  severity: 'info' as const,
});

const initialResources: AccessibilityResource[] = [
  { id: 'R-WC-01', type: 'wheelchair', status: 'available', location: 'Storage' },
  { id: 'R-ESC-01', type: 'escort', status: 'available' },
  { id: 'R-ELEV-01', type: 'elevator', status: 'in-use', location: 'North Tower' },
  { id: 'R-REST-01', type: 'restroom', status: 'available', location: 'West Wing' },
  { id: 'R-RAMP-01', type: 'ramp', status: 'available', location: 'Gate A' },
];
const isDemoSession = () =>
  typeof window !== "undefined" &&
  localStorage.getItem("demo-auth") === "true";

const demoVolunteerLookup: Record<string, string> = {
  "VOL-001": "Rahul Sharma",
  "VOL-002": "Priya Reddy",
  "VOL-003": "Arjun Kumar",
};

const demoRequests: AccessibilityRequest[] = [
  {
    id: "ACC-001",
    spectatorName: "Rahul Sharma",
    category: RequestCategory.WHEELCHAIR,
    priority: RequestPriority.HIGH,
    location: "Gate A",
    assignedVolunteerId: "VOL-001",
    status: RequestStatus.IN_PROGRESS,
    need: "Wheelchair assistance",
    preferredLanguage: "English",
    destination: "North Stand",
    estimatedDistance: "120 m",
  },
  {
    id: "ACC-002",
    spectatorName: "Priya Devi",
    category: RequestCategory.ESCORT,
    priority: RequestPriority.MEDIUM,
    location: "East Gate",
    assignedVolunteerId: "VOL-002",
    status: RequestStatus.OPEN,
    need: "Escort to seating area",
    preferredLanguage: "Hindi",
    destination: "Block C",
    estimatedDistance: "90 m",
  },
];

const mapStatus = (value?: string | null): RequestStatus => {
  switch (value) {
    case 'in_progress':
    case 'in-progress':
      return RequestStatus.IN_PROGRESS;
    case 'completed':
      return RequestStatus.COMPLETED;
    case 'canceled':
    case 'pending':
    case 'open':
    default:
      return RequestStatus.OPEN;
  }
};

const normalizeRequest = (record: any): AccessibilityRequest => ({
  id: String(record.id ?? ''),
  spectatorName: record.spectator_name ?? record.spectatorName ?? 'Unnamed spectator',
  category: (record.category as RequestCategory) ?? RequestCategory.WHEELCHAIR,
  priority: (record.priority as RequestPriority) ?? RequestPriority.MEDIUM,
  location: record.zone_id ? `Zone ${String(record.zone_id).slice(0, 8)}` : record.location ?? 'Unassigned zone',
  assignedVolunteerId: record.assignedVolunteerId ?? undefined,
  status: mapStatus(record.status),
  need: record.need ?? `Accessibility support for ${record.category ?? 'request'}`,
  preferredLanguage: record.preferredLanguage ?? 'English',
  destination: record.destination ?? 'Assigned area',
  estimatedDistance: record.estimatedDistance ?? '—',
});

export const useAccessibilityStore = create<AccessibilityState>()(
  devtools((set, get) => ({
    requests: [],
    resources: initialResources,
    selectedRequestId: null,
    volunteerLookup: {},
    filters: { search: '', priority: [], category: [], status: [] },
    loading: false,
    error: null,
    isSubmitting: false,
    isRealtimeConnected: false,
    selectRequest: (id) => set({ selectedRequestId: id }),
    setSearch: (term) => set((state) => ({ filters: { ...state.filters, search: term } })),
    togglePriority: (p) =>
      set((state) => {
        const arr = state.filters.priority.includes(p)
          ? state.filters.priority.filter((v) => v !== p)
          : [...state.filters.priority, p];
        return { filters: { ...state.filters, priority: arr } };
      }),
    toggleCategory: (c) =>
      set((state) => {
        const arr = state.filters.category.includes(c)
          ? state.filters.category.filter((v) => v !== c)
          : [...state.filters.category, c];
        return { filters: { ...state.filters, category: arr } };
      }),
    toggleStatus: (s) =>
      set((state) => {
        const arr = state.filters.status.includes(s)
          ? state.filters.status.filter((v) => v !== s)
          : [...state.filters.status, s];
        return { filters: { ...state.filters, status: arr } };
      }),
    loadRequests: async () => {
     set({ loading: true, error: null });

  try {

    if (isDemoSession()) {
      set({
        requests: demoRequests,
        volunteerLookup: demoVolunteerLookup,
        selectedRequestId: demoRequests[0]?.id ?? null,
        loading: false,
        error: null,
      });
      return;
    }

    const [requests, volunteers] = await Promise.all([
      AccessibilityService.getRequests(),
      AccessibilityService.getVolunteers(),
    ]);

    const volunteerLookup = Object.fromEntries(
      volunteers.map((v) => [v.id, v.name])
    );

    const selectedRequestId = requests[0]?.id ?? null;

    set({
      requests,
      volunteerLookup,
      selectedRequestId:
        get().selectedRequestId &&
        requests.some((r) => r.id === get().selectedRequestId)
          ? get().selectedRequestId
          : selectedRequestId,
      loading: false,
      error: null,
    });

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Unable to load accessibility requests";
  set({
      error: message,
      loading: false,
    });
  }
},
    retryLoadRequests: async () => {
      await get().loadRequests();
    },
    createRequest: async (input) => {
      set({ isSubmitting: true, error: null });
      try {
        const created = await AccessibilityService.createRequest({
          spectatorName: input.spectatorName,
          category: input.category,
          priority: input.priority,
          location: input.location,
          status: input.status,
          preferredLanguage: input.preferredLanguage,
          need: input.need,
          destination: input.destination,
        });
        const normalized = normalizeRequest(created);
        set((state) => ({
          requests: [normalized, ...state.requests],
          selectedRequestId: normalized.id,
          isSubmitting: false,
        }));
        useNotificationStore.getState().addNotification(buildNotification('Request created', `${normalized.spectatorName} was added to the queue.`));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to create request';
        set({ error: message, isSubmitting: false });
        useNotificationStore.getState().addNotification(buildNotification('Create failed', message));
      }
    },
    updateRequest: async (id, input) => {
      set({ isSubmitting: true, error: null });
      try {
        const updated = await AccessibilityService.updateRequest(id, input);
        const normalized = normalizeRequest(updated);
        set((state) => ({
          requests: state.requests.map((request) => (request.id === id ? normalized : request)),
          isSubmitting: false,
        }));
        useNotificationStore.getState().addNotification(buildNotification('Request updated', 'The accessibility request was updated successfully.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update request';
        set({ error: message, isSubmitting: false });
        useNotificationStore.getState().addNotification(buildNotification('Update failed', message));
      }
    },
    deleteRequest: async (id) => {
      set({ isSubmitting: true, error: null });
      try {
        await AccessibilityService.deleteRequest(id);
        set((state) => ({
          requests: state.requests.filter((request) => request.id !== id),
          selectedRequestId: state.selectedRequestId === id ? null : state.selectedRequestId,
          isSubmitting: false,
        }));
        useNotificationStore.getState().addNotification(buildNotification('Request deleted', 'The accessibility request was removed.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to delete request';
        set({ error: message, isSubmitting: false });
        useNotificationStore.getState().addNotification(buildNotification('Delete failed', message));
      }
    },
    updateRequestPriority: async (requestId, priority) => {
      await get().updateRequest(requestId, { priority });
    },
    updateRequestStatus: async (requestId, status) => {
      await get().updateRequest(requestId, { status });
    },
    assignVolunteer: async (requestId, volunteerId) => {
      set({ isSubmitting: true, error: null });
      try {
        const updated = await AccessibilityService.updateRequest(requestId, { status: RequestStatus.IN_PROGRESS });
        const normalized = normalizeRequest(updated);
        set((state) => ({
          requests: state.requests.map((request) => (request.id === requestId ? { ...normalized, assignedVolunteerId: volunteerId } : request)),
          isSubmitting: false,
        }));
        useNotificationStore.getState().addNotification(buildNotification('Volunteer assigned', 'The request is now in progress with the selected volunteer.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to assign volunteer';
        set({ error: message, isSubmitting: false });
        useNotificationStore.getState().addNotification(buildNotification('Assignment failed', message));
      }
    },
    changeRoute: (requestId) => {
      console.log('Route changed for', requestId);
    },
    markCompleted: async (requestId) => {
      await get().updateRequestStatus(requestId, RequestStatus.COMPLETED);
    },
    escalatePriority: async (requestId) => {
      await get().updateRequestPriority(requestId, RequestPriority.CRITICAL);
    },
    setRealtimeConnected: (connected) => set({ isRealtimeConnected: connected }),
    updateRequestRealtime: (request) => set((state) => {
      const normalized = normalizeRequest(request);
      const exists = state.requests.some((r) => r.id === normalized.id);
      if (request.action === 'deleted') {
        return {
          requests: state.requests.filter((r) => r.id !== normalized.id),
          selectedRequestId: state.selectedRequestId === normalized.id ? null : state.selectedRequestId,
        };
      }
      if (exists) {
        return {
          requests: state.requests.map((r) => r.id === normalized.id ? normalized : r),
        };
      } else {
        return {
          requests: [normalized, ...state.requests],
        };
      }
    }),
    deleteRequestRealtime: (id) => set((state) => ({
      requests: state.requests.filter((r) => r.id !== id),
      selectedRequestId: state.selectedRequestId === id ? null : state.selectedRequestId,
    })),
  }))
);

export default useAccessibilityStore;
