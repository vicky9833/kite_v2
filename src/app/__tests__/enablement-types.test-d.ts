// Feature: kite-ecosystem-enablement — Type-compile guard (Task 1.2)
//
// This is a COMPILE-TIME type-level assertion file. It has no runtime test
// framework dependency and is intentionally named `*.test-d.ts` (the type-test
// convention). It is validated by `npx tsc --noEmit` — tsconfig's
// `include: ["**/*.ts", ...]` picks it up, so any shape regression in the
// enablement-layer types (or any change to the reused Incubator / IncubatorType
// exports) becomes a hard compile error.
//
// What it proves:
//  1. The new enablement-layer types from `@/types` exist and are importable.
//  2. A valid sample literal of every new interface/type compiles (shapes intact).
//  3. The existing `Incubator` / `IncubatorType` exports are UNCHANGED and still
//     usable (construct a sample Incubator + assign an IncubatorType), asserted
//     both by construction and by a structural type-equality check.
//
// Validates: Requirements 16.1, 16.2, 16.3, 16.4

import {
  // New enablement-layer enumerations
  type MentorType,
  MENTOR_TYPES,
  type MentorAvailability,
  MENTOR_AVAILABILITY,
  type ExperienceLevel,
  // New enablement-layer interfaces
  type MentorProfile,
  type IncubatorDetail,
  type IncubatorFilters,
  type MentorFilters,
  type ExperienceBand,
  type ProgramApplyCta,
  type ProgramCohortStructure,
  type ProgramEditorialData,
  type ProgramSuccessStory,
  // Existing exports that MUST remain unchanged and reused (never redefined)
  type Incubator,
  type IncubatorType,
} from '@/types';

// ---------------------------------------------------------------------------
// Type-level assertion helpers (no runtime cost).
// `Expect<Equal<A, B>>` resolves to `true` only when A and B are identical;
// otherwise it is a compile error.
// ---------------------------------------------------------------------------
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

// ===========================================================================
// 1. Existing exports are UNCHANGED (Req 16.1, 16.2, 16.3)
// ===========================================================================

// IncubatorType union is exactly the three canonical values, in this shape.
type _IncubatorTypeUnchanged = Expect<
  Equal<IncubatorType, 'Incubator' | 'Accelerator' | 'Research Park'>
>;

// Incubator structural shape is unchanged.
type _IncubatorUnchanged = Expect<
  Equal<
    Incubator,
    {
      id: string;
      name: string;
      cluster: string;
      focus: string[];
      type: IncubatorType;
    }
  >
>;

// ...and still usable by construction.
const sampleIncubatorType: IncubatorType = 'Accelerator';

export const sampleIncubator: Incubator = {
  id: 'nsrcel-iimb',
  name: 'NSRCEL, IIM Bangalore',
  cluster: 'Bengaluru',
  focus: ['SaaS', 'DeepTech'],
  type: sampleIncubatorType,
};

// ===========================================================================
// 2. New enablement-layer enumerations (Req 16.4)
// ===========================================================================

export const sampleMentorType: MentorType = 'Domain Expert';
export const sampleMentorTypes: readonly MentorType[] = MENTOR_TYPES;

export const sampleAvailability: MentorAvailability = 'Open to mentees';
export const sampleAvailabilities: readonly MentorAvailability[] = MENTOR_AVAILABILITY;

export const sampleExperienceLevel: ExperienceLevel = 'established';

// ===========================================================================
// 3. New enablement-layer interfaces — valid sample literals (Req 16.4)
// ===========================================================================

export const sampleMentorProfile: MentorProfile = {
  id: 'mentor-0',
  name: 'Asha Nair',
  initialsAvatar: 'AN',
  title: 'Principal Advisor',
  firm: 'Coastal Ventures',
  sectors: ['fintech', 'agritech'],
  yearsExperience: 12,
  mentorType: 'Founder Mentor',
  availability: 'Limited availability',
  bio: 'An illustrative one-paragraph bio describing the mentor in declarative, third-person prose.',
};

export const sampleIncubatorDetail: IncubatorDetail = {
  incubatorId: 'nsrcel-iimb',
  aboutParagraph: 'An illustrative description of the incubator and its focus.',
  cohortsPerYear: 3,
  startupsSupported: 120,
  illustrativeOfferings: ['Mentorship', 'Co-working', 'Grant access'],
  illustrativeContactLabel: 'Reach the program team via the official portal',
};

export const sampleIncubatorFilters: IncubatorFilters = {
  cluster: 'Bengaluru',
  focus: null,
  type: 'Incubator',
};

export const sampleMentorFilters: MentorFilters = {
  sector: 'fintech',
  mentorType: 'Investor Mentor',
  experienceLevel: 'veteran',
};

export const sampleExperienceBand: ExperienceBand = {
  id: 'emerging',
  label: 'Emerging (2–7 yrs)',
  min: 2,
  max: 7,
};

export const sampleApplyCta: ProgramApplyCta = {
  label: 'Apply on the official portal',
  href: 'https://startup.karnataka.gov.in/',
};

export const sampleCohortStructure: ProgramCohortStructure = {
  cadenceLabel: '6-month acceleration cohorts',
  detailLines: ['Two cohorts per year', 'Structured milestone reviews'],
};

export const sampleProgramEditorialData: ProgramEditorialData = {
  slug: 'kan',
  name: 'Karnataka Acceleration Network (KAN)',
  overview: 'A declarative, third-person overview of the program.',
  provides: ['Acceleration support', 'Mentor access'],
  cohortStructure: sampleCohortStructure,
  verifiedFigures: ['6-month acceleration cohorts', '306 startups supported over 3 years'],
  sectors: ['Deep Tech', 'AI'], // optional field exercised
  applicationSteps: ['Submit application', 'Screening', 'Selection'],
  partnerIncubatorIds: ['nsrcel-iimb'],
  applyCta: sampleApplyCta,
  successStoriesSeed: 'kan|success-stories',
};

// ProgramEditorialData with the optional `sectors` omitted must also compile.
export const sampleProgramEditorialDataNoSectors: ProgramEditorialData = {
  slug: 'k-combinator',
  name: 'K-Combinator',
  overview: 'A declarative overview.',
  provides: ['Grant support'],
  cohortStructure: { cadenceLabel: '4–6 startups per cohort', detailLines: ['3 cohorts per year'] },
  verifiedFigures: ['90 startups over 5 years'],
  applicationSteps: ['Apply'],
  partnerIncubatorIds: [],
  applyCta: { label: 'Apply', href: 'https://example.karnataka.gov.in/' },
  successStoriesSeed: 'k-combinator|success-stories',
};

export const sampleSuccessStory: ProgramSuccessStory = {
  id: 'story-0',
  startupName: 'Illustrative Labs',
  sector: 'agritech',
  outcomeLine: 'An illustrative, declarative outcome line.',
};
