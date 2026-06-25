// src/lib/synthetic-csr-impact.ts
//
// ===========================================================================
// Determinism contract (Req 21.1, 21.2, 5.5, 5.6, 5.7)
// ---------------------------------------------------------------------------
//  - Every export is PURE and hash-seeded SOLELY from stable string keys
//    (`csr-impact` as the base; `csr-impact|${i}` per metric). The same keys
//    always yield byte-identical output, in every process, on every reload —
//    `generateCsrImpactMetrics()` returns a deep-equal `CsrImpactMetric[]` on
//    every call.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    locale, environment, or any other ambient/time-dependent input.
//  - All randomness flows through `synthetic-prng.ts` (seededRng/seededInt);
//    every helper respects its stated range. Each metric draws from ONE
//    `seededRng(key)` stream, so all values are stable and independent of call
//    order.
//  - Every figure is ILLUSTRATIVE synthetic data — no real CSR aggregate is
//    represented. The metrics are surfaced behind an IllustrativeBadge by their
//    consumer (CsrImpactMetrics on /csr).
// ===========================================================================

import type { CsrImpactMetric } from '@/types';
import { seededInt, seededRng } from '@/lib/synthetic-prng';

// --- Fixed seed key ---------------------------------------------------------

const CSR_IMPACT_SEED = 'csr-impact';

// --- Fixed metric specifications --------------------------------------------
//
// Exactly 3 illustrative headline metrics, in stable display order:
//   1. Total CSR capital deployed (crore)
//   2. Startups supported (count)
//   3. Beneficiaries reached (count)
// Each value is drawn deterministically from its own per-metric seeded stream
// (`csr-impact|${index}`) within an illustrative range.

interface CsrImpactSpec {
  id: string;
  label: string;
  unit: CsrImpactMetric['unit'];
  min: number;
  max: number;
}

const CSR_IMPACT_SPECS: readonly CsrImpactSpec[] = [
  { id: 'total-csr-capital', label: 'Total CSR Capital Deployed', unit: 'crore', min: 180, max: 360 },
  { id: 'startups-supported', label: 'Startups Supported', unit: 'startups', min: 120, max: 280 },
  { id: 'beneficiaries-reached', label: 'Beneficiaries Reached', unit: 'beneficiaries', min: 45000, max: 120000 },
];

/**
 * Generate EXACTLY 3 illustrative CSR impact metrics, seeded by `csr-impact`.
 *
 * Pure and deterministic: every figure flows through the seeded PRNG keyed by
 * `csr-impact|${index}`; no `Math.random`/`Date`/ambient input is consulted.
 * The returned array is byte-stable (deep-equal) across every call.
 */
export function generateCsrImpactMetrics(): CsrImpactMetric[] {
  return CSR_IMPACT_SPECS.map((spec, i) => {
    const rng = seededRng(`${CSR_IMPACT_SEED}|${i}`);
    return {
      id: spec.id,
      label: spec.label,
      value: seededInt(rng, spec.min, spec.max),
      unit: spec.unit,
    };
  });
}
