"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Info } from "lucide-react";

import { useRegistration } from "@/context/RegistrationContext";
import {
  evaluateAllSchemes,
  totalEstimatedBenefit,
} from "@/lib/eligibility-engine";
import { computeProfileCompleteness } from "@/lib/startup-recommendations";
import { getEcosystemRankLabel } from "@/lib/synthetic-dashboard-data";
import { cn, formatStatValue } from "@/lib/utils";

/** Eligibility statuses that count toward the qualifying total (Req 3.5, 3.6). */
const ELIGIBLE_STATUSES = new Set(["definitely-eligible", "likely-eligible"]);

/** Canonical total number of schemes (Req 3.7). */
const TOTAL_SCHEMES = 22;

/**
 * StartupHeroMetrics — the four headline stat cards beneath the header (Req 3).
 *
 * Responsive grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` (Req 3.1–3.3).
 * The eligibility engine is evaluated exactly once and shared across the
 * benefit total and the qualifying count:
 *
 *  1. Total Estimated Benefits — rupee value of `totalEstimatedBenefit`, caption
 *     "Across X eligible schemes" (Req 3.4, 3.5).
 *  2. Eligible Schemes Count — the qualifying count, caption "Of 22 schemes
 *     total" (Req 3.6, 3.7).
 *  3. Profile Completeness — percent from `computeProfileCompleteness`, with a
 *     "Complete Profile" link when below 100 (Req 3.8, 3.9).
 *  4. Ecosystem Rank — synthetic percentile label keyed by sector + stage, with
 *     an info tooltip noting the value is illustrative (Req 3.10, 3.11).
 *
 * The cards mirror the shared `StatCard` visual language (rounded-xl, hairline
 * border, subtle shadow, Plus Jakarta Sans headline figure) but compose extra
 * footer content — the dynamic caption, the in-card link, and the info tooltip —
 * that the value-only `StatCard` contract cannot host.
 */
export function StartupHeroMetrics() {
  const { registrationProfile } = useRegistration();

  if (!registrationProfile) {
    return null;
  }

  // Evaluate the eligibility engine once and reuse the result map (Req 3.4–3.6).
  const results = evaluateAllSchemes(registrationProfile);
  const qualifyingCount = Object.values(results).filter((r) =>
    ELIGIBLE_STATUSES.has(r.status),
  ).length;

  const benefitDisplay = formatStatValue(totalEstimatedBenefit(results), {
    prefix: "₹",
  });
  const completeness = computeProfileCompleteness(registrationProfile);
  const rankLabel = getEcosystemRankLabel(
    registrationProfile.primarySector,
    registrationProfile.currentStage,
  );

  return (
    <section
      aria-label="Your headline metrics"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <MetricCard
        label="Total Estimated Benefits"
        value={benefitDisplay}
        footer={`Across ${qualifyingCount} eligible scheme${
          qualifyingCount === 1 ? "" : "s"
        }`}
      />

      <MetricCard
        label="Eligible Schemes"
        value={String(qualifyingCount)}
        footer={`Of ${TOTAL_SCHEMES} schemes total`}
      />

      <MetricCard
        label="Profile Completeness"
        value={`${completeness}%`}
        footer={
          completeness < 100 ? (
            <Link
              href="/dashboard/startup#profile"
              className="text-caption font-medium text-primary underline-offset-4 hover:underline"
            >
              Complete Profile
            </Link>
          ) : (
            "Profile complete"
          )
        }
      />

      <MetricCard
        label={
          <span className="inline-flex items-center gap-1.5">
            Ecosystem Rank
            {/* Lightweight native title/aria affordance instead of a Radix
                tooltip — keeps the Radix tooltip + positioning lib out of the
                route's First Load JS (Req 27.1, 27.3, 27.4) while preserving the
                accessible "illustrative" hint. */}
            <span
              role="img"
              tabIndex={0}
              aria-label="About the Ecosystem Rank metric: illustrative — based on your sector and stage."
              title="Illustrative — based on your sector and stage."
              className="inline-flex rounded-full text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Info className="h-3.5 w-3.5" aria-hidden />
            </span>
          </span>
        }
        value={rankLabel}
        footer="Illustrative"
      />
    </section>
  );
}

/**
 * A single hero metric card. Mirrors `StatCard`'s restrained editorial styling
 * while allowing a rich `footer` (plain caption, link, or tooltip-bearing node).
 */
function MetricCard({
  label,
  value,
  footer,
  className,
}: {
  label: ReactNode;
  value: string;
  footer: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm",
        "transition-colors hover:border-primary/30",
        className,
      )}
    >
      <p className="font-heading text-h1 font-bold text-dark">{value}</p>
      <div className="mt-2 text-body text-muted">{label}</div>
      <div className="mt-4 text-caption text-muted/80">{footer}</div>
    </div>
  );
}

export default StartupHeroMetrics;
