"use client";

import { cn } from "@/lib/utils";

const TOTAL_STEPS = 4;
const SEGMENTS = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);

export interface OnboardingProgressProps {
  /** The 1-based current wizard step (1..4). */
  currentStep: 1 | 2 | 3 | 4;
  /** Human-readable title of the current step. */
  title: string;
}

/**
 * Editorial four-segment progress header for the investor onboarding wizard.
 *
 * Renders a small "Step N of 4" caption, the current step title as a heading,
 * and a precise four-segment bar. Completed/active segments fill with the
 * `accent` token; future segments use `border`/muted. The bar container is an
 * ARIA `progressbar` exposing the current step (aria-valuenow/min=1/max=4); the
 * individual segments are decorative and hidden from assistive tech. Mirrors
 * `RegistrationProgress`.
 */
export function OnboardingProgress({
  currentStep,
  title,
}: OnboardingProgressProps) {
  return (
    <header className="space-y-3">
      <div className="space-y-1">
        <p className="text-caption font-medium uppercase tracking-wide text-muted">
          Step {currentStep} of {TOTAL_STEPS}
        </p>
        <h1 className="font-heading text-h3 font-semibold text-dark">{title}</h1>
      </div>

      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`Onboarding progress: step ${currentStep} of ${TOTAL_STEPS}, ${title}`}
        className="flex items-center gap-1.5"
      >
        {SEGMENTS.map((segment) => {
          const filled = segment <= currentStep;
          return (
            <span
              key={segment}
              aria-hidden="true"
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                filled ? "bg-accent" : "bg-border",
              )}
            />
          );
        })}
      </div>
    </header>
  );
}

export default OnboardingProgress;
