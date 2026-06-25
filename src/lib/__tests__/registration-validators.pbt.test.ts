import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
} from "@/lib/registration-validators";
import { sectors } from "@/data/sectors";
import type {
  CurrentStage,
  FundingStage,
  LocationKarnataka,
  RegistrationProfile,
  StepValidator,
  WizardFieldErrors,
} from "@/types";

// Feature: kite-registration-schemes-calculator, Property 8 & 9
//
// These tests exercise the five pure step validators (Req 11) across the full
// VALID input space (Property 8: empty result, determinism, no mutation) and a
// single-field-corruption space (Property 9: the corrupted field key always
// surfaces in the returned error record). Arbitraries are constrained to the
// exact field rules in Requirements 4–8 so generated "valid" inputs really are
// valid and generated corruptions violate exactly one rule.

type ProfileDraft = Partial<RegistrationProfile>;

// --- Enumerations mirroring the validator's allowed value sets ---
const CURRENT_STAGES: readonly CurrentStage[] = [
  "Idea",
  "PoC",
  "Early Revenue",
  "Growth",
  "Scale",
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

const FUNDING_STAGES: readonly FundingStage[] = [
  "Bootstrapped",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B Plus",
];

const SECTOR_IDS: readonly string[] = sectors.map((s) => s.id);

// --- Small helpers -----------------------------------------------------------

/** Recursively freeze an object/array so any mutation attempt would throw. */
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as Record<string, unknown>)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

// --- VALID-field arbitraries (per Req 4–8) -----------------------------------

/** A segment of an email local part / domain / tld: lowercase alnum, no @ or whitespace. */
const emailSegment: fc.Arbitrary<string> = fc
  .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789".split("")), {
    minLength: 1,
    maxLength: 8,
  })
  .map((chars) => chars.join(""));

/** A valid email matching /^[^\s@]+@[^\s@]+\.[^\s@]+$/ (Req 4.3). */
const validEmail: fc.Arbitrary<string> = fc
  .tuple(emailSegment, emailSegment, emailSegment)
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

/** Exactly 10 digits, optionally with a leading +91 prefix (Req 4.4). */
const validPhone: fc.Arbitrary<string> = fc
  .tuple(
    fc
      .array(fc.integer({ min: 0, max: 9 }), { minLength: 10, maxLength: 10 })
      .map((d) => d.join("")),
    fc.boolean(),
  )
  .map(([digits, withPrefix]) => (withPrefix ? `+91${digits}` : digits));

/** A non-empty name of length >= 2 after trimming (Req 4.2 / 5.2). */
const validName: fc.Arbitrary<string> = fc
  .string({ minLength: 2, maxLength: 40 })
  .filter((s) => s.trim().length >= 2);

/** An ISO date string strictly in the past (Req 5.4 / 5.5). */
const validPastDate: fc.Arbitrary<string> = fc
  .date({
    min: new Date("1990-01-01T00:00:00.000Z"),
    max: new Date(Date.now() - 24 * 60 * 60 * 1000),
  })
  .map((d) => d.toISOString());

const validStep1: fc.Arbitrary<ProfileDraft> = fc.record({
  founderName: validName,
  founderEmail: validEmail,
  founderPhone: validPhone,
  founderAge: fc.integer({ min: 18, max: 80 }),
});

const validStep2: fc.Arbitrary<ProfileDraft> = fc.record({
  companyName: validName,
  dpiitRecognized: fc.boolean(),
  gstRegistered: fc.boolean(),
  incorporationDate: validPastDate,
  currentStage: fc.constantFrom(...CURRENT_STAGES),
});

const validStep3: fc.Arbitrary<ProfileDraft> = fc.record({
  teamSize: fc.integer({ min: 1, max: 5000 }),
  womenFounderStake: fc.double({ min: 0, max: 100, noNaN: true }),
  womenEmployeePercentage: fc.double({ min: 0, max: 100, noNaN: true }),
  scStFounder: fc.boolean(),
});

