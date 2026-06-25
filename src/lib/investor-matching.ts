// src/lib/investor-matching.ts
//
// Pure investor matching engine for the KITE Investor Suite.
//
// This module has NO React, NO I/O, and NO randomness. Every export is a pure
// function: identical inputs always produce identical outputs (Req 4.9, 5.7).
//
// It exposes two entry points:
//   - evaluateMatch(investor, startup): MatchResult
//       Scores a startup candidate against an investor thesis across four
//       weighted factors (sector ≤40, stage ≤30, geo ≤20, ticket ≤10), clamps
//       the sum to [0,100], bins it into a MatchSignal, and always returns a
//       non-empty human-readable reasons list.
//   - evaluateSchemeRelevance(investor, scheme): RelevanceResult
//       Resolves scheme relevance through a documented, declarative
//       RELEVANCE_RULES table (with a default heuristic), always returning a
//       non-empty reason.

import type {
  InvestmentStage,
  InvestorProfile,
  LocationKarnataka,
  MatchResult,
  MatchSignal,
  RelevanceResult,
  Scheme,
  StartupCandidate,
} from '@/types';

/* -------------------------------------------------------------------------- */
/* Shared helpers                                                             */
/* -------------------------------------------------------------------------- */

/** Clamp `value` into the inclusive range [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Canonical investment-stage order. Adjacency is defined as neighbouring
 * entries in this ordered list (index distance === 1).
 */
const STAGE_ORDER: readonly InvestmentStage[] = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B Plus',
  'Growth',
];

/**
 * Fixed, symmetric sector-adjacency map. Two sectors are "adjacent" when a
 * startup in one is a partial thesis fit for an investor focused on the other.
 * The map is intentionally small and hand-curated (not exhaustive); any pair
 * not listed scores zero on sector overlap. Lookups consult both directions.
 */
const ADJACENCY: Readonly<Record<string, readonly string[]>> = {
  'deep-tech': ['ai-ml', 'robotics', 'esdm-semiconductor', 'space-tech'],
  'ai-ml': ['deep-tech', 'saas-enterprise', 'cybersecurity'],
  'fintech': ['saas-enterprise'],
  'health-tech': ['bio-tech'],
  'bio-tech': ['health-tech', 'deep-tech'],
  'agri-tech': ['cleantech-climatetech'],
  'cleantech-climatetech': ['agri-tech', 'mobility'],
  'esdm-semiconductor': ['deep-tech', 'robotics', 'aerospace'],
  'space-tech': ['deep-tech', 'aerospace'],
  'aerospace': ['space-tech', 'esdm-semiconductor'],
  'robotics': ['deep-tech', 'manufacturing', 'esdm-semiconductor'],
  'manufacturing': ['robotics', 'logistics'],
  'logistics': ['manufacturing', 'mobility'],
  'mobility': ['cleantech-climatetech', 'logistics'],
  'saas-enterprise': ['ai-ml', 'fintech', 'cybersecurity'],
  'cybersecurity': ['ai-ml', 'saas-enterprise'],
  'gaming-avgc': ['ed-tech'],
  'ed-tech': ['gaming-avgc'],
  'marine-tech': ['cleantech-climatetech'],
  'social-impact': ['agri-tech'],
};

/** Return true when sectors `a` and `b` are adjacent in either direction. */
function areSectorsAdjacent(a: string, b: string): boolean {
  return (ADJACENCY[a] ?? []).includes(b) || (ADJACENCY[b] ?? []).includes(a);
}

/* -------------------------------------------------------------------------- */
/* Scoring sub-functions (each pure, each bounded by its weight)              */
/* -------------------------------------------------------------------------- */

/**
 * Sector overlap → [0, 40].
 *   - 40 when the startup's sector is one of the investor's focus sectors.
 *   - 20 (partial) when the startup's sector is adjacent to any focus sector.
 *   - 0 otherwise.
 */
export function scoreSectorOverlap(
  investor: InvestorProfile,
  startup: StartupCandidate,
): number {
  if (investor.focusSectors.includes(startup.sector)) {
    return 40;
  }
  const adjacent = investor.focusSectors.some((focus) =>
    areSectorsAdjacent(focus, startup.sector),
  );
  return adjacent ? 20 : 0;
}

/**
 * Stage match → [0, 30].
 *   - 30 when the startup's stage is one of the investor's focus stages.
 *   - 15 when the startup's stage is adjacent to any focus stage in STAGE_ORDER.
 *   - 0 otherwise.
 */
