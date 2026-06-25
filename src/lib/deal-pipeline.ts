// src/lib/deal-pipeline.ts
//
// PURE helpers for the Investor Deal Pipeline (Req 27.2, 30.1, 31.2).
//
// ===========================================================================
// Purity / determinism contract
// ---------------------------------------------------------------------------
//  - Every exported function is pure: same input -> same output, no mutation
//    of arguments, no I/O, no access to browser storage or network.
//  - No use of `Math.random`, `Date`, `Date.now`, `performance.now`, locale, or
//    any other ambient/time-dependent input. Any synthetic component (e.g.
//    `avgDaysInStage`, `velocityThisWeek`) is derived deterministically from the
//    input via the shared hash-seeded PRNG (`synthetic-prng`).
// ===========================================================================

import type { TrackedDeal, DealStage, StageAnalytics } from '@/types';
import { DEAL_STAGE_ORDER } from '@/types';
import { seededRng, seededInt } from './synthetic-prng';

// ---------------------------------------------------------------------------
// Filtering (Req 27.2)
// ---------------------------------------------------------------------------

export interface DealFilters {
  /** Exact sector id, or undefined = any sector. */
  sector?: string;
  /** Inclusive index range over the canonical 6-stage `DEAL_STAGE_ORDER`. */
  stageRange?: { fromIndex: number; toIndex: number };
  /** Inclusive ask amount range, in lakhs. */
  askRange?: { minLakhs: number; maxLakhs: number };
  /**
   * ISO date range. NOTE: `TrackedDeal` carries no date field, so there is no
   * deal attribute to compare against. To avoid inventing data, this criterion
   * is a documented NO-OP / match-all: specifying `dateRange` never removes any
   * deal. The control is still surfaced in the UI for forward compatibility,
   * but it does not narrow results today.
   */
  dateRange?: { fromIso: string; toIso: string };
  /** Case-insensitive `companyName` substring. */
  query?: string;
}

/**
 * Filter `deals` by every ACTIVE criterion (AND semantics). A criterion is
 * active only when its field is present (not `undefined`).
 *
 * Soundness (Property 18): every returned deal satisfies every active
 * criterion, and the result is always a subset of the input — the same object
 * references are returned, never fabricated or duplicated deals.
 */
