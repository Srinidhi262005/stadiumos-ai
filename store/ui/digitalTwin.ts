import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
  // UI actions
  selectSector: (sector: string) => void;
  setSectorStatus: (sector: string, status: SectorStatus) => void;
}

export const useDigitalTwinStore = create<DigitalTwinState>()(
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
        attendance: '12,000',
        currentDensity: '75%',
        predictedDensity: '80%',
        queueLength: '5 mins',
        volunteerCoverage: '90%',
        medicalCoverage: 'Excellent',
        accessibilityStatus: 'Good',
        sustainabilityStatus: '85%',
      },
      'South Stand': {
        attendance: '10,500',
        currentDensity: '70%',
        predictedDensity: '78%',
        queueLength: '4 mins',
        volunteerCoverage: '88%',
        medicalCoverage: 'Good',
        accessibilityStatus: 'Good',
        sustainabilityStatus: '82%',
      },
      'East Stand': {
        attendance: '8,200',
        currentDensity: '65%',
        predictedDensity: '70%',
        queueLength: '3 mins',
        volunteerCoverage: '85%',
        medicalCoverage: 'Good',
        accessibilityStatus: 'Fair',
        sustainabilityStatus: '80%',
      },
      'West Stand': {
        attendance: '9,000',
        currentDensity: '68%',
        predictedDensity: '73%',
        queueLength: '3 mins',
        volunteerCoverage: '87%',
        medicalCoverage: 'Good',
        accessibilityStatus: 'Good',
        sustainabilityStatus: '81%',
      },
      'VIP': {
        attendance: '2,500',
        currentDensity: '90%',
        predictedDensity: '92%',
        queueLength: '2 mins',
        volunteerCoverage: '95%',
        medicalCoverage: 'Excellent',
        accessibilityStatus: 'Excellent',
        sustainabilityStatus: '90%',
      },
      'Food Court': {
        attendance: '3,200',
        currentDensity: '60%',
        predictedDensity: '65%',
        queueLength: '6 mins',
        volunteerCoverage: '80%',
        medicalCoverage: 'Good',
        accessibilityStatus: 'Good',
        sustainabilityStatus: '78%',
      },
      'Medical Center': {
        attendance: '-',
        currentDensity: '-',
        predictedDensity: '-',
        queueLength: '-',
        volunteerCoverage: '-',
        medicalCoverage: 'Ready',
        accessibilityStatus: 'Good',
        sustainabilityStatus: '85%',
      },
      'Parking': {
        attendance: '-',
        currentDensity: '-',
        predictedDensity: '-',
        queueLength: '8 mins',
        volunteerCoverage: '-',
        medicalCoverage: '-',
        accessibilityStatus: 'Fair',
        sustainabilityStatus: '70%',
      },
      'Gate A': {
        attendance: '-',
        currentDensity: '-',
        predictedDensity: '-',
        queueLength: '2 mins',
        volunteerCoverage: '-',
        medicalCoverage: '-',
        accessibilityStatus: 'Good',
        sustainabilityStatus: '80%',
      },
      'Gate B': {
        attendance: '-',
        currentDensity: '-',
        predictedDensity: '-',
        queueLength: '3 mins',
        volunteerCoverage: '-',
        medicalCoverage: '-',
        accessibilityStatus: 'Good',
        sustainabilityStatus: '80%',
      },
      'Gate C': {
        attendance: '-',
        currentDensity: '-',
        predictedDensity: '-',
        queueLength: '4 mins',
        volunteerCoverage: '-',
        medicalCoverage: '-',
        accessibilityStatus: 'Fair',
        sustainabilityStatus: '78%',
      },
      'Gate D': {
        attendance: '-',
        currentDensity: '-',
        predictedDensity: '-',
        queueLength: '5 mins',
        volunteerCoverage: '-',
        medicalCoverage: '-',
        accessibilityStatus: 'Fair',
        sustainabilityStatus: '78%',
      },
    },
    selectSector: (sector) => set({ selectedSector: sector, sectorStatus: { ...get().sectorStatus, [sector]: 'selected' } }),
    setSectorStatus: (sector, status) => set({ sectorStatus: { ...get().sectorStatus, [sector]: status } }),
  }))
);
