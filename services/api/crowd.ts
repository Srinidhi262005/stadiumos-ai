import apiClient from './client';
import { CrowdTelemetry, GateTelemetry, ZoneDensity } from '../../types/crowd';

const normalizeCrowdTelemetry = (payload: Record<string, unknown>): CrowdTelemetry => ({
  totalOccupancy: Number(payload.totalOccupancy ?? 0),
  maxCapacity: Number(payload.maxCapacity ?? 80000),
  gates: Array.isArray(payload.gates) ? payload.gates as GateTelemetry[] : [],
  zones: Array.isArray(payload.zones) ? payload.zones as ZoneDensity[] : [],
  lastUpdated: String(payload.lastUpdated ?? new Date().toISOString()),
});

export const CrowdService = {
  getCrowdTelemetry: async (): Promise<CrowdTelemetry> => {
    const response = await apiClient.get<unknown>('/crowd');
    return normalizeCrowdTelemetry(response.data as Record<string, unknown>);
  },
  getCrowdSummary: async (): Promise<Record<string, Record<string, string>>> => {
    const response = await apiClient.get<Record<string, Record<string, string>>>('/crowd/summary');
    return response.data;
  },
  createTelemetryEntry: async (payload: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>('/crowd', payload);
    return response.data;
  },
  updateGateStatus: async (gateId: string, status: 'open' | 'closed' | 'restricted'): Promise<GateTelemetry> => {
    const response = await apiClient.patch<GateTelemetry>(`/crowd/gates/${gateId}/status`, { status });
    return response.data;
  },
};

export default CrowdService;
