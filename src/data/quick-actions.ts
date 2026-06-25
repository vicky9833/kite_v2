// src/data/quick-actions.ts
import type { QuickAction } from '@/types';

/**
 * Eight verified quick-action entry points rendered by the home page.
 * Icon names map to lucide-react exports. Data is sourced verbatim.
 */
export const quickActions: QuickAction[] = [
  {
    id: 'register-startup',
    label: 'Register Your Startup',
    description: 'One-time registration. Unlock 22+ schemes.',
    icon: 'Rocket',
    href: '/register',
  },
  {
    id: 'find-scheme',
    label: 'Find a Scheme',
    description: 'Match your stage and sector to the right grant or incentive.',
    icon: 'Search',
    href: '/schemes',
  },
  {
    id: 'policy-calculator',
    label: 'Policy Calculator',
    description: 'Estimate your benefits across all 22+ schemes.',
    icon: 'Calculator',
    href: '/calculator',
  },
  {
    id: 'find-incubator',
    label: 'Find an Incubator',
    description: 'Browse 164+ incubators across 5 regional clusters.',
    icon: 'Building2',
    href: '/incubators',
  },
  {
    id: 'find-mentor',
    label: 'Find a Mentor',
    description: 'Connect with vetted mentors across sectors and stages.',
    icon: 'Users',
    href: '/mentors',
  },
  {
    id: 'investor-connect',
    label: 'Investor Connect',
    description: 'Pipeline access for VCs, angels, and family offices.',
    icon: 'TrendingUp',
    href: '/investors',
  },
  {
    id: 'explore-clusters',
    label: 'Explore Beyond Bengaluru',
    description: '6 regional clusters. Seed funds. Sector specialization.',
    icon: 'MapPin',
    href: '/clusters',
  },
  {
    id: 'events-media',
    label: 'Events & Media',
    description: 'BTS 2026, Demo Days, Startup X-Factor convenings.',
    icon: 'Calendar',
    href: '/events',
  },
];
