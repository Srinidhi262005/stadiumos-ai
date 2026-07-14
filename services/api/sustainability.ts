import apiClient from './client';
import { SustainabilityReport } from '../../types/sustainability';
import { ApiResponse } from '../../types/api';

export const SustainabilityService = {
  getReport: async (): Promise<ApiResponse<SustainabilityReport>> => {
    const response = await apiClient.get<ApiResponse<SustainabilityReport>>('/sustainability/report');
    return response.data;
  }
};

export default SustainabilityService;
