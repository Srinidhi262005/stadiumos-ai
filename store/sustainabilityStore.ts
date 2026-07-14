import { create } from 'zustand';
import { SustainabilityReport } from '../types/sustainability';

interface SustainabilityStoreState {
  report: SustainabilityReport | null;
  selectedSectorId: string | 'all';
  setReport: (report: SustainabilityReport) => void;
  setSelectedSectorId: (sectorId: string | 'all') => void;
}

export const useSustainabilityStore = create<SustainabilityStoreState>((set) => ({
  report: null,
  selectedSectorId: 'all',
  setReport: (report) => set({ report }),
  setSelectedSectorId: (selectedSectorId) => set({ selectedSectorId })
}));
export default useSustainabilityStore;
