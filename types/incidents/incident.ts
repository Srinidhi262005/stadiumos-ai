export interface Incident {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  detectionTime: string;
  assignedTeam: string;
  status: 'detected' | 'in-progress' | 'resolved' | 'escalated';
  summary: string;
  affectedZone: string;
  crowdImpact: string;
  images?: string[];
}
