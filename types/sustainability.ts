export type SustainabilityMetricType = 'energy' | 'water' | 'waste' | 'carbon';

export interface SustainabilityMetric {
  id: string;
  zoneId: string;
  metricType: SustainabilityMetricType;
  value: number;
  measuredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SustainabilityMetricFormValues {
  zoneId: string;
  metricType: SustainabilityMetricType;
  value: string;
  measuredAt: string;
}
