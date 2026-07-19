import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CrowdService } from '@/services/api/crowd';

export type SectorStatus = 'normal' | 'warning' | 'critical' | 'selected';

export interface SectorMetrics {
  currentDensity: string;
  predictedDensity: string;
  queueLength: string;
  entryRate: string;
  exitRate: string;
  occupancy: string;
  trend: string;
}

export interface CrowdState {
  selectedSector: string | null;
  sectorStatus: Record<string, SectorStatus>;
  sectorMetrics: Record<string, SectorMetrics>;
  loading: boolean;
  error: string | null;
  isRealtimeConnected: boolean;
  selectSector: (sector: string) => void;
  setSectorStatus: (sector: string, status: SectorStatus) => void;
  updateSectorMetricsRealtime: (sector: string, metrics: Partial<SectorMetrics>) => void;
  loadSummary: () => Promise<void>;
  retryLoadSummary: () => Promise<void>;
  setRealtimeConnected: (connected: boolean) => void;
  updateZoneRealtime: (data: { zone_name: string; metric_name: string; value: number }) => void;
  updateGateRealtime: (data: { gate_name: string; status: 'open' | 'closed' | 'restricted' }) => void;
}

const isDemoSession = () =>
  typeof window !== 'undefined' &&
  localStorage.getItem('demo-auth') === 'true';

const defaultSectorStatus: Record<string, SectorStatus> = {
  'North Stand': 'normal',
  'South Stand': 'normal',
  'East Stand': 'normal',
  'West Stand': 'normal',
  'VIP': 'normal',
  'Food Court': 'normal',
  'Medical Center': 'normal',
  'Parking': 'normal',
  'Gate A': 'normal',
  'Gate B': 'normal',
  'Gate C': 'normal',
  'Gate D': 'normal',
};

const defaultMetrics: Record<string, SectorMetrics> = {
  'North Stand': {
    currentDensity: '75%',
    predictedDensity: '80%',
    queueLength: '5 mins',
    entryRate: '200/min',
    exitRate: '180/min',
    occupancy: '78%',
    trend: 'Stable',
  },
  'South Stand': {
    currentDensity: '70%',
    predictedDensity: '78%',
    queueLength: '4 mins',
    entryRate: '180/min',
    exitRate: '170/min',
    occupancy: '73%',
    trend: 'Rising',
  },
  'East Stand': {
    currentDensity: '65%',
    predictedDensity: '70%',
    queueLength: '3 mins',
    entryRate: '150/min',
    exitRate: '140/min',
    occupancy: '68%',
    trend: 'Stable',
  },
  'West Stand': {
    currentDensity: '68%',
    predictedDensity: '73%',
    queueLength: '3 mins',
    entryRate: '160/min',
    exitRate: '150/min',
    occupancy: '70%',
    trend: 'Stable',
  },
  'VIP': {
    currentDensity: '90%',
    predictedDensity: '92%',
    queueLength: '2 mins',
    entryRate: '50/min',
    exitRate: '48/min',
    occupancy: '95%',
    trend: 'Stable',
  },
  'Food Court': {
    currentDensity: '60%',
    predictedDensity: '65%',
    queueLength: '6 mins',
    entryRate: '120/min',
    exitRate: '110/min',
    occupancy: '62%',
    trend: 'Rising',
  },
  'Medical Center': {
    currentDensity: '-',
    predictedDensity: '-',
    queueLength: '-',
    entryRate: '-',
    exitRate: '-',
    occupancy: '-',
    trend: '-',
  },
  Parking: {
    currentDensity: '-',
    predictedDensity: '-',
    queueLength: '8 mins',
    entryRate: '-',
    exitRate: '-',
    occupancy: '-',
    trend: '-',
  },
  'Gate A': {
    currentDensity: '-',
    predictedDensity: '-',
    queueLength: '2 mins',
    entryRate: '-',
    exitRate: '-',
    occupancy: '-',
    trend: '-',
  },
  'Gate B': {
    currentDensity: '-',
    predictedDensity: '-',
    queueLength: '3 mins',
    entryRate: '-',
    exitRate: '-',
    occupancy: '-',
    trend: '-',
  },
  'Gate C': {
    currentDensity: '-',
    predictedDensity: '-',
    queueLength: '4 mins',
    entryRate: '-',
    exitRate: '-',
    occupancy: '-',
    trend: '-',
  },
  'Gate D': {
    currentDensity: '-',
    predictedDensity: '-',
    queueLength: '5 mins',
    entryRate: '-',
    exitRate: '-',
    occupancy: '-',
    trend: '-',
  },
};

