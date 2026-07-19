import { OperationTimelineEvent } from './common';

export interface DashboardStats {
  active_incidents: number;
  critical_incidents: number;
  total_volunteers: number;
  open_accessibility_requests: number;
  active_match: string;
  medical_response_time_min: number;
  volunteer_coverage_pct: number;
  accessibility_score_pct: number;
  operational_readiness_pct: number;
}

export interface DashboardTimelineEvent extends OperationTimelineEvent {}

export interface SystemMetric {
  id: string;
  label: string;
  value: string | number;
  change: number; // percentage change, e.g. +5.2 or -2.1
  trend: 'up' | 'down' | 'neutral';
  status: 'success' | 'warning' | 'danger' | 'primary';
  unit?: string;
  iconName?: string;
}

export interface TelemetryDataPoint {
  timestamp: string;
  crowdDensity: number;
  activeIncidents: number;
  powerConsumption: number;
  volunteerCoverage: number;
}
