// src/lib/scheme-sort.ts
//
// Pure, property-testable sorting for the admin scheme-performance table
// (Req 14.6, 14.7). The component delegates all ordering to `sortSchemeRows`
// so the behaviour can be verified independently of React (Property 5).
//
// Determinism contract: `sortSchemeRows` is a pure function — it returns a NEW
// array (never mutating its input) and depends only on its arguments.

import type {
  SchemePerformanceRow,
  SchemeSortKey,
  SortDirection,
} from "@/types";

/**
 * Sort scheme-performance rows by the chosen key and direction.
 *
 * Numeric keys (`applications`, `approved`, `disbursed`) are compared
 * numerically; string keys (`name`, `type`, `status`) use `localeCompare`. The
 * direction sign flips the comparison for descending order. Returns a new array
 * — the input is never mutated.
 */
export function sortSchemeRows(
  rows: readonly SchemePerformanceRow[],
  key: SchemeSortKey,
  direction: SortDirection,
): SchemePerformanceRow[] {
  const sign = direction === "asc" ? 1 : -1;
  return rows.slice().sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * sign;
    }
    return String(av).localeCompare(String(bv)) * sign;
  });
}
