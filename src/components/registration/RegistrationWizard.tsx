"use client";

import * as React from "react";
import { useEffect, useReducer, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRegistration } from "@/context/RegistrationContext";
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
} from "@/lib/registration-validators";
import type {
  RegistrationProfile,
  StepValidator,
  WizardAction,
  WizardFieldErrors,
  WizardState,
  WizardStep,
} from "@/types";

import { RegistrationProgress } from "./RegistrationProgress";

// ---------------------------------------------------------------------------
// Lazy step chunks
// ---------------------------------------------------------------------------

/**
 * Only one step renders at a time, so each step (and its Radix primitives:
 * Select/Slider/RadioGroup/Checkbox) is code-split into its own chunk via
 * `next/dynamic`. This keeps the initial `/register` First Load JS lean — the
 * inactive steps' primitives never enter the initial bundle. `ssr: false` is
 * safe here: the wizard is an interactive Client Component anyway, and it
 * further trims initial JS. A reserved-height `StepFallback` holds layout while
 * the active step's chunk loads, avoiding a jarring shift.
 *
 * The pure exports below (`wizardReducer`, `initialWizardState`, `StepProps`,
 * `WizardField`, `fieldError`) are NOT lazy — they remain statically exported
 * so tests and steps can import them directly.
 */

/** Reserved-height placeholder shown while a step chunk loads (no layout jump). */
function StepFallback() {
  return <div aria-hidden className="min-h-[24rem]" />;
}

const RegistrationStep01Founder = dynamic(
  () => import("./RegistrationStep01Founder").then((m) => m.RegistrationStep01Founder),
  { loading: () => <StepFallback />, ssr: false },
);
const RegistrationStep02Company = dynamic(
  () => import("./RegistrationStep02Company").then((m) => m.RegistrationStep02Company),
  { loading: () => <StepFallback />, ssr: false },
);
const RegistrationStep03Team = dynamic(
  () => import("./RegistrationStep03Team").then((m) => m.RegistrationStep03Team),
  { loading: () => <StepFallback />, ssr: false },
);
const RegistrationStep04Sectors = dynamic(
  () => import("./RegistrationStep04Sectors").then((m) => m.RegistrationStep04Sectors),
  { loading: () => <StepFallback />, ssr: false },
);
const RegistrationStep05Location = dynamic(
  () => import("./RegistrationStep05Location").then((m) => m.RegistrationStep05Location),
  { loading: () => <StepFallback />, ssr: false },
);
const RegistrationStep06Review = dynamic(
  () => import("./RegistrationStep06Review").then((m) => m.RegistrationStep06Review),
  { loading: () => <StepFallback />, ssr: false },
);
const RegistrationSuccess = dynamic(
  () => import("./RegistrationSuccess").then((m) => m.RegistrationSuccess),
  { loading: () => <StepFallback />, ssr: false },
);

// ---------------------------------------------------------------------------
// Shared step contract
// ---------------------------------------------------------------------------

/**
 * The single prop contract every wizard step consumes. The controller owns all
 * state in one `useReducer`; each step receives a read-only slice plus the
 * `dispatch` callback. Steps never hold their own field state.
 *
 * - `profile`  — the cross-step draft (`Partial<RegistrationProfile>`).
 * - `errors`   — the CURRENT step's `WizardFieldErrors` (already sliced).
 * - `touched`  — fieldName → blurred? (drives error-after-blur display).
 * - `dispatch` — the reducer dispatch.
 */
export interface StepProps {
  profile: Partial<RegistrationProfile>;
  errors: WizardFieldErrors;
  touched: Record<string, boolean>;
  dispatch: React.Dispatch<WizardAction>;
}

// ---------------------------------------------------------------------------
// Pure reducer
// ---------------------------------------------------------------------------

/** Step → validator map. Step 6 has no field validation (accuracy gates submit). */
const STEP_VALIDATORS: Record<WizardStep, StepValidator> = {
  1: validateStep1,
  2: validateStep2,
  3: validateStep3,
  4: validateStep4,
  5: validateStep5,
  6: () => ({}),
};

