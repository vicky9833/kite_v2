import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  SCHEME_MAX_BENEFIT_RUPEES,
  deriveZone,
  evaluateScheme,
  evaluateAllSchemes,
  totalEstimatedBenefit,
} from "@/lib/eligibility-engine";
import { schemes } from "@/data/schemes";
import type {
  CurrentStage,
  EligibilityStatus,
  FundingStage,
  LocationKarnataka,
  RegistrationProfile,
  Scheme,
  Zone,
} from "@/types";

// ---------------------------------------------------------------------------
// Shared generators
// ---------------------------------------------------------------------------

/** The four canonical eligibility statuses. */
const ALL_STATUSES: readonly EligibilityStatus[] = [
  "definitely-eligible",
  "likely-eligible",
  "check-requirements",
  "not-eligible",
];

/** A status is "qualifying" (counts toward totals/count) when definitely/likely. */
function isQualifying(status: EligibilityStatus): boolean {
  return status === "definitely-eligible" || status === "likely-eligible";
}

const CURRENT_STAGES: readonly CurrentStage[] = [
  "Idea",
  "PoC",
  "Early Revenue",
  "Growth",
  "Scale",
];

const FUNDING_STAGES: readonly FundingStage[] = [
  "Bootstrapped",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B Plus",
];

const LOCATIONS: readonly LocationKarnataka[] = [
  "Bengaluru Urban",
  "Bengaluru Rural",
  "Mysuru",
  "Mangaluru",
  "Hubballi-Dharwad-Belagavi",
  "Kalaburagi",
  "Shivamogga",
  "Tumakuru",
  "Other Karnataka",
];

/** Documented zone mapping (mirrors deriveZone's contract, Req 1.7). */
const EXPECTED_ZONE: Record<LocationKarnataka, Zone> = {
  "Bengaluru Urban": "Zone 3",
  "Bengaluru Rural": "Zone 2",
  Mysuru: "Zone 2",
  Mangaluru: "Zone 2",
  "Hubballi-Dharwad-Belagavi": "Zone 2",
  Kalaburagi: "Zone 1",
  Shivamogga: "Zone 1",
  Tumakuru: "Zone 1",
  "Other Karnataka": "Zone 1",
};

const ALL_ZONES: readonly Zone[] = ["Zone 1", "Zone 2", "Zone 3"];

/** A realistic RegistrationProfile spanning every field with sensible ranges. */
const profileArbitrary: fc.Arbitrary<RegistrationProfile> = fc.record({
  // Founder
  founderName: fc.string({ minLength: 1, maxLength: 40 }),
  founderEmail: fc.emailAddress(),
  founderPhone: fc.string({ minLength: 10, maxLength: 13 }),
  founderAge: fc.integer({ min: 16, max: 85 }),
  // Company
  companyName: fc.string({ minLength: 1, maxLength: 40 }),
  dpiitRecognized: fc.boolean(),
  gstRegistered: fc.boolean(),
  incorporationDate: fc
    .date({ min: new Date("2010-01-01"), max: new Date("2024-12-31") })
    .map((d) => d.toISOString()),
  currentStage: fc.constantFrom(...CURRENT_STAGES),
  // Team
  teamSize: fc.integer({ min: 1, max: 6000 }),
  womenFounderStake: fc.integer({ min: 0, max: 100 }),
  womenEmployeePercentage: fc.integer({ min: 0, max: 100 }),
  scStFounder: fc.boolean(),
  // Sector
  primarySector: fc.string({ minLength: 1, maxLength: 20 }),
  secondarySectors: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
    maxLength: 3,
  }),
  // Location & funding
  location: fc.constantFrom(...LOCATIONS),
  fundingStage: fc.constantFrom(...FUNDING_STAGES),
  fundingRaised: fc.integer({ min: 0, max: 100000 }),
  // Status
  isRegistered: fc.boolean(),
  kiteId: fc.string({ maxLength: 20 }),
  registeredAt: fc
    .date({ min: new Date("2010-01-01"), max: new Date("2024-12-31") })
    .map((d) => d.toISOString()),
});

/** An arbitrary canonical scheme drawn from the real `schemes.ts` data. */
const schemeArbitrary: fc.Arbitrary<Scheme> = fc.constantFrom(...schemes);

// ---------------------------------------------------------------------------
// Property 3: Eligibility result is well-formed
// ---------------------------------------------------------------------------

