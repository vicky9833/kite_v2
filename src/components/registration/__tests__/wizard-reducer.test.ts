import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  wizardReducer,
  initialWizardState,
  TOTAL_STEPS,
} from "@/components/registration/RegistrationWizard";
import { sectors } from "@/data/sectors";
import type { WizardAction, WizardState } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fold a sequence of actions through the pure reducer from a start state. */
function run(start: WizardState, actions: WizardAction[]): WizardState {
  return actions.reduce(wizardReducer, start);
}

const SECTOR_IDS = sectors.map((s) => s.id);

// ===========================================================================
// Unit tests — pure reducer transitions (Req 3.8, 3.9)
// ===========================================================================

describe("wizardReducer (unit transitions)", () => {
  it("SET_FIELD merges a field into profile", () => {
    const next = wizardReducer(initialWizardState, {
      type: "SET_FIELD",
      field: "founderName",
      value: "Ada Lovelace",
    });
    expect(next.profile.founderName).toBe("Ada Lovelace");
    // Other state is untouched.
    expect(next.currentStep).toBe(1);
    expect(initialWizardState.profile.founderName).toBeUndefined();
  });

  it("SET_FIELD preserves previously set fields when merging another", () => {
    const next = run(initialWizardState, [
      { type: "SET_FIELD", field: "founderName", value: "Grace" },
      { type: "SET_FIELD", field: "founderEmail", value: "grace@example.com" },
    ]);
    expect(next.profile.founderName).toBe("Grace");
    expect(next.profile.founderEmail).toBe("grace@example.com");
  });

  it("BLUR_FIELD marks the field touched", () => {
    const next = wizardReducer(initialWizardState, {
      type: "BLUR_FIELD",
      field: "founderEmail",
    });
    expect(next.touched.founderEmail).toBe(true);
  });

  it("VALIDATE_STEP populates errors[step] for an invalid step", () => {
    // Step 1 with an empty profile is invalid → errors recorded.
    const next = wizardReducer(initialWizardState, {
      type: "VALIDATE_STEP",
      step: 1,
    });
    expect(Object.keys(next.errors[1]).length).toBeGreaterThan(0);
    expect(next.errors[1].founderName).toBeDefined();
  });

  it("VALIDATE_STEP clears errors[step] to {} for a valid step", () => {
    // Fill in a valid step 1 profile, then validate.
    const filled = run(initialWizardState, [
      { type: "SET_FIELD", field: "founderName", value: "Ada Lovelace" },
      { type: "SET_FIELD", field: "founderEmail", value: "ada@example.com" },
      { type: "SET_FIELD", field: "founderPhone", value: "+91 98765 43210" },
      { type: "SET_FIELD", field: "founderAge", value: 30 },
    ]);
    const next = wizardReducer(filled, { type: "VALIDATE_STEP", step: 1 });
    expect(next.errors[1]).toEqual({});
  });

  it("NEXT is a no-op when the current step has recorded errors", () => {
    const invalid = wizardReducer(initialWizardState, {
      type: "VALIDATE_STEP",
      step: 1,
    });
    const next = wizardReducer(invalid, { type: "NEXT" });
    expect(next.currentStep).toBe(1);
  });

  it("NEXT advances when the current step has no recorded errors", () => {
    const next = wizardReducer(initialWizardState, { type: "NEXT" });
    expect(next.currentStep).toBe(2);
  });

  it("NEXT never advances beyond TOTAL_STEPS", () => {
    // Walk to the last step (errors are empty by default).
    let state = initialWizardState;
    for (let i = 0; i < TOTAL_STEPS + 3; i += 1) {
      state = wizardReducer(state, { type: "NEXT" });
    }
    expect(state.currentStep).toBe(TOTAL_STEPS);
    expect(TOTAL_STEPS).toBe(6);
  });

  it("BACK decrements the current step", () => {
    const atStep3: WizardState = { ...initialWizardState, currentStep: 3 };
    const next = wizardReducer(atStep3, { type: "BACK" });
    expect(next.currentStep).toBe(2);
  });

  it("BACK is a no-op at step 1", () => {
    const next = wizardReducer(initialWizardState, { type: "BACK" });
    expect(next.currentStep).toBe(1);
  });

  it("BACK retains profile values", () => {
    const filled = run(initialWizardState, [
      { type: "SET_FIELD", field: "founderName", value: "Margaret" },
      { type: "NEXT" },
    ]);
    expect(filled.currentStep).toBe(2);
    const back = wizardReducer(filled, { type: "BACK" });
    expect(back.currentStep).toBe(1);
    expect(back.profile.founderName).toBe("Margaret");
  });

  it("GO_TO_STEP jumps to the given step", () => {
    const next = wizardReducer(initialWizardState, {
      type: "GO_TO_STEP",
      step: 5,
    });
    expect(next.currentStep).toBe(5);
  });

  it("TOGGLE_ACCURACY sets accuracyConfirmed", () => {
    const on = wizardReducer(initialWizardState, {
      type: "TOGGLE_ACCURACY",
      value: true,
    });
    expect(on.accuracyConfirmed).toBe(true);
    const off = wizardReducer(on, { type: "TOGGLE_ACCURACY", value: false });
    expect(off.accuracyConfirmed).toBe(false);
  });

  it("SUBMIT sets submitted", () => {
    const next = wizardReducer(initialWizardState, { type: "SUBMIT" });
    expect(next.submitted).toBe(true);
  });
});

