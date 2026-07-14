import apiClient from './client';
import { CrowdTelemetry, GateTelemetry } from '../../types/crowd';
import { ApiResponse } from '../../types/api';

export const CrowdService = {
  getCrowdTelemetry: async (): Promise<ApiResponse<CrowdTelemetry>> => {
    const response = await apiClient.get<ApiResponse<CrowdTelemetry>>('/crowd/telemetry');
    return response.data;
  },
  updateGateStatus: async (gateId: string, status: 'open' | 'closed' | 'restricted'): Promise<ApiResponse<GateTelemetry>> => {
    const response = await apiClient.patch<ApiResponse<GateTelemetry>>(`/crowd/gates/${gateId}/status`, { status });
    return response.data;
  }
};

export default CrowdService;
