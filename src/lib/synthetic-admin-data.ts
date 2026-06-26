// src/lib/synthetic-admin-data.ts
//
// Aggregate synthetic data for the KITE government admin dashboard.
//
// ===========================================================================
// Determinism contract (Req 24.2, 24.3, 24.4, 24.6, 24.7, 24.8)
// ---------------------------------------------------------------------------
//  - Every export is PURE and hash-seeded from FIXED module-level keys (and,
//    where a row maps to a canonical entity, that entity's id). Output depends
//    only on those keys plus the canonical data arrays.
//  - Repeated calls to any generator return deep-equal results, on every call,
//    in every process, on every reload — the admin preview is byte-stable.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    time, locale, or any other ambient input. All labels (quarters, months,
//    relative timestamps) are FIXED strings, never derived from the real clock.
//  - Cardinalities are canonical and authoritative — never fabricated:
//      * `getSchemePerformance`       → 22 rows  (one per canonical scheme)
//      * `getFundingTimeline`         → 8 quarters
//      * `getRegionalStartupCounts`   → 7 bars   (6 Beyond Bengaluru + Bengaluru)
//      * `getRegionalDisbursement`    → 7 bars   (6 Beyond Bengaluru + Bengaluru)
//      * `getSectorTreemap`           → 20 nodes (one per canonical sector)
//      * `getSectorGrowth`            → top 10 by growthPct
//      * `getProgramPerformance`      → 6 rows   (one per canonical flagship program)
//      * `getInternationalPartnerships` groups the 32 canonical GIA countries by
//        region; the country counts always sum to 32
//      * `getActivityFeed`            → length seeded into [15, 20]
//  - Key derived invariants: `approved = floor(applications * ratio)` so
//    `approved ≤ applications`; `fundingIntensity ∈ [0, 1]`;
//    `completionPct ∈ [0, 100]`.
//  - The `ADMIN_KPIS` values track the verified figures (21,847 registered
//    startups — just above the verified 21,000+ DPIIT figure as of the current
//    quarter; ₹312 crore; 22; 1,847; ₹19 lakh; 183) — constants, not random.
//    The UI still surfaces them with an illustrative label.
//  - All synthetic figures are illustrative; the UI labels them as such.
// ===========================================================================

import type {
  ActivityEntry,
  ClusterCountDatum,
  DemographicsData,
  FundingTimelinePoint,
  GIARegion,
  KpiCard,
  ProgramPerformance,
  RegionPartnership,
  SchemePerformanceRow,
  SectorGrowthDatum,
  SectorTreemapDatum,
  StackedDisbursementDatum,
} from '@/types';
import { clusters } from '@/data/clusters';
import { flagshipPrograms } from '@/data/flagship-programs';
import { giaCountries } from '@/data/gia-countries';
import { schemes } from '@/data/schemes';
import { sectors } from '@/data/sectors';
import {
  seededFloat,
  seededInt,
  seededPick,
  seededRng,
} from '@/lib/synthetic-prng';

/* -------------------------------------------------------------------------- */
/* Fixed KPI cards (Req 12) — canonical constants, not seeded                 */
/* -------------------------------------------------------------------------- */

/**
 * The six headline KPI cards mandated by Req 12. These are FIXED figures, not
 * random — but the UI still surfaces them with an illustrative label.
 */
export const ADMIN_KPIS: readonly KpiCard[] = [
  {
    id: 'total-registered-startups',
    label: 'Total Registered Startups',
    value: '21,847',
    trend: '+4.2% QoQ',
  },
  {
    id: 'total-benefits-disbursed',
    label: 'Total Benefits Disbursed',
    value: '₹312 crore',
  },
  {
    id: 'active-schemes',
    label: 'Active Schemes',
    value: '22',
    caption: 'All schemes operational',
  },
  {
    id: 'scheme-applications-last-month',
    label: 'Scheme Applications Last Month',
    value: '1,847',
  },
  {
    id: 'average-benefit-per-startup',
    label: 'Average Benefit Per Startup',
    value: '₹19 lakh',
  },
  {
    id: 'soonicorns-tracked',
    label: 'Soonicorns Tracked',
    value: '183',
    trend: '+6',
  },
];

