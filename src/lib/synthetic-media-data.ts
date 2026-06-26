// src/lib/synthetic-media-data.ts
//
// ===========================================================================
// Determinism contract (Req 2.3)
// ---------------------------------------------------------------------------
//  - Every export is PURE and hash-seeded SOLELY from stable string keys
//    (`press|count`, `press|{i}`, `announce|count`, `announce|{i}`). The same
//    key always yields byte-identical output, in every process, on every
//    reload.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    locale, environment, or any other ambient/time-dependent input. Relative
//    date labels are drawn from a fixed pool, never computed from the clock.
//  - All values are ILLUSTRATIVE synthetic content — no real coverage exists.
//    Consumers surface these behind an IllustrativeBadge.
// ===========================================================================

import type { GovAnnouncement, PressMention, PressType } from '@/types';
import { seededInt, seededPick, seededRng } from '@/lib/synthetic-prng';

const PRESS_COUNT_SEED = 'press|count';
const ANNOUNCE_COUNT_SEED = 'announce|count';

/** Official EITBT startup portal — the canonical source link target. */
const EITBT_PORTAL = 'https://eitbt.karnataka.gov.in/startup';

// --- Fixed, time-independent value pools ------------------------------------

const PUBLICATIONS: Record<PressType, readonly string[]> = {
  'major-press': [
    'The Deccan Herald', 'The Indian Express', 'The Hindu', 'Times of Karnataka',
  ],
  'business-press': [
    'Business Standard', 'The Economic Chronicle', 'Mint Karnataka', 'Financial Express South',
  ],
  'tech-press': [
    'TechBengaluru', 'Inc42 South', 'YourStory Karnataka', 'The Startup Ledger',
  ],
  'international-press': [
    'Global Innovation Review', 'Asia Tech Wire', 'The International Startup Post', 'World Venture Digest',
  ],
};

const PRESS_TYPES: readonly PressType[] = [
  'major-press', 'business-press', 'tech-press', 'international-press',
];

const HEADLINE_TEMPLATES: readonly string[] = [
  'Karnataka cements lead as India\u2019s deep-tech capital',
  'Bengaluru startups raise record funding in latest quarter',
  'Beyond Bengaluru clusters draw fresh investor interest',
  'ELEVATE cohort showcases next wave of Karnataka founders',
  'Karnataka\u2019s GCC count crosses new milestone',
  'Women-led ventures gain ground in Karnataka\u2019s startup policy',
  'K-Combinator demo day spotlights coastal Karnataka talent',
  'Karnataka signs new global innovation partnership',
  'State unveils support for grassroots and rural innovators',
  'Karnataka tops national rankings for startup ecosystem support',
  'KITVEN Fund-5 backs growth-stage Karnataka startups',
  'Karnataka semiconductor corridor attracts new entrants',
];

const EXCERPT_FRAGMENTS: readonly string[] = [
  'The development underscores Karnataka\u2019s position as the country\u2019s most active innovation hub.',
  'Officials pointed to sustained policy support and the state\u2019s 22-scheme framework.',
  'Founders and investors welcomed the move as a signal of long-term commitment.',
  'The announcement builds on the Karnataka Startup Policy 2025-30 targets.',
  'Analysts noted the growing role of Beyond Bengaluru clusters in the ecosystem.',
  'The initiative is expected to deepen Karnataka\u2019s international engagement.',
];

const DATE_LABELS: readonly string[] = [
  '2 days ago', '4 days ago', '1 week ago', '2 weeks ago', '3 weeks ago',
  '1 month ago', '6 weeks ago', '2 months ago',
];

const DEPARTMENTS: readonly string[] = [
  'Department of Electronics, IT, Bt and S&T',
  'Karnataka Innovation and Technology Society (KITS)',
  'Karnataka Digital Economy Mission (KDEM)',
  'Karnataka Startup Cell',
  'Directorate of Electronics, IT, BT',
];

const ANNOUNCEMENT_TITLES: readonly string[] = [
  'ELEVATE 2026 application window now open',
  'Revised guidelines for Beyond Bengaluru Cluster Fund issued',
  'Karnataka notifies SC/ST founder support under ELEVATE Unnati',
  'New empanelment of incubators under the Startup Policy',
  'KITVEN Fund-5 investment guidelines published',
  'Grand Challenge Karnataka 2026 problem statements released',
  'Women-Led Accelerator program operational guidelines notified',
  'NAIN 2.0 centre expansion across Kalyana Karnataka announced',
  'Updated reimbursement norms for patent and IP support',
  'Global Innovation Alliance partner-country MoU ratified',
  'Karnataka Annual Startup Report scheduled for release',
  'Single-window clearance enhancements for registered startups',
];

const ANNOUNCEMENT_SUMMARIES: readonly string[] = [
  'The order details eligibility, the application process, and timelines for prospective beneficiaries.',
  'The department has issued operational guidelines and a revised standard operating procedure.',
  'Registered startups are advised to review the notification and submit required documents through official channels.',
  'The circular supersedes earlier guidance and takes effect from the date of issue.',
  'The notification reflects commitments made under the Karnataka Startup Policy 2025-30.',
];

// --- Press mentions ---------------------------------------------------------

function generatePressMention(key: string): PressMention {
  const rng = seededRng(key);
  const publicationType = seededPick(rng, PRESS_TYPES);
  const publication = seededPick(rng, PUBLICATIONS[publicationType]);
  const headline = seededPick(rng, HEADLINE_TEMPLATES);
  const excerpt = seededPick(rng, EXCERPT_FRAGMENTS);
  const dateLabel = seededPick(rng, DATE_LABELS);
  const idSuffix = key.split('|')[1] ?? key;
  return {
    id: `press-${idSuffix}`,
    publication,
    publicationType,
    headline,
    dateLabel,
    excerpt,
    href: '#illustrative-coverage',
  };
}

/** 12–18 illustrative press mentions; byte-stable across calls (Req 2.1). */
export function generatePressMentions(): PressMention[] {
  const count = seededInt(seededRng(PRESS_COUNT_SEED), 12, 18);
  return Array.from({ length: count }, (_u, i) => generatePressMention(`press|${i}`));
}

// --- Government announcements ----------------------------------------------

function generateAnnouncement(key: string): GovAnnouncement {
  const rng = seededRng(key);
  const title = seededPick(rng, ANNOUNCEMENT_TITLES);
  const department = seededPick(rng, DEPARTMENTS);
  const summary = seededPick(rng, ANNOUNCEMENT_SUMMARIES);
  const dateLabel = seededPick(rng, DATE_LABELS);
  const idSuffix = key.split('|')[1] ?? key;
  return {
    id: `announce-${idSuffix}`,
    title,
    department,
    dateLabel,
    summary,
    sourceHref: EITBT_PORTAL,
  };
}

/** 8–12 illustrative government announcements; byte-stable (Req 2.2). */
export function generateAnnouncements(): GovAnnouncement[] {
  const count = seededInt(seededRng(ANNOUNCE_COUNT_SEED), 8, 12);
  return Array.from({ length: count }, (_u, i) => generateAnnouncement(`announce|${i}`));
}
