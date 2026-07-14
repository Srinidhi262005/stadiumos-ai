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
