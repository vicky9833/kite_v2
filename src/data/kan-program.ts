// src/data/kan-program.ts
// VERIFIED data — authored verbatim from approved KAN (Karnataka Acceleration
// Network) program facts. Canonical, never fabricated (Req 11.1, 11.2).
// Verified figures: 6-month acceleration cohorts; 306 startups supported over
// 3 years (Req 4.3, 4.4). Copy is declarative, third-person, and free of
// superlatives, exclamation marks, and urgency/scarcity phrasing (Req 4.8).
import type { ProgramEditorialData } from '@/types';

export const kanProgram: ProgramEditorialData = {
  slug: 'kan',
  name: 'Karnataka Acceleration Network (KAN)',
  overview:
    'The Karnataka Acceleration Network (KAN) is a state-supported acceleration ' +
    'programme that helps growth-stage startups across Karnataka prepare for ' +
    'investment and scale. KAN runs structured six-month acceleration cohorts ' +
    'that pair founders with mentors, domain experts, and the state innovation ' +
    'ecosystem. Over its first three years, the programme has supported 306 ' +
    'startups drawn from incubators and accelerators across the Bengaluru and ' +
    'Beyond Bengaluru clusters.',
  provides: [
    'A six-month structured acceleration curriculum covering product, go-to-market, and fundraising readiness.',
    'Mentorship from domain experts, experienced founders, and investor networks.',
    'Connections to Karnataka incubators, accelerators, and research parks.',
    'Investor readiness support, including pitch preparation and due-diligence guidance.',
    'Access to state innovation programmes and ecosystem partners.',
  ],
  cohortStructure: {
    cadenceLabel: '6-month acceleration cohorts',
    detailLines: [
      'Each cohort runs for six months end to end.',
      'The programme has supported 306 startups over three years.',
      'Cohorts draw participants from incubators and accelerators across Karnataka.',
    ],
  },
  verifiedFigures: [
    '6-month acceleration cohorts',
    '306 startups supported over 3 years',
  ],
  applicationSteps: [
    'Review the programme scope and the current cohort timeline on the official portal.',
    'Complete the application form on the Karnataka startup portal.',
    'Participate in the screening and selection review conducted by the programme team.',
    'Join the six-month cohort upon selection and begin the structured curriculum.',
  ],
  partnerIncubatorIds: [
    'nsrcel-iimb',
    'c-camp',
    'axilor',
    'social-alpha',
    'deshpande-startups',
    'sjce-step',
  ],
  applyCta: {
    label: 'Apply on the official Karnataka startup portal',
    href: 'https://eitbt.karnataka.gov.in/startup',
  },
  successStoriesSeed: 'kan|success-stories',
};
