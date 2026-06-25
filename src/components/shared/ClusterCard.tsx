import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Cluster } from "@/types";

/**
 * ClusterCard — a single "Beyond Bengaluru" regional cluster card (Req 12).
 *
 * Government-grade editorial, NOT a SaaS marketing card. The restraint is the
 * brief: a flat white surface (`bg-card`) with a hairline `border` and a modest
 * `shadow-sm`. There are NO gradients, blobs, glow, glassmorphism, emoji, or
 * decorative imagery — the hierarchy comes from typography, the Karnataka
 * palette, and the verified cluster data.
 *
 * Server Component: the single call-to-action is an internal `next/link`
 * navigation to the cluster's own route (`cluster.href`), so no client-side
 * router is needed and no `"use client"` directive is required. The card is
 * only ever rendered for clusters that have already passed `isValidCluster`
 * (the section filters the source list), so `cluster.href` is a known-valid
 * internal route.
 */
export interface ClusterCardProps {
  /** The cluster record to render (already validated by the section). */
  cluster: Cluster;
  /** Extra classes merged onto the card wrapper. */
  className?: string;
}

export function ClusterCard({ cluster, className }: ClusterCardProps) {
  const {
    name,
    tagline,
    focusAreas,
    infrastructure,
    seedFund,
    ctaLabel,
    href,
  } = cluster;

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      {/* Name + tagline */}
      <h3 className="font-heading text-lg font-bold text-dark md:text-xl">
        {name}
      </h3>
      <p className="mt-1 text-sm text-muted">{tagline}</p>

      {/* Focus areas — restrained outline chips */}
      {focusAreas.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Focus areas">
          {focusAreas.map((area) => (
            <li key={area}>
              <Badge variant="outline" className="border-border text-muted">
                {area}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Seed fund — prominent but bordered, never a glow/gradient callout */}
      <div className="mt-5 rounded-lg border border-border bg-surface px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Seed Fund
        </p>
        <p className="mt-1 font-heading text-base font-bold text-primary">
          {seedFund}
        </p>
      </div>

      {/* Infrastructure — comma-joined paragraph reads cleaner than a long
          bullet list inside a compact card. */}
      {infrastructure.length > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-muted">
          <span className="font-medium text-dark">Infrastructure: </span>
          {infrastructure.join(", ")}
        </p>
      ) : null}

      {/* CTA pinned to the bottom of the card */}
      <Link
        href={href}
        aria-label={`${ctaLabel} — ${name}`}
        className={cn(
          "mt-auto inline-flex items-center gap-1 pt-6",
          "text-sm font-semibold text-primary",
          "transition-colors hover:text-accent",
          "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        )}
      >
        {ctaLabel}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

export default ClusterCard;
