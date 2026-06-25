/**
 * Profile-completeness unit test (task 9.3) — Requirements 3.8, 3.9, 7.8.
 *
 * Example-based coverage for `computeProfileCompleteness`, the pure metric behind
 * the startup dashboard's "Profile Completeness" hero card (Req 3.8) and two
 * downstream UI triggers:
 *
 *   - the hero "Complete Profile" link, shown while completeness is `< 100`
 *     (Req 3.9), and
 *   - the "Complete your profile" recommendation, fired while completeness is
 *     `< 80` (Req 7.8).
 *
 * The metric scores 10 equally-weighted enrichment checks, so each filled check
 * is worth 10%. The cases below pin the empty/minimal floor, the fully-filled
 * ceiling, and the two boundaries that flip those triggers (70 → 80 crosses the
 * `< 80` recommendation edge; 90 → 100 crosses the `< 100` link edge). The
 * recommendation edge is asserted end-to-end through `buildRecommendations`.
 */

import { describe, it, expect } from "vitest";

import {
  buildRecommendations,
  computeProfileCompleteness,
} from "@/lib/startup-recommendations";
import type { RegistrationProfile } from "@/types";

/**
 * A fully-filled profile: every one of the 10 completeness checks passes, so
 * `computeProfileCompleteness` returns 100. Tests clone this and unfill specific
 * counted fields to land on exact percentages.
 */
const FULL_PROFILE: RegistrationProfile = {
  // Founder
  founderName: "Asha Rao",
  founderEmail: "asha@example.com",
  founderPhone: "9876543210", // counted
  founderAge: 29, // counted (> 0)
  // Company
  companyName: "Deep Signal Labs", // counted (non-empty)
  dpiitRecognized: true, // counted (=== true)
  gstRegistered: true, // counted (=== true)
  incorporationDate: "2022-06-15", // counted (non-empty)
  currentStage: "Early Revenue",
  // Team
  teamSize: 12, // counted (> 0)
  womenFounderStake: 30, // counted (> 0 OR womenEmployeePercentage > 0)
  womenEmployeePercentage: 40,
  scStFounder: false,
  // Sector
  primarySector: "deep-tech",
  secondarySectors: ["fintech"], // counted (length >= 1)
  // Location & funding
  location: "Mysuru",
  fundingStage: "Seed",
  fundingRaised: 10, // counted (> 0)
  // Status
  isRegistered: true,
  kiteId: "KITE-2025-ABC234",
  registeredAt: "2025-01-01T00:00:00.000Z",
};

/**
 * An empty/minimal profile: every counted field is in its unfilled state
 * (empty strings, zeroes, false, empty array), so completeness is 0.
 */
const EMPTY_PROFILE: RegistrationProfile = {
  ...FULL_PROFILE,
  founderPhone: "",
  founderAge: 0,
  companyName: "",
  dpiitRecognized: false,
  gstRegistered: false,
  incorporationDate: "",
  teamSize: 0,
  womenFounderStake: 0,
  womenEmployeePercentage: 0,
  secondarySectors: [],
  fundingRaised: 0,
};

describe("computeProfileCompleteness (Req 3.8)", () => {
  it("scores a fully-filled profile at 100", () => {
    expect(computeProfileCompleteness(FULL_PROFILE)).toBe(100);
  });

  it("scores an empty/minimal profile at 0 (low %)", () => {
    expect(computeProfileCompleteness(EMPTY_PROFILE)).toBe(0);
  });

  it("treats absent (undefined) optional fields as unfilled", () => {
    // A bare profile object missing every counted field still scores low,
    // because the checks coalesce absent fields to their unfilled value.
    const bare = { ...EMPTY_PROFILE } as Partial<RegistrationProfile>;
    delete bare.founderPhone;
    delete bare.incorporationDate;
    delete (bare as { secondarySectors?: string[] }).secondarySectors;
    expect(computeProfileCompleteness(bare as RegistrationProfile)).toBe(0);
  });
});

describe("completeness boundaries that drive UI triggers (Req 3.9, 7.8)", () => {
  // Drop N counted fields from the full profile to land on (100 - 10N)%.
  const at90 = (): RegistrationProfile => ({
    ...FULL_PROFILE,
    gstRegistered: false, // -1 check
  });

  const at80 = (): RegistrationProfile => ({
    ...FULL_PROFILE,
    gstRegistered: false, // -1
    dpiitRecognized: false, // -1
  });

  const at70 = (): RegistrationProfile => ({
    ...FULL_PROFILE,
    gstRegistered: false, // -1
    dpiitRecognized: false, // -1
    fundingRaised: 0, // -1
  });

  it("90% is below the < 100 link threshold but above the < 80 recommendation edge", () => {
    const completeness = computeProfileCompleteness(at90());
    expect(completeness).toBe(90);
    // Req 3.9 — the "Complete Profile" link shows while < 100.
    expect(completeness).toBeLessThan(100);
    // Req 7.8 — the recommendation does NOT fire at 90 (>= 80).
    expect(completeness).toBeGreaterThanOrEqual(80);
  });

  it("80% sits exactly on the recommendation edge (not < 80) yet still < 100", () => {
    const completeness = computeProfileCompleteness(at80());
    expect(completeness).toBe(80);
    expect(completeness).toBeLessThan(100); // link still shows (Req 3.9)
    expect(completeness).toBeGreaterThanOrEqual(80); // recommendation off (Req 7.8)
  });

  it("70% crosses below the < 80 recommendation edge", () => {
    const completeness = computeProfileCompleteness(at70());
    expect(completeness).toBe(70);
    expect(completeness).toBeLessThan(80);
    expect(completeness).toBeLessThan(100);
  });

  it("fires the complete-profile recommendation only when completeness < 80 (Req 7.8)", () => {
    const idsFor = (p: RegistrationProfile) =>
      buildRecommendations({
        profile: p,
        completeness: computeProfileCompleteness(p),
      }).map((r) => r.id);

    // 70% (< 80) → recommendation present.
    expect(idsFor(at70())).toContain("complete-profile");
    // 80% (edge, not < 80) → recommendation absent.
    expect(idsFor(at80())).not.toContain("complete-profile");
    // 100% → recommendation absent.
    expect(idsFor(FULL_PROFILE)).not.toContain("complete-profile");
  });

  it("the < 100 link trigger is off only at exactly 100", () => {
    expect(computeProfileCompleteness(FULL_PROFILE)).toBe(100);
    expect(computeProfileCompleteness(FULL_PROFILE) < 100).toBe(false);
    expect(computeProfileCompleteness(at90()) < 100).toBe(true);
  });
});
