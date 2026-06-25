"use client";

import * as React from "react";
import { useEffect, useReducer, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInvestor } from "@/context/InvestorContext";
import {
  validateInvestorStep1,
  validateInvestorStep2,
  validateInvestorStep3,
  type InvestorStepValidator,
} from "@/lib/investor-onboarding-validators";
import type { InvestorProfile, WizardFieldErrors } from "@/types";

import { OnboardingProgress } from "./OnboardingProgress";

// ---------------------------------------------------------------------------
// Lazy step chunks
// ---------------------------------------------------------------------------

/**
 * Only one step renders at a time, so each step (and its Radix primitives:
 * Select/RadioGroup/Checkbox/multi-selects) is code-split into its own chunk
 * via `next/dynamic`. This keeps the initial `/investors/onboard` First Load JS
 * lean — the inactive steps' primitives never enter the initial bundle.
 * `ssr: false` is safe here: the wizard is an interactive Client Component
 * anyway, and it further trims initial JS. A reserved-height `StepFallback`
 * holds layout while the active step's chunk loads, avoiding a jarring shift.
 *
 * The pure exports below (`investorWizardReducer`, `initialInvestorWizardState`)
 * are NOT lazy — they remain statically exported so the reducer tests and steps
 * can import them directly as pure functions.
 */

/** Reserved-height placeholder shown while a step chunk loads (no layout jump). */
function StepFallback() {
  return <div aria-hidden className="min-h-[24rem]" />;
}

const OnboardStep01Identity = dynamic(
  () => import("./OnboardStep01Identity").then((m) => m.OnboardStep01Identity),
  { loading: () => <StepFallback />, ssr: false },
);
const OnboardStep02Firm = dynamic(
  () => import("./OnboardStep02Firm").then((m) => m.OnboardStep02Firm),
  { loading: () => <StepFallback />, ssr: false },
);
const OnboardStep03Thesis = dynamic(
  () => import("./OnboardStep03Thesis").then((m) => m.OnboardStep03Thesis),
  { loading: () => <StepFallback />, ssr: false },
);
const OnboardStep04Review = dynamic(
  () => import("./OnboardStep04Review").then((m) => m.OnboardStep04Review),
  { loading: () => <StepFallback />, ssr: false },
);
const OnboardingSuccess = dynamic(
  () => import("./OnboardingSuccess").then((m) => m.OnboardingSuccess),
  { loading: () => <StepFallback />, ssr: false },
);

// ---------------------------------------------------------------------------
// Step contract
// ---------------------------------------------------------------------------

export type InvestorWizardStep = 1 | 2 | 3 | 4;

/**
 * The single prop contract every wizard step consumes. The controller owns all
 * state in one `useReducer`; each step receives a read-only slice plus the
 * `dispatch` callback. Steps never hold their own field state.
 */
export interface InvestorStepProps {
  profile: Partial<InvestorProfile>;
  errors: WizardFieldErrors;
  touched: Record<string, boolean>;
  dispatch: React.Dispatch<InvestorWizardAction>;
}

// ---------------------------------------------------------------------------
// Pure reducer state + actions
// ---------------------------------------------------------------------------

export interface InvestorWizardState {
  currentStep: InvestorWizardStep;
  profile: Partial<InvestorProfile>;
  errors: Record<InvestorWizardStep, WizardFieldErrors>;
  touched: Record<string, boolean>;
  submitted: boolean;
  accuracyConfirmed: boolean;
}

export type InvestorWizardAction =
  | { type: "SET_FIELD"; field: keyof InvestorProfile; value: unknown }
  | { type: "BLUR_FIELD"; field: string }
  | { type: "VALIDATE_STEP"; step: InvestorWizardStep }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "GO_TO_STEP"; step: InvestorWizardStep }
  | { type: "TOGGLE_ACCURACY"; value: boolean }
  | { type: "SUBMIT" };

export const TOTAL_STEPS = 4 as const;

/** Step → validator map. Step 4 has no field validation (accuracy gates submit). */
const STEP_VALIDATORS: Record<InvestorWizardStep, InvestorStepValidator> = {
  1: validateInvestorStep1,
  2: validateInvestorStep2,
  3: validateInvestorStep3,
  4: () => ({}),
};

export const STEP_TITLES: Record<InvestorWizardStep, string> = {
  1: "Identity",
  2: "Firm profile",
  3: "Investment thesis",
  4: "Review & submit",
};

/** Initial wizard state: step 1, empty draft, empty per-step errors. */
export const initialInvestorWizardState: InvestorWizardState = {
  currentStep: 1,
  profile: {},
  errors: { 1: {}, 2: {}, 3: {}, 4: {} },
  touched: {},
  submitted: false,
  accuracyConfirmed: false,
};

