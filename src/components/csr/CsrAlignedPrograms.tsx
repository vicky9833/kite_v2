"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, HandHeart } from "lucide-react";

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
import { CSR_ALIGNED_SCHEME_IDS, hasSchemeBadge } from "@/lib/scheme-tagging";
import type { Scheme, SchemeType } from "@/types";

/**
 * CsrAlignedPrograms — the CSR_Hub CSR-aligned programs list (Req 18).
 *
 * Renders the REAL CSR-aligned schemes from `src/data/schemes.ts` using the
 * existing SchemeRow cell pattern inside a semantic `<Table>` (Req 18.1). The
 * list is driven by `CSR_ALIGNED_SCHEME_IDS` and therefore always includes
 * `grassroot-innovation`, `elevate-unnati`, `nain-2`, and `rd-project-grant`
 * (Req 18.3); every id is a real scheme id that exists in Scheme_Data (Req
 * 18.4). Each row carries a "CSR-Aligned" badge sourced from
 * `hasSchemeBadge(id, 'CSR-Aligned')` (Req 18.2).
 *
 * A small client-side filter (`useState`, no URL/storage) offers a scheme-type
 * select; the visible rows are derived with `useMemo` and a no-results message
 * is shown when the active filter matches zero schemes (Req 18.5, 18.6).
 */

/** The CSR-aligned schemes resolved to real Scheme records, in list order. */
const CSR_ALIGNED_SCHEMES: Scheme[] = CSR_ALIGNED_SCHEME_IDS.map((id) => {
  const scheme = schemes.find((s) => s.id === id);
  if (!scheme) {
    throw new Error(`Unknown CSR-aligned scheme id: ${id}`);
  }
  return scheme;
});

type TypeFilter = "all" | SchemeType;

const TYPE_FILTER_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All scheme types" },
  { value: "grant", label: "Grants" },
  { value: "fiscal", label: "Fiscal incentives" },
];

/** Combine `amount` and `maxBenefit` into one benefit summary (per SchemeRow). */
function formatBenefit(amount: string, maxBenefit: string): string {
  return `${amount} · up to ${maxBenefit}`;
}

export function CsrAlignedPrograms() {
  const fieldId = useId();
  const typeSelectId = `${fieldId}-type`;

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const visibleSchemes = useMemo(
    () =>
      CSR_ALIGNED_SCHEMES.filter(
        (scheme) => typeFilter === "all" || scheme.type === typeFilter,
      ),
    [typeFilter],
  );

  return (
    <section
      id="csr-aligned-programs"
      aria-labelledby="csr-aligned-programs-heading"
      className="scroll-mt-24 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            CSR-aligned programs
          </span>
          <h2
            id="csr-aligned-programs-heading"
            className="font-heading text-h2 text-dark"
          >
            Programs Aligned with CSR Priorities
          </h2>
          <p className="text-body text-muted">
            Real Karnataka Startup Policy programs whose grassroots, inclusion,
            and innovation mandates align naturally with corporate CSR funding.
            Each program is a live scheme corporates can co-fund today. Filter by
            type to narrow the list.
          </p>
        </div>

        {/* Client-side filter controls (no URL / no storage) */}
        <div className="mt-8 flex flex-col gap-2">
          <label
            htmlFor={typeSelectId}
            className="text-caption font-medium text-foreground"
          >
            Scheme type
          </label>
          <select
            id={typeSelectId}
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as TypeFilter)
            }
            className="h-10 w-full max-w-xs rounded-md border border-border bg-card px-3 text-body text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {TYPE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* CSR-aligned schemes table (SchemeRow cell pattern) */}
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {visibleSchemes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-dark">Program</TableHead>
                  <TableHead className="text-dark">Benefit</TableHead>
                  <TableHead className="text-dark">Duration</TableHead>
                  <TableHead className="text-dark">Eligibility</TableHead>
                  <TableHead className="text-right text-dark">
                    <span className="sr-only">Details</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleSchemes.map((scheme) => (
                  <TableRow key={scheme.id} className="hover:bg-surface">
                    <TableCell className="align-top">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-heading font-semibold text-dark">
                          {scheme.name}
                        </span>
                        {hasSchemeBadge(scheme.id, "CSR-Aligned") ? (
                          <Badge variant="accent" className="w-fit">
                            <HandHeart
                              aria-hidden="true"
                              className="mr-1 h-3 w-3"
                            />
                            CSR-Aligned
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
                ))}
              </TableBody>
            </Table>
          ) : (
            <p
              role="status"
              className="px-6 py-12 text-center text-body text-muted"
            >
              No CSR-aligned programs match the current filter. Try selecting
              &ldquo;All scheme types&rdquo; to see every CSR-aligned program.
            </p>
          )}
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

export default CsrAlignedPrograms;
