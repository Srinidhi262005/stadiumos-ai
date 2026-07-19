import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CrowdService } from '@/services/api/crowd';

export type SectorStatus = 'normal' | 'warning' | 'critical' | 'selected';

export interface SectorMetrics {
  attendance: string;
  currentDensity: string;
  predictedDensity: string;
  queueLength: string;
  volunteerCoverage: string;
  medicalCoverage: string;
  accessibilityStatus: string;
  sustainabilityStatus: string;
}

export interface DigitalTwinState {
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
}

const defaultSectorStatus = {
  'North Stand': 'normal' as const,
  'South Stand': 'normal' as const,
  'East Stand': 'normal' as const,
  'West Stand': 'normal' as const,
  'VIP': 'normal' as const,
  'Food Court': 'normal' as const,
  'Medical Center': 'normal' as const,
  'Parking': 'normal' as const,
  'Gate A': 'normal' as const,
  'Gate B': 'normal' as const,
  'Gate C': 'normal' as const,
  'Gate D': 'normal' as const,
};

const defaultMetrics = {
  'North Stand': { attendance: '12,000', currentDensity: '75%', predictedDensity: '80%', queueLength: '5 mins', volunteerCoverage: '90%', medicalCoverage: 'Excellent', accessibilityStatus: 'Good', sustainabilityStatus: '85%' },
  'South Stand': { attendance: '10,500', currentDensity: '70%', predictedDensity: '78%', queueLength: '4 mins', volunteerCoverage: '88%', medicalCoverage: 'Good', accessibilityStatus: 'Good', sustainabilityStatus: '82%' },
  'East Stand': { attendance: '8,200', currentDensity: '65%', predictedDensity: '70%', queueLength: '3 mins', volunteerCoverage: '85%', medicalCoverage: 'Good', accessibilityStatus: 'Fair', sustainabilityStatus: '80%' },
  'West Stand': { attendance: '9,000', currentDensity: '68%', predictedDensity: '73%', queueLength: '3 mins', volunteerCoverage: '87%', medicalCoverage: 'Good', accessibilityStatus: 'Good', sustainabilityStatus: '81%' },
  'VIP': { attendance: '2,500', currentDensity: '90%', predictedDensity: '92%', queueLength: '2 mins', volunteerCoverage: '95%', medicalCoverage: 'Excellent', accessibilityStatus: 'Excellent', sustainabilityStatus: '90%' },
  'Food Court': { attendance: '3,200', currentDensity: '60%', predictedDensity: '65%', queueLength: '6 mins', volunteerCoverage: '80%', medicalCoverage: 'Good', accessibilityStatus: 'Good', sustainabilityStatus: '78%' },
  'Medical Center': { attendance: '-', currentDensity: '-', predictedDensity: '-', queueLength: '-', volunteerCoverage: '-', medicalCoverage: 'Ready', accessibilityStatus: 'Good', sustainabilityStatus: '85%' },
  'Parking': { attendance: '-', currentDensity: '-', predictedDensity: '-', queueLength: '8 mins', volunteerCoverage: '-', medicalCoverage: '-', accessibilityStatus: 'Fair', sustainabilityStatus: '70%' },
  'Gate A': { attendance: '-', currentDensity: '-', predictedDensity: '-', queueLength: '2 mins', volunteerCoverage: '-', medicalCoverage: '-', accessibilityStatus: 'Good', sustainabilityStatus: '80%' },
  'Gate B': { attendance: '-', currentDensity: '-', predictedDensity: '-', queueLength: '3 mins', volunteerCoverage: '-', medicalCoverage: '-', accessibilityStatus: 'Good', sustainabilityStatus: '80%' },
  'Gate C': { attendance: '-', currentDensity: '-', predictedDensity: '-', queueLength: '4 mins', volunteerCoverage: '-', medicalCoverage: '-', accessibilityStatus: 'Fair', sustainabilityStatus: '78%' },
  'Gate D': { attendance: '-', currentDensity: '-', predictedDensity: '-', queueLength: '5 mins', volunteerCoverage: '-', medicalCoverage: '-', accessibilityStatus: 'Fair', sustainabilityStatus: '78%' },
};

export const useDigitalTwinStore = create<DigitalTwinState>()(
  devtools((set, get) => ({
    selectedSector: null,
    sectorStatus: { ...defaultSectorStatus },
    sectorMetrics: { ...defaultMetrics },
    loading: false,
    error: null,
    isRealtimeConnected: false,
    selectSector: (sector) => set({ selectedSector: sector, sectorStatus: { ...get().sectorStatus, [sector]: 'selected' } }),
    setSectorStatus: (sector, status) => set({ sectorStatus: { ...get().sectorStatus, [sector]: status } }),
    updateSectorMetricsRealtime: (sector, metrics) => set((state) => ({
      sectorMetrics: {
        ...state.sectorMetrics,
        [sector]: { ...state.sectorMetrics[sector], ...metrics }
      }
    })),
    loadSummary: async () => {
      set({ loading: true, error: null });
      try {
        const summary = await CrowdService.getCrowdSummary();
        const sectorMetrics = Object.fromEntries(Object.entries(summary).map(([sector, metrics]) => [sector, {
          attendance: metrics.currentDensity ?? '-',
          currentDensity: metrics.currentDensity ?? '-',
          predictedDensity: metrics.predictedDensity ?? '-',
          queueLength: metrics.queueLength ?? '-',
          volunteerCoverage: '90%',
          medicalCoverage: 'Ready',
          accessibilityStatus: 'Good',
          sustainabilityStatus: '80%',
        }]));
        set({ sectorMetrics: { ...defaultMetrics, ...sectorMetrics }, loading: false });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load digital twin summary';
        set({ error: message, loading: false });
      }
    },
    retryLoadSummary: async () => {
      await get().loadSummary();
    },
    setRealtimeConnected: (connected) => set({ isRealtimeConnected: connected }),
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
      }

      if (metricKey) {
        set((state) => {
          const currentSectorMetrics = state.sectorMetrics[zone_name] || {
            attendance: '-', currentDensity: '-', predictedDensity: '-', queueLength: '-', volunteerCoverage: '-', medicalCoverage: '-', accessibilityStatus: '-', sustainabilityStatus: '-'
          };
          return {
            sectorMetrics: {
              ...state.sectorMetrics,
              [zone_name]: {
                ...currentSectorMetrics,
                [metricKey!]: formattedValue,
              }
            }
          };
        });
      }
    },
  }))
);

export default useDigitalTwinStore;
