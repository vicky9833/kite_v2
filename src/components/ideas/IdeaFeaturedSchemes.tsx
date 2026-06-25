import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { schemes } from "@/data/schemes";
import { GRASSROOTS_FRIENDLY_SCHEME_IDS, hasSchemeBadge } from "@/lib/scheme-tagging";
import type { Scheme } from "@/types";

/**
 * IdeaFeaturedSchemes — the Idea_Bank featured matched schemes section (Req 31).
 *
 * Renders the grassroots-friendly schemes using the existing SchemeRow cell
 * pattern inside a semantic `<Table>` (Req 31.1), reusing the layout of
 * `WomenSchemesList`. The featured set is `GRASSROOTS_FRIENDLY_SCHEME_IDS`
 * (`grassroot-innovation`, `nain-2`, `rgep`, `rd-project-grant`) — every id is
 * a real scheme id that exists in `Scheme_Data` (Req 31.3). Each row carries a
 * "Grassroots Friendly" badge from `hasSchemeBadge(id, 'Grassroots Friendly')`
 * (Req 31.2).
 *
 * Server Component (no interactivity / no `"use client"`). As featured schemes
 * are a fixed curated list, there is no filter. Government-grade restraint:
 * flat `rounded-xl shadow-sm border`, Lucide icons only, no gradients/emoji.
 */

/** The grassroots-friendly schemes resolved to real Scheme records, in order. */
const FEATURED_SCHEMES: Scheme[] = GRASSROOTS_FRIENDLY_SCHEME_IDS.map((id) => {
  const scheme = schemes.find((s) => s.id === id);
  if (!scheme) {
    throw new Error(`Unknown grassroots-friendly scheme id: ${id}`);
  }
  return scheme;
});

/** Combine `amount` and `maxBenefit` into one benefit summary (per SchemeRow). */
function formatBenefit(amount: string, maxBenefit: string): string {
  return `${amount} · up to ${maxBenefit}`;
}

export function IdeaFeaturedSchemes() {
  return (
    <section
      aria-labelledby="idea-featured-schemes-heading"
      className="py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            Grassroots-friendly schemes
          </span>
          <h2
            id="idea-featured-schemes-heading"
            className="font-heading text-h2 text-dark"
          >
            Schemes for Grassroot Innovators
          </h2>
          <p className="text-body text-muted">
            Real Karnataka Startup Policy schemes that grassroots and student
            innovators can apply to today. Each is flagged Grassroots Friendly
            so you can see relevant funding routes at a glance.
          </p>
        </div>

        {/* Featured schemes table (SchemeRow cell pattern) */}
        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-dark">Scheme</TableHead>
                <TableHead className="text-dark">Benefit</TableHead>
                <TableHead className="text-dark">Duration</TableHead>
                <TableHead className="text-dark">Eligibility</TableHead>
                <TableHead className="text-right text-dark">
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FEATURED_SCHEMES.map((scheme) => {
                const isGrassrootsFriendly = hasSchemeBadge(
                  scheme.id,
                  "Grassroots Friendly",
                );
                return (
                  <TableRow key={scheme.id} className="hover:bg-surface">
                    <TableCell className="align-top">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-heading font-semibold text-dark">
                          {scheme.name}
                        </span>
                        {isGrassrootsFriendly ? (
                          <Badge variant="accent" className="w-fit">
                            Grassroots Friendly
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-body text-foreground">
                      {formatBenefit(scheme.amount, scheme.maxBenefit)}
                    </TableCell>
                    <TableCell className="align-top text-body text-muted">
                      {scheme.duration}
                    </TableCell>
                    <TableCell className="align-top text-caption text-muted">
                      {scheme.eligibility.join(", ")}
                    </TableCell>
                    <TableCell className="align-top text-right">
                      <Link
                        href={`/schemes#${scheme.id}`}
                        className="rounded-md font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Learn more
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-8">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 rounded-md font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            See All 22 Schemes
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default IdeaFeaturedSchemes;