export function scoreStageMatch(
  investor: InvestorProfile,
  startup: StartupCandidate,
): number {
  if (investor.focusStages.includes(startup.stage)) {
    return 30;
  }
  const startupIndex = STAGE_ORDER.indexOf(startup.stage);
  if (startupIndex === -1) {
    return 0;
  }
  const adjacent = investor.focusStages.some((focus) => {
    const focusIndex = STAGE_ORDER.indexOf(focus);
    return focusIndex !== -1 && Math.abs(focusIndex - startupIndex) === 1;
  });
  return adjacent ? 15 : 0;
}

/** Bengaluru-region locations (used by the "Beyond Bengaluru" geo rule). */
const BENGALURU_LOCATIONS: readonly LocationKarnataka[] = [
  'Bengaluru Urban',
  'Bengaluru Rural',
];

/**
 * Geographic match → [0, 20].
 *   - 20 when the investor's geographic focus covers the startup's location:
 *       • an exact location entry, or
 *       • a broad "Karnataka" focus (covers every Karnataka location), or
 *       • a "Karnataka Beyond Bengaluru" focus matching a non-Bengaluru location.
 *   - 10 for a broad "India" / "Global" focus.
 *   - 0 otherwise.
 */
export function scoreGeoMatch(
  investor: InvestorProfile,
  startup: StartupCandidate,
): number {
  const focus = investor.geographicFocus;
  const isBengaluru = BENGALURU_LOCATIONS.includes(startup.location);

  if (focus.includes(startup.location)) {
    return 20;
  }
  if (focus.includes('Karnataka')) {
    return 20;
  }
  if (focus.includes('Karnataka Beyond Bengaluru') && !isBengaluru) {
    return 20;
  }
  if (focus.includes('India') || focus.includes('Global')) {
    return 10;
  }
  return 0;
}

/**
 * Ticket compatibility → [0, 10].
 *   - 10 when the ask sits inside the investor's ticket band [min, max].
 *   - 5 when the ask sits within ±25% of the band (min*0.75 .. max*1.25).
 *   - 0 otherwise.
 */
export function scoreTicketCompat(
  investor: InvestorProfile,
  startup: StartupCandidate,
): number {
  const { ticketSizeMinLakhs: min, ticketSizeMaxLakhs: max } = investor;
  const ask = startup.askLakhs;

  if (ask >= min && ask <= max) {
    return 10;
  }
  const lowerBound = min * 0.75;
  const upperBound = max * 1.25;
  if (ask >= lowerBound && ask <= upperBound) {
    return 5;
  }
  return 0;
}

/* -------------------------------------------------------------------------- */
/* Reasons + signal                                                           */
/* -------------------------------------------------------------------------- */

interface ReasonParts {
  sector: number;
  stage: number;
  geo: number;
  ticket: number;
  investor: InvestorProfile;
  startup: StartupCandidate;
}

/**
 * Build a human-readable reasons list — one sentence per scoring factor plus an
 * overall summary sentence. The summary guarantees the list is ALWAYS non-empty
 * even when every factor scores zero (Req 4.8).
 */
function buildReasons(parts: ReasonParts): string[] {
  const { sector, stage, geo, ticket, startup } = parts;
  const reasons: string[] = [];

  reasons.push(
    sector > 0
      ? `Sector ${startup.sector} fits your focus sectors (+${sector}).`
      : `Sector ${startup.sector} is outside your focus sectors (+0).`,
  );
  reasons.push(
    stage > 0
      ? `Stage ${startup.stage} aligns with your focus stages (+${stage}).`
      : `Stage ${startup.stage} is outside your focus stages (+0).`,
  );
  reasons.push(
    geo > 0
      ? `Location ${startup.location} is within your geographic focus (+${geo}).`
      : `Location ${startup.location} is outside your geographic focus (+0).`,
  );
  reasons.push(
    ticket > 0
      ? `Ask of ₹${startup.askLakhs}L fits your ticket band (+${ticket}).`
      : `Ask of ₹${startup.askLakhs}L is outside your ticket band (+0).`,
  );

  const total = sector + stage + geo + ticket;
  reasons.push(
    total > 0
      ? `Overall, ${startup.companyName} scores ${total} against your thesis.`
      : `Overall, ${startup.companyName} does not currently match your thesis.`,
  );

  return reasons;
}

/**
 * Bin a score into a MatchSignal:
 *   strong (≥80) / possible (50–79) / out-of-thesis (<50).
 */
function toSignal(score: number): MatchSignal {
  if (score >= 80) return 'strong';
  if (score >= 50) return 'possible';
  return 'out-of-thesis';
}

