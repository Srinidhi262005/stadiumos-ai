import apiClient from './client';
import { ReportItem, ActivityAuditLog } from '../../types/reports';
import { ApiResponse } from '../../types/api';

export const ReportsService = {
  getReports: async (category?: string): Promise<ApiResponse<ReportItem[]>> => {
    const response = await apiClient.get<ApiResponse<ReportItem[]>>('/reports', {
      params: { category }
    });
    return response.data;
  },
  generateReport: async (title: string, category: string, format: string): Promise<ApiResponse<ReportItem>> => {
    const response = await apiClient.post<ApiResponse<ReportItem>>('/reports/generate', {
      title,
      category,
      format
    });
    return response.data;
  },
  getAuditLogs: async (): Promise<ApiResponse<ActivityAuditLog[]>> => {
    const response = await apiClient.get<ApiResponse<ActivityAuditLog[]>>('/reports/audit-logs');
    return response.data;
  }
};

export default ReportsService;
