"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { schemes } from "@/data/schemes";
import { hasSchemeBadge } from "@/lib/scheme-tagging";
import { cn } from "@/lib/utils";
import type { Scheme, SchemeType } from "@/types";

/**
 * WomenSchemesList — the Women_Hub women-relevant schemes section (Req 10).
 *
 * Renders a curated set of REAL Karnataka schemes (every id below exists in
 * `src/data/schemes.ts`) in the {@link SchemeRow} table-row pattern — name,
 * type, and max benefit — with a small "Women Preference" badge adjacent to the
 * rows flagged by `hasSchemeBadge(id, 'Women Preference')`
 * (`elevate`, `elevate-unnati`, `kitven-fund-5`, `beyond-bengaluru-cluster-fund`)
 * (Req 10.1, 10.2, 10.6). ELEVATE Unnati is surfaced prominently in a lead-in
 * callout.
 *
 * A simple client-side filter holds state in `useState` only (no URL/storage):
 * a "Women preference only" toggle and a scheme-type select, both with visible
 * labels (Req 10.3). When the active filter matches zero schemes, a no-results
 * message is shown (Req 10.4). A "See All 22 Schemes" link routes to `/schemes`
 * (Req 10.5).
 *
 * Client Component (holds filter state); government-grade restraint —
 * `rounded-xl shadow-sm border`, `max-w-7xl`, Lucide icons only.
 */

/**
 * Curated, ordered list of REAL women-relevant scheme ids. Every id exists in
 * Scheme_Data; the four `WOMEN_PREFERENCE_SCHEME_IDS` carry the badge, the rest
 * are broadly relevant pathways for women founders.
 */
const WOMEN_RELEVANT_SCHEME_IDS: readonly string[] = [
  "elevate-unnati",
  "elevate",
  "kitven-fund-5",
  "beyond-bengaluru-cluster-fund",
  "grand-challenge-karnataka",
  "kan",
  "nain-2",
  "grassroot-innovation",
];

type SchemeTypeFilter = SchemeType | "all";

const SCHEME_TYPE_OPTIONS: readonly { value: SchemeTypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "grant", label: "Grants" },
  { value: "fiscal", label: "Fiscal incentives" },
];

/** Resolve the curated id list to real Scheme records, preserving order. */
function getWomenRelevantSchemes(): Scheme[] {
  const byId = new Map(schemes.map((scheme) => [scheme.id, scheme]));
  return WOMEN_RELEVANT_SCHEME_IDS.flatMap((id) => {
    const scheme = byId.get(id);
    return scheme ? [scheme] : [];
  });
}

export function WomenSchemesList() {
  const headingId = "women-schemes-heading";
  const preferenceToggleId = useId();
  const typeSelectId = useId();

  const [womenPreferenceOnly, setWomenPreferenceOnly] = useState(false);
  const [schemeType, setSchemeType] = useState<SchemeTypeFilter>("all");

  const womenRelevantSchemes = useMemo(() => getWomenRelevantSchemes(), []);

  const visibleSchemes = useMemo(
    () =>
      womenRelevantSchemes.filter(
        (scheme) =>
          (!womenPreferenceOnly ||
            hasSchemeBadge(scheme.id, "Women Preference")) &&
          (schemeType === "all" || scheme.type === schemeType),
      ),
    [womenRelevantSchemes, womenPreferenceOnly, schemeType],
  );

  return (
    <section aria-labelledby={headingId} className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <h2 id={headingId} className="font-heading text-h2 text-dark">
            Schemes for Women-Led Startups
          </h2>
          <p className="text-body text-muted">
            Real Karnataka schemes that are relevant to women founders. Schemes
            with an explicit women-founder preference are marked with a{" "}
            <span className="font-medium text-dark">Women Preference</span>{" "}
            badge.
          </p>
        </div>

        {/* ELEVATE Unnati — surfaced prominently */}
        <div className="mt-8 flex flex-col gap-2 rounded-xl border border-border bg-surface p-6 shadow-sm sm:flex-row sm:items-start sm:gap-4">
          <Sparkles
            aria-hidden="true"
            className="h-6 w-6 shrink-0 text-primary"
          />
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-lg text-dark">
              Spotlight: ELEVATE Unnati
            </h3>
            <p className="text-body text-muted">
              The dedicated ELEVATE track for SC/ST founders — including SC/ST
              women founders — routed via the Department of Social Welfare, with
              grants up to ₹50 lakh per startup.
            </p>
            <Link
              href="/schemes#elevate-unnati"
              className="mt-1 inline-flex w-fit items-center gap-1 rounded-md font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              View ELEVATE Unnati
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Filter controls — labeled, state in useState only */}
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <input
              id={preferenceToggleId}
              type="checkbox"
              checked={womenPreferenceOnly}
              onChange={(event) => setWomenPreferenceOnly(event.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <label
              htmlFor={preferenceToggleId}
              className="text-body font-medium text-dark"
            >
              Women Preference only
            </label>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor={typeSelectId}
              className="text-body font-medium text-dark"
            >
              Scheme type
            </label>
            <select
              id={typeSelectId}
              value={schemeType}
              onChange={(event) =>
                setSchemeType(event.target.value as SchemeTypeFilter)
              }
              className="rounded-md border border-border bg-card px-3 py-1.5 text-body text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {SCHEME_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {visibleSchemes.length === 0 ? (
          <p
            role="status"
            className="mt-8 rounded-xl border border-border bg-surface p-6 text-body text-muted"
          >
            No women-relevant schemes match the current filters. Try clearing the
            women-preference filter or selecting a different scheme type.
          </p>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl border border-border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface">
                  <TableHead className="text-dark">Scheme</TableHead>
                  <TableHead className="text-dark">Type</TableHead>
                  <TableHead className="text-dark">Max benefit</TableHead>
                  <TableHead className="text-right text-dark">
                    <span className="sr-only">Details</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleSchemes.map((scheme) => {
                  const isWomenPreference = hasSchemeBadge(
                    scheme.id,
                    "Women Preference",
                  );
                  return (
                    <TableRow key={scheme.id} className="hover:bg-surface">
                      <TableCell className="align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-heading font-semibold text-dark">
                            {scheme.name}
                          </span>
                          {isWomenPreference ? (
                            <Badge variant="accent">Women Preference</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-body capitalize text-muted">
                        {scheme.type}
                      </TableCell>
                      <TableCell className="align-top text-body text-foreground">
                        {scheme.maxBenefit}
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
        )}

        <div className="mt-8">
          <Link
            href="/schemes"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            See All 22 Schemes
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default WomenSchemesList;
