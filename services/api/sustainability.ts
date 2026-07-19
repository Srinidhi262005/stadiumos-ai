import apiClient from './client';
import { ApiResponse } from '../../types/api';
import { SustainabilityMetric, SustainabilityMetricFormValues } from '../../types/sustainability';

interface SustainabilityApiRecord {
  id: string;
  zone_id?: string | null;
  metric_type?: string | null;
  value?: number | null;
  measured_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const unwrapPayload = <T,>(payload: T | ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

const normalizeMetric = (record: SustainabilityApiRecord): SustainabilityMetric => ({
  id: String(record.id ?? ''),
  zoneId: record.zone_id ?? 'unknown-zone',
  metricType: (record.metric_type as SustainabilityMetric['metricType']) ?? 'energy',
  value: Number(record.value ?? 0),
  measuredAt: record.measured_at ?? new Date().toISOString(),
  createdAt: record.created_at ?? record.measured_at ?? new Date().toISOString(),
  updatedAt: record.updated_at ?? record.measured_at ?? new Date().toISOString(),
});

export const SustainabilityService = {
  getMetrics: async (): Promise<SustainabilityMetric[]> => {
    const response = await apiClient.get<SustainabilityApiRecord[] | ApiResponse<SustainabilityApiRecord[]>>('/sustainability');
    const payload = unwrapPayload(response.data);
    return payload.map(normalizeMetric);
  },
  getMetric: async (id: string): Promise<SustainabilityMetric> => {
    const response = await apiClient.get<SustainabilityApiRecord | ApiResponse<SustainabilityApiRecord>>(`/sustainability/${id}`);
    return normalizeMetric(unwrapPayload(response.data));
  },
  createMetric: async (data: SustainabilityMetricFormValues): Promise<SustainabilityMetric> => {
    const response = await apiClient.post<SustainabilityApiRecord | ApiResponse<SustainabilityApiRecord>>('/sustainability', {
      zone_id: data.zoneId,
      metric_type: data.metricType,
      value: Number(data.value),
      measured_at: data.measuredAt,
    });
    return normalizeMetric(unwrapPayload(response.data));
  },
  updateMetric: async (id: string, data: Partial<SustainabilityMetricFormValues>): Promise<SustainabilityMetric> => {
    const response = await apiClient.put<SustainabilityApiRecord | ApiResponse<SustainabilityApiRecord>>(`/sustainability/${id}`, {
      ...(data.zoneId !== undefined ? { zone_id: data.zoneId } : {}),
      ...(data.metricType !== undefined ? { metric_type: data.metricType } : {}),
      ...(data.value !== undefined ? { value: Number(data.value) } : {}),
      ...(data.measuredAt !== undefined ? { measured_at: data.measuredAt } : {}),
    });
    return normalizeMetric(unwrapPayload(response.data));
  },
  deleteMetric: async (id: string): Promise<void> => {
    await apiClient.delete(`/sustainability/${id}`);
  },
};

export default SustainabilityService;
