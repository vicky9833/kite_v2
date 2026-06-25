// src/components/investors/BeyondBengaluruSection.tsx
//
// Investor Connect — "Beyond Bengaluru" (Req 12).
//
// Six regional cluster cards reframed for investors. The existing
// `ClusterCard` (`@/components/shared/ClusterCard`) renders a cluster's own
// editorial fields (tagline, seed fund, infrastructure) with a fixed
// "Explore …" CTA and exposes no slots for the investor framing this section
// needs — synthetic soonicorn count, synthetic co-invest capacity, and a
// "View Deal Flow" CTA — so a LOCAL card mirroring its restrained style is used
// instead (same `rounded-xl border bg-card shadow-sm` surface, no
// gradients/blobs/glow). The synthetic counts come from
// `getClusterInvestorFraming(clusterId)` and are visibly labeled illustrative.
//
// Full-bleed self-contained section, matching the sibling Investor Connect
// sections (own background + `py-16 md:py-24` + inner `max-w-7xl` container).

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { Cluster } from "@/types";
import { clusters } from "@/data/clusters";
import { getClusterInvestorFraming } from "@/lib/synthetic-investor-data";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";

/** A single investor-framed cluster card (local, mirrors ClusterCard style). */
function ClusterInvestorCard({ cluster }: { cluster: Cluster }) {
  const framing = getClusterInvestorFraming(cluster.id);

  return (
    <article className="relative flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <IllustrativeBadge variant="corner" />

      <h3 className="pr-20 font-heading text-lg font-bold text-dark md:text-xl">
        {cluster.name}
      </h3>
      <p className="mt-1 text-sm text-muted">{cluster.tagline}</p>

      {/* Focus sectors */}
      {cluster.focusAreas.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Focus sectors">
          {cluster.focusAreas.map((area) => (
            <li key={area}>
              <Badge variant="outline" className="border-border text-muted">
                {area}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Synthetic investor framing — soonicorns + co-invest capacity. */}
      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">
            Soonicorns
          </dt>
          <dd className="mt-1 font-heading text-base font-bold text-primary">
            {framing.soonicornCount}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">
            Co-invest Capacity
          </dt>
          <dd className="mt-1 font-heading text-base font-bold text-primary">
            ₹{framing.coInvestCapacityCrore} Cr
          </dd>
        </div>
      </dl>

      <Link
        href={`/clusters/${cluster.id}`}
        aria-label={`View deal flow — ${cluster.name}`}
        className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-semibold text-primary transition-colors hover:text-accent rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        View Deal Flow
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

export function BeyondBengaluruSection() {
  return (
    <section
      aria-labelledby="beyond-bengaluru-heading"
      className="bg-surface py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <SectionHeading
            id="beyond-bengaluru-heading"
            eyebrow="Regional clusters"
            title="Beyond Bengaluru"
            description="Six regional clusters opening fresh deal flow across Karnataka, each backed by dedicated seed capital."
          />
          <IllustrativeBadge variant="inline" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clusters.map((cluster) => (
            <ClusterInvestorCard key={cluster.id} cluster={cluster} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default BeyondBengaluruSection;
