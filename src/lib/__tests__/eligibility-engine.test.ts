// Feature: kite-registration-schemes-calculator — eligibility engine unit tests
//
// Table-driven EXAMPLE unit tests (NOT property tests) for
// `src/lib/eligibility-engine.ts`. These pin the per-scheme Req 18 rules to
// concrete boundary cases and verify the status -> benefit/confidence mapping
// (Req 19.2, 19.4). Scheme objects are the REAL canonical objects looked up
// from `src/data/schemes.ts` by id — nothing is fabricated here.

import { describe, expect, it } from 'vitest';

import {
  SCHEME_MAX_BENEFIT_RUPEES,
  evaluateScheme,
} from '@/lib/eligibility-engine';
import { schemes } from '@/data/schemes';
import type {
  EligibilityStatus,
  RegistrationProfile,
  Scheme,
} from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Look up a real scheme object from the canonical data by id. */
function schemeById(id: string): Scheme {
  const scheme = schemes.find((s) => s.id === id);
  if (!scheme) {
    throw new Error(`Test setup error: no scheme with id "${id}" in schemes.ts`);
  }
  return scheme;
}

/**
 * A fully-populated, sensible-default RegistrationProfile. Defaults are chosen
 * to be a "qualifying-ish" baseline (DPIIT + GST recognized, Early Revenue,
 * young founder, non-Bengaluru location, early funding) so that each case below
 * only has to override the field(s) under test.
 */
const baseProfile: RegistrationProfile = {
  // Founder (Step 1)
  founderName: 'Test Founder',
  founderEmail: 'founder@example.com',
  founderPhone: '9999999999',
  founderAge: 28,
  // Company (Step 2)
  companyName: 'Test Co',
  dpiitRecognized: true,
  gstRegistered: true,
  incorporationDate: '2023-01-01',
  currentStage: 'Early Revenue',
  // Team (Step 3)
  teamSize: 5,
  womenFounderStake: 0,
  womenEmployeePercentage: 0,
  scStFounder: false,
  // Sector (Step 4)
  primarySector: 'fintech',
  secondarySectors: [],
  // Location & funding (Step 5)
  location: 'Mysuru', // Zone 2, not Bengaluru Urban
  fundingStage: 'Pre-Seed',
  fundingRaised: 10,
  // Status
  isRegistered: true,
  kiteId: 'KITE-TEST-0001',
  registeredAt: '2023-01-02',
};

/** Build a profile from the base with per-case field overrides. */
function makeProfile(overrides: Partial<RegistrationProfile>): RegistrationProfile {
  return { ...baseProfile, ...overrides };
}

// ---------------------------------------------------------------------------
// Table-driven Req 18 status cases
// ---------------------------------------------------------------------------

interface StatusCase {
  name: string;
  schemeId: string;
  overrides: Partial<RegistrationProfile>;
  expectedStatus: EligibilityStatus;
}

