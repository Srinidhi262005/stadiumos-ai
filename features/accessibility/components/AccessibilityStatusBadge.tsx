import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AccessibilityRequest } from '@/features/accessibility/types/accessibility';

interface AccessibilityStatusBadgeProps {
  status: AccessibilityRequest['status'];
}

export const AccessibilityStatusBadge: React.FC<AccessibilityStatusBadgeProps> = ({ status }) => {
  const colorMap: Record<AccessibilityRequest['status'], string> = {
    open: 'bg-green-600',
    'in-progress': 'bg-blue-600',
    completed: 'bg-gray-600',
    escalated: 'bg-red-600',
  };
  const labelMap: Record<AccessibilityRequest['status'], string> = {
    open: 'Open',
    'in-progress': 'In Progress',
    completed: 'Completed',
    escalated: 'Escalated',
  };
  return (
    <Badge variant="secondary" className={`${colorMap[status]} capitalize`}> {labelMap[status]} </Badge>
  );
};
