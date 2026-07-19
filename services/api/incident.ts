import apiClient from './client';
import { Incident } from '../../types/incidents/incident';
import { ApiResponse } from '../../types/api';
import { ReportIncidentInput } from '../../lib/validators';

const unwrapPayload = <T,>(payload: T | ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

export const IncidentService = {
  getIncidents: async (params?: { severity?: string; status?: string }): Promise<Incident[]> => {
    const response = await apiClient.get<Incident[] | ApiResponse<Incident[]>>('/incidents', { params });
    return unwrapPayload(response.data);
  },
  reportIncident: async (data: ReportIncidentInput): Promise<Incident> => {
    const response = await apiClient.post<Incident | ApiResponse<Incident>>('/incidents', {
      match_id: '00000000-0000-0000-0000-000000000000',
      zone_id: null,
      description: data.description,
      severity: data.severity,
      category: 'Security',
      status: 'detected',
      crowd_impact: 'Low',
      assigned_team: null,
    });
    return unwrapPayload(response.data);
  },
  updateIncident: async (id: string, payload: Record<string, unknown>): Promise<Incident> => {
    const response = await apiClient.put<Incident | ApiResponse<Incident>>(`/incidents/${id}`, payload);
    return unwrapPayload(response.data);
  },
  updateIncidentStatus: async (id: string, status: Incident['status']): Promise<Incident> => {
    return IncidentService.updateIncident(id, { status });
  },
  assignTeam: async (id: string, assignedTeam: string): Promise<Incident> => {
    return IncidentService.updateIncident(id, { assigned_team: assignedTeam });
  },
};

export default IncidentService;
