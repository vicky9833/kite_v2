import Link from "next/link";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatCard } from "@/components/shared/StatCard";
import { ecosystemStats, homeStatsStripIds } from "@/data/ecosystem-stats";
import { cn } from "@/lib/utils";
import type { Stat } from "@/types";

/**
 * LiveMetricsSection — the "Live Ecosystem Metrics" Home section (Req 9).
 *
 * Renders the six curated Karnataka ecosystem metrics as a restrained,
 * government-grade editorial grid. The selection is driven by
 * `homeStatsStripIds` from the data layer (not invented here): each id is
 * resolved to its matching {@link Stat}, preserving the curated order, and any
 * unresolved id is filtered out.
 *
 * Per the latest direction, the cards are static (Req 9.4/9.5 count-up is
 * superseded) — each metric is presented with the existing {@link StatCard}
 * server component, so this section is itself a Server Component (no
 * `"use client"`, no interactivity, no animation).
 *
 * Unavailable-data guard (Req 9.7): if no curated stats resolve, the grid is
 * replaced with a restrained "Metrics are currently unavailable." message.
 */
export interface LiveMetricsSectionProps {
  /** Extra classes merged onto the section wrapper. */
  className?: string;
}

/** Resolve curated ids → Stats, preserving order and dropping any unknown id. */
const homeStats: Stat[] = homeStatsStripIds
  .map((id) => ecosystemStats.find((stat) => stat.id === id))
  .filter((stat): stat is Stat => stat !== undefined);

export function LiveMetricsSection({ className }: LiveMetricsSectionProps) {
  const hasStats = homeStats.length > 0;

  return (
    <section className={cn("bg-card py-16 md:py-24", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Live Metrics"
          title="Karnataka's Digital Landscape"
          description="Verified figures from official policy documents and ecosystem reports, in one consolidated view."
        />

        {hasStats ? (
          <>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {homeStats.map((stat) => (
                <StatCard key={stat.id} stat={stat} />
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/intelligence"
                className={cn(
                  "inline-block rounded-sm text-sm font-medium text-primary",
                  "transition-colors hover:text-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                )}
              >
                Explore Full Intelligence Dashboard
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-12 text-body text-muted">
            Metrics are currently unavailable.
          </p>
        )}
      </div>
    </section>
  );
}

export default LiveMetricsSection;
