// ===========================================================================
// KITE Ecosystem Enablement (Prompt 5) — pure incubator filter module.
//
// Pure functions only: no I/O, no network, no storage, no Math.random, no Date,
// no ambient input. Every export depends solely on its arguments and never
// mutates them. The verified Incubator records are treated as canonical and are
// never altered or reordered (Req 11.1).
//
// Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 2.9, 2.10
// ===========================================================================

import type { Incubator, IncubatorFilters, IncubatorType } from '@/types';

/** The inactive ("any") filter state: every dimension is null. */
export const EMPTY_INCUBATOR_FILTERS: IncubatorFilters = {
  cluster: null,
  focus: null,
  type: null,
};

/**
 * Distinct `cluster` values in source order, deduped, omitting none (Req 2.1).
 * The first occurrence of each value fixes its position; later duplicates are
 * dropped. Case-sensitive string identity.
 */
export function deriveClusterOptions(data: readonly Incubator[]): string[] {
  const seen = new Set<string>();
  const options: string[] = [];
  for (const incubator of data) {
    if (!seen.has(incubator.cluster)) {
      seen.add(incubator.cluster);
      options.push(incubator.cluster);
    }
  }
  return options;
}

/**
 * Distinct values across all `focus[]` arrays, in source order, deduped,
 * omitting none (Req 2.2). Records are visited in order, and within each record
 * the focus tags are visited in stored order. Case-sensitive string identity.
 */
export function deriveFocusOptions(data: readonly Incubator[]): string[] {
  const seen = new Set<string>();
  const options: string[] = [];
  for (const incubator of data) {
    for (const focus of incubator.focus) {
      if (!seen.has(focus)) {
        seen.add(focus);
        options.push(focus);
      }
    }
  }
  return options;
}

/**
 * Sound, subset-preserving AND filter (Req 2.4–2.7, 2.9).
 *
 * A `null` field is inactive ("any") and matches every record. Active fields
 * are combined with logical AND: cluster equality, focus membership, and type
 * equality. All comparisons are case-sensitive string equality. The result is
 * always a subset of `data` in the original order — records are never
 * fabricated, duplicated, mutated, or reordered.
 */
export function filterIncubators(
  data: readonly Incubator[],
  filters: IncubatorFilters,
): Incubator[] {
  return data.filter(
    (incubator) =>
      (filters.cluster === null || incubator.cluster === filters.cluster) &&
      (filters.focus === null || incubator.focus.includes(filters.focus)) &&
      (filters.type === null || incubator.type === filters.type),
  );
}

/**
 * One human-readable line per active filter, naming its dimension and selected
 * value (Req 2.10). Inactive (null) dimensions are omitted. Order is fixed:
 * cluster, focus, type.
 */
export function describeActiveFilters(filters: IncubatorFilters): string[] {
  const lines: string[] = [];
  if (filters.cluster !== null) {
    lines.push(`Cluster: ${filters.cluster}`);
  }
  if (filters.focus !== null) {
    lines.push(`Focus: ${filters.focus}`);
  }
  if (filters.type !== null) {
    const type: IncubatorType = filters.type;
    lines.push(`Type: ${type}`);
  }
  return lines;
}
