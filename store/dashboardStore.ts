import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import DashboardService from '../services/api/dashboard';
import { DashboardStats, DashboardTimelineEvent, SystemMetric, TelemetryDataPoint } from '../types/dashboard';

interface DashboardStoreState {
  metrics: SystemMetric[];
  telemetryHistory: TelemetryDataPoint[];
  stats: DashboardStats | null;
  timeline: DashboardTimelineEvent[];
  loading: boolean;
  error: string | null;
  timeRange: '1h' | '6h' | '12h' | '24h';
  isRealtimeConnected: boolean;
  setTimeRange: (range: '1h' | '6h' | '12h' | '24h') => void;
  setMetrics: (metrics: SystemMetric[]) => void;
  setTelemetryHistory: (history: TelemetryDataPoint[]) => void;
  addTelemetryPoint: (point: TelemetryDataPoint) => void;
  updateMetricRealtime: (metric: SystemMetric) => void;
  updateStatsRealtime: (stats: Partial<DashboardStats>) => void;
  loadDashboardData: () => Promise<void>;
  setRealtimeConnected: (connected: boolean) => void;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardStoreState>()(
  devtools((set) => ({
    metrics: [],
    telemetryHistory: [],
    stats: null,
    timeline: [],
    loading: false,
    error: null,
    timeRange: '1h',
    isRealtimeConnected: false,
    setTimeRange: (range) => set({ timeRange: range }),
    setMetrics: (metrics) => set({ metrics }),
    setTelemetryHistory: (telemetryHistory) => set({ telemetryHistory }),
    addTelemetryPoint: (point) => set((state) => ({
      telemetryHistory: [...state.telemetryHistory.slice(-50), point] // Cap at 50 points
    })),
    updateMetricRealtime: (metric) => set((state) => ({
      metrics: state.metrics.map((m) => m.id === metric.id ? metric : m),
    })),
    updateStatsRealtime: (statsUpdate) => set((state) => ({
      stats: state.stats ? { ...state.stats, ...statsUpdate } : null,
    })),
    loadDashboardData: async () => {
      set({ loading: true, error: null });
      try {
        const [stats, timeline] = await Promise.all([
          DashboardService.getStats(),
          DashboardService.getTimeline()
        ]);
        set({ stats, timeline, loading: false });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load dashboard data';
        set({ error: message, loading: false });
      }
    },
    setRealtimeConnected: (connected) => set({ isRealtimeConnected: connected }),
    clearError: () => set({ error: null })
  }))
);
export default useDashboardStore;
