// src/lib/scheme-apply-urls.ts
//
// PURE module — no React, no side effects, no async, no external dependencies.
// Resolves a scheme id to the external official portal URL used by the
// "Apply Now" controls (Req 23). Same input always yields the same output.
//
// Every "Apply Now" control renders the resolved URL with
// target="_blank" rel="noopener noreferrer" plus an inline disclaimer that the
// link redirects to an official portal while this site is a frontend preview
// (Req 23.1, 23.6).

/**
 * Fallback portal for any scheme without an explicit mapping (Req 23.5).
 * A non-empty absolute https URL.
 */
export const DEFAULT_APPLY_URL = 'https://eitbt.karnataka.gov.in/startup';

/**
 * Documented scheme-id → official portal URL mappings, keyed by the REAL
 * scheme ids defined in `src/data/schemes.ts`.
 *
 * - 'kitven-fund-5'  → KITVEN Fund-5 portal (Req 23.2)
 * - 'kan'            → Karnataka Acceleration Network portal (Req 23.3)
 * - 'elevate'        → ELEVATE portal (Req 23.4)
 * - 'elevate-unnati' → ELEVATE family portal (Req 23.4)
 */
const APPLY_URL_MAP: Record<string, string> = {
  'kitven-fund-5': 'https://kitven.in',
  'kan': 'https://karnatakadigital.in/acceleration-network',
  'elevate': 'https://eitbt.karnataka.gov.in/elevate',
  'elevate-unnati': 'https://eitbt.karnataka.gov.in/elevate',
};

/**
 * Total function: every input — including arbitrary/unknown strings — returns a
 * non-empty absolute https URL. Returns the mapped portal when present,
 * otherwise the default startup portal (Req 23.5).
 *
 * NOTE: we use an own-property guard rather than `APPLY_URL_MAP[id] ?? DEFAULT`
 * because a plain object inherits keys like `toString`/`constructor` from
 * `Object.prototype`; a bare index lookup on those would return an inherited
 * function instead of falling through to the default. `hasOwnProperty` ensures
 * only the documented mappings are honored.
 */
export function resolveApplyUrl(schemeId: string): string {
  return Object.prototype.hasOwnProperty.call(APPLY_URL_MAP, schemeId)
    ? APPLY_URL_MAP[schemeId]!
    : DEFAULT_APPLY_URL;
}
