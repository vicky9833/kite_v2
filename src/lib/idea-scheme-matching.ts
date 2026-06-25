import type { IdeaSubmission, LocationKarnataka } from '@/types';
import { schemes } from '@/data/schemes';

/** Real scheme ids known to the engine — every one exists in schemes.ts. */
const VALID_SCHEME_IDS: ReadonlySet<string> = new Set(schemes.map((s) => s.id));

export interface SchemeMatch {
  schemeId: string; // always ∈ VALID_SCHEME_IDS (Req 4.2)
  reason: string; // why-it-matched, shown in Idea_Success_State (Req 28.3)
  weight: number; // higher = stronger; drives ordering (Req 4.8, 4.10)
}

const MAX_MATCHES = 5;
const BENGALURU: ReadonlySet<LocationKarnataka> = new Set<LocationKarnataka>([
  'Bengaluru Urban',
  'Bengaluru Rural',
]);

/** Bengaluru-located ideas are NOT "not in Bengaluru" (Req 4.5). */
export function isBengaluru(location: LocationKarnataka): boolean {
  return BENGALURU.has(location);
}

/**
 * Pure, deterministic, no I/O, no Math.random, no Date (Req 4.12). Builds the
 * candidate matches from the documented rules, de-dupes by id keeping the
 * highest weight, sorts by weight desc (distinct weights so ties never collide
 * for a single idea), and caps at 5.
 */
export function matchIdeaToSchemesDetailed(idea: IdeaSubmission): SchemeMatch[] {
  const candidates: SchemeMatch[] = [];
  const add = (schemeId: string, reason: string, weight: number): void => {
    if (VALID_SCHEME_IDS.has(schemeId)) candidates.push({ schemeId, reason, weight });
  };

  const ruralNotBengaluru =
    idea.ideaCategory === 'Rural Development' && !isBengaluru(idea.location);
  const ruralStudent =
    idea.ideaCategory === 'Rural Development' && idea.innovatorType === 'Student';

  // --- Innovator-type strong signals (ordered ahead of weaker matches) ---
  if (idea.innovatorType === 'Rural Innovator') {
    add('grassroot-innovation', 'Dedicated support for grassroot and rural innovators.', 100); // Req 4.10
  }
  if (idea.innovatorType === 'Student') {
    add('nain-2', 'NAIN 2.0 funds student innovation teams across Karnataka colleges.', 90); // Req 4.8
    if (idea.innovatorAge <= 30) {
      add('rgep', 'RGEP gives young individual innovators (≤30) a 12-month stipend.', 70); // Req 4.9
    }
  }

  // --- Category signals ---
  if (idea.ideaCategory === 'AgriTech') {
    add(
      'grassroot-innovation',
      'Grassroot Innovation Support suits field-tested AgriTech ideas.',
      60,
    ); // Req 4.4
    add('rd-project-grant', 'R&D Project Grant co-funds applied AgriTech research.', 55); // Req 4.4
  }
  if (ruralNotBengaluru) {
    add(
      'beyond-bengaluru-cluster-fund',
      'Beyond Bengaluru Cluster Fund backs rural-development ideas outside Bengaluru.',
      65,
    ); // Req 4.5
  }
  if (ruralStudent) {
    add('nain-2', 'NAIN 2.0 supports student-led rural-development projects.', 60); // Req 4.6
  }
  if (idea.ideaCategory === 'Rural Development' && !ruralNotBengaluru && !ruralStudent) {
    add(
      'grassroot-innovation',
      'Grassroot Innovation Support is the core rural-development pathway.',
      60,
    ); // Req 4.7
  }

  // --- Broadly relevant baseline pathway for any submitted idea ---
  add('elevate', 'ELEVATE (Idea2PoC) is Karnataka’s flagship early-stage grant.', 20); // Req 4.13

  // De-dupe by id keeping the highest-weight occurrence; preserve first reason
  // at that weight. Stable sort by weight desc; cap at MAX_MATCHES (Req 4.1, 4.3).
  const byId = new Map<string, SchemeMatch>();
  candidates.forEach((m) => {
    const prev = byId.get(m.schemeId);
    if (!prev || m.weight > prev.weight) byId.set(m.schemeId, m);
  });
  return [...byId.values()].sort((a, b) => b.weight - a.weight).slice(0, MAX_MATCHES);
}

/** Id-only projection used to populate IdeaSubmission.matchedSchemeIds (Req 3.4). */
export function matchIdeaToSchemes(idea: IdeaSubmission): string[] {
  return matchIdeaToSchemesDetailed(idea).map((m) => m.schemeId);
}
