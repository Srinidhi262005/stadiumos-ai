import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ReportsService } from '@/services/api/reports';
import { useNotificationStore } from '@/store/notificationStore';
import { ActivityAuditLog, ReportCategory, ReportFormat, ReportItem } from '@/types/reports';

interface ReportsFilters {
  search: string;
  category: string;
}

interface ReportsState {
  reports: ReportItem[];
  auditLogs: ActivityAuditLog[];
  filters: ReportsFilters;
  loading: boolean;
  generating: boolean;
  deletingId: string | null;
  error: string | null;
  isRealtimeConnected: boolean;
  setSearch: (value: string) => void;
  setCategoryFilter: (value: string) => void;
  loadReports: () => Promise<void>;
  retryLoadReports: () => Promise<void>;
  loadAuditLogs: () => Promise<void>;
  generateReport: (title: string, category: ReportCategory, format: ReportFormat) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  addReportRealtime: (report: ReportItem) => void;
  deleteReportRealtime: (id: string) => void;
  setRealtimeConnected: (connected: boolean) => void;
}

const buildNotification = (title: string, description: string) => ({
  title,
  description,
  category: 'system' as const,
  severity: 'info' as const,
});

export const useReportsStore = create<ReportsState>()(
  devtools((set) => ({
    reports: [],
    auditLogs: [],
    filters: { search: '', category: 'All' },
    loading: false,
    generating: false,
    deletingId: null,
    error: null,
    isRealtimeConnected: false,
    setSearch: (value) => set((state) => ({ filters: { ...state.filters, search: value } })),
    setCategoryFilter: (value) => set((state) => ({ filters: { ...state.filters, category: value } })),
    loadReports: async () => {
      set({ loading: true, error: null });
      try {
        const reports = await ReportsService.getReports();
        set({ reports, loading: false });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load reports';
        set({ error: message, loading: false });
      }
    },
    retryLoadReports: async () => {
      await useReportsStore.getState().loadReports();
    },
    loadAuditLogs: async () => {
      try {
        const auditLogs = await ReportsService.getAuditLogs();
        set({ auditLogs });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load audit logs';
        set({ error: message });
      }
    },
    generateReport: async (title, category, format) => {
      if (!title.trim()) {
        return;
      }

      set({ generating: true, error: null });
      try {
        const created = await ReportsService.generateReport(title.trim(), category, format);
        set((state) => ({ reports: [created, ...state.reports], generating: false }));
        useNotificationStore.getState().addNotification(buildNotification('Report generated', `${created.title} is ready for review.`));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to generate report';
        set({ error: message, generating: false });
        useNotificationStore.getState().addNotification(buildNotification('Report generation failed', message));
      }
    },
    deleteReport: async (id) => {
      set({ deletingId: id });
      try {
        await ReportsService.deleteReport(id);
        set((state) => ({ reports: state.reports.filter((report) => report.id !== id), deletingId: null }));
        useNotificationStore.getState().addNotification(buildNotification('Report deleted', 'The selected report was removed from the list.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to delete report';
        set({ error: message, deletingId: null });
      }
    },
    addReportRealtime: (report) => set((state) => {
      if (state.reports.some((existing) => existing.id === report.id)) {
        return state;
      }
      return { reports: [report, ...state.reports] };
    }),
    deleteReportRealtime: (id) => set((state) => ({ reports: state.reports.filter((report) => report.id !== id) })),
    setRealtimeConnected: (connected) => set({ isRealtimeConnected: connected }),
  }))
);

export default useReportsStore;
