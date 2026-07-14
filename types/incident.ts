export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'acknowledged' | 'dispatching' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: string;
  reportedAt: string;
  resolvedAt?: string;
  assignedTeam?: string;
  reporterName: string;
  gpsCoordinates?: {
    lat: number;
    lng: number;
  };
}
