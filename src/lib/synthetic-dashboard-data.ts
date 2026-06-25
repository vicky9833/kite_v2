// src/lib/synthetic-dashboard-data.ts
//
// Per-sector synthetic data for the KITE startup dashboard.
//
// ===========================================================================
// Determinism contract (Req 24.1, 24.3, 24.4, 24.5, 24.7, 24.8)
// ---------------------------------------------------------------------------
//  - Every export is PURE and hash-seeded solely from its arguments
//    (`sectorId`, and for the rank label also `stage`).
//  - The same `sectorId` always yields a deep-equal `SectorDashboardData`, on
//    every call, in every process, on every reload. `getEcosystemRankLabel`
//    is likewise stable for a given `(sectorId, stage)` pair.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, time, locale, or any
//    other ambient input. Month labels are FIXED strings ("Jan".."Dec"), never
//    derived from the real calendar, so output is time-independent.
//  - Cardinalities are canonical and authoritative:
//      * 12 `monthlyFunding` points (one per fixed month label),
//      * 7  `clusterStartups` bars (the 6 Beyond Bengaluru clusters from
//        `clusters.ts` + "Bengaluru"),
//      * 5  `topSchemes` rows drawn from canonical scheme names, ordered
//        strictly non-increasing by `rupees`.
//  - All synthetic figures are illustrative; the UI labels them as such.
// ===========================================================================

import type {
  ClusterCountDatum,
  CurrentStage,
  FundingPoint,
  SchemeDisbursementDatum,
  SectorDashboardData,
} from '@/types';
import { clusters } from '@/data/clusters';
import { schemes } from '@/data/schemes';
import { seededInt, seededRng, seededShuffle } from '@/lib/synthetic-prng';

/**
 * Fixed month labels for the 12 `monthlyFunding` points. These are static
 * strings — intentionally NOT derived from the real date — so the synthetic
 * preview is time-independent and byte-stable across reloads.
 */
const MONTH_LABELS: readonly string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** The 7 cluster bars: the 6 canonical Beyond Bengaluru clusters + Bengaluru. */
const CLUSTER_NAMES: readonly string[] = [
  ...clusters.map((c) => c.name),
  'Bengaluru',
];

/**
 * Build the 12 monthly funding points with fixed labels and a hash-seeded
 * `rupeesCrore` in a plausible band. Seeded per `sectorId` + month label, so
 * the series is deterministic and varies sensibly month to month.
 */
function buildMonthlyFunding(sectorId: string): FundingPoint[] {
  return MONTH_LABELS.map((month) => {
    const rng = seededRng(`${sectorId}|funding|${month}`);
    return {
      month,
      // Plausible illustrative band: tens to a few hundred crore.
      rupeesCrore: seededInt(rng, 18, 240),
    };
  });
}

/**
 * Build the 7 cluster startup-count bars. Each count is hash-seeded per
 * `sectorId` + cluster name. Bengaluru is seeded in a higher band to reflect
 * its dominant ecosystem share while remaining illustrative.
 */
function buildClusterStartups(sectorId: string): ClusterCountDatum[] {
  return CLUSTER_NAMES.map((cluster) => {
    const rng = seededRng(`${sectorId}|cluster|${cluster}`);
    const isHub = cluster === 'Bengaluru';
    return {
      cluster,
      count: isHub ? seededInt(rng, 220, 480) : seededInt(rng, 12, 140),
    };
  });
}

/**
 * Build the 5 top schemes by disbursement. Deterministically selects 5 schemes
 * from the canonical `schemes` array (via a seeded shuffle), assigns a seeded
 * `rupees` figure to each, then sorts strictly non-increasing by `rupees`.
 * Ties are broken by `schemeId` so the ordering is fully deterministic.
 */
function buildTopSchemes(sectorId: string): SchemeDisbursementDatum[] {
  const pickRng = seededRng(`${sectorId}|topSchemes|pick`);
  const selected = seededShuffle(pickRng, schemes).slice(0, 5);

  const rows: SchemeDisbursementDatum[] = selected.map((scheme) => {
    const rng = seededRng(`${sectorId}|scheme|${scheme.id}`);
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      // Illustrative disbursement band, in rupees.
      rupees: seededInt(rng, 5_000_000, 250_000_000),
    };
  });

  return rows.sort((a, b) =>
    b.rupees !== a.rupees ? b.rupees - a.rupees : a.schemeId.localeCompare(b.schemeId),
  );
}

/**
 * Per-sector synthetic dashboard bundle. Pure and hash-seeded from `sectorId`;
 * repeated calls with the same id return deep-equal results. See the module's
 * determinism contract for the full guarantees.
 */
export function getSectorDashboardData(sectorId: string): SectorDashboardData {
  return {
    sectorId,
    monthlyFunding: buildMonthlyFunding(sectorId),
    clusterStartups: buildClusterStartups(sectorId),
    topSchemes: buildTopSchemes(sectorId),
  };
}

/**
 * Synthetic ecosystem-rank label, e.g. "Top 35%". Hash-seeded from
 * `${sectorId}|${stage}` so it is deterministic for a given sector/stage pair.
 * The value is illustrative and surfaced with an illustrative label in the UI.
 */
export function getEcosystemRankLabel(sectorId: string, stage: CurrentStage): string {
  const rng = seededRng(`${sectorId}|${stage}`);
  const percentile = seededInt(rng, 5, 60);
  return `Top ${percentile}%`;
}