function hasErrors(errors: WizardFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Exhaustiveness guard — a compile error here means an action went unhandled. */
function assertNever(action: never): never {
  throw new Error(`Unhandled investor wizard action: ${JSON.stringify(action)}`);
}

/**
 * Pure investor wizard reducer — `(state, action) => state`. No side effects,
 * no I/O. Fully exhaustive over the typed `InvestorWizardAction` union.
 *
 * - `NEXT` no-ops when the current step has recorded errors or at step 4.
 * - `BACK` no-ops at step 1.
 * - Submit is gated on `accuracyConfirmed` by the controller; the reducer's
 *   `SUBMIT` simply flips `submitted`.
 */
export function investorWizardReducer(
  state: InvestorWizardState,
  action: InvestorWizardAction,
): InvestorWizardState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        profile: { ...state.profile, [action.field]: action.value },
      };

    case "BLUR_FIELD":
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };

    case "VALIDATE_STEP": {
      const stepErrors = STEP_VALIDATORS[action.step](state.profile);
      return {
        ...state,
        errors: { ...state.errors, [action.step]: stepErrors },
      };
    }

    case "NEXT": {
      if (hasErrors(state.errors[state.currentStep])) return state;
      if (state.currentStep >= TOTAL_STEPS) return state;
      return {
        ...state,
        currentStep: (state.currentStep + 1) as InvestorWizardStep,
      };
    }

    case "BACK": {
      if (state.currentStep <= 1) return state;
      return {
        ...state,
        currentStep: (state.currentStep - 1) as InvestorWizardStep,
      };
    }

    case "GO_TO_STEP":
      return { ...state, currentStep: action.step };

    case "TOGGLE_ACCURACY":
      return { ...state, accuracyConfirmed: action.value };

    case "SUBMIT":
      return { ...state, submitted: true };

    default:
      return assertNever(action);
  }
}

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

export interface InvestorOnboardingWizardProps {
  /**
   * Optional internal path to navigate to after a successful onboarding. Only
   * ever resolved from a guarded mapping table (no open-redirects). When
   * `undefined`, the post-submit success screen renders instead.
   */
  redirectTo?: string;
}

/**
 * InvestorOnboardingWizard — the four-step guided onboarding controller (Req 16).
 *
 * Holds the single `useReducer`; renders the progress header, the active step,
 * and Back/Continue controls inside a `max-w-3xl` container. Continue uses the
 * validate-on-attempt pattern: it dispatches `VALIDATE_STEP` then `NEXT`, so an
 * invalid step records its errors and `NEXT` no-ops. The Continue label is
 * "Continue" on steps 1–3 and "Submit" on step 4. Submit is `aria-disabled`
 * (never native `disabled`) while accuracy is unconfirmed, so SR users can
 * still focus it.
 *
 * On submit: push the final draft via `updateInvestorProfile`, call
 * `completeOnboarding()`, dispatch `SUBMIT`, then — if `redirectTo` is set —
 * `router.push(redirectTo)`. With no `redirectTo`, render `OnboardingSuccess`.
 */
export function InvestorOnboardingWizard({
  redirectTo,
}: InvestorOnboardingWizardProps = {}) {
  const [state, dispatch] = useReducer(
    investorWizardReducer,
    initialInvestorWizardState,
  );
  const { updateInvestorProfile, completeOnboarding } = useInvestor();
  const router = useRouter();

  const stepContainerRef = useRef<HTMLDivElement>(null);

  const {
    currentStep,
    errors,
    touched,
    profile,
    submitted,
    accuracyConfirmed,
  } = state;

  const currentErrors = errors[currentStep];
  const isLastStep = currentStep === TOTAL_STEPS;
  // Continue is gated by recorded errors; the last step is gated by accuracy.
  const continueDisabled = isLastStep
    ? !accuracyConfirmed
    : hasErrors(currentErrors);

  // Move focus to the active step's first control on entry.
  useEffect(() => {
    if (submitted) return;
    const node = stepContainerRef.current?.querySelector<HTMLElement>(
      'input, textarea, [role="combobox"], [role="radio"], [role="checkbox"], button, [tabindex]',
    );
    node?.focus();
  }, [currentStep, submitted]);

  function handleBack() {
    dispatch({ type: "BACK" });
  }

  function handleContinue() {
    if (isLastStep) {
      // Submit is gated on the accuracy checkbox (Req 16.4).
      if (!accuracyConfirmed) return;
      // Push the final draft, then finalize onboarding (Req 16.5).
      updateInvestorProfile(profile);
      completeOnboarding();
      dispatch({ type: "SUBMIT" });
      // Additive redirect: when a guarded target is supplied, navigate there
      // after submit (Req 16.6). When absent, the success screen renders.
      if (redirectTo) router.push(redirectTo);
      return;
    }

    // Validate-on-attempt: record errors, then attempt to advance.
    dispatch({ type: "VALIDATE_STEP", step: currentStep });
    dispatch({ type: "NEXT" });

    // Sync the validated slice into shared context only when the step is valid.
    const stepErrors = STEP_VALIDATORS[currentStep](profile);
    if (!hasErrors(stepErrors)) {
      updateInvestorProfile(profile);
    }
  }

  const stepProps: InvestorStepProps = {
    profile,
    errors: currentErrors,
    touched,
    dispatch,
  };

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <OnboardingSuccess />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <OnboardingProgress
        currentStep={currentStep}
        title={STEP_TITLES[currentStep]}
      />

      <div ref={stepContainerRef} className="mt-8">
        {currentStep === 1 ? <OnboardStep01Identity {...stepProps} /> : null}
        {currentStep === 2 ? <OnboardStep02Firm {...stepProps} /> : null}
        {currentStep === 3 ? <OnboardStep03Thesis {...stepProps} /> : null}
        {currentStep === 4 ? (
          <OnboardStep04Review
            {...stepProps}
            accuracyConfirmed={accuracyConfirmed}
          />
        ) : null}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 1}
          aria-disabled={currentStep === 1}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="accent"
          onClick={handleContinue}
          aria-disabled={continueDisabled}
          // Never use the native `disabled` attribute so SR users can focus it
          // and hear why it is unavailable.
          className={cn(continueDisabled && "opacity-50")}
        >
          {isLastStep ? "Submit" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

export default InvestorOnboardingWizard;
