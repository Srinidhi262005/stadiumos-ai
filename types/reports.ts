export type ReportCategory = 'operations' | 'crowd' | 'safety' | 'sustainability' | 'volunteers';
export type ReportFormat = 'pdf' | 'csv' | 'json';

export interface ReportItem {
  id: string;
  title: string;
  category: ReportCategory;
  generatedBy: string;
  createdAt: string;
  fileSizeBytes: number;
  format: ReportFormat;
  downloadUrl: string;
}

export interface ActivityAuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}
