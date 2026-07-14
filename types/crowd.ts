export interface GateTelemetry {
  gateId: string;
  gateName: string;
  flowRate: number; // people per minute
  capacityPercentage: number;
  status: 'open' | 'closed' | 'restricted';
  countIn: number;
  countOut: number;
}

export interface ZoneDensity {
  zoneId: string;
  zoneName: string;
  density: number; // people/m2
  currentOccupancy: number;
  maxCapacity: number;
  status: 'normal' | 'congested' | 'critical';
}

export interface CrowdTelemetry {
  totalOccupancy: number;
  maxCapacity: number;
  gates: GateTelemetry[];
  zones: ZoneDensity[];
  lastUpdated: string;
}
