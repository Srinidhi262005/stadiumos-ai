import React from 'react';
import { Badge } from '@/components/ui/badge';

interface LanguageBadgeProps {
  language: string;
}

export const LanguageBadge: React.FC<LanguageBadgeProps> = ({ language }) => (
  <Badge variant="secondary" className="bg-blue-700 capitalize mr-1">
    {language}
  </Badge>
);

interface SkillBadgeProps {
  skill: string;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({ skill }) => (
  <Badge variant="secondary" className="bg-purple-700 capitalize mr-1">
    {skill}
  </Badge>
);
