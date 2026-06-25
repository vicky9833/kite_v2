// src/data/flagship-programs.ts
import type { FlagshipProgram } from '@/types';

/**
 * The six flagship programs of the Karnataka startup ecosystem.
 * Data is sourced verbatim from verified official program documentation.
 * Order is significant and matches the home page Flagship Programs section.
 */
export const flagshipPrograms: FlagshipProgram[] = [
  {
    id: 'leap',
    name: 'LEAP',
    tagline: '₹1,000 Crore. 16 sub-programs. 5 years.',
    description:
      'Umbrella program for catalytic capital, deep-tech, fund-of-funds, and ecosystem infrastructure.',
    keyMetric: '₹1,000 Cr',
    status: 'active',
    ctaLabel: 'Explore LEAP',
    href: '/programs/leap',
  },
  {
    id: 'k-combinator',
    name: 'K-Combinator',
    tagline: 'Mangaluru-based. 90 startups over 5 years. ₹9.5 Cr GoK + TiE.',
    description:
      'KDEM + TiE Mangaluru partnership. 4-6 startups per cohort, 3 cohorts/year. Target: 5 soonicorns by 2034.',
    keyMetric: '90 startups',
    status: 'active',
    ctaLabel: 'Apply to K-Combinator',
    href: '/programs/k-combinator',
  },
  {
    id: 'kitven-fund-5',
    name: 'KITVEN Fund-5',
    tagline: '₹100 Cr VC fund. 2-10% of corpus. Max 30% stake.',
    description:
      "Karnataka's flagship venture capital fund for growth-stage startups.",
    keyMetric: '₹100 Cr',
    status: 'active',
    ctaLabel: 'Apply to KITVEN',
    href: '/schemes/kitven',
  },
  {
    id: 'elevate',
    name: 'ELEVATE (Idea2PoC)',
    tagline: 'Up to ₹50 lakh. 1,227+ funded since 2017.',
    description:
      "Karnataka's flagship early-stage grant program. 4-stage selection.",
    keyMetric: '₹280+ Cr committed',
    status: 'active',
    ctaLabel: 'Apply to ELEVATE',
    href: '/schemes/elevate',
  },
  {
    id: 'beyond-bengaluru-fund',
    name: 'Beyond Bengaluru Cluster Fund',
    tagline: '₹75 Cr cluster seed fund. 6 regional clusters.',
    description:
      'Seed equity for startups in Mysuru, Mangaluru, HDB, Kalaburagi, Shivamogga, Tumakuru.',
    keyMetric: '₹75 Cr',
    status: 'active',
    ctaLabel: 'Explore Clusters',
    href: '/clusters',
  },
  {
    id: 'gck',
    name: 'Grand Challenge Karnataka',
    tagline: 'Phase 2A: ₹10L × 5 startups. Phase 2B winner: ₹50L.',
    description:
      'Sector-specific challenge program with public-private problem statements.',
    keyMetric: '₹50L winner',
    status: 'active',
    ctaLabel: 'View Active Challenges',
    href: '/schemes/gck',
  },
];
