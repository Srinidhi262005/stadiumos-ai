import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Volunteer } from '@/types/volunteers/volunteer';

interface VolunteerStatusBadgeProps {
  status: Volunteer['status'];
}

export const VolunteerStatusBadge: React.FC<VolunteerStatusBadgeProps> = ({ status }) => {
  const colorMap: Record<Volunteer['status'], string> = {
    available: 'bg-green-600',
    assigned: 'bg-blue-600',
    'on-break': 'bg-yellow-600',
    unavailable: 'bg-gray-600',
  };
  const labelMap: Record<Volunteer['status'], string> = {
    available: 'Available',
    assigned: 'Assigned',
    'on-break': 'On Break',
    unavailable: 'Unavailable',
  };
  return (
    <Badge variant="secondary" className={`${colorMap[status]} capitalize`}> 
      {labelMap[status]}
    </Badge>
  );
};
