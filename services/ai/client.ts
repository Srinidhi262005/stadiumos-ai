import apiClient from '../api/client';
import { ApiResponse } from '../../types/api';

export interface AiModelRecommendation {
  id: string;
  scenario: string;
  recommendation: string;
  impactScore: number; // e.g. 92
  confidenceScore: number; // e.g. 88
  alternatives: { option: string; impact: string }[];
  reasoning: string;
  status: 'pending' | 'applied' | 'dismissed';
}

export const AiService = {
  getRecommendations: async (module: string): Promise<ApiResponse<AiModelRecommendation[]>> => {
    const response = await apiClient.post<ApiResponse<AiModelRecommendation[]>>('/ai/recommendations', { module });
    return response.data;
  },
  executeAction: async (recommendationId: string, optionSelected: string): Promise<ApiResponse<{ success: boolean; log: string }>> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; log: string }>>(`/ai/recommendations/${recommendationId}/execute`, {
      option: optionSelected
    });
    return response.data;
  }
};

export default AiService;
