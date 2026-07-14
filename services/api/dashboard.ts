import apiClient from './client';
import { SystemMetric, TelemetryDataPoint } from '../../types/dashboard';
import { ApiResponse } from '../../types/api';

export const DashboardService = {
  getMetrics: async (): Promise<ApiResponse<SystemMetric[]>> => {
    const response = await apiClient.get<ApiResponse<SystemMetric[]>>('/dashboard/metrics');
    return response.data;
  },
  getTelemetryHistory: async (range: string): Promise<ApiResponse<TelemetryDataPoint[]>> => {
    const response = await apiClient.get<ApiResponse<TelemetryDataPoint[]>>(`/dashboard/telemetry`, {
      params: { range }
    });
    return response.data;
  }
};

export default DashboardService;
