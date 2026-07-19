import apiClient from './client';
import { Volunteer } from '../../types/volunteers/volunteer';
import { ApiResponse } from '../../types/api';

export interface VolunteerFormValues {
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  status: Volunteer['status'];
  isActive: boolean;
}

interface VolunteerApiRecord {
  id: string | number;
  name: string;
  email?: string | null;
  phone?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

const unwrapPayload = <T,>(payload: T | ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

const normalizeVolunteer = (record: VolunteerApiRecord): Volunteer => ({
  id: String(record.id ?? ''),
  name: record.name ?? 'Unnamed volunteer',
  role: 'Volunteer',
  languages: [],
  skills: [],
  location: 'Unassigned',
  status: record.is_active === false ? 'unavailable' : 'available',
  email: record.email ?? '',
  phone: record.phone ?? '',
  isActive: record.is_active ?? true,
});

export const VolunteerService = {
  getVolunteers: async (): Promise<Volunteer[]> => {
    const response = await apiClient.get<VolunteerApiRecord[] | ApiResponse<VolunteerApiRecord[]>>('/volunteers');
    const payload = unwrapPayload(response.data);
    return payload.map(normalizeVolunteer);
  },
  getVolunteer: async (id: string): Promise<Volunteer> => {
    const response = await apiClient.get<VolunteerApiRecord | ApiResponse<VolunteerApiRecord>>(`/volunteers/${id}`);
    return normalizeVolunteer(unwrapPayload(response.data));
  },
  createVolunteer: async (data: VolunteerFormValues): Promise<Volunteer> => {
    const response = await apiClient.post<VolunteerApiRecord | ApiResponse<VolunteerApiRecord>>('/volunteers', {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      is_active: data.isActive,
    });
    return normalizeVolunteer(unwrapPayload(response.data));
  },
  updateVolunteer: async (id: string, data: Partial<VolunteerFormValues>): Promise<Volunteer> => {
    const response = await apiClient.put<VolunteerApiRecord | ApiResponse<VolunteerApiRecord>>(`/volunteers/${id}`, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
      ...(data.isActive !== undefined ? { is_active: data.isActive } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    });
    return normalizeVolunteer(unwrapPayload(response.data));
  },
  deleteVolunteer: async (id: string): Promise<void> => {
    await apiClient.delete(`/volunteers/${id}`);
  },
};

export default VolunteerService;
