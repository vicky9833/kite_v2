// src/data/k-combinator-program.ts
//
// VERIFIED data — authored verbatim from the approved K-Combinator program
// facts. Every figure below is canonical and traces directly to the verified
// K-Combinator constant set (Req 5.3–5.10, 11.1):
//   - Partnership with KDEM and TiE Mangaluru.
//   - Located at wrkwrk in Silicon Beach Mangaluru.
//   - 4–6 startups per cohort; 3 cohorts per year.
//   - 90 startups over 5 years; target of 5 soonicorns by 2034.
//   - Exact nine sectors: Deep Tech, Space, Drone, AI, Robotics, HealthTech,
//     AgriTech, FinTech, MarineTech.
//   - Grant of ₹10 lakh per qualifying startup at 0% equity.
//   - 5-year budget of ₹9.5 crore from the Government of Karnataka plus
//     ₹50 lakh in-kind from TiE.
// No synthetic content lives here; success stories are generated at render
// time from `successStoriesSeed`. Copy is declarative, third-person, and free
// of superlatives, exclamation marks, and urgency/scarcity phrasing (Req 5.14).

import type { ProgramEditorialData } from '@/types';

/**
 * The nine K-Combinator sectors are a program-specific verified `string[]`
 * literal (Req 5.8), distinct from the canonical 20-sector taxonomy used by
 * the mentor and incubator filters.
 */
const K_COMBINATOR_SECTORS: string[] = [
  'Deep Tech',
  'Space',
  'Drone',
  'AI',
  'Robotics',
  'HealthTech',
  'AgriTech',
  'FinTech',
  'MarineTech',
];

export const kCombinatorProgram: ProgramEditorialData = {
  slug: 'k-combinator',
  name: 'K-Combinator',
  overview:
    'K-Combinator is a frontier-technology acceleration program delivered in ' +
    'partnership with the Karnataka Digital Economy Mission (KDEM) and TiE ' +
    'Mangaluru. The program is based at wrkwrk in Silicon Beach Mangaluru and ' +
    'supports startups working in deep-tech and frontier sectors. It admits ' +
    '4 to 6 startups per cohort across 3 cohorts each year, with a five-year ' +
    'target of 90 startups and 5 soonicorns by 2034.',
  provides: [
    'A grant of ₹10 lakh per qualifying startup at 0% equity.',
    'A structured cohort placed at wrkwrk in Silicon Beach Mangaluru.',
    'Mentorship and ecosystem access through TiE Mangaluru and KDEM.',
    'Sector-focused support across deep-tech and frontier technology areas.',
  ],
  cohortStructure: {
    cadenceLabel: '4–6 startups per cohort, 3 cohorts per year',
    detailLines: [
      'Each cohort admits 4 to 6 startups.',
      'The program runs 3 cohorts per year.',
      'The five-year target is 90 startups supported.',
      'The program targets 5 soonicorns by 2034.',
    ],
  },
  verifiedFigures: [
    'Partnership with KDEM and TiE Mangaluru',
    'Located at wrkwrk in Silicon Beach Mangaluru',
    '4–6 startups per cohort',
    '3 cohorts per year',
    '90 startups over 5 years',
    'Target of 5 soonicorns by 2034',
    'Grant of ₹10 lakh per qualifying startup at 0% equity',
    '5-year budget of ₹9.5 crore from the Government of Karnataka',
    '₹50 lakh in-kind contribution from TiE',
  ],
  sectors: K_COMBINATOR_SECTORS,
  applicationSteps: [
    'Review the program focus across the nine supported sectors.',
    'Prepare details of the startup, team, and current stage.',
    'Submit an application through the official Karnataka portal.',
    'Shortlisted startups are evaluated for the next cohort intake.',
  ],
  // Real ids from src/data/incubators.ts. 'wrkwrk' is the K-Combinator anchor
  // in Silicon Beach Mangaluru; the remaining ids are Mangaluru-cluster
  // incubators that align with the program's frontier-technology sectors.
  partnerIncubatorIds: ['wrkwrk', 'sahyadri-shine', 'aic-nitte', 'manipal-tbi'],
  applyCta: {
    label: 'Apply on the official portal',
    href: 'https://wrkwrk.space',
  },
  successStoriesSeed: 'k-combinator|success-stories',
};