// ===========================================================================
// Property 13: Secondary sectors are capped and exclude the primary
// Feature: kite-registration-schemes-calculator, Property 13
//
// Validates: Requirements 7.4, 7.5, 7.6
// ===========================================================================

describe("Property 13: secondary sectors are capped and exclude the primary", () => {
  // A SET_FIELD action over primarySector with a real sector id.
  const setPrimary: fc.Arbitrary<WizardAction> = fc
    .constantFrom(...SECTOR_IDS)
    .map((value) => ({ type: "SET_FIELD", field: "primarySector", value }));

  // A SET_FIELD action over secondarySectors: arrays of real ids, sometimes
  // longer than 3 and sometimes including a value that may be the primary.
  const setSecondary: fc.Arbitrary<WizardAction> = fc
    .array(fc.constantFrom(...SECTOR_IDS), { minLength: 0, maxLength: 6 })
    .map((value) => ({ type: "SET_FIELD", field: "secondarySectors", value }));

  const actionSequence: fc.Arbitrary<WizardAction[]> = fc.array(
    fc.oneof(setPrimary, setSecondary),
    { minLength: 1, maxLength: 20 },
  );

  it("folds any selection sequence to ≤3 secondaries excluding the primary", () => {
    fc.assert(
      fc.property(actionSequence, (actions) => {
        const final = run(initialWizardState, actions);
        const secondary = final.profile.secondarySectors ?? [];

        // Capped at 3.
        expect(secondary.length).toBeLessThanOrEqual(3);

        // Never contains the current primary.
        if (final.profile.primarySector !== undefined) {
          expect(secondary).not.toContain(final.profile.primarySector);
        }
      }),
      { numRuns: 25 },
    );
  });

  it("SET_FIELD primarySector=X removes X from secondarySectors when present", () => {
    fc.assert(
      fc.property(
        // Pick a starting secondary array (≤3, real ids) and a primary id X
        // that is guaranteed to be a member of that array.
        fc
          .array(fc.constantFrom(...SECTOR_IDS), { minLength: 1, maxLength: 3 })
          .chain((arr) =>
            fc.record({
              secondary: fc.constant(arr),
              primary: fc.constantFrom(...arr),
            }),
          ),
        ({ secondary, primary }) => {
          // Seed the secondary array (cleaned of any existing primary first).
          const seeded = run(initialWizardState, [
            { type: "SET_FIELD", field: "secondarySectors", value: secondary },
          ]);
          expect(seeded.profile.secondarySectors).toEqual(secondary);

          // Now choose primary = X, where X is in the secondary array.
          const next = wizardReducer(seeded, {
            type: "SET_FIELD",
            field: "primarySector",
            value: primary,
          });

          expect(next.profile.primarySector).toBe(primary);
          expect(next.profile.secondarySectors).not.toContain(primary);
        },
      ),
      { numRuns: 25 },
    );
  });
});
