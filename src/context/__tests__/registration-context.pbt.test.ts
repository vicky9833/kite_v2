import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import fc from "fast-check";

import {
  RegistrationProvider,
  useRegistration,
} from "@/context/RegistrationContext";
import type {
  CurrentStage,
  FundingStage,
  LocationKarnataka,
  RegistrationProfile,
} from "@/types";

// Feature: kite-registration-schemes-calculator, Property 7: updateProfile merges and preserves

/**
 * Property 7 (Req 1.4): *For any* current profile state and any partial, the
 * profile produced by `updateProfile` equals the current state with exactly the
 * partial's keys overwritten and every key absent from the partial left
 * unchanged — i.e. functional `{ ...current, ...partial }` merge semantics.
 *
 * This file uses the PREFERRED, robust approach: it drives the REAL context via
 * `renderHook(() => useRegistration(), { wrapper: RegistrationProvider })`. Each
 * property run mounts a fresh provider, seeds an initial profile with a first
 * `updateProfile(current)` call, applies `updateProfile(partial)`, then asserts
 * the merge invariant against the actual in-memory state the provider produced.
 * Every iteration unmounts its provider so runs stay isolated (the jsdom
 * `afterEach` cleanup only fires between `it` blocks, not between fc runs).
 */

/* -------------------------------------------------------------------------- */
/* Arbitraries over real RegistrationProfile field names + value shapes        */
/* -------------------------------------------------------------------------- */

const currentStageArb: fc.Arbitrary<CurrentStage> = fc.constantFrom(
  "Idea",
  "PoC",
  "Early Revenue",
  "Growth",
  "Scale",
);

const fundingStageArb: fc.Arbitrary<FundingStage> = fc.constantFrom(
  "Bootstrapped",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B Plus",
);

const locationArb: fc.Arbitrary<LocationKarnataka> = fc.constantFrom(
  "Bengaluru Urban",
  "Bengaluru Rural",
  "Mysuru",
  "Mangaluru",
  "Hubballi-Dharwad-Belagavi",
  "Kalaburagi",
  "Shivamogga",
  "Tumakuru",
  "Other Karnataka",
);

/**
 * `fc.record(..., { requiredKeys: [] })` makes every field optional, so each
 * generated record is an arbitrary partial over real `RegistrationProfile`
 * keys (from `{}` up to all keys present). The field set spans every value
 * shape the profile uses: booleans, strings, numbers, enums, and string[].
 */
const partialProfileArbitrary: fc.Arbitrary<Partial<RegistrationProfile>> =
  fc.record(
    {
      // booleans
      dpiitRecognized: fc.boolean(),
      gstRegistered: fc.boolean(),
      scStFounder: fc.boolean(),
      isRegistered: fc.boolean(),
      // strings
      founderName: fc.string(),
      founderEmail: fc.string(),
      founderPhone: fc.string(),
      companyName: fc.string(),
      primarySector: fc.string(),
      kiteId: fc.string(),
      // numbers
      founderAge: fc.integer({ min: 18, max: 80 }),
      teamSize: fc.integer({ min: 1, max: 5000 }),
      womenFounderStake: fc.integer({ min: 0, max: 100 }),
      fundingRaised: fc.double({ min: 0, max: 100000, noNaN: true }),
      // enums
      currentStage: currentStageArb,
      fundingStage: fundingStageArb,
      location: locationArb,
      // string[]
      secondarySectors: fc.array(fc.string(), { maxLength: 3 }),
    },
    { requiredKeys: [] },
  );

/* -------------------------------------------------------------------------- */
/* Property test — drives the real RegistrationContext                          */
/* -------------------------------------------------------------------------- */

describe("RegistrationContext updateProfile (Property 7: merges and preserves)", () => {
  it("overwrites exactly the partial's keys and preserves all other keys", () => {
    fc.assert(
      fc.property(
        partialProfileArbitrary,
        partialProfileArbitrary,
        (current, partial) => {
          const { result, unmount } = renderHook(() => useRegistration(), {
            wrapper: RegistrationProvider,
          });

          try {
            // Seed the running draft with `current`, then merge `partial`.
            act(() => {
              result.current.updateProfile(current);
            });
            act(() => {
              result.current.updateProfile(partial);
            });

            const merged = result.current.registrationProfile;
            expect(merged).not.toBeNull();

            const currentKeys = Object.keys(current);
            const partialKeys = Object.keys(partial);

            // 1. Every partial key wins: present with the partial's value.
            for (const key of partialKeys) {
              expect(merged).toHaveProperty(key);
              expect(merged![key as keyof RegistrationProfile]).toBe(
                partial[key as keyof RegistrationProfile],
              );
            }

            // 2. Keys in `current` but absent from `partial` are preserved.
            for (const key of currentKeys) {
              if (partialKeys.includes(key)) continue;
              expect(merged![key as keyof RegistrationProfile]).toBe(
                current[key as keyof RegistrationProfile],
              );
            }

            // 3. The merged key set is exactly the union of both inputs' keys.
            const expectedKeys = new Set([...currentKeys, ...partialKeys]);
            expect(new Set(Object.keys(merged!))).toEqual(expectedKeys);
          } finally {
            unmount();
          }
        },
      ),
      { numRuns: 25 },
    );
  });

  /**
   * A focused, hand-picked example confirming the real context performs the
   * merge end-to-end: distinct overlapping + disjoint keys across two updates.
   */
  it("preserves untouched fields and lets later partials overwrite (example)", () => {
    const { result, unmount } = renderHook(() => useRegistration(), {
      wrapper: RegistrationProvider,
    });

    try {
      act(() => {
        result.current.updateProfile({ founderName: "Asha", founderAge: 29 });
      });
      act(() => {
        result.current.updateProfile({
          companyName: "Kite Labs",
          founderAge: 30,
        });
      });

      expect(result.current.registrationProfile).toMatchObject({
        founderName: "Asha", // preserved from the first partial
        companyName: "Kite Labs", // added by the second partial
        founderAge: 30, // overwritten by the second partial
      });
    } finally {
      unmount();
    }
  });
});