export const useCrowdStore = create<CrowdState>()(
  devtools((set, get) => ({
    selectedSector: null,
    sectorStatus: { ...defaultSectorStatus },
    sectorMetrics: { ...defaultMetrics },
    loading: false,
    error: null,
    isRealtimeConnected: false,

    selectSector: (sector) =>
      set({
        selectedSector: sector,
        sectorStatus: {
          ...get().sectorStatus,
          [sector]: 'selected',
        },
      }),

    setSectorStatus: (sector, status) =>
      set({
        sectorStatus: {
          ...get().sectorStatus,
          [sector]: status,
        },
      }),

    updateSectorMetricsRealtime: (sector, metrics) =>
      set((state) => ({
        sectorMetrics: {
          ...state.sectorMetrics,
          [sector]: {
            ...state.sectorMetrics[sector],
            ...metrics,
          },
        },
      })),

    loadSummary: async () => {
      set({
        loading: true,
        error: null,
      });

      try {
        if (isDemoSession()) {
          set({
            sectorMetrics: { ...defaultMetrics },
            sectorStatus: { ...defaultSectorStatus },
            loading: false,
          });
          return;
        }

        const summary = await CrowdService.getCrowdSummary();

        const sectorMetrics = Object.fromEntries(
          Object.entries(summary).map(([sector, metrics]: any) => [
            sector,
            {
              currentDensity: metrics.currentDensity ?? '-',
              predictedDensity: metrics.predictedDensity ?? '-',
              queueLength: metrics.queueLength ?? '-',
              entryRate: metrics.entryRate ?? '-',
              exitRate: metrics.exitRate ?? '-',
              occupancy: metrics.occupancy ?? '-',
              trend: metrics.trend ?? '-',
            },
          ])
        );

        set({
          sectorMetrics: {
            ...defaultMetrics,
            ...sectorMetrics,
          },
          loading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Unable to load crowd summary',
          loading: false,
        });
      }
    },

    retryLoadSummary: async () => {
      await get().loadSummary();
    },

    setRealtimeConnected: (connected) =>
      set({
        isRealtimeConnected: connected,
      }),

    updateZoneRealtime: (data) => {
      const { zone_name, metric_name, value } = data;

      if (!zone_name) return;

      let metricKey: keyof SectorMetrics | null = null;
      let formattedValue = String(value);

      if (metric_name === 'density') {
        metricKey = 'currentDensity';
        formattedValue = `${value}%`;
      } else if (metric_name === 'queue_length') {
        metricKey = 'queueLength';
        formattedValue = `${value} mins`;
      } else if (metric_name === 'entry_rate') {
        metricKey = 'entryRate';
        formattedValue = `${value}/min`;
      } else if (metric_name === 'exit_rate') {
        metricKey = 'exitRate';
        formattedValue = `${value}/min`;
      } else if (metric_name === 'occupancy') {
        metricKey = 'occupancy';
        formattedValue = `${value}%`;
      }

      if (!metricKey) return;

      set((state) => {
        const statusUpdate: Record<string, SectorStatus> = {};

        if (metric_name === 'density') {
          if (value >= 90) statusUpdate[zone_name] = 'critical';
          else if (value >= 80) statusUpdate[zone_name] = 'warning';
          else statusUpdate[zone_name] = 'normal';
        }

        return {
          sectorMetrics: {
            ...state.sectorMetrics,
            [zone_name]: {
              ...state.sectorMetrics[zone_name],
              [metricKey]: formattedValue,
            },
          },
          sectorStatus: {
            ...state.sectorStatus,
            ...statusUpdate,
          },
        };
      });
    },

    updateGateRealtime: (data) => {
      const { gate_name, status } = data;

      set((state) => ({
        sectorStatus: {
          ...state.sectorStatus,
          [gate_name]:
            status === 'closed'
              ? 'critical'
              : status === 'restricted'
              ? 'warning'
              : 'normal',
        },
      }));
    },
  }))
);

export default useCrowdStore;