describe("eligibility engine (Property 3: result is well-formed)", () => {
  it("evaluateScheme returns a structurally valid result for any profile + scheme", () => {
    // Feature: kite-registration-schemes-calculator, Property 3
    fc.assert(
      fc.property(profileArbitrary, schemeArbitrary, (profile, scheme) => {
        const result = evaluateScheme(profile, scheme);

        // status is one of the four canonical values
        expect(ALL_STATUSES).toContain(result.status);
        // schemeId echoes the evaluated scheme
        expect(result.schemeId).toBe(scheme.id);
        // estimatedBenefit is a finite, non-negative number
        expect(Number.isFinite(result.estimatedBenefit)).toBe(true);
        expect(result.estimatedBenefit).toBeGreaterThanOrEqual(0);
        // confidence is within [0, 1]
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
        // reasons non-empty whenever status is not definitely-eligible
        if (result.status !== "definitely-eligible") {
          expect(result.reasons.length).toBeGreaterThan(0);
          for (const reason of result.reasons) {
            expect(reason.trim().length).toBeGreaterThan(0);
          }
        }
      }),
      { numRuns: 25 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: Status determines benefit and confidence
// ---------------------------------------------------------------------------

describe("eligibility engine (Property 4: status determines benefit and confidence)", () => {
  it("benefit = max/half/0 and confidence = 1/0.7/0.3/0 per status", () => {
    // Feature: kite-registration-schemes-calculator, Property 4
    fc.assert(
      fc.property(profileArbitrary, schemeArbitrary, (profile, scheme) => {
        const result = evaluateScheme(profile, scheme);
        const max = SCHEME_MAX_BENEFIT_RUPEES[scheme.id] ?? 0;

        switch (result.status) {
          case "definitely-eligible":
            expect(result.estimatedBenefit).toBe(max);
            expect(result.confidence).toBe(1);
            break;
          case "likely-eligible":
            expect(result.estimatedBenefit).toBe(max / 2);
            expect(result.confidence).toBe(0.7);
            break;
          case "check-requirements":
            expect(result.estimatedBenefit).toBe(0);
            expect(result.confidence).toBe(0.3);
            break;
          case "not-eligible":
            expect(result.estimatedBenefit).toBe(0);
            expect(result.confidence).toBe(0);
            break;
        }
      }),
      { numRuns: 25 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5: Total benefit equals the sum over qualifying schemes
// ---------------------------------------------------------------------------

describe("eligibility engine (Property 5: total benefit sums qualifying schemes)", () => {
  it("totalEstimatedBenefit equals the sum of benefits over definitely/likely results", () => {
    // Feature: kite-registration-schemes-calculator, Property 5
    fc.assert(
      fc.property(profileArbitrary, (profile) => {
        const results = evaluateAllSchemes(profile);

        const expected = Object.values(results)
          .filter((r) => isQualifying(r.status))
          .reduce((sum, r) => sum + r.estimatedBenefit, 0);

        expect(totalEstimatedBenefit(results)).toBe(expected);
      }),
      { numRuns: 25 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Zone derivation is total and correct
// ---------------------------------------------------------------------------

describe("eligibility engine (Property 6: zone derivation is total and correct)", () => {
  it("deriveZone maps every location to the documented Zone (always one of three)", () => {
    // Feature: kite-registration-schemes-calculator, Property 6
    fc.assert(
      fc.property(fc.constantFrom(...LOCATIONS), (location) => {
        const zone = deriveZone(location);

        // matches the documented mapping
        expect(zone).toBe(EXPECTED_ZONE[location]);
        // always one of the three canonical zones
        expect(ALL_ZONES).toContain(zone);
      }),
      { numRuns: 25 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 11: Qualifying count matches eligible schemes
// ---------------------------------------------------------------------------

describe("eligibility engine (Property 11: qualifying count matches eligible schemes)", () => {
  it("count of definitely/likely results matches an independently computed count", () => {
    // Feature: kite-registration-schemes-calculator, Property 11
    fc.assert(
      fc.property(profileArbitrary, (profile) => {
        const results = evaluateAllSchemes(profile);

        const qualifyingCount = Object.values(results).filter((r) =>
          isQualifying(r.status),
        ).length;

        // Independently recompute by evaluating each scheme directly.
        const independentCount = schemes.filter((scheme) =>
          isQualifying(evaluateScheme(profile, scheme).status),
        ).length;

        expect(qualifyingCount).toBe(independentCount);
      }),
      { numRuns: 25 },
    );
  });
});