/* -------------------------------------------------------------------------- */
/* Shared fixed labels                                                        */
/* -------------------------------------------------------------------------- */

/** The 8 fiscal quarters of the funding timeline (fixed, time-independent). */
const TIMELINE_QUARTERS: readonly string[] = [
  'Q1 FY23',
  'Q2 FY23',
  'Q3 FY23',
  'Q4 FY23',
  'Q1 FY24',
  'Q2 FY24',
  'Q3 FY24',
  'Q4 FY24',
];

/** The 7 regional bars: the 6 canonical Beyond Bengaluru clusters + Bengaluru. */
const REGION_NAMES: readonly string[] = [
  ...clusters.map((c) => c.name),
  'Bengaluru',
];

/* -------------------------------------------------------------------------- */
/* Funding timeline (8 quarters)                                              */
/* -------------------------------------------------------------------------- */

/**
 * Eight quarters of total ecosystem funding. Seeded per fixed quarter label so
 * the series is deterministic and varies sensibly quarter to quarter.
 */
export function getFundingTimeline(): FundingTimelinePoint[] {
  return TIMELINE_QUARTERS.map((quarter) => {
    const rng = seededRng(`admin|timeline|${quarter}`);
    return {
      quarter,
      // Plausible illustrative band, in crore.
      rupeesCrore: seededInt(rng, 120, 560),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Scheme performance (22 rows, one per canonical scheme)                     */
/* -------------------------------------------------------------------------- */

/**
 * One performance row per canonical scheme (exactly 22). `type` and `status`
 * come straight from canonical data. `applications` is seeded `≥ 0`; `approved`
 * is derived as `floor(applications * ratio)` with `ratio ∈ [0.30, 0.85)`, so
 * `approved ≤ applications` always holds. `disbursed` is seeded `≥ 0`.
 */
export function getSchemePerformance(): SchemePerformanceRow[] {
  return schemes.map((scheme) => {
    const rng = seededRng(`admin|scheme|${scheme.id}`);
    const applications = seededInt(rng, 40, 2_400);
    const ratio = seededFloat(rng, 0.3, 0.85);
    const approved = Math.floor(applications * ratio);
    const disbursed = seededInt(rng, 0, 480_000_000);
    return {
      schemeId: scheme.id,
      name: scheme.name,
      type: scheme.type,
      applications,
      approved,
      disbursed,
      status: scheme.status,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Regional distribution (7 bars each)                                        */
/* -------------------------------------------------------------------------- */

/**
 * Startup counts across the 7 regional bars. Bengaluru is seeded in a higher
 * band to reflect its dominant ecosystem share while remaining illustrative.
 */
export function getRegionalStartupCounts(): ClusterCountDatum[] {
  return REGION_NAMES.map((cluster) => {
    const rng = seededRng(`admin|regionCount|${cluster}`);
    const isHub = cluster === 'Bengaluru';
    return {
      cluster,
      count: isHub ? seededInt(rng, 4_200, 9_800) : seededInt(rng, 120, 1_400),
    };
  });
}

/**
 * Disbursement split into fiscal vs grant series across the 7 regional bars.
 * Both series are seeded `≥ 0`; Bengaluru is seeded in a higher band.
 */
export function getRegionalDisbursement(): StackedDisbursementDatum[] {
  return REGION_NAMES.map((cluster) => {
    const rng = seededRng(`admin|regionDisbursement|${cluster}`);
    const isHub = cluster === 'Bengaluru';
    return {
      cluster,
      fiscal: isHub ? seededInt(rng, 40, 180) : seededInt(rng, 4, 60),
      grant: isHub ? seededInt(rng, 30, 150) : seededInt(rng, 3, 48),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Sector analysis (treemap of 20, growth top 10)                             */
/* -------------------------------------------------------------------------- */

/**
 * One treemap node per canonical sector (exactly 20). `startupCount` is seeded
 * `≥ 0`; `fundingIntensity` is seeded into `[0, 1)` (within `[0, 1]`).
 */
export function getSectorTreemap(): SectorTreemapDatum[] {
  return sectors.map((sector) => {
    const rng = seededRng(`admin|treemap|${sector.id}`);
    return {
      sectorId: sector.id,
      name: sector.name,
      startupCount: seededInt(rng, 5, 1_600),
      fundingIntensity: seededFloat(rng, 0, 1),
    };
  });
}

/**
 * Top 10 sectors by synthetic year-over-year growth. A seeded `growthPct` is
 * assigned to every canonical sector, then the list is sorted non-increasing by
 * `growthPct` (ties broken by `sectorId` for full determinism) and sliced to 10.
 */
export function getSectorGrowth(): SectorGrowthDatum[] {
  const all: SectorGrowthDatum[] = sectors.map((sector) => {
    const rng = seededRng(`admin|growth|${sector.id}`);
    return {
      sectorId: sector.id,
      name: sector.name,
      growthPct: seededInt(rng, -8, 64),
    };
  });

  return all
    .sort((a, b) =>
      b.growthPct !== a.growthPct
        ? b.growthPct - a.growthPct
        : a.sectorId.localeCompare(b.sectorId),
    )
    .slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Founder demographics                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Founder demographic breakdowns. The women-led split is the FIXED verified
 * figure (25% women-led vs 75% other). The stage and age distributions are
 * seeded but deterministic, and surfaced with an illustrative label.
 */
export function getDemographics(): DemographicsData {
  const stageRng = seededRng('admin|demographics|stage');
  const ageRng = seededRng('admin|demographics|age');

  return {
    // Verified figure (Req 17): 25% women-led.
    womenLed: [
      { label: 'Women-led', value: 25 },
      { label: 'Other', value: 75 },
    ],
    stage: [
      { label: 'Idea', value: seededInt(stageRng, 10, 30) },
      { label: 'PoC', value: seededInt(stageRng, 10, 28) },
      { label: 'Early Revenue', value: seededInt(stageRng, 12, 30) },
      { label: 'Growth', value: seededInt(stageRng, 8, 24) },
      { label: 'Scale', value: seededInt(stageRng, 4, 16) },
    ],
    age: [
      { label: '<25', value: seededInt(ageRng, 8, 22) },
      { label: '25–35', value: seededInt(ageRng, 30, 52) },
      { label: '35–45', value: seededInt(ageRng, 18, 36) },
      { label: '45+', value: seededInt(ageRng, 6, 18) },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Flagship program performance (6 rows)                                      */
/* -------------------------------------------------------------------------- */

/**
 * One performance row per canonical flagship program (exactly 6). `status`
 * comes from canonical data. `disbursed` and `enrolled` are seeded `≥ 0`;
 * `completionPct` is seeded into `[0, 100]`.
 */
export function getProgramPerformance(): ProgramPerformance[] {
  return flagshipPrograms.map((program) => {
    const rng = seededRng(`admin|program|${program.id}`);
    return {
      programId: program.id,
      name: program.name,
      disbursed: seededInt(rng, 0, 1_000),
      enrolled: seededInt(rng, 0, 1_400),
      completionPct: seededInt(rng, 0, 100),
      status: program.status,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* International partnerships (group 32 GIA countries by region)              */
/* -------------------------------------------------------------------------- */

/**
 * Group the 32 canonical GIA countries by `region`. `countryCount` is the REAL
 * count per region (so the counts always sum to 32); `jointPrograms` is a
 * seeded illustrative figure (`≥ 0`). Regions are emitted in descending order
 * of country count (ties broken by region name) for stable, readable output.
 */
export function getInternationalPartnerships(): RegionPartnership[] {
  const counts = new Map<GIARegion, number>();
  for (const country of giaCountries) {
    counts.set(country.region, (counts.get(country.region) ?? 0) + 1);
  }

  const rows: RegionPartnership[] = Array.from(counts.entries()).map(
    ([region, countryCount]) => {
      const rng = seededRng(`admin|partnership|${region}`);
      return {
        region,
        countryCount,
        jointPrograms: seededInt(rng, 1, 14),
      };
    },
  );

  return rows.sort((a, b) =>
    b.countryCount !== a.countryCount
      ? b.countryCount - a.countryCount
      : a.region.localeCompare(b.region),
  );
}

/* -------------------------------------------------------------------------- */
/* Activity feed (15–20 deterministic entries)                                */
/* -------------------------------------------------------------------------- */

/** Fixed relative timestamp labels (never derived from the real clock). */
const TIMESTAMP_LABELS: readonly string[] = [
  '2 hours ago',
  '5 hours ago',
  '8 hours ago',
  '14 hours ago',
  'Yesterday',
  '2 days ago',
  '3 days ago',
  'Last week',
];

/** Regional choices for registration entries (6 clusters + Bengaluru). */
const ACTIVITY_REGIONS: ReadonlyArray<{ name: string; href: string }> = [
  ...clusters.map((c) => ({ name: c.name, href: c.href })),
  { name: 'Bengaluru', href: '/clusters' },
];

/** The shape produced by an activity template before id/timestamp are added. */
type ActivityCore = Pick<
  ActivityEntry,
  'type' | 'description' | 'entityLabel' | 'href'
>;

/**
 * Plausible activity templates. Each is pure given its `rng` and draws only
 * from canonical data, so every produced entry has a non-empty description and
 * a valid internal href.
 */
const ACTIVITY_TEMPLATES: ReadonlyArray<(rng: () => number) => ActivityCore> = [
  (rng) => {
    const region = seededPick(rng, ACTIVITY_REGIONS);
    return {
      type: 'registration',
      description: `New startup registered in the ${region.name} cluster`,
      entityLabel: region.name,
      href: region.href,
    };
  },
  (rng) => {
    const scheme = seededPick(rng, schemes);
    return {
      type: 'approval',
      description: `${scheme.name} application approved`,
      entityLabel: scheme.name,
      href: `/schemes/${scheme.id}`,
    };
  },
  (rng) => {
    const scheme = seededPick(rng, schemes);
    const amount = seededInt(rng, 5, 200);
    return {
      type: 'disbursement',
      description: `₹${amount} lakh disbursed under ${scheme.name}`,
      entityLabel: scheme.name,
      href: `/schemes/${scheme.id}`,
    };
  },
  (rng) => {
    const sector = seededPick(rng, sectors);
    return {
      type: 'disbursement',
      description: `KITVEN Fund-5 invested in a ${sector.name} startup`,
      entityLabel: sector.name,
      href: '/schemes/kitven-fund-5',
    };
  },
  (rng) => {
    const program = seededPick(rng, flagshipPrograms);
    return {
      type: 'event',
      description: `${program.name} cohort selection announced`,
      entityLabel: program.name,
      href: program.href,
    };
  },
  (rng) => {
    const program = seededPick(rng, flagshipPrograms);
    return {
      type: 'milestone',
      description: `${program.name} demo day concluded`,
      entityLabel: program.name,
      href: program.href,
    };
  },
];

/**
 * A deterministic feed of 15–20 recent ecosystem activity entries. The length
 * is seeded into `[15, 20]`; each entry is seeded per index, so repeated calls
 * return deep-equal results. Every entry carries a non-empty `description` and
 * `timestampLabel`, and a valid internal `href`.
 */
export function getActivityFeed(): ActivityEntry[] {
  const length = seededInt(seededRng('admin|activityFeed|length'), 15, 20);

  return Array.from({ length }, (_unused, i) => {
    const rng = seededRng(`admin|activity|${i}`);
    const template = seededPick(rng, ACTIVITY_TEMPLATES);
    const core = template(rng);
    const timestampLabel = seededPick(rng, TIMESTAMP_LABELS);
    return {
      id: `activity-${i}`,
      timestampLabel,
      type: core.type,
      description: core.description,
      entityLabel: core.entityLabel,
      href: core.href,
    };
  });
}
