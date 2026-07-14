export const ROUTES = {
  DASHBOARD: '/dashboard',
  DIGITAL_TWIN: '/digital-twin',
  CROWD: '/crowd',
  INCIDENTS: '/incidents',
  VOLUNTEERS: '/volunteers',
  ACCESSIBILITY: '/accessibility',
  SUSTAINABILITY: '/sustainability',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  LOGIN: '/login'
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
