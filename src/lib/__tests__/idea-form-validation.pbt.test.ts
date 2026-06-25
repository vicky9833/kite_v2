// src/lib/__tests__/idea-form-validation.pbt.test.ts
//
// Property-based tests for the pure Idea Submission Form validator.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  validateIdeaForm,
  IDEA_TITLE_MIN_LENGTH,
  IDEA_SUMMARY_MIN_LENGTH,
  IDEA_SUMMARY_MAX_LENGTH,
  IDEA_PROBLEM_MIN_LENGTH,
  IDEA_PROBLEM_MAX_LENGTH,
  IDEA_SOLUTION_MIN_LENGTH,
  IDEA_SOLUTION_MAX_LENGTH,
  type IdeaFormValues,
} from "@/lib/idea-form-validation";
import {
  INNOVATOR_TYPES,
  IDEA_CATEGORIES,
  type InnovatorType,
  type IdeaCategory,
  type LocationKarnataka,
} from "@/types";

// --- Oracle: independent re-statement of the documented constraints ---------
// Mirrors the email shape used by the validator (local@domain.tld, pragmatic).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const trimmedLength = (v: string | null): number =>
  typeof v === "string" ? v.trim().length : 0;

const nameOk = (v: string | null): boolean => trimmedLength(v) > 0;
const emailOk = (v: string | null): boolean =>
  typeof v === "string" && EMAIL_PATTERN.test(v.trim());
const ageOk = (v: number | null): boolean =>
  typeof v === "number" && Number.isFinite(v);
const titleOk = (v: string | null): boolean =>
  trimmedLength(v) >= IDEA_TITLE_MIN_LENGTH;
const inRange = (v: string | null, min: number, max: number): boolean => {
  const len = trimmedLength(v);
  return len >= min && len <= max;
};
const summaryOk = (v: string | null): boolean =>
  inRange(v, IDEA_SUMMARY_MIN_LENGTH, IDEA_SUMMARY_MAX_LENGTH);
const problemOk = (v: string | null): boolean =>
  inRange(v, IDEA_PROBLEM_MIN_LENGTH, IDEA_PROBLEM_MAX_LENGTH);
const solutionOk = (v: string | null): boolean =>
  inRange(v, IDEA_SOLUTION_MIN_LENGTH, IDEA_SOLUTION_MAX_LENGTH);
const innovatorTypeOk = (v: InnovatorType | null): boolean =>
  v !== null && (INNOVATOR_TYPES as readonly string[]).includes(v);
const ideaCategoryOk = (v: IdeaCategory | null): boolean =>
  v !== null && (IDEA_CATEGORIES as readonly string[]).includes(v);
const locationOk = (v: LocationKarnataka | null): boolean =>
  v !== null && (LOCATIONS as readonly string[]).includes(v);

// --- Generators: emit valid/invalid candidates across the boundaries --------
const str = (n: number): string => "a".repeat(n);

// length picker including a length whose `n` may be 0 -> empty string
const lengthValue = (lengths: number[]) =>
  fc.constantFrom(...lengths).map((n) => str(n));

const nullableLengthValue = (lengths: number[]) =>
  fc.oneof(fc.constant<string | null>(null), lengthValue(lengths));

const nameGen = fc.oneof(
  fc.constant<string | null>(null),
  fc.constant(""),
  fc.constant("   "),
  fc.constant("Asha"),
  fc.constant("  Asha  "),
);

const emailGen = fc.oneof(
  fc.constant<string | null>(null),
  fc.constant(""),
  fc.constant("notanemail"),
  fc.constant("a@b"),
  fc.constant("name@example.com"),
  fc.constant(" name@example.com "),
  fc.constant("a@b.co"),
);

const ageGen = fc.oneof(
  fc.constant<number | null>(null),
  fc.constant(Number.NaN),
  fc.constant(Number.POSITIVE_INFINITY),
  fc.integer({ min: 0, max: 120 }),
  fc.double({ min: 15, max: 99, noNaN: false }),
);

const titleGen = nullableLengthValue([
  0,
  IDEA_TITLE_MIN_LENGTH - 1,
  IDEA_TITLE_MIN_LENGTH,
  IDEA_TITLE_MIN_LENGTH + 1,
]);

const summaryGen = nullableLengthValue([
  0,
  IDEA_SUMMARY_MIN_LENGTH - 1,
  IDEA_SUMMARY_MIN_LENGTH,
  IDEA_SUMMARY_MIN_LENGTH + 1,
  IDEA_SUMMARY_MAX_LENGTH - 1,
  IDEA_SUMMARY_MAX_LENGTH,
  IDEA_SUMMARY_MAX_LENGTH + 1,
]);