const validStep4: fc.Arbitrary<ProfileDraft> = fc
  .constantFrom(...SECTOR_IDS)
  .chain((primary) =>
    fc.record({
      primarySector: fc.constant(primary),
      secondarySectors: fc.uniqueArray(
        fc.constantFrom(...SECTOR_IDS.filter((id) => id !== primary)),
        { minLength: 0, maxLength: 3 },
      ),
    }),
  );

const validStep5: fc.Arbitrary<ProfileDraft> = fc.record({
  location: fc.constantFrom(...LOCATIONS),
  fundingStage: fc.constantFrom(...FUNDING_STAGES),
  fundingRaised: fc.double({ min: 0, max: 1_000_000, noNaN: true }),
});

// --- Single-field corruptions (per Req 4–8, Req 11.5) ------------------------
//
// Each corruption names the field key it targets and a `make` function that
// produces an out-of-range value (optionally derived from the valid profile,
// needed for the secondary-sector rules). Applying it to an otherwise-valid
// profile violates exactly that one field rule.

type Corruption = {
  key: keyof RegistrationProfile;
  make: (valid: ProfileDraft) => unknown;
};

const corruptionsStep1: fc.Arbitrary<Corruption> = fc.oneof(
  fc
    .constantFrom("", "a", " ", "  ")
    .map((v) => ({ key: "founderName" as const, make: () => v })),
  fc
    .constantFrom("notanemail", "missing@dot", "two@@at.com", "", "  ")
    .map((v) => ({ key: "founderEmail" as const, make: () => v })),
  fc
    .constantFrom("123", "12345678901", "abcdefghij", "", "+9112345")
    .map((v) => ({ key: "founderPhone" as const, make: () => v })),
  fc
    .oneof(fc.integer({ max: 17 }), fc.integer({ min: 81 }))
    .map((v) => ({ key: "founderAge" as const, make: () => v })),
);

const corruptionsStep2: fc.Arbitrary<Corruption> = fc.oneof(
  fc
    .constantFrom("", "a", "   ")
    .map((v) => ({ key: "companyName" as const, make: () => v })),
  fc
    .constantFrom(undefined, "yes", null, 1)
    .map((v) => ({ key: "dpiitRecognized" as const, make: () => v })),
  fc
    .constantFrom(undefined, "no", null, 0)
    .map((v) => ({ key: "gstRegistered" as const, make: () => v })),
  fc.oneof(
    // empty incorporation date
    fc.constant("").map((v) => ({
      key: "incorporationDate" as const,
      make: () => v,
    })),
    // future incorporation date
    fc
      .date({
        min: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        max: new Date("2999-12-31T00:00:00.000Z"),
      })
      .map((d) => ({
        key: "incorporationDate" as const,
        make: () => d.toISOString(),
      })),
  ),
  fc
    .constantFrom("Unknown", "", "scale", undefined)
    .map((v) => ({ key: "currentStage" as const, make: () => v })),
);

const corruptionsStep3: fc.Arbitrary<Corruption> = fc.oneof(
  fc
    .oneof(fc.integer({ max: 0 }), fc.integer({ min: 5001 }))
    .map((v) => ({ key: "teamSize" as const, make: () => v })),
  fc
    .oneof(
      fc.double({ min: -1000, max: -0.0001, noNaN: true }),
      fc.double({ min: 100.0001, max: 1000, noNaN: true }),
    )
    .map((v) => ({ key: "womenFounderStake" as const, make: () => v })),
  fc
    .oneof(
      fc.double({ min: -1000, max: -0.0001, noNaN: true }),
      fc.double({ min: 100.0001, max: 1000, noNaN: true }),
    )
    .map((v) => ({ key: "womenEmployeePercentage" as const, make: () => v })),
);

