import apiClient from './client';
import { ApiResponse } from '../../types/api';
import { DashboardStats, DashboardTimelineEvent, SystemMetric, TelemetryDataPoint } from '../../types/dashboard';

const unwrapPayload = <T,>(payload: T | ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

const fallbackStats: DashboardStats = {
  active_incidents: 3,
  critical_incidents: 1,
  total_volunteers: 18,
  open_accessibility_requests: 2,
  active_match: 'FIFA World Cup 2026: USA vs England',
  medical_response_time_min: 2.4,
  volunteer_coverage_pct: 92,
  accessibility_score_pct: 88,
  operational_readiness_pct: 96,
};

const fallbackTimeline: DashboardTimelineEvent[] = [
  {
    id: 'demo-1',
    title: 'Crowd surge detected',
    description: 'Gate A is running 15% above expected density and stewards are being rerouted.',
    timestamp: '08:12',
    category: 'crowd',
    severity: 'warning',
  },
  {
    id: 'demo-2',
    title: 'Medical team standby',
    description: 'A rapid-response unit has been positioned near the East Stand.',
    timestamp: '08:24',
    category: 'incident',
    severity: 'danger',
  },
  {
    id: 'demo-3',
    title: 'Volunteer shift updated',
    description: 'Two experienced volunteers were reassigned to guest support.',
    timestamp: '08:35',
    category: 'volunteer',
    severity: 'success',
  },
];

export const DashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get<DashboardStats | ApiResponse<DashboardStats>>('/dashboard/stats');
      return unwrapPayload(response.data);
    } catch {
      return fallbackStats;
    }
  },
  getTimeline: async (): Promise<DashboardTimelineEvent[]> => {
    try {
      const response = await apiClient.get<DashboardTimelineEvent[] | ApiResponse<DashboardTimelineEvent[]>>('/dashboard/timeline');
      const timeline = unwrapPayload(response.data);
      return timeline.length > 0 ? timeline : fallbackTimeline;
    } catch {
      return fallbackTimeline;
    }
  },
  getMetrics: async (): Promise<SystemMetric[]> => {
    return [];
  },
  getTelemetryHistory: async (_range: string): Promise<TelemetryDataPoint[]> => {
    return [];
  }
};

export default DashboardService;