const STEP_TITLES: Record<WizardStep, string> = {
  1: "Founder details",
  2: "Company basics",
  3: "Team composition",
  4: "Sector focus",
  5: "Location & funding",
  6: "Review & submit",
};

export const TOTAL_STEPS = 6 as const;

/** Initial wizard state: step 1, empty draft, empty per-step errors. */
export const initialWizardState: WizardState = {
  currentStep: 1,
  profile: {},
  errors: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} },
  touched: {},
  submitted: false,
  accuracyConfirmed: false,
};

function hasErrors(errors: WizardFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Exhaustiveness guard — a compile error here means an action went unhandled. */
function assertNever(action: never): never {
  throw new Error(`Unhandled wizard action: ${JSON.stringify(action)}`);
}

/**
 * Pure wizard reducer — `(state, action) => state`. No side effects, no I/O.
 * Fully exhaustive over the typed `WizardAction` union.
 */
export function wizardReducer(
  state: WizardState,
  action: WizardAction,
): WizardState {
  switch (action.type) {
    case "SET_FIELD": {
      const { field, value } = action;

      // Step 4 coupling: choosing a primary sector drops it from secondaries.
      if (field === "primarySector") {
        const nextPrimary = value as string;
        const secondary = (state.profile.secondarySectors ?? []).filter(
          (id) => id !== nextPrimary,
        );
        return {
          ...state,
          profile: {
            ...state.profile,
            primarySector: nextPrimary,
            secondarySectors: secondary,
          },
        };
      }

      // Step 4 coupling: cap secondaries at 3 (a 4th selection is ignored) and
      // never allow the current primary to appear among them.
      if (field === "secondarySectors") {
        const next = (value as string[]) ?? [];
        if (next.length > 3) return state;
        const primary = state.profile.primarySector;
        const cleaned = primary
          ? next.filter((id) => id !== primary)
          : next;
        return {
          ...state,
          profile: { ...state.profile, secondarySectors: cleaned },
        };
      }

      return {
        ...state,
        profile: { ...state.profile, [field]: value },
      };
    }

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
        currentStep: (state.currentStep + 1) as WizardStep,
      };
    }

    case "BACK": {
      if (state.currentStep <= 1) return state;
      return {
        ...state,
        currentStep: (state.currentStep - 1) as WizardStep,
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
// Shared field helpers (consumed by every step for consistent a11y wiring)
// ---------------------------------------------------------------------------

/**
 * Returns a field's error message ONLY once it has been touched (blurred),
 * otherwise `undefined`. Steps use the same gated value for both the visible
 * error node and the input's `aria-describedby`/`aria-invalid`.
 */
export function fieldError(
  errors: WizardFieldErrors,
  touched: Record<string, boolean>,
  name: string,
): string | undefined {
  return touched[name] ? errors[name] : undefined;
}

export interface WizardFieldProps {
  /** Id of the control this field labels. The error node id is `${id}-error`. */
  id: string;
  label: string;
  /** Already-gated error message (see `fieldError`); shown in a live region. */
  error?: string;
  /** Optional helper text rendered beneath the control. */
  hint?: string;
  /** Optional id of the hint node (for `aria-describedby` composition). */
  hintId?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Editorial field shell: label, control, optional hint, and an adjacent
 * `aria-live="polite"` region that announces the error as it appears
 * (Req 27.3). The error node carries the id `${id}-error` so the control can
 * point at it via `aria-describedby`.
 */
export function WizardField({
  id,
  label,
  error,
  hint,
  hintId,
  className,
  children,
}: WizardFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-caption font-medium text-dark">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="text-caption text-muted">
          {hint}
        </p>
      ) : null}
      <div aria-live="polite" className="min-h-[1.25rem]">
        {error ? (
          <p id={`${id}-error`} className="text-caption font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

/**
 * RegistrationWizard — the six-step guided wizard controller (Req 3).
 *
 * Holds the single `useReducer`; renders the progress header, the active step,
 * and Back/Continue controls inside a `max-w-3xl` container. Continue uses the
 * validate-on-attempt pattern: it dispatches `VALIDATE_STEP` then `NEXT`, so an
 * invalid step records its errors and `NEXT` no-ops. Continue is `aria-disabled`
 * (never `disabled`) while the step is invalid, so screen-reader users can still
 * focus it. On each successful advance the validated draft is pushed into the
 * shared `RegistrationContext`; the final submit calls `completeRegistration()`.
 *
 * `redirectTo` is an **optional, additive** prop (default `undefined`). When set
 * (the `/register?redirectFrom=…` round-trip supplies it), the wizard runs
 * `router.push(redirectTo)` right after `completeRegistration()` / the `SUBMIT`
 * dispatch (Req 1.6). When absent, the wizard renders `RegistrationSuccess`
 * exactly as today — no behavior change (Req 1.7, 30.5).
 */
export interface RegistrationWizardProps {
  /**
   * Optional internal path to navigate to after a successful registration. Only
   * ever resolved from a guarded mapping table (no open-redirects). When
   * `undefined`, the post-submit success screen renders as before.
   */
  redirectTo?: string;
}

export function RegistrationWizard({ redirectTo }: RegistrationWizardProps = {}) {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);
  const { updateProfile, completeRegistration } = useRegistration();
  const router = useRouter();

  const stepContainerRef = useRef<HTMLDivElement>(null);

  const { currentStep, errors, touched, profile, submitted, accuracyConfirmed } =
    state;

  const currentErrors = errors[currentStep];
  const isLastStep = currentStep === TOTAL_STEPS;
  // Continue is gated by recorded errors; the last step is gated by accuracy.
  const continueDisabled = isLastStep
    ? !accuracyConfirmed
    : hasErrors(currentErrors);

  // Move focus to the active step's first control on entry (Req 3.11, 27.1).
  useEffect(() => {
    if (submitted) return;
    const node = stepContainerRef.current?.querySelector<HTMLElement>(
      'input, textarea, [role="combobox"], [role="slider"], [role="radio"], button, [tabindex]',
    );
    node?.focus();
  }, [currentStep, submitted]);

  function handleBack() {
    dispatch({ type: "BACK" });
  }

  function handleContinue() {
    if (isLastStep) {
      // Submit is gated on the accuracy checkbox (Req 9.4).
      if (!accuracyConfirmed) return;
      // Push the final draft, then finalize registration (Req 9.5).
      updateProfile(profile);
      completeRegistration();
      dispatch({ type: "SUBMIT" });
      // Additive redirect: when a guarded target is supplied (the
      // `/register?redirectFrom=…` round-trip), navigate there after submit
      // (Req 1.6). When absent, the success screen renders as today (Req 1.7).
      if (redirectTo) router.push(redirectTo);
      return;
    }

    // Validate-on-attempt: record errors, then attempt to advance.
    dispatch({ type: "VALIDATE_STEP", step: currentStep });
    dispatch({ type: "NEXT" });

    // Sync the validated slice into shared context only when the step is valid.
    const stepErrors = STEP_VALIDATORS[currentStep](profile);
    if (!hasErrors(stepErrors)) {
      updateProfile(profile);
    }
  }

  const stepProps: StepProps = { profile, errors: currentErrors, touched, dispatch };

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <RegistrationSuccess />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <RegistrationProgress currentStep={currentStep} title={STEP_TITLES[currentStep]} />

      <div ref={stepContainerRef} className="mt-8">
        {currentStep === 1 ? <RegistrationStep01Founder {...stepProps} /> : null}
        {currentStep === 2 ? <RegistrationStep02Company {...stepProps} /> : null}
        {currentStep === 3 ? <RegistrationStep03Team {...stepProps} /> : null}
        {currentStep === 4 ? <RegistrationStep04Sectors {...stepProps} /> : null}
        {currentStep === 5 ? <RegistrationStep05Location {...stepProps} /> : null}
        {currentStep === 6 ? (
          <RegistrationStep06Review {...stepProps} accuracyConfirmed={accuracyConfirmed} />
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
          // and hear why it is unavailable (Req 3.10, 27.2).
          className={cn(continueDisabled && "opacity-50")}
        >
          {isLastStep ? "Submit Registration" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

export default RegistrationWizard;
