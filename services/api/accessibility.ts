import apiClient from './client';
import { AccessibilityStatus, AssistanceRequest, AssistanceStatus } from '../../types/accessibility';
import { ApiResponse } from '../../types/api';

export const AccessibilityService = {
  getStatus: async (): Promise<ApiResponse<AccessibilityStatus>> => {
    const response = await apiClient.get<ApiResponse<AccessibilityStatus>>('/accessibility/status');
    return response.data;
  },
  getRequests: async (status?: AssistanceStatus): Promise<ApiResponse<AssistanceRequest[]>> => {
    const response = await apiClient.get<ApiResponse<AssistanceRequest[]>>('/accessibility/requests', {
      params: { status }
    });
    return response.data;
  },
  updateRequestStatus: async (id: string, status: AssistanceStatus): Promise<ApiResponse<AssistanceRequest>> => {
    const response = await apiClient.patch<ApiResponse<AssistanceRequest>>(`/accessibility/requests/${id}/status`, { status });
    return response.data;
  }
};

export default AccessibilityService;
