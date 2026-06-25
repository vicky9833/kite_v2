"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { WizardFieldErrors } from "@/types";

/**
 * Returns a field's error message ONLY once it has been touched (blurred),
 * otherwise `undefined`. Steps use the same gated value for both the visible
 * error node and the input's `aria-describedby`/`aria-invalid`. Mirrors the
 * registration wizard's `fieldError`.
 */
export function fieldError(
  errors: WizardFieldErrors,
  touched: Record<string, boolean>,
  name: string,
): string | undefined {
  return touched[name] ? errors[name] : undefined;
}

export interface OnboardingFieldProps {
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
 * `aria-live="polite"` region that announces the error as it appears. The error
 * node carries the id `${id}-error` so the control can point at it via
 * `aria-describedby`. Mirrors the registration wizard's `WizardField`.
 */
export function OnboardingField({
  id,
  label,
  error,
  hint,
  hintId,
  className,
  children,
}: OnboardingFieldProps) {
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

export default OnboardingField;