const statusCases: StatusCase[] = [
  // --- Req 18.2: SGST Reimbursement ---
  {
    name: 'SGST: dpiit + gst + stage >= Early Revenue -> definitely-eligible',
    schemeId: 'sgst-reimbursement',
    overrides: { dpiitRecognized: true, gstRegistered: true, currentStage: 'Early Revenue' },
    expectedStatus: 'definitely-eligible',
  },
  {
    name: 'SGST: missing dpiit -> not-eligible',
    schemeId: 'sgst-reimbursement',
    overrides: { dpiitRecognized: false, gstRegistered: true, currentStage: 'Growth' },
    expectedStatus: 'not-eligible',
  },
  {
    name: 'SGST: missing gst -> not-eligible',
    schemeId: 'sgst-reimbursement',
    overrides: { dpiitRecognized: true, gstRegistered: false, currentStage: 'Early Revenue' },
    expectedStatus: 'not-eligible',
  },

  // --- Req 18.3: Patent Filing Subsidy ---
  {
    name: 'Patent: dpiit (Idea stage) -> definitely-eligible',
    schemeId: 'patent-subsidy',
    overrides: { dpiitRecognized: true, currentStage: 'Idea' },
    expectedStatus: 'definitely-eligible',
  },
  {
    name: 'Patent: no dpiit -> not-eligible',
    schemeId: 'patent-subsidy',
    overrides: { dpiitRecognized: false },
    expectedStatus: 'not-eligible',
  },

  // --- Req 18.4: ELEVATE ---
  {
    name: 'ELEVATE: Idea + Pre-Seed -> definitely-eligible',
    schemeId: 'elevate',
    overrides: { currentStage: 'Idea', fundingStage: 'Pre-Seed' },
    expectedStatus: 'definitely-eligible',
  },
  {
    name: 'ELEVATE: PoC + Bootstrapped -> definitely-eligible',
    schemeId: 'elevate',
    overrides: { currentStage: 'PoC', fundingStage: 'Bootstrapped' },
    expectedStatus: 'definitely-eligible',
  },
  {
    name: 'ELEVATE: past window (Growth + Series A) -> not-eligible',
    schemeId: 'elevate',
    overrides: { currentStage: 'Growth', fundingStage: 'Series A' },
    expectedStatus: 'not-eligible',
  },
  {
    name: 'ELEVATE: stage past PoC but early funding -> check-requirements',
    schemeId: 'elevate',
    overrides: { currentStage: 'Early Revenue', fundingStage: 'Pre-Seed' },
    expectedStatus: 'check-requirements',
  },

  // --- Req 18.5: ELEVATE Unnati ---
  {
    name: 'ELEVATE Unnati: scStFounder false -> not-eligible',
    schemeId: 'elevate-unnati',
    overrides: { scStFounder: false, currentStage: 'Idea', fundingStage: 'Pre-Seed' },
    expectedStatus: 'not-eligible',
  },
  {
    name: 'ELEVATE Unnati: scStFounder true + ELEVATE conditions -> definitely-eligible',
    schemeId: 'elevate-unnati',
    overrides: { scStFounder: true, currentStage: 'PoC', fundingStage: 'Pre-Seed' },
    expectedStatus: 'definitely-eligible',
  },

  // --- Req 18.7: RGEP ---
  {
    name: 'RGEP: founderAge <= 30 (exactly 30) -> definitely-eligible',
    schemeId: 'rgep',
    overrides: { founderAge: 30 },
    expectedStatus: 'definitely-eligible',
  },
  {
    name: 'RGEP: founderAge > 30 -> not-eligible',
    schemeId: 'rgep',
    overrides: { founderAge: 31 },
    expectedStatus: 'not-eligible',
  },

  // --- Req 18.8: New Incubation Centers ---
  {
    name: 'New incubation centers: Zone 1 location -> definitely-eligible',
    schemeId: 'new-incubation-centers',
    overrides: { location: 'Kalaburagi' }, // Zone 1
    expectedStatus: 'definitely-eligible',
  },
  {
    name: 'New incubation centers: Zone 2 location -> definitely-eligible',
    schemeId: 'new-incubation-centers',
    overrides: { location: 'Mysuru' }, // Zone 2
    expectedStatus: 'definitely-eligible',
  },
  {
    name: 'New incubation centers: Bengaluru Urban (Zone 3) -> not-eligible',
    schemeId: 'new-incubation-centers',
    overrides: { location: 'Bengaluru Urban' },
    expectedStatus: 'not-eligible',
  },

  // --- Req 18.9: Beyond Bengaluru Cluster Seed Fund ---
  {
    name: 'Beyond Bengaluru cluster fund: non-Bengaluru location -> definitely-eligible',
    schemeId: 'beyond-bengaluru-cluster-fund',
    overrides: { location: 'Hubballi-Dharwad-Belagavi' },
    expectedStatus: 'definitely-eligible',
  },
  {
    name: 'Beyond Bengaluru cluster fund: Bengaluru Urban -> not-eligible',
    schemeId: 'beyond-bengaluru-cluster-fund',
    overrides: { location: 'Bengaluru Urban' },
    expectedStatus: 'not-eligible',
  },

  // --- Req 18.10: KITVEN Fund-5 ---
  {
    name: 'KITVEN: stage >= Early Revenue -> definitely-eligible',
    schemeId: 'kitven-fund-5',
    overrides: { currentStage: 'Early Revenue' },
    expectedStatus: 'definitely-eligible',
  },
  {
    name: 'KITVEN: earlier stage (PoC) -> not-eligible',
    schemeId: 'kitven-fund-5',
    overrides: { currentStage: 'PoC' },
    expectedStatus: 'not-eligible',
  },

  // --- Req 18.11: Internship Support ---
  {
    name: 'Internship support: dpiit -> definitely-eligible',
    schemeId: 'internship-support',
    overrides: { dpiitRecognized: true },
    expectedStatus: 'definitely-eligible',
  },
  {
    name: 'Internship support: no dpiit -> not-eligible',
    schemeId: 'internship-support',
    overrides: { dpiitRecognized: false },
    expectedStatus: 'not-eligible',
  },

  // --- Req 18.12: NAIN 2.0 (student-team status not captured -> always check) ---
  {
    name: 'NAIN 2.0: unknown student-team status -> check-requirements (dpiit profile)',
    schemeId: 'nain-2',
    overrides: { dpiitRecognized: true },
    expectedStatus: 'check-requirements',
  },
  {
    name: 'NAIN 2.0: unknown student-team status -> check-requirements (no dpiit profile)',
    schemeId: 'nain-2',
    overrides: { dpiitRecognized: false },
    expectedStatus: 'check-requirements',
  },
];

