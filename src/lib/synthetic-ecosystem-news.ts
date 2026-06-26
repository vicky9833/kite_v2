// src/lib/synthetic-ecosystem-news.ts
//
// ===========================================================================
// Determinism contract
// ---------------------------------------------------------------------------
//  - `generateEcosystemNews()` is PURE and hash-seeded from a FIXED seed string.
//    It returns the SAME 8 items, in the same order, on every call, in every
//    process, on every reload — byte-stable.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    locale, or any ambient input. The relative date label per item is drawn
//    deterministically from a fixed pool seeded by the item id.
//  - All items are ILLUSTRATIVE synthetic ecosystem updates surfaced behind an
//    IllustrativeBadge by the carousel. Each `href` routes to a real KITE page.
// ===========================================================================

import type { EcosystemNewsItem } from '@/types';
import { seededInt, seededRng } from '@/lib/synthetic-prng';

const DATE_POOL: readonly string[] = [
  'Today',
  '2 days ago',
  '4 days ago',
  '1 week ago',
  '2 weeks ago',
  '3 weeks ago',
  '1 month ago',
];

/** The fixed pool of illustrative ecosystem updates (headline/summary/category/href). */
const NEWS_SEED: ReadonlyArray<Omit<EcosystemNewsItem, 'dateRelative'>> = [
  {
    id: 'vc-milestone',
    headline: 'Karnataka crosses $79B VC milestone',
    summary: 'Bengaluru startups have raised over $79B since 2010 — 46% of India\u2019s VC.',
    category: 'Achievement',
    href: '/dashboard/admin',
  },
  {
    id: 'dpiit-21k',
    headline: '21,000+ DPIIT startups milestone reached',
    summary: 'Karnataka now hosts more than 21,000 DPIIT-recognized startups.',
    category: 'Achievement',
    href: '/schemes',
  },
  {
    id: 'kcombinator-demo',
    headline: 'K-Combinator first cohort demo day completed',
    summary: 'The Mangaluru accelerator wrapped its inaugural cohort demo day.',
    category: 'Event',
    href: '/programs/k-combinator',
  },
  {
    id: 'kitven-deploy',
    headline: 'KITVEN Fund-5 deploys first \u20B925 crore',
    summary: 'Karnataka\u2019s \u20B9100 Cr venture fund makes its first growth-stage investments.',
    category: 'Funding',
    href: '/schemes/kitven',
  },
  {
    id: 'bts-registration',
    headline: 'Bengaluru Tech Summit 2026 registration opens',
    summary: 'Registration is open for Karnataka\u2019s flagship technology summit.',
    category: 'Event',
    href: '/events',
  },
  {
    id: 'gia-japan',
    headline: 'GIA Japan partnership signed for robotics',
    summary: 'A new bilateral track connects Karnataka and Japan on robotics and mobility.',
    category: 'Partnership',
    href: '/gia/jp',
  },
  {
    id: 'kan-cohort-14',
    headline: 'KAN cohort 14 selected',
    summary: 'The Karnataka Acceleration Network announces its fourteenth cohort.',
    category: 'Achievement',
    href: '/programs/kan',
  },
  {
    id: 'elevate-2a-winners',
    headline: 'ELEVATE Phase 2A announces 5 winners',
    summary: 'Five startups advance with grants under the ELEVATE Phase 2A round.',
    category: 'Funding',
    href: '/schemes/elevate',
  },
  {
    id: 'mysuru-1000',
    headline: 'Mysuru cluster crosses 1,000 startups',
    summary: 'The Mysuru cybersecurity & ESDM cluster passes a 1,000-startup milestone.',
    category: 'Achievement',
    href: '/clusters/mysuru',
  },
  {
    id: 'mangaluru-exits',
    headline: 'Mangaluru Silicon Beach announces 2 new exits',
    summary: 'Two coastal-Karnataka ventures report successful exits.',
    category: 'Recognition',
    href: '/clusters/mangaluru',
  },
];

/** Number of items surfaced in the carousel (deterministic, fixed). */
export const ECOSYSTEM_NEWS_COUNT = 8;

/**
 * Return the deterministic list of ecosystem news items for the home carousel.
 * Exactly {@link ECOSYSTEM_NEWS_COUNT} items, byte-stable across calls. Each
 * item's relative date label is drawn deterministically from a fixed pool.
 */
export function generateEcosystemNews(): EcosystemNewsItem[] {
  return NEWS_SEED.slice(0, ECOSYSTEM_NEWS_COUNT).map((item) => {
    const rng = seededRng(`ecosystem-news|${item.id}`);
    const dateRelative = DATE_POOL[seededInt(rng, 0, DATE_POOL.length - 1)] as string;
    return { ...item, dateRelative };
  });
}
