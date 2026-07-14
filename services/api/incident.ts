import apiClient from './client';
import { Incident, IncidentStatus } from '../../types/incident';
import { ApiResponse } from '../../types/api';
import { ReportIncidentInput } from '../../lib/validators';

export const IncidentService = {
  getIncidents: async (params?: { severity?: string; status?: string }): Promise<ApiResponse<Incident[]>> => {
    const response = await apiClient.get<ApiResponse<Incident[]>>('/incidents', { params });
    return response.data;
  },
  reportIncident: async (data: ReportIncidentInput): Promise<ApiResponse<Incident>> => {
    const response = await apiClient.post<ApiResponse<Incident>>('/incidents', data);
    return response.data;
  },
  updateIncidentStatus: async (id: string, status: IncidentStatus): Promise<ApiResponse<Incident>> => {
    const response = await apiClient.patch<ApiResponse<Incident>>(`/incidents/${id}/status`, { status });
    return response.data;
  },
  assignTeam: async (id: string, assignedTeam: string): Promise<ApiResponse<Incident>> => {
    const response = await apiClient.patch<ApiResponse<Incident>>(`/incidents/${id}/assign`, { assignedTeam });
    return response.data;
  }
};

export default IncidentService;
