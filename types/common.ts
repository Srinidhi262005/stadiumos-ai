export type StatusSeverity = 'success' | 'warning' | 'danger' | 'primary' | 'info';

export interface GeoLocation {
  lat: number;
  lng: number;
  elevation?: number;
}

export interface AiModelConfidence {
  score: number; // percentage value from 0 to 100
  sampleSize?: number;
  algorithmUsed: string;
}

export interface OperationTimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'system' | 'incident' | 'crowd' | 'volunteer' | 'ai';
  severity: StatusSeverity;
}
