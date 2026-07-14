import React from 'react';
import { Volunteer } from '@/types/volunteers/volunteer';
import { VolunteerStatusBadge } from './VolunteerStatusBadge';

interface VolunteerCardProps {
  volunteer: Volunteer;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function VolunteerCard({ volunteer, selected, onSelect }: VolunteerCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(volunteer.id)}
      className={`w-full text-left rounded-lg p-3 border transition-colors ${
        selected
          ? 'border-blue-500 bg-blue-900/30'
          : 'border-gray-700 bg-[#101827] hover:border-gray-500'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-white text-sm">{volunteer.name}</span>
        <VolunteerStatusBadge status={volunteer.status} />
      </div>
      <p className="text-xs text-gray-400 mt-1">{volunteer.role}</p>
      <p className="text-xs text-gray-500">{volunteer.location}</p>
    </button>
  );
}
