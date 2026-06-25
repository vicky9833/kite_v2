// src/lib/synthetic-program-stories.ts
//
// ===========================================================================
// Determinism contract (Req 4.5, 5.11, 11.3)
// ---------------------------------------------------------------------------
//  - `generateSuccessStories` is PURE and hash-seeded SOLELY from the supplied
//    `seed` string (e.g. `kan|success-stories`, `k-combinator|success-stories`).
//    The same seed yields byte-identical output, in every process, on every
//    reload — the editorial success-stories preview is byte-stable.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    locale, environment, or any other ambient/time-dependent input.
//  - All randomness flows through `synthetic-prng.ts`
//    (seededRng/seededInt/seededPick/seededShuffle); every helper respects its
//    stated range.
//  - Content is ILLUSTRATIVE only. `startupName` is drawn from a fixed
//    plausible-name pool; `sector` is drawn from the canonical 20-sector
//    taxonomy in `sectors.ts`; `outcomeLine` is declarative, third-person, and
//    clearly illustrative. The consumer renders these behind an
//    `IllustrativeBadge`. Different seeds produce different stories.
// ===========================================================================

import type { ProgramSuccessStory } from '@/types';
import { sectors } from '@/data/sectors';
import { seededInt, seededPick, seededRng, seededShuffle } from '@/lib/synthetic-prng';

// --- Fixed, time-independent value pools -----------------------------------

// Plausible illustrative startup names. Fixed constant — only the seeded
// selection varies by seed. Deliberately neutral, non-promotional coinages.
const STARTUP_NAME_POOL: readonly string[] = [
  'Anvaya Labs',
  'Tarang Systems',
  'Pradhan Technologies',
  'Sahya Ventures',
  'Nirvaha Robotics',
  'Udaan Analytics',
  'Vistaar Health',
  'Kshitij Aerospace',
  'Tantra Mobility',
  'Sthira Energy',
  'Vaayu Drones',
  'Samvit AI',
  'Pragati Agritech',
  'Drishti Sensors',
  'Setu Networks',
  'Avani Marine',
];

// Outcome templates: declarative, third-person, illustrative. `{sector}` is
// substituted with the story's canonical sector name. No superlatives,
// exclamation marks, or urgency/scarcity phrasing.
const OUTCOME_TEMPLATES: readonly string[] = [
  'completed the cohort and went on to run a paid pilot with an enterprise partner in the {sector} space.',
  'graduated from the programme and subsequently raised an institutional seed round to scale its {sector} product.',
  'used the acceleration support to validate its {sector} platform and expand into two additional districts.',
  'progressed from prototype to first revenue, building on the {sector} mentorship received during the cohort.',
  'established a research partnership following the programme to advance its {sector} technology.',
  'grew its team and onboarded its first set of customers in the {sector} segment after the cohort.',
];

/**
 * Build a single illustrative success story from a per-story seeded stream.
 * Each story keys off `${seed}|story|${index}` so the set is stable and
 * independent of generation order.
 */
function generateStory(seed: string, index: number): ProgramSuccessStory {
  const rng = seededRng(`${seed}|story|${index}`);

  const startupName = seededPick(rng, STARTUP_NAME_POOL);
  const sector = seededPick(rng, sectors).name;
  const template = seededPick(rng, OUTCOME_TEMPLATES);
  const outcomeLine = `${startupName} ${template.replace('{sector}', sector)}`;

  return {
    id: `${seed}|${index}`,
    startupName,
    sector,
    outcomeLine,
  };
}

/**
 * Generate the illustrative success-stories set for an editorial program page,
 * seeded SOLELY by `seed`. See the module determinism contract above: the same
 * seed always yields byte-identical output, and different seeds (e.g. KAN vs
 * K-Combinator) yield different stories.
 *
 * Produces a small, seeded count (3–4) of stories.
 */
export function generateSuccessStories(seed: string): ProgramSuccessStory[] {
  // Seeded count in [3,4] from a dedicated count stream (independent of the
  // per-story streams so it stays stable regardless of story content).
  const count = seededInt(seededRng(`${seed}|count`), 3, 4);

  // Build candidate stories, then de-duplicate by startupName so a single set
  // never repeats the same company. A seeded shuffle of the name pool keeps
  // the fallback selection deterministic if collisions occur.
  const stories: ProgramSuccessStory[] = [];
  const usedNames = new Set<string>();
  const fallbackNames = seededShuffle(seededRng(`${seed}|names`), STARTUP_NAME_POOL);
  let fallbackCursor = 0;

  for (let i = 0; i < count; i++) {
    const story = generateStory(seed, i);
    if (usedNames.has(story.startupName)) {
      // Deterministically pick the next unused fallback name.
      while (
        fallbackCursor < fallbackNames.length &&
        usedNames.has(fallbackNames[fallbackCursor] as string)
      ) {
        fallbackCursor += 1;
      }
      const replacement = fallbackNames[fallbackCursor] as string | undefined;
      if (replacement !== undefined) {
        const rebuilt: ProgramSuccessStory = {
          ...story,
          startupName: replacement,
          outcomeLine: story.outcomeLine.replace(story.startupName, replacement),
        };
        usedNames.add(replacement);
        stories.push(rebuilt);
        continue;
      }
    }
    usedNames.add(story.startupName);
    stories.push(story);
  }

  return stories;
}
