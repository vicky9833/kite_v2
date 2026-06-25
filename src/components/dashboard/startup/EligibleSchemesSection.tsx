"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ConfidenceDot } from "@/components/shared/ConfidenceDot";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { useRegistration } from "@/context/RegistrationContext";
import { schemes } from "@/data/schemes";
import { evaluateAllSchemes } from "@/lib/eligibility-engine";
import { selectTopEligibleSchemes } from "@/lib/startup-selectors";
import { cn, formatStatValue } from "@/lib/utils";

/** Lookup of scheme id → canonical scheme name (Req 4.4). */
const SCHEME_NAME_BY_ID = new Map(schemes.map((s) => [s.id, s.name]));

/**
 * EligibleSchemesSection — "Schemes You Qualify For" (Req 4).
 *
 * Evaluates the eligibility engine for the session profile, selects the top
 * eligible schemes via `selectTopEligibleSchemes` (definitely/likely-eligible,
 * sorted by descending estimated benefit, capped at six — Req 4.2, 4.3), and
 * renders one card per scheme with its name, a `ConfidenceDot` status, the
 * estimated benefit, and a "View Details" link to `/schemes/{schemeId}`
 * (Req 4.4).
 *
 * Layout: four columns on desktop, three on tablet, and a horizontally
 * scrolling snap row on mobile (Req 4.5–4.7). A "See All 22 Schemes" link
 * routes to `/schemes` (Req 4.8).
 */
export function EligibleSchemesSection() {
  const { registrationProfile } = useRegistration();

  if (!registrationProfile) {
    return null;
  }

  const results = evaluateAllSchemes(registrationProfile);
  const topSchemes = selectTopEligibleSchemes(results);

  return (
    <section aria-labelledby="eligible-schemes-heading" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          id="eligible-schemes-heading"
          title="Schemes You Qualify For"
        />
        <Link
          href="/schemes"
          className="inline-flex items-center gap-1.5 text-body font-medium text-primary underline-offset-4 hover:underline"
        >
          See All 22 Schemes
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      {topSchemes.length === 0 ? (
        <p className="text-body text-muted">
          No qualifying schemes yet. Complete your profile to surface more
          matches.
        </p>
      ) : (
        <ul
          className={cn(
            // Mobile: horizontal snap-scroll row; tablet/desktop: grid.
            "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2",
            "md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-4",
          )}
        >
          {topSchemes.map((result) => {
            const name =
              SCHEME_NAME_BY_ID.get(result.schemeId) ?? result.schemeId;
            return (
              <li
                key={result.schemeId}
                className={cn(
                  "flex min-w-[16rem] shrink-0 snap-start flex-col rounded-xl border border-border bg-card p-5 shadow-sm",
                  "md:min-w-0 md:shrink",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-lg font-bold text-dark">
                    {name}
                  </h3>
                  <ConfidenceDot status={result.status} className="mt-1" />
                </div>

                <p className="mt-4 font-heading text-h3 font-bold text-dark">
                  {formatStatValue(result.estimatedBenefit, { prefix: "₹" })}
                </p>
                <p className="text-caption text-muted">Estimated benefit</p>

                <Link
                  href={`/schemes/${result.schemeId}`}
                  aria-label={`View details: ${name}`}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-5 w-fit min-h-11 rounded-lg",
                  )}
                >
                  View Details
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default EligibleSchemesSection;
