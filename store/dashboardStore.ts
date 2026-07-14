import { create } from 'zustand';
import { SystemMetric, TelemetryDataPoint } from '../types/dashboard';

interface DashboardStoreState {
  metrics: SystemMetric[];
  telemetryHistory: TelemetryDataPoint[];
  timeRange: '1h' | '6h' | '12h' | '24h';
  setTimeRange: (range: '1h' | '6h' | '12h' | '24h') => void;
  setMetrics: (metrics: SystemMetric[]) => void;
  setTelemetryHistory: (history: TelemetryDataPoint[]) => void;
  addTelemetryPoint: (point: TelemetryDataPoint) => void;
}

export const useDashboardStore = create<DashboardStoreState>((set) => ({
  metrics: [],
  telemetryHistory: [],
  timeRange: '1h',
  setTimeRange: (range) => set({ timeRange: range }),
  setMetrics: (metrics) => set({ metrics }),
  setTelemetryHistory: (telemetryHistory) => set({ telemetryHistory }),
  addTelemetryPoint: (point) => set((state) => ({
    telemetryHistory: [...state.telemetryHistory.slice(-50), point] // Cap at 50 points
  }))
}));
export default useDashboardStore;
