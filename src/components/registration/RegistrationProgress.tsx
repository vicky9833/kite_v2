"use client";

import { cn } from "@/lib/utils";
import type { WizardStep } from "@/types";

const TOTAL_STEPS = 6;
const SEGMENTS = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);

export interface RegistrationProgressProps {
  /** The 1-based current wizard step (1..6). */
  currentStep: WizardStep;
  /** Human-readable title of the current step. */
  title: string;
}

/**
 * Editorial six-segment progress header for the registration wizard.
 *
 * Renders a small "Step N of 6" caption, the current step title as a heading,
 * and a precise six-segment bar. Completed/active segments fill with the
 * `accent` token; future segments use `border`/muted (Req 3.3). The bar
 * container is an ARIA `progressbar` exposing the current step; the individual
 * segments are decorative and hidden from assistive tech (Req 27.1).
 */
export function RegistrationProgress({
  currentStep,
  title,
}: RegistrationProgressProps) {
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
        aria-label={`Registration progress: step ${currentStep} of ${TOTAL_STEPS}, ${title}`}
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

export default RegistrationProgress;