export function filterDeals(deals: TrackedDeal[], filters: DealFilters): TrackedDeal[] {
  return deals.filter((deal) => {
    // Sector: exact id match.
    if (filters.sector !== undefined && deal.sector !== filters.sector) {
      return false;
    }

    // Stage range: index of the deal's currentStage must fall within the
    // inclusive [from, to] index window. Indices are normalised so a reversed
    // range behaves like its ascending equivalent.
    if (filters.stageRange !== undefined) {
      const index = DEAL_STAGE_ORDER.indexOf(deal.currentStage);
      const lo = Math.min(filters.stageRange.fromIndex, filters.stageRange.toIndex);
      const hi = Math.max(filters.stageRange.fromIndex, filters.stageRange.toIndex);
      if (index < lo || index > hi) {
        return false;
      }
    }

    // Ask range: inclusive [min, max] over askLakhs.
    if (filters.askRange !== undefined) {
      if (deal.askLakhs < filters.askRange.minLakhs || deal.askLakhs > filters.askRange.maxLakhs) {
        return false;
      }
    }

    // dateRange: documented match-all no-op (see DealFilters.dateRange).

    // Query: case-insensitive companyName substring (empty query matches all).
    if (filters.query !== undefined) {
      const needle = filters.query.toLowerCase();
      if (!deal.companyName.toLowerCase().includes(needle)) {
        return false;
      }
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Grouping / ordering for kanban rendering (Property 21)
// ---------------------------------------------------------------------------

/**
 * The deals shown in a single kanban column: exactly the deals whose
 * `currentStage` equals `stage`, ordered by `orderInStage` non-decreasing.
 *
 * Returns a NEW array (the input is never mutated). This is the pure helper the
 * board uses to render each column, so the within-stage ordering and stage
 * membership invariants (Property 21) are testable without a DOM.
 */
export function dealsForStage(deals: TrackedDeal[], stage: DealStage): TrackedDeal[] {
  return deals
    .filter((deal) => deal.currentStage === stage)
    .sort((a, b) => a.orderInStage - b.orderInStage);
}

// ---------------------------------------------------------------------------
// CSV export (Req 31.2)
// ---------------------------------------------------------------------------

const CSV_HEADER = [
  'id',
  'companyName',
  'sector',
  'stage',
  'askLakhs',
  'currentStage',
  'orderInStage',
  'notes',
] as const;

/**
 * Escape a single CSV field:
 *  - embedded newlines (CR / LF / CRLF) are collapsed to a single space so a
 *    deal can never span more than one CSV line (this keeps the line-count
 *    invariant exact);
 *  - fields containing a comma or a double-quote are wrapped in double quotes
 *    with internal quotes doubled, per RFC 4180.
 */
function escapeCsvField(value: string): string {
  const singleLine = value.replace(/\r\n|\r|\n/g, ' ');
  if (/[",]/.test(singleLine)) {
    return `"${singleLine.replace(/"/g, '""')}"`;
  }
  return singleLine;
}

/**
 * Serialise `deals` to CSV text: one header row plus one row per deal.
 *
 * Property 19: the line count (rows joined by `\n`) is exactly
 * `deals.length + 1`. Deterministic and side-effect free — no I/O.
 */
export function dealsToCsv(deals: TrackedDeal[]): string {
  const headerRow = CSV_HEADER.join(',');
  const rows = deals.map((deal) =>
    [
      escapeCsvField(deal.id),
      escapeCsvField(deal.companyName),
      escapeCsvField(deal.sector),
      escapeCsvField(deal.stage),
      escapeCsvField(String(deal.askLakhs)),
      escapeCsvField(deal.currentStage),
      escapeCsvField(String(deal.orderInStage)),
      escapeCsvField(deal.notes ?? ''),
    ].join(','),
  );
  return [headerRow, ...rows].join('\n');
}

// ---------------------------------------------------------------------------
// Stage analytics (Req 30.1)
// ---------------------------------------------------------------------------

/**
 * Compute per-stage analytics for the pipeline.
 *
 * Bounds always hold (Property 20):
 *  - `perStage` counts cover all six stages and sum to `deals.length`;
 *  - every `conversion.rate` is within the inclusive range [0, 1]
 *    (divide-by-zero is guarded to 0, and ratios are clamped to 1);
 *  - `velocityThisWeek` is >= 0.
 *
 * The synthetic `avgDaysInStage` and `velocityThisWeek` figures are hash-seeded
 * from the input (no `Math.random`/clock), so they are deterministic.
 */
export function computeStageAnalytics(deals: TrackedDeal[]): StageAnalytics {
  // Count deals per stage. Every stage in DEAL_STAGE_ORDER is initialised to 0,
  // and every deal's currentStage is one of those six stages (by type), so the
  // counts always sum to deals.length.
  const countByStage = new Map<DealStage, number>();
  for (const stage of DEAL_STAGE_ORDER) {
    countByStage.set(stage, 0);
  }
  for (const deal of deals) {
    countByStage.set(deal.currentStage, (countByStage.get(deal.currentStage) ?? 0) + 1);
  }

  const perStage = DEAL_STAGE_ORDER.map((stage) => {
    const count = countByStage.get(stage) ?? 0;
    // Synthetic average days in stage, deterministic per (stage, count).
    const avgDaysInStage =
      count === 0 ? 0 : seededInt(seededRng(`avg-days::${stage}::${count}`), 3, 90);
    return { stage, count, avgDaysInStage };
  });

  // Conversion ratios between consecutive stages. Guard divide-by-zero (-> 0)
  // and clamp the ratio into [0, 1] so the bound holds even when a downstream
  // stage holds more deals than its predecessor.
  const conversion: StageAnalytics['conversion'] = [];
  for (let i = 0; i < DEAL_STAGE_ORDER.length - 1; i++) {
    const fromStage = DEAL_STAGE_ORDER[i] as DealStage;
    const toStage = DEAL_STAGE_ORDER[i + 1] as DealStage;
    const fromCount = countByStage.get(fromStage) ?? 0;
    const toCount = countByStage.get(toStage) ?? 0;
    const raw = fromCount === 0 ? 0 : toCount / fromCount;
    const rate = Math.max(0, Math.min(1, raw));
    conversion.push({ fromStage, toStage, rate });
  }

  // Synthetic weekly velocity, deterministic and always >= 0.
  const velocityThisWeek = seededInt(
    seededRng(`velocity::${deals.length}`),
    0,
    Math.max(0, deals.length),
  );

  return { perStage, conversion, velocityThisWeek };
}
