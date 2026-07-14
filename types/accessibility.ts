export type AssistanceType = 'wheelchair' | 'vision' | 'hearing' | 'mobility';
export type AssistanceStatus = 'pending' | 'assisting' | 'completed';

export interface AssistanceRequest {
  id: string;
  guestName: string;
  seatNumber: string;
  assistanceType: AssistanceType;
  status: AssistanceStatus;
  requestedAt: string;
  assignedStaffId?: string;
  notes?: string;
}

export interface AccessibilityStatus {
  totalAccessibleSeats: number;
  occupiedAccessibleSeats: number;
  activeRequests: number;
  elevatorsOperational: number;
  totalElevators: number;
}
