"use client";

import Link from "next/link";

import { ConfidenceDot } from "@/components/shared/ConfidenceDot";
import { useRegistration } from "@/context/RegistrationContext";
import { evaluateScheme } from "@/lib/eligibility-engine";
import { formatNumber } from "@/lib/utils";
import type { EligibilityStatus, Scheme } from "@/types";

/**
 * PersonalizedEligibilityCard — the client island rendered inside the SERVER
 * Scheme Detail page (`/schemes/[id]`). The server passes the canonical
 * `scheme` down as a prop; only this personalized fragment ships JS while the
 * editorial content stays on the server.
 *
 * Two states (Req 16.8, 16.9):
 *  - Unregistered (no `isRegistered` AND no profile): a small, restrained muted
 *    banner inviting the visitor to register, with a link to `/register`.
 *  - Registered (or a profile is present): calls the pure `evaluateScheme`
 *    engine and renders a card whose BORDER color encodes the eligibility
 *    status, with a "Your Eligibility" title + ConfidenceDot, a reasons
 *    paragraph, and an estimated-benefit line formatted in Indian rupees.
 *
 * Government-grade: a single restrained colored border + clear reasons — careful
 * public-sector communication, not a toast. Accessible (semantic heading,
 * non-color-only status via ConfidenceDot's label).
 */

export interface PersonalizedEligibilityCardProps {
  /** The resolved scheme, passed down from the server detail page. */
  scheme: Scheme;
}

/**
 * Status → border color token. The four canonical {@link EligibilityStatus}
 * values map to the semantic KITE tokens (Req 16.8). A 2px border carries the
 * status signal without resorting to fills or glow.
 */
const STATUS_BORDER_CLASS: Record<EligibilityStatus, string> = {
  "definitely-eligible": "border-success",
  "likely-eligible": "border-warning",
  "check-requirements": "border-muted",
  "not-eligible": "border-danger",
};

/**
 * Render the estimated benefit in Indian rupees. When the benefit is 0 (or not
 * a positive finite number — e.g. a non-monetary scheme), we show a clear
 * sentence rather than a misleading "₹0" (founder judgment).
 */
function renderEstimatedBenefit(estimatedBenefit: number): string {
  if (!Number.isFinite(estimatedBenefit) || estimatedBenefit <= 0) {
    return "No direct monetary benefit estimated";
  }
  return `₹${formatNumber(estimatedBenefit)}`;
}

export function PersonalizedEligibilityCard({
  scheme,
}: PersonalizedEligibilityCardProps) {
  const { isRegistered, registrationProfile } = useRegistration();

  // Unregistered state: neither a completed registration nor an in-progress
  // profile draft exists (Req 16.9).
  if (!isRegistered && registrationProfile === null) {
    return (
      <div
        className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted shadow-sm"
        role="note"
      >
        <span>
          Register to see your personalized eligibility for this scheme.{" "}
        </span>
        <Link
          href="/register"
          className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
        >
          Register
        </Link>
      </div>
    );
  }

  // Registered (or a profile is set): guard the null profile defensively — when
  // `isRegistered` is true a profile is always present, but the type allows null.
  if (registrationProfile === null) {
    return null;
  }

  const result = evaluateScheme(registrationProfile, scheme);

  return (
    <section
      aria-labelledby="personalized-eligibility-title"
      className={`rounded-xl border-2 ${STATUS_BORDER_CLASS[result.status]} bg-card p-5 shadow-sm`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="personalized-eligibility-title"
          className="font-heading text-lg font-semibold text-dark"
        >
          Your Eligibility
        </h2>
        <ConfidenceDot status={result.status} showLabel />
      </div>

      {result.reasons.length === 1 ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {result.reasons[0]}
        </p>
      ) : (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
          {result.reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      )}

      <p className="mt-4 border-t border-border pt-3 text-sm text-dark">
        <span className="font-medium">Estimated Benefit:</span>{" "}
        <span>{renderEstimatedBenefit(result.estimatedBenefit)}</span>
      </p>
    </section>
  );
}

export default PersonalizedEligibilityCard;
