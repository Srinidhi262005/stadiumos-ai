export type UserRole = 'admin' | 'ops' | 'volunteer' | 'external';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  permissions: string[];
  department?: string;
}

export interface AuthSession {
  token: string;
  expiresAt: number;
  user: UserProfile;
}
