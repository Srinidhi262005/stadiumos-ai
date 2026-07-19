import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import SustainabilityService from '../services/api/sustainability';
import { SustainabilityMetric, SustainabilityMetricFormValues, SustainabilityMetricType } from '../types/sustainability';
const isDemoSession = () =>
  typeof window !== "undefined" &&
  localStorage.getItem("demo-auth") === "true";

const demoMetrics: SustainabilityMetric[] = [
  {
    id: "SUS-001",
    zoneId: 'main-stadium',
    metricType: 'energy',
    value: 68,
    measuredAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "SUS-002",
    zoneId: 'north-stand',
    metricType: 'water',
    value: 42,
    measuredAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "SUS-003",
    zoneId: 'food-court',
    metricType: 'waste',
    value: 81,
    measuredAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
interface SustainabilityStoreState {
  metrics: SustainabilityMetric[];
  loading: boolean;
  error: string | null;
  selectedMetricId: string | null;
  selectedMetricType: SustainabilityMetricType | 'all';
  isRealtimeConnected: boolean;
  loadMetrics: () => Promise<void>;
  createMetric: (data: SustainabilityMetricFormValues) => Promise<void>;
  updateMetric: (id: string, data: Partial<SustainabilityMetricFormValues>) => Promise<void>;
  deleteMetric: (id: string) => Promise<void>;
  updateMetricRealtime: (metric: SustainabilityMetric) => void;
  deleteMetricRealtime: (id: string) => void;
  setSelectedMetricType: (metricType: SustainabilityMetricType | 'all') => void;
  selectMetric: (metricId: string | null) => void;
  setRealtimeConnected: (connected: boolean) => void;
  clearError: () => void;
}

export const useSustainabilityStore = create<SustainabilityStoreState>()(
  devtools((set) => ({
  metrics: [],
  loading: false,
  error: null,
  selectedMetricId: null,
  selectedMetricType: 'all',
  isRealtimeConnected: false,
  loadMetrics: async () => {
  set({ loading: true, error: null });

  try {

    if (isDemoSession()) {
      set({
        metrics: demoMetrics,
        loading: false,
        error: null,
      });
      return;
    }

    const metrics = await SustainabilityService.getMetrics();

    set({
      metrics,
      loading: false,
      error: null,
    });

  } catch (error) {

    set({
      loading: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load sustainability metrics.",
    });

  }
},
  createMetric: async (data) => {
    set({ loading: true, error: null });
    try {
      const metric = await SustainabilityService.createMetric(data);
      set((state) => ({ metrics: [metric, ...state.metrics], loading: false, selectedMetricId: metric.id }));
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to create sustainability metric.' });
    }
  },
  updateMetric: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const metric = await SustainabilityService.updateMetric(id, data);
      set((state) => ({
        metrics: state.metrics.map((existing) => existing.id === id ? metric : existing),
        loading: false,
        selectedMetricId: metric.id,
      }));
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to update sustainability metric.' });
    }
  },
  deleteMetric: async (id) => {
    set({ loading: true, error: null });
    try {
      await SustainabilityService.deleteMetric(id);
      set((state) => ({
        metrics: state.metrics.filter((metric) => metric.id !== id),
        loading: false,
        selectedMetricId: state.selectedMetricId === id ? null : state.selectedMetricId,
      }));
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to delete sustainability metric.' });
    }
  },
  updateMetricRealtime: (metric) => set((state) => {
    const metricId = String((metric as any).id ?? '');
    if (!metricId) return state;

    if ((metric as any).action === 'deleted') {
      return {
        metrics: state.metrics.filter((existing) => existing.id !== metricId),
        selectedMetricId: state.selectedMetricId === metricId ? null : state.selectedMetricId,
      };
    }

    const exists = state.metrics.some((existing) => existing.id === metricId);
    if (exists) {
      return {
        metrics: state.metrics.map((existing) => (existing.id === metricId ? { ...existing, ...metric } : existing)),
      };
    }

    return { metrics: [metric as SustainabilityMetric, ...state.metrics] };
  }),
  deleteMetricRealtime: (id) => set((state) => ({
    metrics: state.metrics.filter((metric) => metric.id !== id),
  })),
  setSelectedMetricType: (selectedMetricType) => set({ selectedMetricType }),
  selectMetric: (selectedMetricId) => set({ selectedMetricId }),
  setRealtimeConnected: (connected) => set({ isRealtimeConnected: connected }),
  clearError: () => set({ error: null }),
  }))
);

export default useSustainabilityStore;
