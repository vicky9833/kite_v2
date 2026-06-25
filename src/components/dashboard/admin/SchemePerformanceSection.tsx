"use client";

// src/components/dashboard/admin/SchemePerformanceSection.tsx
//
// "Scheme Performance" (Req 14). A client component (holds sort state) that
// renders the 22 canonical schemes with illustrative application / approval /
// disbursement figures. At `md`+ it renders a semantic `<table>` with sortable
// column headers; below `md` it renders the same data as stacked cards.
//
// Sorting is delegated to the pure `sortSchemeRows` helper (task 13.1) so the
// ordering is property-testable (Property 5). The page composition (task 15.1)
// wraps this section in `LazySection`.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { getSchemePerformance } from "@/lib/synthetic-admin-data";
import { sortSchemeRows } from "@/lib/scheme-sort";
import { cn, formatNumber, formatStatValue } from "@/lib/utils";
import type {
  SchemePerformanceRow,
  SchemeSortKey,
  SortDirection,
} from "@/types";

/** Column descriptor: header label, the sort key, and value alignment. */
interface ColumnDef {
  key: SchemeSortKey;
  label: string;
  numeric: boolean;
}

/** Sortable columns, in display order (Req 14.1). */
const COLUMNS: readonly ColumnDef[] = [
  { key: "name", label: "Scheme Name", numeric: false },
  { key: "type", label: "Type", numeric: false },
  { key: "applications", label: "Applications", numeric: true },
  { key: "approved", label: "Approved", numeric: true },
  { key: "disbursed", label: "Disbursed", numeric: true },
  { key: "status", label: "Status", numeric: false },
];

/** Render a single cell value for the given column key. */
function formatCell(row: SchemePerformanceRow, key: SchemeSortKey): string {
  switch (key) {
    case "applications":
      return formatNumber(row.applications);
    case "approved":
      return formatNumber(row.approved);
    case "disbursed":
      return formatStatValue(row.disbursed, { prefix: "₹" });
    default:
      return String(row[key]);
  }
}

/** Map the active sort direction to the ARIA `aria-sort` token (Req 14.8). */
function ariaSortFor(
  column: ColumnDef,
  activeKey: SchemeSortKey,
  direction: SortDirection,
): "ascending" | "descending" | "none" {
  if (column.key !== activeKey) {
    return "none";
  }
  return direction === "asc" ? "ascending" : "descending";
}

/**
 * SchemePerformanceSection — sortable scheme-performance table (Req 14).
 *
 * Holds the sort state (default `disbursed` desc — Req 14.6). Clicking a header
 * toggles asc/desc on the active column or switches to a newly chosen column
 * (Req 14.7); the active `<th>` carries `aria-sort` while the rest report
 * `"none"` (Req 14.8, 28.3). Header controls are real `<button>`s inside
 * `<th scope="col">` for keyboard operability. Application / approval /
 * disbursement figures are illustrative (caption near the heading).
 */
export function SchemePerformanceSection() {
  const rows = useMemo(() => getSchemePerformance(), []);
  const [sortKey, setSortKey] = useState<SchemeSortKey>("disbursed");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const sortedRows = useMemo(
    () => sortSchemeRows(rows, sortKey, direction),
    [rows, sortKey, direction],
  );

  function handleSort(key: SchemeSortKey) {
    if (key === sortKey) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Numeric columns default to descending (largest first); string columns
      // default to ascending (A→Z).
      const column = COLUMNS.find((c) => c.key === key);
      setDirection(column?.numeric ? "desc" : "asc");
    }
  }

  return (
    <section
      aria-labelledby="scheme-performance-heading"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <SectionHeading
          id="scheme-performance-heading"
          title="Scheme Performance"
        />
        <p className="text-caption text-muted">
          Applications, Approved, and Disbursed figures are illustrative for
          preview purposes only.
        </p>
      </div>

      {/* Desktop / tablet: semantic table (md+). */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm md:block">
        <table className="w-full border-collapse text-left text-body">
          <caption className="sr-only">
            Scheme performance: applications, approvals, and disbursement for the
            22 Karnataka schemes. Application, approval, and disbursement figures
            are illustrative.
          </caption>
          <thead>
            <tr className="border-b border-border">
              {COLUMNS.map((column) => {
                const sortState = ariaSortFor(column, sortKey, direction);
                const isActive = column.key === sortKey;
                const Icon = !isActive
                  ? ArrowUpDown
                  : direction === "asc"
                    ? ArrowUp
                    : ArrowDown;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={sortState}
                    className={cn(
                      "px-4 py-3 font-heading text-caption font-semibold uppercase tracking-wide text-muted",
                      column.numeric ? "text-right" : "text-left",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className={cn(
                        "inline-flex min-h-9 items-center gap-1.5 rounded-md px-1 text-inherit",
                        "hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        column.numeric ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <span>{column.label}</span>
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5",
                          isActive ? "text-primary" : "text-muted/60",
                        )}
                        aria-hidden
                      />
                    </button>
                  </th>
                );
              })}
              <th
                scope="col"
                className="px-4 py-3 text-right font-heading text-caption font-semibold uppercase tracking-wide text-muted"
              >
                View Details
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr
                key={row.schemeId}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 font-medium text-dark">{row.name}</td>
                <td className="px-4 py-3 capitalize text-muted">{row.type}</td>
                <td className="px-4 py-3 text-right tabular-nums text-dark">
                  {formatCell(row, "applications")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-dark">
                  {formatCell(row, "approved")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-dark">
                  {formatCell(row, "disbursed")}
                </td>
                <td className="px-4 py-3 capitalize text-muted">
                  {row.status}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/schemes/${row.schemeId}`}
                    aria-label={`View details: ${row.name}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-lg",
                    )}
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards (below md). */}
      <ul className="flex flex-col gap-4 md:hidden" data-testid="scheme-cards">
        {sortedRows.map((row) => (
          <li
            key={row.schemeId}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading text-lg font-bold text-dark">
                {row.name}
              </h3>
              <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-xs font-medium capitalize text-muted">
                {row.status}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-body">
              <div className="flex flex-col">
                <dt className="text-caption text-muted">Type</dt>
                <dd className="capitalize text-dark">{row.type}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-caption text-muted">Applications</dt>
                <dd className="tabular-nums text-dark">
                  {formatCell(row, "applications")}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-caption text-muted">Approved</dt>
                <dd className="tabular-nums text-dark">
                  {formatCell(row, "approved")}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-caption text-muted">Disbursed</dt>
                <dd className="tabular-nums text-dark">
                  {formatCell(row, "disbursed")}
                </dd>
              </div>
            </dl>

            <Link
              href={`/schemes/${row.schemeId}`}
              aria-label={`View details: ${row.name}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-fit rounded-lg",
              )}
            >
              View Details
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SchemePerformanceSection;
