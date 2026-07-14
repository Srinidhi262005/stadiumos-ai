export type RequestCategory =
  | 'wheelchair'
  | 'visual'
  | 'hearing'
  | 'senior'
  | 'family'
  | 'medical';

export type RequestPriority = 'low' | 'medium' | 'high' | 'critical';
export type RequestStatus = 'open' | 'in-progress' | 'completed' | 'escalated';

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