const corruptionsStep4: fc.Arbitrary<Corruption> = fc.oneof(
  // primary empty or invalid
  fc
    .constantFrom("", "not-a-real-sector", "deep-tech-xyz")
    .map((v) => ({ key: "primarySector" as const, make: () => v })),
  // secondary too long (> 3) — distinct ids excluding primary
  fc.constant({
    key: "secondarySectors" as const,
    make: (valid: ProfileDraft) =>
      SECTOR_IDS.filter((id) => id !== valid.primarySector).slice(0, 4),
  }),
  // secondary contains the primary sector
  fc.constant({
    key: "secondarySectors" as const,
    make: (valid: ProfileDraft) => [valid.primarySector as string],
  }),
);

const corruptionsStep5: fc.Arbitrary<Corruption> = fc.oneof(
  fc
    .constantFrom("Mars", "", "bengaluru urban", undefined)
    .map((v) => ({ key: "location" as const, make: () => v })),
  fc
    .constantFrom("Series Z", "", "seed", undefined)
    .map((v) => ({ key: "fundingStage" as const, make: () => v })),
  fc
    .double({ min: -1_000_000, max: -0.0001, noNaN: true })
    .map((v) => ({ key: "fundingRaised" as const, make: () => v })),
);

// --- Step registry: one entry per validator ----------------------------------

interface StepCase {
  name: string;
  validator: StepValidator;
  valid: fc.Arbitrary<ProfileDraft>;
  corruptions: fc.Arbitrary<Corruption>;
}

const STEP_CASES: StepCase[] = [
  {
    name: "Step 1 (founder details)",
    validator: validateStep1,
    valid: validStep1,
    corruptions: corruptionsStep1,
  },
  {
    name: "Step 2 (company basics)",
    validator: validateStep2,
    valid: validStep2,
    corruptions: corruptionsStep2,
  },
  {
    name: "Step 3 (team composition)",
    validator: validateStep3,
    valid: validStep3,
    corruptions: corruptionsStep3,
  },
  {
    name: "Step 4 (sector selection)",
    validator: validateStep4,
    valid: validStep4,
    corruptions: corruptionsStep4,
  },
  {
    name: "Step 5 (location & funding)",
    validator: validateStep5,
    valid: validStep5,
    corruptions: corruptionsStep5,
  },
];

describe("registration step validators (Property 8 & 9)", () => {
  // Feature: kite-registration-schemes-calculator, Property 8
  // Step validators accept valid input and are pure.
  describe("Property 8: valid input -> empty, deterministic, non-mutating", () => {
    for (const step of STEP_CASES) {
      it(`${step.name}: returns {} for valid input, is deterministic, and does not mutate`, () => {
        fc.assert(
          fc.property(step.valid, (profile) => {
            const frozen = deepFreeze(profile);
            const snapshot = structuredClone(frozen);

            const first = step.validator(frozen);
            const second = step.validator(frozen);

            // Valid input -> no field errors (Req 11.1).
            expect(first).toEqual({});
            // Deterministic: same input -> identical output (Req 11.4).
            expect(second).toEqual(first);
            // Argument is not mutated (Req 11.4).
            expect(frozen).toEqual(snapshot);
          }),
          { numRuns: 25 },
        );
      });
    }
  });

  // Feature: kite-registration-schemes-calculator, Property 9
  // Step validators flag out-of-range fields.
  describe("Property 9: a single corrupted field always surfaces its key", () => {
    for (const step of STEP_CASES) {
      it(`${step.name}: the corrupted field key appears in the error record`, () => {
        fc.assert(
          fc.property(step.valid, step.corruptions, (validProfile, corruption) => {
            const corrupted: ProfileDraft = {
              ...validProfile,
              [corruption.key]: corruption.make(validProfile),
            };

            const errors: WizardFieldErrors = step.validator(corrupted);

            // The corrupted field's key must be present in the returned errors (Req 11.5).
            expect(errors[corruption.key]).toBeDefined();
            expect(typeof errors[corruption.key]).toBe("string");
          }),
          { numRuns: 25 },
        );
      });
    }
  });
});
