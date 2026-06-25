// Startup dashboard selectors (pure).
//
// Pure, JSX-free helpers for the startup dashboard: choosing the top eligible
// schemes to surface (Req 4.2, 4.3) and computing days since registration
// (Req 2.4). No I/O, no module-level `Date` — `daysSince` takes `now`
// explicitly so callers stay deterministic and testable.

import type { EligibilityResult } from "@/types";

/** Eligibility statuses considered "eligible" for display (Req 4.2). */
const ELIGIBLE_STATUSES = new Set(["definitely-eligible", "likely-eligible"]);

/**
 * Select the top eligible schemes to surface on the dashboard.
 *
 * Keeps only `definitely-eligible` / `likely-eligible` results (Req 4.2),
 * sorts by `estimatedBenefit` descending (Req 4.3), and returns at most
 * `limit` (default 6). Returns a new array; the input map is not mutated.
 */
export function selectTopEligibleSchemes(
  results: Record<string, EligibilityResult>,
  limit = 6,
): EligibilityResult[] {
  return Object.values(results)
    .filter((r) => ELIGIBLE_STATUSES.has(r.status))
    .sort((a, b) => b.estimatedBenefit - a.estimatedBenefit)
    .slice(0, limit);
}

/** Milliseconds in one day. */
const MS_PER_DAY = 86_400_000;

/**
 * Whole days elapsed between an ISO timestamp and `now`.
 *
 * `daysSince(iso, now) = floor((now - Date.parse(iso)) / 86_400_000)`. For any
 * `registeredAt <= now` this is a non-negative integer (Req 2.4).
 */
export function daysSince(iso: string, now: Date): number {
  return Math.floor((now.getTime() - Date.parse(iso)) / MS_PER_DAY);
}
