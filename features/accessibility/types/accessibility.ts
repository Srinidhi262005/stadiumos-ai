export enum RequestCategory {
  WHEELCHAIR = 'wheelchair',
  VISUAL = 'visual',
  HEARING = 'hearing',
  SENIOR = 'senior',
  FAMILY = 'family',
  MEDICAL = 'medical',
  ESCORT = 'escort',
}

export enum RequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum RequestStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  ESCALATED = 'escalated',
}

export interface AccessibilityRequest {
  id: string;
  spectatorName: string;
  category: RequestCategory;
  priority: RequestPriority;
  location: string;
  assignedVolunteerId?: string;
  status: RequestStatus;
  need: string; // description of need
  preferredLanguage: string;
  destination: string;
  estimatedDistance: string;
}

export type ResourceType = 'wheelchair' | 'escort' | 'elevator' | 'restroom' | 'ramp';
export type ResourceStatus = 'available' | 'in-use' | 'offline';

export interface AccessibilityResource {
  id: string;
  type: ResourceType;
  status: ResourceStatus;
  location?: string;
}