/* -------------------------------------------------------------------------- */
/* Public: evaluateMatch                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Score a startup candidate against an investor thesis.
 *
 * The four factor weights sum to exactly 100, so `clamp(..., 0, 100)` is
 * defensive rather than corrective; the returned `score` is always an integer
 * in [0, 100]. `startupId` is derived from `startup.kiteId` (Req 4.2).
 */
export function evaluateMatch(
  investor: InvestorProfile,
  startup: StartupCandidate,
): MatchResult {
  const sector = scoreSectorOverlap(investor, startup); // 0..40
  const stage = scoreStageMatch(investor, startup); //     0..30
  const geo = scoreGeoMatch(investor, startup); //         0..20
  const ticket = scoreTicketCompat(investor, startup); //  0..10

  const score = Math.round(clamp(sector + stage + geo + ticket, 0, 100));
  const signal = toSignal(score);
  const reasons = buildReasons({ sector, stage, geo, ticket, investor, startup });

  return { startupId: startup.kiteId, score, signal, reasons };
}

/* -------------------------------------------------------------------------- */
/* Public: evaluateSchemeRelevance (pure RULES TABLE)                         */
/* -------------------------------------------------------------------------- */

interface RelevanceRule {
  schemeId: string;
  isRelevant: (investor: InvestorProfile) => boolean;
  reason: (investor: InvestorProfile, relevant: boolean) => string; // never empty
}

/**
 * Declarative relevance table. Each entry maps a canonical scheme id (verified
 * against `src/data/schemes.ts`) to a pure predicate and a non-empty reason
 * builder. Schemes not listed fall through to `defaultRelevanceHeuristic`.
 */
const RELEVANCE_RULES: readonly RelevanceRule[] = [
  {
    // KITVEN Fund-5 → relevant to ALL investors as a co-investor opportunity (5.3).
    schemeId: 'kitven-fund-5',
    isRelevant: () => true,
    reason: () =>
      'KITVEN Fund-5 co-invests alongside private investors (₹100 Cr corpus, 2–10% per deal, max 30% stake).',
  },
  {
    // Beyond Bengaluru Cluster Seed Fund → relevant when geo includes the cluster focus (5.4).
    schemeId: 'beyond-bengaluru-cluster-fund',
    isRelevant: (investor) =>
      investor.geographicFocus.includes('Karnataka Beyond Bengaluru'),
    reason: (_investor, relevant) =>
      relevant
        ? 'Your Beyond-Bengaluru geographic focus aligns with this cluster seed fund.'
        : 'This cluster seed fund targets Beyond-Bengaluru regions outside your current geographic focus.',
  },
  {
    // R&D Project Grant → relevant when focus sectors include deep-tech (5.5).
    schemeId: 'rd-project-grant',
    isRelevant: (investor) => investor.focusSectors.includes('deep-tech'),
    reason: (_investor, relevant) =>
      relevant
        ? 'Your deep-tech focus aligns with this triple-helix R&D grant for portfolio companies.'
        : 'This grant best fits deep-tech ventures, which are outside your stated focus sectors.',
  },
];

/**
 * Default heuristic for schemes not covered by an explicit rule. Deterministic:
 * a scheme is relevant when any of the investor's focus-sector id tokens appears
 * in the scheme's name or short description (case-insensitive).
 */
function defaultRelevanceHeuristic(
  investor: InvestorProfile,
  scheme: Scheme,
): boolean {
  const haystack = `${scheme.name} ${scheme.shortDescription}`.toLowerCase();
  return investor.focusSectors.some((sectorId) =>
    sectorId
      .split('-')
      .some((token) => token.length > 2 && haystack.includes(token)),
  );
}

/**
 * Resolve a scheme's relevance to an investor. Total and side-effect-free: the
 * same inputs always yield the same `RelevanceResult`, and `reason` is always a
 * non-empty string (Req 5.6, 5.7).
 */
export function evaluateSchemeRelevance(
  investor: InvestorProfile,
  scheme: Scheme,
): RelevanceResult {
  const rule = RELEVANCE_RULES.find((r) => r.schemeId === scheme.id);
  if (rule) {
    const isRelevant = rule.isRelevant(investor);
    return {
      schemeId: scheme.id,
      isRelevant,
      reason: rule.reason(investor, isRelevant),
    };
  }

  const isRelevant = defaultRelevanceHeuristic(investor, scheme);
  return {
    schemeId: scheme.id,
    isRelevant,
    reason: isRelevant
      ? `${scheme.name} is broadly applicable to portfolio companies in your focus areas.`
      : `${scheme.name} does not strongly align with your current thesis.`,
  };
}
