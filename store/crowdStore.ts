import { create } from 'zustand';
import { GateTelemetry, ZoneDensity } from '../types/crowd';

interface CrowdStoreState {
  totalOccupancy: number;
  maxCapacity: number;
  gates: GateTelemetry[];
  zones: ZoneDensity[];
  selectedGateId: string | null;
  selectedZoneId: string | null;
  flowThreshold: number; // people per minute alert threshold
  setCrowdData: (data: { totalOccupancy: number; maxCapacity: number; gates: GateTelemetry[]; zones: ZoneDensity[] }) => void;
  setSelectedGateId: (id: string | null) => void;
  setSelectedZoneId: (id: string | null) => void;
  setFlowThreshold: (threshold: number) => void;
}

export const useCrowdStore = create<CrowdStoreState>((set) => ({
  totalOccupancy: 0,
  maxCapacity: 80000,
  gates: [],
  zones: [],
  selectedGateId: null,
  selectedZoneId: null,
  flowThreshold: 150,
  setCrowdData: (data) => set(data),
  setSelectedGateId: (selectedGateId) => set({ selectedGateId }),
  setSelectedZoneId: (selectedZoneId) => set({ selectedZoneId }),
  setFlowThreshold: (flowThreshold) => set({ flowThreshold })
}));
export default useCrowdStore;
