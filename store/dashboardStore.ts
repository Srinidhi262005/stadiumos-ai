import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import DashboardService from '../services/api/dashboard';
import { DashboardStats, DashboardTimelineEvent, SystemMetric, TelemetryDataPoint } from '../types/dashboard';

const isDemoSession = () =>
  typeof window !== 'undefined' &&
  localStorage.getItem('demo-auth') === 'true';

const demoStats: DashboardStats = {
  active_incidents: 3,
  critical_incidents: 1,
  total_volunteers: 18,
  open_accessibility_requests: 2,
  active_match: 'FIFA World Cup 2026: USA vs England',
  medical_response_time_min: 2.4,
  volunteer_coverage_pct: 92,
  accessibility_score_pct: 88,
  operational_readiness_pct: 96,
};

const demoTimeline: DashboardTimelineEvent[] = [
  {
    id: 'demo-1',
    title: 'Crowd surge detected',
    description: 'Gate A is running 15% above expected density and stewards are being rerouted.',
    timestamp: '08:12',
    category: 'crowd',
    severity: 'warning',
  },
  {
    id: 'demo-2',
    title: 'Medical team standby',
    description: 'A rapid-response unit has been positioned near the East Stand.',
    timestamp: '08:24',
    category: 'incident',
    severity: 'danger',
  },
  {
    id: 'demo-3',
    title: 'Volunteer shift updated',
    description: 'Two experienced volunteers were reassigned to guest support.',
    timestamp: '08:35',
    category: 'volunteer',
    severity: 'success',
  },
];

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
        if (isDemoSession()) {
          set({ stats: demoStats, timeline: demoTimeline, loading: false });
          return;
        }

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
