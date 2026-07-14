import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Incident } from '@/types/incidents/incident';
import { motion } from 'framer-motion';

interface IncidentCardProps {
  incident: Incident;
  onSelect: (id: string) => void;
  selected: boolean;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onSelect, selected }) => {
  const severityColors: Record<Incident['severity'], string> = {
    low: 'bg-green-600',
    medium: 'bg-yellow-600',
    high: 'bg-orange-600',
    critical: 'bg-red-600 animate-pulse',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`cursor-pointer border-l-4 ${severityColors[incident.severity]} ${selected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onSelect(incident.id)}
    >
      <Card className="bg-[#101827] border-none text-white">
        <CardHeader className="p-2">
          <CardTitle className="flex justify-between items-center text-sm">
            <span>{incident.id}</span>
            <Badge variant="secondary" className="capitalize">{incident.severity}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 text-xs">
          <p className="font-medium">{incident.category}</p>
          <p>{incident.location}</p>
          <p className="text-gray-400">{incident.detectionTime}</p>
          <p className="mt-1 text-primary">{incident.status}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
