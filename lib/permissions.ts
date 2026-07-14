import { UserRole } from '../types/auth';

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'],
  ops: [
    'dashboard:view',
    'digital-twin:view',
    'crowd:view',
    'crowd:control',
    'incidents:view',
    'incidents:edit',
    'incidents:dispatch',
    'volunteers:view',
    'volunteers:assign',
    'accessibility:view',
    'accessibility:edit',
    'sustainability:view',
    'reports:view',
    'reports:generate'
  ],
  volunteer: [
    'dashboard:view',
    'incidents:view',
    'incidents:create',
    'volunteers:view',
    'accessibility:view'
  ],
  external: [
    'dashboard:view',
    'reports:view'
  ]
};

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}
