"use client";

// src/components/dashboard/startup/RecommendedNextSteps.tsx
//
// "Recommended Next Steps" (Req 7). Renders the 3–4 prioritised recommendation
// cards produced by the pure recommendation engine. The session profile (plus
// its computed completeness) forms the `RecommendationContext`; the session-only
// `visitedCalculator` / `browsedSchemes` signals default to false (untracked).
//
// Each card resolves its Lucide icon from the `iconName` string via a local
// `ICON_MAP` — mirroring the pattern in `QuickActionCard` so the pure data layer
// stays free of React/runtime imports. CTAs route via `next/link` for internal
// hrefs and a plain anchor (new tab) for external (https) portals.

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  Calendar,
  MapPin,
  ReceiptText,
  Search,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import {
  buildRecommendations,
  computeProfileCompleteness,
  selectDisplayRecommendations,
} from "@/lib/startup-recommendations";
import { cn } from "@/lib/utils";
import type { RegistrationProfile } from "@/types";

export interface RecommendedNextStepsProps {
  /** The founder's session profile, used to build the recommendation context. */
  profile: RegistrationProfile;
}

/**
 * Maps each recommendation's `iconName` to its concrete `lucide-react` glyph.
 * Covers every icon emitted by `buildRecommendations` (rule + evergreen recs).
 */
const ICON_MAP: Record<string, LucideIcon> = {
  UserCheck,
  BadgeCheck,
  ReceiptText,
  Calculator,
  Search,
  MapPin,
  Calendar,
  Users,
};

/** True for absolute http(s) URLs that should open in a new tab. */
function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * RecommendedNextSteps — a single desktop row (stacked on mobile) of prioritised
 * "what to do next" cards. The recommendation list is always 3–4 items because
 * the engine pads with evergreen recs and clamps the display count.
 */
export function RecommendedNextSteps({ profile }: RecommendedNextStepsProps) {
  const completeness = computeProfileCompleteness(profile);
  const recommendations = selectDisplayRecommendations(
    buildRecommendations({ profile, completeness }),
  );

  return (
    <section aria-labelledby="recommended-next-steps-heading" className="flex flex-col gap-8">
      <SectionHeading
        id="recommended-next-steps-heading"
        title="Recommended Next Steps"
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {recommendations.map((rec) => {
          const Icon = ICON_MAP[rec.iconName];
          const external = isExternalHref(rec.href);

          return (
            <article
              key={rec.id}
              className="flex flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              {Icon ? (
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              ) : null}

              <h3 className="font-heading text-lg font-semibold text-dark">
                {rec.heading}
              </h3>

              <p className="text-sm text-muted">{rec.description}</p>

              {external ? (
                <a
                  href={rec.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "mt-auto inline-flex items-center gap-1 pt-2",
                    "text-sm font-semibold text-primary",
                    "transition-colors hover:text-accent",
                    "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  )}
                >
                  {rec.ctaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : (
                <Link
                  href={rec.href}
                  className={cn(
                    "mt-auto inline-flex items-center gap-1 pt-2",
                    "text-sm font-semibold text-primary",
                    "transition-colors hover:text-accent",
                    "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  )}
                >
                  {rec.ctaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RecommendedNextSteps;
