import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
  selectSector: (sector: string) => void;
  setSectorStatus: (sector: string, status: SectorStatus) => void;
}

export const useCrowdStore = create<CrowdState>()(
  devtools((set, get) => ({
    selectedSector: null,
    sectorStatus: {
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
    },
    sectorMetrics: {
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
      'Parking': {
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
    },
    selectSector: (sector) => set({ selectedSector: sector, sectorStatus: { ...get().sectorStatus, [sector]: 'selected' } }),
    setSectorStatus: (sector, status) => set({ sectorStatus: { ...get().sectorStatus, [sector]: status } }),
  }))
);