const problemGen = nullableLengthValue([
  0,
  IDEA_PROBLEM_MIN_LENGTH - 1,
  IDEA_PROBLEM_MIN_LENGTH,
  IDEA_PROBLEM_MIN_LENGTH + 1,
  IDEA_PROBLEM_MAX_LENGTH - 1,
  IDEA_PROBLEM_MAX_LENGTH,
  IDEA_PROBLEM_MAX_LENGTH + 1,
]);

const solutionGen = nullableLengthValue([
  0,
  IDEA_SOLUTION_MIN_LENGTH - 1,
  IDEA_SOLUTION_MIN_LENGTH,
  IDEA_SOLUTION_MIN_LENGTH + 1,
  IDEA_SOLUTION_MAX_LENGTH - 1,
  IDEA_SOLUTION_MAX_LENGTH,
  IDEA_SOLUTION_MAX_LENGTH + 1,
]);

const innovatorTypeGen = fc.oneof(
  fc.constant<InnovatorType | null>(null),
  fc.constantFrom(...INNOVATOR_TYPES),
  fc.constant("Bogus" as InnovatorType),
);

const ideaCategoryGen = fc.oneof(
  fc.constant<IdeaCategory | null>(null),
  fc.constantFrom(...IDEA_CATEGORIES),
  fc.constant("Bogus" as IdeaCategory),
);

const locationGen = fc.oneof(
  fc.constant<LocationKarnataka | null>(null),
  fc.constantFrom(...LOCATIONS),
  fc.constant("Atlantis" as LocationKarnataka),
);

const formGen: fc.Arbitrary<IdeaFormValues> = fc.record({
  innovatorName: nameGen,
  innovatorEmail: emailGen,
  innovatorAge: ageGen,
  innovatorType: innovatorTypeGen,
  ideaTitle: titleGen,
  ideaCategory: ideaCategoryGen,
  ideaSummary: summaryGen,
  problemStatement: problemGen,
  proposedSolution: solutionGen,
  location: locationGen,
});

describe("idea-form-validation", () => {
  // Feature: kite-inclusion-grassroots, Property 17
  // The validator reports isValid true IFF every constraint holds. Validity is
  // exactly the conjunction of the per-field constraints, and the submit-enabled
  // flag (isValid) matches that conjunction. Boundaries are exercised: title
  // 4/5, summary 49/50/500/501, problem/solution 49/50/1000/1001, missing
  // radios/dropdowns, and missing/invalid age.
  it("Property 17: isValid equals the conjunction of all field constraints", () => {
    fc.assert(
      fc.property(formGen, (values) => {
        const constraints = [
          nameOk(values.innovatorName),
          emailOk(values.innovatorEmail),
          ageOk(values.innovatorAge),
          titleOk(values.ideaTitle),
          summaryOk(values.ideaSummary),
          problemOk(values.problemStatement),
          solutionOk(values.proposedSolution),
          innovatorTypeOk(values.innovatorType),
          ideaCategoryOk(values.ideaCategory),
          locationOk(values.location),
        ];
        const expectedValid = constraints.every(Boolean);

        const result = validateIdeaForm(values);

        // Submit-enabled flag equals the conjunction of every constraint.
        expect(result.isValid).toBe(expectedValid);

        // isValid is true exactly when there are no field errors.
        expect(result.isValid).toBe(
          Object.keys(result.fieldErrors).length === 0,
        );

        // Each field's error presence mirrors that field's constraint.
        expect("innovatorName" in result.fieldErrors).toBe(
          !nameOk(values.innovatorName),
        );
        expect("innovatorEmail" in result.fieldErrors).toBe(
          !emailOk(values.innovatorEmail),
        );
        expect("innovatorAge" in result.fieldErrors).toBe(
          !ageOk(values.innovatorAge),
        );
        expect("ideaTitle" in result.fieldErrors).toBe(
          !titleOk(values.ideaTitle),
        );
        expect("ideaSummary" in result.fieldErrors).toBe(
          !summaryOk(values.ideaSummary),
        );
        expect("problemStatement" in result.fieldErrors).toBe(
          !problemOk(values.problemStatement),
        );
        expect("proposedSolution" in result.fieldErrors).toBe(
          !solutionOk(values.proposedSolution),
        );
        expect("innovatorType" in result.fieldErrors).toBe(
          !innovatorTypeOk(values.innovatorType),
        );
        expect("ideaCategory" in result.fieldErrors).toBe(
          !ideaCategoryOk(values.ideaCategory),
        );
        expect("location" in result.fieldErrors).toBe(
          !locationOk(values.location),
        );
      }),
      { numRuns: 100 },
    );
  });
});
