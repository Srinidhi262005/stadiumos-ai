export interface NavigationItem {
  name: string;
  href: string;
  iconName: string;
  description: string;
  roles?: string[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    iconName: 'LayoutDashboard',
    description: 'Stadium operations overview and live telemetry'
  },
  {
    name: 'Digital Twin',
    href: '/digital-twin',
    iconName: 'Layers',
    description: '3D spatial visualization and sensor tracking'
  },
  {
    name: 'Crowd Flow',
    href: '/crowd',
    iconName: 'Users',
    description: 'Real-time density tracking and gate control'
  },
  {
    name: 'Incidents & Safety',
    href: '/incidents',
    iconName: 'AlertTriangle',
    description: 'Active dispatcher and emergency management'
  },
  {
    name: 'Volunteers',
    href: '/volunteers',
    iconName: 'UserCheck',
    description: 'Staff allocation, scheduling, and shifts'
  },
  {
    name: 'Accessibility',
    href: '/accessibility',
    iconName: 'Accessibility',
    description: 'Accessible seating and route monitoring'
  },
  {
    name: 'Sustainability',
    href: '/sustainability',
    iconName: 'Leaf',
    description: 'Resource, waste, and energy optimization'
  },
  {
    name: 'Reports & Logs',
    href: '/reports',
    iconName: 'FileText',
    description: 'Analytical reports and operational logs'
  },
  {
    name: 'Settings',
    href: '/settings',
    iconName: 'Settings',
    description: 'System config and FastAPI integration keys'
  }
];
