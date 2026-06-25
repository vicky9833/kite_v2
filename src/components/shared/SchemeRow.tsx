import Link from "next/link";

import { TableCell, TableRow } from "@/components/ui/table";
import type { Scheme } from "@/types";

/**
 * SchemeRow — a single presentational row in the home "Schemes & Benefits at a
 * Glance" preview table. Renders one {@link Scheme} across four content columns
 * (name, benefit summary, duration, eligibility) plus a trailing "Learn more"
 * link to the scheme's anchor on the full `/schemes` page.
 *
 * Pure presentational Server Component (no `"use client"`, no state). The
 * benefit summary combines `amount` + `maxBenefit` as "{amount} · up to
 * {maxBenefit}", and the eligibility list is comma-joined for table density.
 */
export interface SchemeRowProps {
  scheme: Scheme;
}

/** Comma-join an eligibility list into a single dense sentence fragment. */
function formatEligibility(eligibility: string[]): string {
  return eligibility.join(", ");
}

/** Combine `amount` and `maxBenefit` into one benefit summary string. */
function formatBenefit(amount: string, maxBenefit: string): string {
  return `${amount} · up to ${maxBenefit}`;
}

export function SchemeRow({ scheme }: SchemeRowProps) {
  return (
    <TableRow className="hover:bg-surface">
      <TableCell className="align-top">
        <span className="font-heading font-semibold text-dark">
          {scheme.name}
        </span>
      </TableCell>
      <TableCell className="align-top text-body text-foreground">
        {formatBenefit(scheme.amount, scheme.maxBenefit)}
      </TableCell>
      <TableCell className="align-top text-body text-muted">
        {scheme.duration}
      </TableCell>
      <TableCell className="align-top text-caption text-muted">
        {formatEligibility(scheme.eligibility)}
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
}

export default SchemeRow;
