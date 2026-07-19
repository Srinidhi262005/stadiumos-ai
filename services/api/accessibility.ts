import apiClient from './client';
import {
  AccessibilityRequest,
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from '../../features/accessibility/types/accessibility';
import { ApiResponse } from '../../types/api';
import { Volunteer } from '../../types/volunteers/volunteer';

interface AccessibilityApiRecord {
  id: string;
  spectator_name?: string | null;
  match_id?: string | null;
  zone_id?: string | null;
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface VolunteerApiRecord {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface AccessibilityFormPayload {
  spectatorName: string;
  category: RequestCategory;
  priority: RequestPriority;
  location: string;
  status: RequestStatus;
  preferredLanguage: string;
  need: string;
  destination: string;
}

const unwrapPayload = <T,>(payload: T | ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

const mapStatus = (value?: string | null): AccessibilityRequest['status'] => {
  switch (value) {
    case 'in_progress':
      return RequestStatus.IN_PROGRESS;
    case 'completed':
      return RequestStatus.COMPLETED;
    case 'canceled':
      return RequestStatus.OPEN;
    case 'pending':
    default:
      return RequestStatus.OPEN;
  }
};

const normalizeRequest = (record: AccessibilityApiRecord): AccessibilityRequest => ({
  id: String(record.id ?? ''),
  spectatorName: record.spectator_name ?? 'Unnamed spectator',
  category: (record.category as RequestCategory) ?? RequestCategory.WHEELCHAIR,
  priority: (record.priority as RequestPriority) ?? RequestPriority.MEDIUM,
  location: record.zone_id ? `Zone ${String(record.zone_id).slice(0, 8)}` : 'Unassigned zone',
  assignedVolunteerId: undefined,
  status: mapStatus(record.status),
  need: `Accessibility support for ${record.category ?? 'request'}`,
  preferredLanguage: 'English',
  destination: 'Assigned area',
  estimatedDistance: '—',
});

export const AccessibilityService = {
  getRequests: async (): Promise<AccessibilityRequest[]> => {
    const response = await apiClient.get<AccessibilityApiRecord[] | ApiResponse<AccessibilityApiRecord[]>>('/accessibility');
    const payload = unwrapPayload(response.data);
    return payload.map(normalizeRequest);
  },
  getRequest: async (id: string): Promise<AccessibilityRequest> => {
    const response = await apiClient.get<AccessibilityApiRecord | ApiResponse<AccessibilityApiRecord>>(`/accessibility/${id}`);
    return normalizeRequest(unwrapPayload(response.data));
  },
  createRequest: async (payload: AccessibilityFormPayload): Promise<AccessibilityRequest> => {
    const response = await apiClient.post<AccessibilityApiRecord | ApiResponse<AccessibilityApiRecord>>('/accessibility', {
      spectator_name: payload.spectatorName,
      match_id: '46d89759-53cd-4797-a70a-9b521229c679',
      zone_id: 'f99304fd-c173-4a6b-8661-5e6b2fd2b259',
      category: payload.category,
      priority: payload.priority,
      status: payload.status === RequestStatus.OPEN ? 'pending' : payload.status === RequestStatus.IN_PROGRESS ? 'in_progress' : 'completed',
    });
    return normalizeRequest(unwrapPayload(response.data));
  },
  updateRequest: async (id: string, updates: Partial<AccessibilityFormPayload> & { priority?: RequestPriority; status?: RequestStatus }): Promise<AccessibilityRequest> => {
    const response = await apiClient.put<AccessibilityApiRecord | ApiResponse<AccessibilityApiRecord>>(`/accessibility/${id}`, {
      ...(updates.spectatorName !== undefined ? { spectator_name: updates.spectatorName } : {}),
      ...(updates.category !== undefined ? { category: updates.category } : {}),
      ...(updates.priority !== undefined ? { priority: updates.priority } : {}),
      ...(updates.status !== undefined ? { status: updates.status === RequestStatus.OPEN ? 'pending' : updates.status === RequestStatus.IN_PROGRESS ? 'in_progress' : 'completed' } : {}),
      ...(updates.location !== undefined ? { zone_id: 'f99304fd-c173-4a6b-8661-5e6b2fd2b259' } : {}),
    });
    return normalizeRequest(unwrapPayload(response.data));
  },
  deleteRequest: async (id: string): Promise<void> => {
    await apiClient.delete(`/accessibility/${id}`);
  },
  getVolunteers: async (): Promise<Volunteer[]> => {
    const response = await apiClient.get<VolunteerApiRecord[] | ApiResponse<VolunteerApiRecord[]>>('/volunteers');
    const payload = unwrapPayload(response.data);
    return payload.map((volunteer) => ({
      id: String(volunteer.id ?? ''),
      name: volunteer.name ?? 'Unnamed volunteer',
      role: 'Volunteer',
      languages: [],
      skills: [],
      location: 'Unassigned',
      status: 'available',
      email: volunteer.email ?? '',
      phone: '',
      isActive: true,
    }));
  },
};

export default AccessibilityService;
