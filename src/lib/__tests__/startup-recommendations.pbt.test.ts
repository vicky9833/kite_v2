import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  computeProfileCompleteness,
  buildRecommendations,
  selectDisplayRecommendations,
  type RecommendationContext,
} from "@/lib/startup-recommendations";
import type {
  CurrentStage,
  FundingStage,
  LocationKarnataka,
  RegistrationProfile,
} from "@/types";

// ---------------------------------------------------------------------------
// Shared generators
// ---------------------------------------------------------------------------

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

/**
 * A RegistrationProfile whose *enrichment* fields are deliberately allowed to
 * be unfilled (empty strings, zeros, false, empty arrays) so completeness
 * spans the full range and the monotonicity case (filling an unfilled field)
 * is exercised.
 */
const profileArbitrary: fc.Arbitrary<RegistrationProfile> = fc.record({
  // Founder
  founderName: fc.string({ maxLength: 40 }),
  founderEmail: fc.string({ maxLength: 40 }),
  founderPhone: fc.string({ maxLength: 13 }),
  founderAge: fc.integer({ min: 0, max: 85 }),
  // Company
  companyName: fc.string({ maxLength: 40 }),
  dpiitRecognized: fc.boolean(),
  gstRegistered: fc.boolean(),
  incorporationDate: fc.oneof(
    fc.constant(""),
    fc
      .date({ min: new Date("2010-01-01"), max: new Date("2024-12-31") })
      .map((d) => d.toISOString()),
  ),
  currentStage: fc.constantFrom(...CURRENT_STAGES),
  // Team
  teamSize: fc.integer({ min: 0, max: 6000 }),
  womenFounderStake: fc.integer({ min: 0, max: 100 }),
  womenEmployeePercentage: fc.integer({ min: 0, max: 100 }),
  scStFounder: fc.boolean(),
  // Sector
  primarySector: fc.string({ maxLength: 20 }),
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

/**
 * One filler per counted enrichment field: applied to a profile it sets that
 * specific field to a guaranteed-filled value (leaving everything else as-is).
 */
const FIELD_FILLERS: ReadonlyArray<
  (p: RegistrationProfile) => RegistrationProfile
> = [
  (p) => ({ ...p, founderPhone: "9999999999" }),
  (p) => ({ ...p, incorporationDate: "2020-01-01T00:00:00.000Z" }),
  (p) => ({ ...p, secondarySectors: ["fintech"] }),
  (p) => ({ ...p, dpiitRecognized: true }),
  (p) => ({ ...p, gstRegistered: true }),
  (p) => ({ ...p, teamSize: 5 }),
  (p) => ({ ...p, fundingRaised: 100 }),
  (p) => ({ ...p, womenFounderStake: 50 }),
  (p) => ({ ...p, founderAge: 30 }),
  (p) => ({ ...p, companyName: "Acme Labs" }),
];

// ---------------------------------------------------------------------------
// Property 11: Profile completeness is bounded and monotonic
// ---------------------------------------------------------------------------

describe("startup recommendations (Property 11: completeness bounded + monotonic)", () => {
  it("computeProfileCompleteness is in [0,100] and never decreases when filling an unfilled field", () => {
    // Feature: kite-dashboards, Property 11
    fc.assert(
      fc.property(
        profileArbitrary,
        fc.integer({ min: 0, max: FIELD_FILLERS.length - 1 }),
        (profile, fillerIndex) => {
          const base = computeProfileCompleteness(profile);

          // Bounded.
          expect(Number.isInteger(base)).toBe(true);
          expect(base).toBeGreaterThanOrEqual(0);
          expect(base).toBeLessThanOrEqual(100);

          // Monotonic: filling any single counted field never decreases it.
          const filler = FIELD_FILLERS[fillerIndex]!;
          const filled = computeProfileCompleteness(filler(profile));
          expect(filled).toBeGreaterThanOrEqual(base);
          expect(filled).toBeLessThanOrEqual(100);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 12: Recommendation shape, display bound, and rule triggering
// ---------------------------------------------------------------------------

const contextArbitrary: fc.Arbitrary<RecommendationContext> = fc.record({
  profile: profileArbitrary,
  completeness: fc.integer({ min: 0, max: 100 }),
  visitedCalculator: fc.option(fc.boolean(), { nil: undefined }),
  browsedSchemes: fc.option(fc.boolean(), { nil: undefined }),
});

describe("startup recommendations (Property 12: shape, display bound, rule triggering)", () => {
  it("recs are well-formed, display is clamped to [3,4], and rule ids track their conditions", () => {
    // Feature: kite-dashboards, Property 12
    fc.assert(
      fc.property(contextArbitrary, (ctx) => {
        const recs = buildRecommendations(ctx);

        // Every recommendation is fully populated.
        for (const rec of recs) {
          expect(rec.id.length).toBeGreaterThan(0);
          expect(rec.iconName.length).toBeGreaterThan(0);
          expect(rec.heading.length).toBeGreaterThan(0);
          expect(rec.description.length).toBeGreaterThan(0);
          expect(rec.ctaLabel.length).toBeGreaterThan(0);
          expect(rec.href.length).toBeGreaterThan(0);
        }

        // Ids are unique (de-duped by id).
        const ids = recs.map((r) => r.id);
        expect(new Set(ids).size).toBe(ids.length);

        // Display selector clamps to between 3 and 4.
        const display = selectDisplayRecommendations(recs);
        expect(display.length).toBeGreaterThanOrEqual(3);
        expect(display.length).toBeLessThanOrEqual(4);

        // Each rule's recommendation is present iff its condition holds.
        const has = (id: string) => ids.includes(id);
        const visited = ctx.visitedCalculator ?? false;
        const browsed = ctx.browsedSchemes ?? false;

        expect(has("complete-profile")).toBe(ctx.completeness < 80);
        expect(has("register-dpiit")).toBe(ctx.profile.dpiitRecognized !== true);
        expect(has("register-gst")).toBe(ctx.profile.gstRegistered !== true);
        expect(has("try-calculator")).toBe(!visited);
        expect(has("browse-schemes")).toBe(!browsed);
      }),
      { numRuns: 100 },
    );
  });
});
