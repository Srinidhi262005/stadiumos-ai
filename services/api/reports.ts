import apiClient from './client';
import { ActivityAuditLog, ReportCategory, ReportFormat, ReportItem } from '../../types/reports';

const normalizeReport = (item: Record<string, unknown>): ReportItem => ({
  id: String(item.id ?? ''),
  title: String(item.title ?? ''),
  category: String(item.category ?? 'operations') as ReportCategory,
  generatedBy: String(item.generatedBy ?? 'System'),
  createdAt: String(item.createdAt ?? item.created_at ?? ''),
  fileSizeBytes: Number(item.fileSizeBytes ?? 0),
  format: String(item.format ?? 'pdf') as ReportFormat,
  downloadUrl: String(item.downloadUrl ?? item.download_url ?? '#'),
});

const normalizeAuditLog = (item: Record<string, unknown>): ActivityAuditLog => ({
  id: String(item.id ?? ''),
  userId: String(item.userId ?? item.user_id ?? ''),
  userName: String(item.userName ?? item.user_name ?? 'System'),
  action: String(item.action ?? ''),
  details: String(item.details ?? ''),
  timestamp: String(item.timestamp ?? item.created_at ?? ''),
  ipAddress: String(item.ipAddress ?? item.ip_address ?? '127.0.0.1'),
});

export const ReportsService = {
  getReports: async (): Promise<ReportItem[]> => {
    const response = await apiClient.get<unknown[]>('/reports');
    return response.data.map((item) => normalizeReport(item as Record<string, unknown>));
  },
  generateReport: async (title: string, category: string, format: string): Promise<ReportItem> => {
    const response = await apiClient.post<Record<string, unknown>>('/reports', {
      match_id: '46d8975953cd4797a70a9b521229c679',
      zone_id: 'f99304fdc1734a6b86615e6b2fd2b259',
      title,
      content: `${category} report generated in ${format.toUpperCase()} format`,
    });
    return normalizeReport(response.data);
  },
  getAuditLogs: async (): Promise<ActivityAuditLog[]> => {
    const response = await apiClient.get<unknown[]>('/reports/logs');
    return response.data.map((item) => normalizeAuditLog(item as Record<string, unknown>));
  },
  deleteReport: async (id: string): Promise<void> => {
    await apiClient.delete(`/reports/${id}`);
  },
};

export default ReportsService;
