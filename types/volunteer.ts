export type ShiftStatus = 'scheduled' | 'active' | 'completed' | 'absent';

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  skills: string[];
  status: 'available' | 'on-duty' | 'offline';
}

export interface VolunteerShift {
  id: string;
  volunteerId: string;
  volunteerName: string;
  role: string;
  location: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
}

export interface VolunteerStaffing {
  totalVolunteers: number;
  activeVolunteers: number;
  coveragePercentage: number;
  shifts: VolunteerShift[];
}
