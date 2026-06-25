// src/lib/scheme-tagging.ts
//
// Pure inclusion-layer badge helper. A single documented place mapping fixed
// sets of REAL scheme ids (every id below exists in src/data/schemes.ts) to
// each inclusion badge. Founder judgment about "which real scheme gets which
// badge" is recorded here and is fully testable. No React, no I/O, no ambient
// input. The literal `rural-innovation-center` never appears — there is no such
// scheme; rural/grassroot references map to `grassroot-innovation`.

/** Schemes surfaced with a "Women Preference" badge on Women_Hub (Req 10.2). */
export const WOMEN_PREFERENCE_SCHEME_IDS: readonly string[] = [
  'elevate',
  'elevate-unnati',
  'kitven-fund-5',
  'beyond-bengaluru-cluster-fund',
];

/** Schemes surfaced with a "CSR-Aligned" badge on CSR_Hub (Req 18.2, 18.3). */
export const CSR_ALIGNED_SCHEME_IDS: readonly string[] = [
  'grassroot-innovation',
  'elevate-unnati',
  'nain-2',
  'rd-project-grant',
];

/** Schemes surfaced with a "Grassroots Friendly" badge on Idea_Bank (Req 31.1). */
export const GRASSROOTS_FRIENDLY_SCHEME_IDS: readonly string[] = [
  'grassroot-innovation',
  'nain-2',
  'rgep',
  'rd-project-grant',
];

export type SchemeBadge = 'Women Preference' | 'CSR-Aligned' | 'Grassroots Friendly';

/** Maps each badge to its documented set of real scheme ids. */
const BADGE_SCHEME_IDS: Record<SchemeBadge, readonly string[]> = {
  'Women Preference': WOMEN_PREFERENCE_SCHEME_IDS,
  'CSR-Aligned': CSR_ALIGNED_SCHEME_IDS,
  'Grassroots Friendly': GRASSROOTS_FRIENDLY_SCHEME_IDS,
};

/**
 * True iff `schemeId` carries `badge`, i.e. it is in that badge's documented
 * set. Pure and deterministic. Every listed id exists in schemes.ts.
 */
export function hasSchemeBadge(schemeId: string, badge: SchemeBadge): boolean {
  return BADGE_SCHEME_IDS[badge].includes(schemeId);
}
