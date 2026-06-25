"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOptionalRegistration } from "@/context/RegistrationContext";

/**
 * SchemesPersonalizationBanner — surgical, additive home personalization island
 * (Req 24.1, 24.2, 24.4, 24.5).
 *
 * A `"use client"` island placed immediately ABOVE the existing schemes preview
 * section on the home page. It reads the session `RegistrationContext`:
 *
 *   - WHILE Registered_State: renders a restrained, accent-bordered banner that
 *     reads "You qualify for {qualifyingCount} of 22 schemes" with a control
 *     targeting `/schemes` (Req 24.1). `qualifyingCount` is the number of
 *     schemes whose eligibility status is `definitely-eligible` or
 *     `likely-eligible`, computed in context via `evaluateAllSchemes`
 *     (Req 24.2).
 *   - WHILE Unregistered_State (the default): renders `null` — the home page is
 *     byte-for-byte the foundation behavior, with no banner (Req 24.4).
 *
 * This component does not alter any foundation home section; it only adds an
 * island that disappears when no profile exists (Req 24.5). No persistence,
 * no network — state comes solely from in-memory React context (Req 25).
 *
 * Visual discipline (Req 26): flat accent-tinted card, `rounded-xl`, a thin
 * `border-accent/40` border, `bg-accent/5` fill, a single Lucide icon, no
 * gradient/blob/glow.
 */
export function SchemesPersonalizationBanner() {
  const { isRegistered, qualifyingCount } = useOptionalRegistration();

  // Unregistered_State: render nothing so the home page matches the foundation
  // slice exactly (Req 24.4).
  if (!isRegistered) {
    return null;
  }

  return (
    <section aria-labelledby="schemes-personalization-heading" className="bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-xl border border-accent/40 bg-accent/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <BadgeCheck
              className="mt-0.5 size-5 shrink-0 text-accent"
              aria-hidden="true"
            />
            <div>
              <h2
                id="schemes-personalization-heading"
                className="text-base font-semibold text-dark"
              >
                You qualify for {qualifyingCount} of 22 schemes
              </h2>
              <p className="mt-1 text-sm text-muted">
                Based on your registered profile. Review your personalized
                eligibility and estimated benefits.
              </p>
            </div>
          </div>

          <Button asChild variant="accent" className="min-h-11 shrink-0">
            <Link href="/schemes">
              View your schemes
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default SchemesPersonalizationBanner;