describe('eligibility-engine — Req 18 per-scheme status rules', () => {
  it.each(statusCases)('$name', ({ schemeId, overrides, expectedStatus }) => {
    const scheme = schemeById(schemeId);
    const result = evaluateScheme(makeProfile(overrides), scheme);

    expect(result.schemeId).toBe(schemeId);
    expect(result.status).toBe(expectedStatus);

    // Req 19.5: any non-definitely-eligible result must carry a non-empty reason.
    if (expectedStatus !== 'definitely-eligible') {
      expect(result.reasons.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Status -> benefit/confidence mapping (Req 19.2, 19.4)
// ---------------------------------------------------------------------------

describe('eligibility-engine — status to benefit/confidence mapping', () => {
  it('definitely-eligible -> full scheme maximum benefit + confidence 1', () => {
    const scheme = schemeById('patent-subsidy');
    const result = evaluateScheme(makeProfile({ dpiitRecognized: true }), scheme);

    expect(result.status).toBe('definitely-eligible');
    expect(result.estimatedBenefit).toBe(SCHEME_MAX_BENEFIT_RUPEES['patent-subsidy']);
    expect(result.confidence).toBe(1);
  });

  it('likely-eligible -> half of scheme maximum benefit + confidence 0.7', () => {
    // SGST with dpiit + gst but still at Idea stage falls to likely-eligible.
    const scheme = schemeById('sgst-reimbursement');
    const sgstMax = SCHEME_MAX_BENEFIT_RUPEES['sgst-reimbursement'] ?? 0;
    const result = evaluateScheme(
      makeProfile({ dpiitRecognized: true, gstRegistered: true, currentStage: 'Idea' }),
      scheme,
    );

    expect(result.status).toBe('likely-eligible');
    expect(result.estimatedBenefit).toBe(sgstMax / 2);
    expect(result.confidence).toBe(0.7);
  });

  it('not-eligible -> 0 benefit + confidence 0', () => {
    const scheme = schemeById('patent-subsidy');
    const result = evaluateScheme(makeProfile({ dpiitRecognized: false }), scheme);

    expect(result.status).toBe('not-eligible');
    expect(result.estimatedBenefit).toBe(0);
    expect(result.confidence).toBe(0);
  });

  it('check-requirements -> 0 benefit + confidence 0.3', () => {
    const scheme = schemeById('nain-2');
    const result = evaluateScheme(makeProfile({}), scheme);

    expect(result.status).toBe('check-requirements');
    expect(result.estimatedBenefit).toBe(0);
    expect(result.confidence).toBe(0.3);
  });
});
