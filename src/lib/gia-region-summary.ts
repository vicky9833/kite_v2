// src/lib/gia-region-summary.ts
//
// Pure derivation of GIA region summaries from the verified `giaCountries`
// data. Region counts are NEVER hardcoded — they are computed here so the
// region overview cards stay correct if the verified data changes (Req 7.2).
// No I/O, no ambient input.

import type { GIACountry, GIARegion, GiaRegionSummary } from '@/types';

/** Canonical region order used by the region overview section. */
export const GIA_REGION_ORDER: readonly GIARegion[] = [
  'Europe', 'Middle East', 'Asia-Pacific', 'Americas', 'Africa',
];

/**
 * Build one `GiaRegionSummary` per region present in `countries`. The total of
 * all `countryCount` equals `countries.length`, and each region with at least
 * one member appears exactly once (Property 4 / Req 7.2). `focusAreas` collects
 * the most frequent focus areas across the region (top 4, by frequency then
 * first-seen order).
 */
export function buildRegionSummaries(countries: readonly GIACountry[]): GiaRegionSummary[] {
  const byRegion = new Map<GIARegion, GIACountry[]>();
  for (const country of countries) {
    const list = byRegion.get(country.region) ?? [];
    list.push(country);
    byRegion.set(country.region, list);
  }

  const summaries: GiaRegionSummary[] = [];
  // Emit in canonical order first, then any unexpected regions (defensive).
  const orderedRegions: GIARegion[] = [
    ...GIA_REGION_ORDER.filter((r) => byRegion.has(r)),
    ...[...byRegion.keys()].filter((r) => !GIA_REGION_ORDER.includes(r)),
  ];

  for (const region of orderedRegions) {
    const members = byRegion.get(region) ?? [];
    summaries.push({
      region,
      countryCount: members.length,
      focusAreas: topFocusAreas(members, 4),
    });
  }
  return summaries;
}

/** Most frequent focus areas across `members`, capped at `limit`. */
function topFocusAreas(members: readonly GIACountry[], limit: number): string[] {
  const counts = new Map<string, number>();
  const order: string[] = [];
  for (const member of members) {
    for (const focus of member.focusAreas) {
      if (!counts.has(focus)) order.push(focus);
      counts.set(focus, (counts.get(focus) ?? 0) + 1);
    }
  }
  return order
    .slice()
    .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || order.indexOf(a) - order.indexOf(b))
    .slice(0, limit);
}
