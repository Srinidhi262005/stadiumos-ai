export interface Volunteer {
  id: string;
  name: string;
  role: string;
  languages: string[];
  skills: string[];
  location: string;
  status: 'available' | 'assigned' | 'on-break' | 'unavailable';
  certifications?: string[];
}

export interface Assignment {
  incidentId: string;
  mission: string;
  status: 'accepted' | 'travelling' | 'arrived' | 'task-started' | 'completed';
  eta: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  checklist: string[];
  eta: string;
  location: string;
  assignedVolunteerId?: string;
}
