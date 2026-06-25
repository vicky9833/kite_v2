# Implementation Plan: KITE Inclusion & Grassroots Layer (Prompt 6)

## Overview

This plan implements the Inclusion & Grassroots Layer — the three public surfaces that
broaden participation beyond the marketplace (Prompts 2–4) and the enablement layer
(Prompt 5) — on top of the existing Next.js 14 / App Router / TypeScript-strict project,
exactly as specified in `design.md` and satisfying all 38 requirements. It replaces three
existing `StubPage` placeholders with full institutional surfaces and adds the session-only
state, pure data modules, and additive types they require. It is dependency-ordered into the
five Prompt 1–5 phases:

- **Phase A — Foundation.** Additive types appended to `src/types/index.ts`
  (`IdeaSubmission`, `IdeaSubmissionDraft`, `InnovatorType`/`INNOVATOR_TYPES`,
  `IdeaCategory`/`IDEA_CATEGORIES`, `IdeaStatus`, `IdeaBankContextValue`,
  `WomenFounderCard`, `CsrPartnership`, `CsrPartnerType`/`CSR_PARTNER_TYPES`, `NgoPartner`,
  `CsrImpactMetric`, `IdeaBoardFilters`, `IllustrativeGender` + the optional
  `MentorProfile.illustrativeGender`); the pure `idea-id-generator.ts`, `scheme-tagging.ts`,
  `idea-scheme-matching.ts`, and `ideas-board-filters.ts`; the session-only
  `IdeaBankContext.tsx` wired innermost in `layout.tsx`; the five synthetic generators
  (`synthetic-women-founders.ts`, `synthetic-csr-partnerships.ts`, `synthetic-ngo-partners.ts`,
  `synthetic-csr-impact.ts`, `synthetic-ideas.ts`); and the additive `illustrativeGender`
  extension to `synthetic-mentors.ts`. Hard prerequisite for B/C/D/E.
- **Phase B — Women Founders Hub (`/women`).** The 9 section components in
  `src/components/women/`, the filterable schemes client island, and the page composition.
- **Phase C — CSR & NGO Hub (`/csr`).** The 8 section components in `src/components/csr/`,
  the schemes filter island, the `Blob` brief-download island, and the page composition.
- **Phase D — Idea Bank (`/ideas`).** The pure form validator; the `IdeaBankClient` island
  (submission form + success state + public board + categories spotlight pre-fill); the
  server hero / how-it-works / featured grassroots schemes / resources sections; and the
  page composition.
- **Phase E — Integration & polish.** Footer additions + navigation/home quick-action
  verification; e2e, a11y, responsive, perf/bundle, no-IO, and visual audits; bundle
  housekeeping; final checkpoint.

The 17 Correctness Properties are folded in as one property-based test each (`fast-check`,
`{ numRuns: 100 }`), tagged `// Feature: kite-inclusion-grassroots, Property {n}`, placed in
the phase where the code under test is built, in the exact test files from the design's Test
architecture table. All test sub-tasks are marked `*` (optional for a fast MVP, required for
full conformance).

**Operating discipline carried into every task:** frontend-only / session-only — NO backend,
database, API, network/`fetch`, or persistence (`localStorage`/`sessionStorage`/cookies/
`indexedDB`); the `IdeaBankContext` `ideas` array is in-memory React state that resets on
refresh; the CSR `Blob` brief download is the only permitted output. Verified Karnataka data
is canonical and never fabricated: **25% women-led ELEVATE winners**, the **51% founder-stake**
and **51% women-employee** thresholds, the **₹5 crore Women-Led Accelerator grant over 5
years**, **ELEVATE Unnati** for SC/ST founders, and **exactly 22 schemes** in `schemes.ts`
(all scheme references — including every match the engine produces — use only those real ids;
there is NO `rural-innovation-center`; "Rural Innovation Center" maps to `grassroot-innovation`).
All synthetic figures (founders, partnerships, NGO partners, seed ideas, CSR impact, mentor
gender) are deterministic, hash-seeded via the existing `synthetic-prng` (never `Math.random`,
`Date`, `Date.now`, or `performance.now`), and visibly labeled via `IllustrativeBadge`; all CSR
aggregate numbers are illustrative. Type extensions are additive only. WCAG 2.1 AA throughout.
First Load JS ≤ 150KB per route (charts, if ever added, only via the dynamic chart barrel).

**Verify commands:** `npx tsc --noEmit` (types), `npm run lint`, `npm run test:run -- <file>`
(single file), `npm run test:run` (full suite), `npm run build` (bundle).

## Tasks

### Phase A — Foundation

- [x] 1. Additive inclusion-layer types
  - [x] 1.1 Append inclusion-layer types to `src/types/index.ts`
    - Append, after the Ecosystem Enablement block (never alter/remove an existing export):
      `InnovatorType` + `INNOVATOR_TYPES`, `IdeaCategory` + `IDEA_CATEGORIES`, `IdeaStatus`,
      `IdeaSubmission` (all 15 fields), `IdeaSubmissionDraft` (`Omit` of id/ideaId/submittedAt/
      status/matchedSchemeIds), `IdeaBankContextValue`, `IllustrativeGender`, `WomenFounderCard`,
      `CsrPartnerType` + `CSR_PARTNER_TYPES`, `CsrPartnership`, `NgoPartner`, `CsrImpactMetric`,
      and `IdeaBoardFilters`. Reuse the existing `LocationKarnataka` and `Scheme`. Edit the
      existing `MentorProfile` interface in place to add ONLY `illustrativeGender?:
      IllustrativeGender` (no field made required or removed). Must compile under `strict` +
      `noUncheckedIndexedAccess`.
    - _Depends: none (wave 0)_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 6.1, 5.1, 5.2, 5.3, 21.1_
  - [x]* 1.2 Type-compile guard → `src/app/__tests__/inclusion-types.test-d.ts`
    - Assert the new types compile, that `IdeaSubmissionDraft` is assignable into a completed
      `IdeaSubmission`, that `MentorProfile.illustrativeGender` is optional, and that prior
      exports (incl. `MentorProfile`, `LocationKarnataka`, `Scheme`) are unchanged.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 1.1, 1.8, 6.1_

- [x] 2. Pure idea-id generator
  - [x] 2.1 Implement `src/lib/idea-id-generator.ts`
    - Near-copy of `investor-id-generator.ts`: export `IDEA_ID_ALPHABET`
      (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, excludes `O`/`0`/`I`/`1`), `IDEA_ID_PATTERN`, the
      `Rng` type, and `generateIdeaId(rng = Math.random, year = new Date().getFullYear())`
      returning `IDEA-YYYY-XXXXXX` with a 6-char suffix; each char maps `rng()` to a clamped
      alphabet index so out-of-range `rng()` (1, negative, `NaN`) never overflows. Pure: no
      React, no I/O, no network.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x]* 2.2 Property test → `src/lib/__tests__/idea-id-generator.pbt.test.ts`
    - `// Feature: kite-inclusion-grassroots, Property 1` (well-formed for any rng sequence
      incl. `1`/negatives/`NaN` and any 4-digit year; suffix chars all from `IDEA_ID_ALPHABET`,
      never `O`/`0`/`I`/`1`) and `Property 2` (deterministic for a fixed rng seed + year). Each
      `{ numRuns: 100 }`.
    - _Depends: 2.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/idea-id-generator.pbt.test.ts`_
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 3. Pure scheme-tagging helper
  - [x] 3.1 Implement `src/lib/scheme-tagging.ts`
    - Export `WOMEN_PREFERENCE_SCHEME_IDS` (`elevate`, `elevate-unnati`, `kitven-fund-5`,
      `beyond-bengaluru-cluster-fund`), `CSR_ALIGNED_SCHEME_IDS` (`grassroot-innovation`,
      `elevate-unnati`, `nain-2`, `rd-project-grant`), `GRASSROOTS_FRIENDLY_SCHEME_IDS`
      (`grassroot-innovation`, `nain-2`, `rgep`, `rd-project-grant`), the `SchemeBadge` union,
      and pure `hasSchemeBadge(schemeId, badge)`. Every listed id exists in `schemes.ts`; the
      literal `rural-innovation-center` never appears.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 10.2, 10.6, 18.2, 18.3, 18.4, 31.1, 31.2, 31.3, 38.2_
  - [x]* 3.2 Property test → `src/lib/__tests__/scheme-tagging.pbt.test.ts`
    - `// Feature: kite-inclusion-grassroots, Property 16` — `hasSchemeBadge` is true exactly
      when the id is in that badge's documented set; every id in the three sets exists in
      `Scheme_Data`; none equals `rural-innovation-center`. `{ numRuns: 100 }`.
    - _Depends: 3.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/scheme-tagging.pbt.test.ts`_
    - _Requirements: 10.2, 10.6, 18.2, 18.4, 31.2, 31.3, 38.2_

- [x] 4. Pure idea→scheme matching engine
  - [x] 4.1 Implement `src/lib/idea-scheme-matching.ts`
    - Export `SchemeMatch` (`{ schemeId, reason, weight }`), `isBengaluru(location)`,
      `matchIdeaToSchemesDetailed(idea)` (builds weighted candidates from the documented rules,
      guards every `add` against the real-id set, de-dupes by id keeping the highest weight,
      sorts by weight desc with distinct weights so ties never collide, caps at 5), and
      `matchIdeaToSchemes(idea)` (id-only projection). Rules: AgriTech → `grassroot-innovation`
      + `rd-project-grant`; Rural Development & not Bengaluru → `beyond-bengaluru-cluster-fund`;
      Rural Development & Student → `nain-2`; Rural Development & neither → `grassroot-innovation`;
      Student → `nain-2` (ahead of weaker); Student & age ≤ 30 → `rgep`; Rural Innovator →
      `grassroot-innovation` (ahead of weaker); baseline `elevate`. Pure: no React, no I/O, no
      `Math.random`, no `Date`.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13_
  - [x]* 4.2 Property test → `src/lib/__tests__/idea-scheme-matching.pbt.test.ts`
    - `// Feature: kite-inclusion-grassroots, Property 3` (≤5 ids, all real, no dups; every
      detailed entry carries a non-empty reason), `Property 4` (rule coverage + ordering of
      stronger ahead of weaker across all documented conditions, exercising age 30/31 and
      Bengaluru vs non-Bengaluru), and `Property 5` (deep-equal inputs → identical ordered
      arrays). Each `{ numRuns: 100 }`.
    - _Depends: 4.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/idea-scheme-matching.pbt.test.ts`_
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.13, 28.3_

- [x] 5. Pure public-board filter / sort / truncation
  - [x] 5.1 Implement `src/lib/ideas-board-filters.ts`
    - Export `EMPTY_IDEA_BOARD_FILTERS`; pure `filterIdeas(ideas, f)` (category AND
      innovator-type AND location equality, `null` = inactive, subset-preserving);
      `sortByMostRecent(ideas)` (stable, most-recent-first by `submittedAt`);
      `orderBoardIdeas(sessionIds, ideas)` (partition by `sessionIds`, sort each group
      most-recent-first, session group concatenated first); and `truncateSummary(summary)`
      (≤150 visible chars; identity when ≤150; otherwise a prefix + ellipsis indicator).
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 29.1, 29.2, 29.5, 29.6, 29.8_
  - [x]* 5.2 Property test → `src/lib/__tests__/ideas-board-filters.pbt.test.ts`
    - `// Feature: kite-inclusion-grassroots, Property 13` (filter sound, AND-composed, subset;
      empty filters return the full input), `Property 14` (ordering pins session ids first,
      most-recent within each group; empty session set → whole collection most-recent-first),
      and `Property 15` (truncation ≤150, identity ≤150, prefix otherwise). Each `{ numRuns: 100 }`.
    - _Depends: 5.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/ideas-board-filters.pbt.test.ts`_
    - _Requirements: 29.2, 29.5, 29.6, 29.8, 10.3, 18.5_

- [x] 6. Session-only `IdeaBankContext` and layout wiring
  - [x] 6.1 Implement `src/context/IdeaBankContext.tsx`
    - Mirror `InvestorContext` 1:1: `"use client"`; in-memory `useState<{ ideas }>` initialized
      to `[]` (no storage/network/I/O); `submitIdea(draft)` (generate id via `generateIdeaId`,
      set `id`/`ideaId`, `status: 'submitted'`, `submittedAt` ISO stamp, populate
      `matchedSchemeIds` via `matchIdeaToSchemes`, append, return the completed record);
      `updateIdeaStatus(ideaId, status)` (change only the matching idea); `removeIdea(ideaId)`
      (remove only the matching idea); `getMatchedIdeas()` (derived subset with ≥1 match);
      `IdeaBankProvider`; `useIdeaBank` (throws outside provider); `EMPTY_IDEA_BANK` fallback;
      `useOptionalIdeaBank` (returns fallback, never throws).
    - _Depends: 1.1, 2.1, 4.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  - [x] 6.2 Wire `IdeaBankProvider` into `src/app/layout.tsx`
    - Add `<IdeaBankProvider>` as the **innermost** provider, preserving the existing order
      (`LanguageProvider` → `RegistrationProvider` → `InvestorProvider` → **`IdeaBankProvider`**
      → `SiteChrome`/`main`/`Footer`/`AIAssistantButton`/`Toaster`). Purely additive; no existing
      provider or consumer altered.
    - _Depends: 6.1_
    - _Verify: `npx tsc --noEmit`; `npm run build`_
    - _Requirements: 3.9_
  - [x]* 6.3 Property test → `src/context/__tests__/idea-bank-context.pbt.test.tsx`
    - `// Feature: kite-inclusion-grassroots, Property 9` (submitIdea appends one well-formed,
      matched, stamped record; length +1; prior ideas preserved), `Property 10` (updateIdeaStatus
      changes only the target, length unchanged), `Property 11` (removeIdea drops only the target,
      length −1), and `Property 12` (getMatchedIdeas = exactly the non-empty-match subset, order
      preserved). Each `{ numRuns: 100 }`.
    - _Depends: 6.1_
    - _Verify: `npm run test:run -- src/context/__tests__/idea-bank-context.pbt.test.tsx`_
    - _Requirements: 3.4, 3.5, 3.6, 3.7, 27.2, 27.3_
  - [x]* 6.4 Component test → `src/context/__tests__/idea-bank-context.test.tsx`
    - Mount → empty `ideas`; remount → reset to empty; `useOptionalIdeaBank` outside a provider
      returns empty + no-op mutators + `getMatchedIdeas() === []`; `useIdeaBank` throws outside a
      provider.
    - _Depends: 6.1_
    - _Verify: `npm run test:run -- src/context/__tests__/idea-bank-context.test.tsx`_
    - _Requirements: 3.1, 3.2, 3.3, 3.8_

- [x] 7. Pure synthetic generators
  - [x] 7.1 Implement `src/lib/synthetic-women-founders.ts`
    - Determinism header (pure, hash-seeded from string keys only; NO `Math.random`/`Date`/
      `Date.now`/`performance.now`/ambient input). `generateWomenFounders()` → exactly 6
      `WomenFounderCard` (name, company, sector, stage, one-line pitch, initials avatar), each
      seeded by `women-founders|{i}`; byte-stable across calls.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`; probe `generateWomenFounders()` twice and deep-compare; length === 6_
    - _Requirements: 5.1, 5.5, 5.6, 5.7_
  - [x]* 7.2 Property test → `src/lib/__tests__/synthetic-women-founders.pbt.test.ts`
    - `// Feature: kite-inclusion-grassroots, Property 6` (exactly 6, each field non-empty) and
      `Property 7` (deterministic, ambient-free). `{ numRuns: 100 }`.
    - _Depends: 7.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/synthetic-women-founders.pbt.test.ts`_
    - _Requirements: 5.1, 5.5, 5.6, 5.7_
  - [x] 7.3 Implement `src/lib/synthetic-csr-partnerships.ts`
    - Same determinism header. `generateCsrPartnerships()` → exactly 6 `CsrPartnership`
      (partnerName, partnerType ∈ `CSR_PARTNER_TYPES`, focusArea, numeric `scaleCrore`,
      partnershipType), seeded by `csr-partnerships|{i}`; byte-stable.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`; probe twice and deep-compare; length === 6_
    - _Requirements: 5.2, 5.5, 5.6, 5.7_
  - [x]* 7.4 Property test → `src/lib/__tests__/synthetic-csr-partnerships.pbt.test.ts`
    - `// Feature: kite-inclusion-grassroots, Property 6` (exactly 6; `partnerType` from the four
      canonical values; non-empty focus area; numeric `scaleCrore`; partnership type) and
      `Property 7` (deterministic, ambient-free). `{ numRuns: 100 }`.
    - _Depends: 7.3_
    - _Verify: `npm run test:run -- src/lib/__tests__/synthetic-csr-partnerships.pbt.test.ts`_
    - _Requirements: 5.2, 5.5, 5.6, 5.7_
  - [x] 7.5 Implement `src/lib/synthetic-ngo-partners.ts`
    - Same determinism header. Export `NGO_PARTNER_COUNT = 4` (≥3, fixed for byte-stability) and
      `generateNgoPartners()` → `NGO_PARTNER_COUNT` `NgoPartner` (name, focus, geographicReach,
      partnershipType), seeded by `ngo-partners|{i}`; byte-stable.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`; probe twice and deep-compare; length ≥ 3_
    - _Requirements: 5.3, 5.5, 5.6, 5.7_
  - [x]* 7.6 Property test → `src/lib/__tests__/synthetic-ngo-partners.pbt.test.ts`
    - `// Feature: kite-inclusion-grassroots, Property 6` (≥3, each field non-empty) and
      `Property 7` (deterministic, ambient-free). `{ numRuns: 100 }`.
    - _Depends: 7.5_
    - _Verify: `npm run test:run -- src/lib/__tests__/synthetic-ngo-partners.pbt.test.ts`_
    - _Requirements: 5.3, 5.5, 5.6, 5.7_
  - [x] 7.7 Implement `src/lib/synthetic-csr-impact.ts`
    - Same determinism header. `generateCsrImpactMetrics()` → exactly 3 `CsrImpactMetric`
      (total CSR capital in crore, startups supported, beneficiaries reached) seeded by
      `csr-impact`; every figure via the PRNG, no `Math.random`/`Date`; byte-stable.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`; probe twice and deep-compare; length === 3_
    - _Requirements: 21.1, 21.2, 5.5, 5.6, 5.7_
  - [x]* 7.8 Property test → `src/lib/__tests__/synthetic-csr-impact.pbt.test.ts`
    - `// Feature: kite-inclusion-grassroots, Property 7` — exactly 3 metrics, deterministic,
      no ambient input. `{ numRuns: 100 }`.
    - _Depends: 7.7_
    - _Verify: `npm run test:run -- src/lib/__tests__/synthetic-csr-impact.pbt.test.ts`_
    - _Requirements: 21.1, 21.2_
  - [x] 7.9 Implement `src/lib/synthetic-ideas.ts`
    - Same determinism header. Export `getSeedIdeaCount()` (`seededInt` in `[12,18]`) and
      `generateSeedIdeas()` → that many fully-populated `IdeaSubmission` records. Each seed idea
      derives a deterministic `ideaId` via `generateIdeaId(seededRng(key), FIXED_SEED_YEAR)`,
      `matchedSchemeIds` via `matchIdeaToSchemes`, `status: 'submitted'`, and a `submittedAt`
      computed from a FIXED base epoch constant plus a seeded offset (never `Date.now`). Every
      scheme reference uses only real ids; byte-stable.
    - _Depends: 1.1, 2.1, 4.1_
    - _Verify: `npx tsc --noEmit`; probe twice and deep-compare; length in `[12,18]`_
    - _Requirements: 5.4, 5.5, 5.6, 5.7, 5.8_
  - [x]* 7.10 Property test → `src/lib/__tests__/synthetic-ideas.pbt.test.ts`
    - `// Feature: kite-inclusion-grassroots, Property 6` (12–18 inclusive; each with a
      well-formed `ideaId`, a `matchedSchemeIds` array of only real scheme ids, and all
      board-rendered fields present) and `Property 7` (deterministic, ambient-free).
      `{ numRuns: 100 }`.
    - _Depends: 7.9_
    - _Verify: `npm run test:run -- src/lib/__tests__/synthetic-ideas.pbt.test.ts`_
    - _Requirements: 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 8. Additive `illustrativeGender` on the mentor generator
  - [x] 8.1 Extend `src/lib/synthetic-mentors.ts`
    - Inside `generateMentor`, draw one additional value from the same per-mentor seeded stream
      and assign `illustrativeGender` (`genderDraw < 0.375 ? 'woman' : 'man'`) so the realized
      directory is 35–40% women. Additive only — the existing directory shape, ordering, and
      byte-stability are preserved; no `Math.random`/`Date`.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`; probe `generateMentors()` twice and deep-compare_
    - _Requirements: 6.2, 6.3_
  - [x]* 8.2 Property test → `src/lib/__tests__/synthetic-mentors-gender.pbt.test.ts`
    - `// Feature: kite-inclusion-grassroots, Property 8` (every profile gets a deterministic
      `illustrativeGender`; realized women fraction within `[0.35, 0.40]`) and `Property 7`
      (deterministic, ambient-free). `{ numRuns: 100 }`.
    - _Depends: 8.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/synthetic-mentors-gender.pbt.test.ts`_
    - _Requirements: 6.2, 6.3_

- [x] 9. Phase A checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npx tsc --noEmit`_

### Phase B — Women Founders Hub (`/women`)

- [x] 10. Women Hub sections and page
  - [x] 10.1 Implement `WomenHeroStrip` + `WomenVerifiedStatsRow` + `WomenWhyKarnataka`
    - In `src/components/women/`: `WomenHeroStrip.tsx` (server, `py-12 bg-dark`, headline +
      subhead naming the verified 25% women-led ELEVATE share and the Women-Led Accelerator,
      "Browse Women-Specific Schemes" → `/schemes`, "Explore Women-Led Accelerators" → on-page
      accelerator anchor); `WomenVerifiedStatsRow.tsx` (server, 5 verified stats — 25%, 51%
      founder-stake, 51% women-employee, ₹5cr over 5yr, ELEVATE Unnati — all without an
      `IllustrativeBadge`, the 25% stat given extra typographic weight);
      `WomenWhyKarnataka.tsx` (server, 3-column editorial on 51% founder-stake, 51%
      women-employee, and dedicated accelerator capital naming ₹5cr/5yr + KITVEN + Beyond
      Bengaluru + ELEVATE Unnati). `rounded-xl shadow-sm border` cards; `py-16 md:py-24`;
      `max-w-7xl`; Lucide icons only.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 9.1, 9.2, 9.3, 9.4, 36.7, 38.1, 38.5_
  - [x] 10.2 Implement `WomenAcceleratorProgram` + `WomenFeaturedFounders`
    - `WomenAcceleratorProgram.tsx` (server, the hero anchor target; program overview,
      eligibility for incubators hosting women-led tracks, expected outcomes, ₹5cr/5yr as
      verified data, and an Apply_CTA external `https` link to an official Karnataka portal);
      `WomenFeaturedFounders.tsx` (server, exactly 6 cards from `generateWomenFounders()` — name,
      company, sector, stage, one-line pitch, initials avatar — with exactly one
      `IllustrativeBadge` marking the section synthetic).
    - _Depends: 1.1, 7.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 38.4_
  - [x] 10.3 Implement `WomenMentors` + `WomenResources` + `WomenGetInvolved`
    - `WomenMentors.tsx` (server, exactly 3 cards from `generateMentors()` filtered to
      `illustrativeGender === 'woman'`, "See All Mentors" → `/mentors`, framing copy stating the
      labeling is illustrative and not a definitive demographic classification);
      `WomenResources.tsx` (server, exactly 3 cards — "Policy Women Framework" →
      `/policies/startup-2025-30`, "KITS Women Founders Helpdesk" with helpline + email,
      "International Women Founder Programs" → `/gia`); `WomenGetInvolved.tsx` (server, exactly 2
      cards — "I am a Woman Founder" → `/register` + `/schemes`, "I want to Support Women
      Founders" → `/mentors` + `/investors`).
    - _Depends: 1.1, 8.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 13.1, 13.2, 13.3, 14.1, 14.2, 14.3, 14.4, 15.1, 15.2, 15.3, 35.7, 6.4, 6.5_
  - [-] 10.4 Implement `WomenSchemesList` (client filter island)
    - `src/components/women/WomenSchemesList.tsx` (`"use client"`): renders women-relevant
      schemes via the `SchemeRow` pattern inside a `<Table>` with a "Women Preference" badge
      (from `hasSchemeBadge(id, 'Women Preference')`) adjacent to each flagged row; holds filter
      state in `useState` (no URL/storage), `useMemo` over `filterIdeas`-style filtering, shows a
      no-results message when zero match, and renders a "See All 22 Schemes" link to `/schemes`.
      References only real scheme ids.
    - _Depends: 3.1, 5.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  - [x] 10.5 Compose `src/app/women/page.tsx`
    - Replace the StubPage with a server shell composing, in order: `WomenHeroStrip`,
      `WomenVerifiedStatsRow`, `WomenWhyKarnataka`, `WomenSchemesList` (client island),
      `WomenAcceleratorProgram` (anchor), `WomenFeaturedFounders`, `WomenMentors`,
      `WomenResources`, `WomenGetInvolved`. Single `h1` then sequential `h2`; `max-w-7xl`;
      heavier below-the-fold grids may use `LazySection`.
    - _Depends: 10.1, 10.2, 10.3, 10.4_
    - _Verify: `npm run build` succeeds; `/women` renders all 9 sections with no stub content_
    - _Requirements: 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1, 36.1, 36.2, 36.3, 36.4, 36.5, 36.6_
  - [x]* 10.6 Component test → `src/components/women/__tests__/WomenHub.test.tsx`
    - Replaces stub; hero (`py-12 bg-dark`, 25% + accelerator, 2 CTAs); 5 verified stats verbatim
      with no badge + 25% emphasis; why-Karnataka 3 cols; 6 founders + badge; 3 women mentors +
      framing + "See All Mentors"; accelerator anchor/eligibility/Apply `https`/₹5cr; 3 resources;
      2 get-involved cards.
    - _Depends: 10.5_
    - _Verify: `npm run test:run -- src/components/women/__tests__/WomenHub.test.tsx`_
    - _Requirements: 7, 8, 9, 11, 12, 13, 14, 15, 36.7, 38.1, 38.5_
  - [x]* 10.7 Component test → `src/components/women/__tests__/WomenSchemesList.test.tsx`
    - `SchemeRow` rows; "Women Preference" badges on flagged schemes; filter shows only matching;
      zero-match no-results message; "See All 22 Schemes" → `/schemes`; only real scheme ids.
    - _Depends: 10.4_
    - _Verify: `npm run test:run -- src/components/women/__tests__/WomenSchemesList.test.tsx`_
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 11. Phase B checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npm run build`_

### Phase C — CSR & NGO Hub (`/csr`)

- [x] 12. CSR Hub sections and page
  - [-] 12.1 Implement `CsrHeroStrip` + `CsrLandscape`
    - In `src/components/csr/`: `CsrHeroStrip.tsx` (server, `py-12 bg-dark`, partnership-invitation
      headline, "Partner with KITE" → on-page partnership anchor, "Browse CSR-Aligned Programs" →
      the filtered CSR-aligned schemes); `CsrLandscape.tsx` (server, 3-column editorial — CSR
      Mandate Context with any Karnataka CSR share labeled an illustrative range; Karnataka Focus
      Areas naming rural development, women empowerment, education, healthcare, climate;
      Partnership Pathways naming direct grant, matched programs, ecosystem partnerships).
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 17.1, 17.2, 17.3, 17.4_
  - [-] 12.2 Implement `CsrFeaturedPartnerships` + `CsrNgoPartners` + `CsrImpactMetrics`
    - `CsrFeaturedPartnerships.tsx` (server, exactly 6 cards from `generateCsrPartnerships()` —
      partnerName, partnerType ∈ the four canonical values, focusArea, `scaleCrore`,
      partnershipType — with one `IllustrativeBadge`); `CsrNgoPartners.tsx` (server, ≥3 cards from
      `generateNgoPartners()` in a 3-column layout — name, focus, geographic reach, partnership
      type — with one `IllustrativeBadge`); `CsrImpactMetrics.tsx` (server, exactly 3 large stat
      cards from `generateCsrImpactMetrics()` — total CSR capital crore, startups supported,
      beneficiaries reached — with one `IllustrativeBadge`; plain stat cards, no chart).
    - _Depends: 1.1, 7.3, 7.5, 7.7_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 20.1, 20.2, 20.3, 21.1, 21.3, 38.4_
  - [-] 12.3 Implement `CsrResources`
    - `src/components/csr/CsrResources.tsx` (server, exactly 3 cards — "Karnataka CSR Framework",
      "Sample MoU Templates", "Contact CSR Team"). `rounded-xl shadow-sm border`; `py-16 md:py-24`.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 23.1, 23.2, 23.3, 23.4_
  - [x] 12.4 Implement `CsrAlignedPrograms` (client filter island)
    - `src/components/csr/CsrAlignedPrograms.tsx` (`"use client"`): renders the CSR-aligned
      programs via the `SchemeRow` pattern in a `<Table>` with a "CSR-Aligned" badge on each row
      (from `hasSchemeBadge(id, 'CSR-Aligned')`); the list includes `grassroot-innovation`,
      `elevate-unnati`, `nain-2`, and `rd-project-grant`; holds filter state in `useState`,
      shows only matching rows when filtered, and a no-results message when zero match. Real
      scheme ids only.
    - _Depends: 3.1, 5.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_
  - [-] 12.5 Implement `CsrHowToPartner` (client island with `Blob` brief download)
    - `src/components/csr/CsrHowToPartner.tsx` (`"use client"`): the partnership-anchor 3-step
      section ("Connect with KDEM Partnership Team", "Identify Aligned Programs", "Formalize
      Partnership Agreement"), a "Contact KDEM Partnership Team" `mailto` CTA, and a "Download CSR
      Partnership Brief" control that builds an in-memory `Blob` and triggers a client-side
      download via `URL.createObjectURL` (no `fetch`/network).
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 22.1, 22.2, 22.3, 33.4_
  - [x] 12.6 Compose `src/app/csr/page.tsx`
    - Replace the StubPage with a server shell composing, in order: `CsrHeroStrip`,
      `CsrLandscape`, `CsrAlignedPrograms` (client island), `CsrFeaturedPartnerships`,
      `CsrNgoPartners`, `CsrImpactMetrics`, `CsrHowToPartner` (client island, anchor),
      `CsrResources`. Single `h1` then sequential `h2`; `max-w-7xl`; below-the-fold grids may use
      `LazySection`.
    - _Depends: 12.1, 12.2, 12.3, 12.4, 12.5_
    - _Verify: `npm run build` succeeds; `/csr` renders all 8 sections with no stub content_
    - _Requirements: 16.1, 17.1, 18.1, 19.1, 20.1, 21.1, 22.1, 23.1, 36.1, 36.2, 36.3, 36.4, 36.5, 36.6_
  - [x]* 12.7 Component test → `src/components/csr/__tests__/CsrHub.test.tsx`
    - Replaces stub; hero; landscape 3 cols + illustrative CSR-share range; 6 partnerships +
      badge; ≥3 NGO + badge; 3 impact metrics + badge; how-to-partner 3 steps + `mailto`; 3
      resources.
    - _Depends: 12.6_
    - _Verify: `npm run test:run -- src/components/csr/__tests__/CsrHub.test.tsx`_
    - _Requirements: 16, 17, 19, 20, 21, 22.1, 22.2, 23_
  - [x]* 12.8 Component test → `src/components/csr/__tests__/CsrAlignedPrograms.test.tsx`
    - "CSR-Aligned" badges; includes `grassroot-innovation`/`elevate-unnati`/`nain-2`/
      `rd-project-grant`; filter shows only matching; zero-match no-results; real scheme ids only.
    - _Depends: 12.4_
    - _Verify: `npm run test:run -- src/components/csr/__tests__/CsrAlignedPrograms.test.tsx`_
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_
  - [x]* 12.9 Component test → `src/components/csr/__tests__/CsrPartnershipBrief.test.tsx`
    - "Download CSR Partnership Brief" triggers a client-side `Blob` download via
      `URL.createObjectURL`, with no `fetch`/network call.
    - _Depends: 12.5_
    - _Verify: `npm run test:run -- src/components/csr/__tests__/CsrPartnershipBrief.test.tsx`_
    - _Requirements: 22.3, 33.4_

- [x] 13. Phase C checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npm run build`_

### Phase D — Idea Bank (`/ideas`)

- [x] 14. Idea Bank form validator and client island
  - [x] 14.1 Implement `src/lib/idea-form-validation.ts`
    - Pure validator: given candidate form values, report valid iff every constraint holds —
      `innovatorName`/`innovatorEmail` present, `innovatorAge` a present numeric; `ideaTitle` ≥ 5
      chars; `ideaSummary` 50–500 inclusive; `problemStatement` and `proposedSolution` each
      50–1000 inclusive; `innovatorType`, `ideaCategory`, and `location` set. Return per-field
      messages plus a single `isValid` boolean. No React, no I/O.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 26.6, 26.7, 26.8, 26.9, 26.10, 26.11, 26.12_
  - [x]* 14.2 Property test → `src/lib/__tests__/idea-form-validation.pbt.test.ts`
    - `// Feature: kite-inclusion-grassroots, Property 17` — validity holds iff every constraint
      is satisfied, and the submit-enabled flag equals validity, exercising boundaries (title 4/5,
      summary 49/50/500/501, problem/solution 49/50/1000/1001, missing radio/dropdowns).
      `{ numRuns: 100 }`.
    - _Depends: 14.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/idea-form-validation.pbt.test.ts`_
    - _Requirements: 26.6, 26.7, 26.8, 26.9, 26.10, 26.11, 26.12_
  - [x] 14.3 Implement `IdeaSubmissionForm`
    - `src/components/ideas/IdeaSubmissionForm.tsx`: single-column `max-w-3xl` form rendering all
      10 fields (`innovatorType` as a required radio group of the 5 innovator types;
      `ideaCategory` and `location` as required dropdowns; the text fields); plain React state +
      `idea-form-validation`; submit disabled (and `aria-disabled`) while invalid, enabled when
      valid; every field with a programmatic `<label>` + `aria-describedby` constraint text; an
      `aria-live="polite"` error region. Accepts an initial `ideaCategory` (for spotlight
      pre-fill).
    - _Depends: 14.1, 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.11, 26.12, 35.1, 35.2, 35.3_
  - [x] 14.4 Implement `IdeaSuccessState`
    - `src/components/ideas/IdeaSuccessState.tsx`: green check + "Idea Submitted" headline + the
      assigned `ideaId` prominently; a "Copy ID" control; one matched scheme card per match
      (scheme name, why-it-matched reason from `matchIdeaToSchemesDetailed`, maximum benefit,
      "View Scheme" link); a no-matches message in place of cards when `matchedSchemeIds` is
      empty; "Apply to Recommended Schemes" + "Submit Another Idea" CTAs; an `aria-live` region
      announcing the id and matched-scheme count.
    - _Depends: 1.1, 4.1, 6.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 27.4, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 35.4_
  - [x] 14.5 Implement `PublicIdeasBoard`
    - `src/components/ideas/PublicIdeasBoard.tsx`: union of session ideas + seed ideas from
      `generateSeedIdeas()`, rendered as a semantic `<ul>`/`<li>`; each card shows title,
      category badge, innovator-type badge, location, relative timestamp, summary truncated via
      `truncateSummary`, and "Read More"; `IllustrativeBadge` on seed ideas; category/type/location
      filters via `filterIdeas`; default most-recent sort; session submissions pinned via
      `orderBoardIdeas` and marked "Yours"; no-results message retaining most-recent sort.
    - _Depends: 1.1, 5.1, 7.9_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 35.5, 35.6_
  - [x] 14.6 Implement `IdeaCategoriesSpotlight`
    - `src/components/ideas/IdeaCategoriesSpotlight.tsx`: exactly 8 cards in a 4×2 grid, one per
      `IdeaCategory`, each with a Lucide icon, the category name, and a count of typically-matched
      schemes; a "Submit in This Category" control that signals the chosen category to the island
      (pre-fill + scroll to form anchor).
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 30.1, 30.2, 30.3_
  - [x] 14.7 Implement `IdeaBankClient` island
    - `src/components/ideas/IdeaBankClient.tsx` (`"use client"`): consumes `useIdeaBank()`;
      holds the form/success/board view state and the spotlight-selected category; on valid
      submit calls `submitIdea` and transitions to `IdeaSuccessState`; "Submit Another Idea"
      returns to the form; composes `IdeaCategoriesSpotlight`, `IdeaSubmissionForm`,
      `IdeaSuccessState`, and `PublicIdeasBoard` so a "Submit in This Category" click pre-fills
      and scrolls to the form anchor without crossing a server/client boundary.
    - _Depends: 14.3, 14.4, 14.5, 14.6, 6.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 28.6, 30.3_

- [x] 15. Idea Bank server sections, page, and tests
  - [x] 15.1 Implement `IdeaHeroStrip` + `IdeaHowItWorks`
    - `src/components/ideas/IdeaHeroStrip.tsx` (server, `py-12 bg-dark`, grassroots-framed
      headline, "Submit Your Idea" → on-page form anchor, "Browse Recent Ideas" → on-page board
      anchor); `IdeaHowItWorks.tsx` (server, 3-column explainer — "Submit Your Idea", "Get Matched
      to Programs", "Apply for Support").
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 25.1_
  - [x] 15.2 Implement `IdeaFeaturedSchemes` + `IdeaResources`
    - `src/components/ideas/IdeaFeaturedSchemes.tsx` (server, `SchemeRow` pattern for
      `grassroot-innovation`, `nain-2`, `rgep`, `rd-project-grant` with a "Grassroots Friendly"
      badge from `hasSchemeBadge`; real ids only); `IdeaResources.tsx` (server, exactly 3 cards —
      "Grassroot Innovation Program Guide", "NAIN 2.0 for Students", "Contact KITS Innovation Cell"
      with helpline + email).
    - _Depends: 3.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 31.1, 31.2, 31.3, 32.1, 32.2, 32.3, 32.4_
  - [x] 15.3 Compose `src/app/ideas/page.tsx`
    - Replace the StubPage with a server shell composing, in order: `IdeaHeroStrip`,
      `IdeaHowItWorks`, the `IdeaBankClient` island (categories spotlight + form + success +
      board, with form and board anchors), `IdeaFeaturedSchemes`, `IdeaResources`. Single `h1`
      then sequential `h2`; `max-w-7xl`; relies on the `IdeaBankProvider` wired in 6.2.
    - _Depends: 14.7, 15.1, 15.2, 6.2_
    - _Verify: `npm run build` succeeds; `/ideas` renders all sections with no stub content_
    - _Requirements: 24.1, 25.1, 26.1, 27.1, 28.1, 29.1, 30.1, 31.1, 32.1, 36.1, 36.2, 36.3, 36.4, 36.5, 36.6_
  - [x]* 15.4 Component test → `src/components/ideas/__tests__/IdeaSubmissionForm.test.tsx`
    - Single-col `max-w-3xl`; all 10 fields; radio group of 5 innovator types; category/location
      dropdowns; submit disabled when invalid / enabled when valid; `aria-live` errors;
      `aria-disabled` submit.
    - _Depends: 14.3_
    - _Verify: `npm run test:run -- src/components/ideas/__tests__/IdeaSubmissionForm.test.tsx`_
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.11, 26.12, 35.1, 35.2, 35.3_
  - [x]* 15.5 Component test → `src/components/ideas/__tests__/IdeaSuccessState.test.tsx`
    - Green check + headline + `ideaId`; Copy ID; matched cards (name/reason/max benefit/View
      Scheme); zero-match message; Apply + Submit Another; `aria-live` announcing id + match
      count; Submit Another returns to the form.
    - _Depends: 14.4_
    - _Verify: `npm run test:run -- src/components/ideas/__tests__/IdeaSuccessState.test.tsx`_
    - _Requirements: 27.4, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 35.4_
  - [x]* 15.6 Component test → `src/components/ideas/__tests__/PublicIdeasBoard.test.tsx`
    - Union list (semantic `<ul>`); card fields incl. 150-char truncated summary + Read More;
      `IllustrativeBadge` on seed ideas; category/type/location filters; default most-recent;
      "Yours" pin; zero-match no-results retaining sort.
    - _Depends: 14.5_
    - _Verify: `npm run test:run -- src/components/ideas/__tests__/PublicIdeasBoard.test.tsx`_
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 35.5_
  - [x]* 15.7 Component test → `src/components/ideas/__tests__/IdeaBank.test.tsx`
    - Replaces stub; hero; how-it-works; categories spotlight 8 cards 4×2 + pre-fill; featured
      grassroots schemes + "Grassroots Friendly" badge; 3 resources.
    - _Depends: 15.3_
    - _Verify: `npm run test:run -- src/components/ideas/__tests__/IdeaBank.test.tsx`_
    - _Requirements: 24, 25, 30, 31, 32_

- [x] 16. Phase D checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npm run build`_

### Phase E — Integration & polish

- [x] 17. Footer/navigation integration, audits, and housekeeping
  - [x] 17.1 Add footer entries and verify navigation + home quick-actions
    - In `src/data/footer.ts` append footer links for `/women`, `/csr`, and `/ideas` under
      appropriate existing footer columns, removing/altering no existing entry. Verify
      `src/data/navigation.ts` already exposes "Women Founders" (`/women`) and "NGOs & CSR"
      (`/csr`) under For Stakeholders and "Idea Bank" (`/ideas`) under Connect — upgrade only if
      missing; remove none. Verify the home quick-actions in `src/data/quick-actions.ts` and any
      home links resolve to the three routes (no stub).
    - _Depends: 10.5, 12.6, 15.3_
    - _Verify: `npx tsc --noEmit`; `npm run build`_
    - _Requirements: 37.1, 37.2, 37.3, 37.4_
  - [x]* 17.2 Navigation/footer test → `src/app/__tests__/navigation-inclusion.test.ts`
    - Nav exposes `/women` + `/csr` under For Stakeholders and `/ideas` under Connect; footer
      gains the three links; no existing nav or footer entry removed or altered.
    - _Depends: 17.1_
    - _Verify: `npm run test:run -- src/app/__tests__/navigation-inclusion.test.ts`_
    - _Requirements: 37.1, 37.2, 37.3, 37.4_
  - [x]* 17.3 E2E → `src/app/__tests__/inclusion.e2e.test.tsx`
    - Fill form → enable submit → submit → success (id + matches) → Submit Another → board shows
      the pinned "Yours" submission; category-spotlight pre-fill → form; scheme-list filter →
      recompute.
    - _Depends: 14.7, 15.3, 10.4, 12.4_
    - _Verify: `npm run test:run -- src/app/__tests__/inclusion.e2e.test.tsx`_
    - _Requirements: 26, 27, 28, 29, 30_
  - [x]* 17.4 A11y audit (axe) → `src/app/__tests__/inclusion-a11y.test.tsx`
    - All three routes: heading order; form labels + descriptions; `aria-live` error + success
      regions; `aria-disabled` submit; semantic board list; keyboard-operable filters; mentor
      illustrative-gender framing.
    - _Depends: 10.5, 12.6, 15.3_
    - _Verify: `npm run test:run -- src/app/__tests__/inclusion-a11y.test.tsx`_
    - _Requirements: 35.1, 35.2, 35.3, 35.4, 35.5, 35.6, 35.7_
  - [x]* 17.5 Responsive audit → `src/app/__tests__/inclusion-responsive.test.tsx`
    - Hero strips, 3-col editorials, card grids, the form, the board, and the category 4×2 grid
      at mobile / tablet / desktop.
    - _Depends: 10.5, 12.6, 15.3_
    - _Verify: `npm run test:run -- src/app/__tests__/inclusion-responsive.test.tsx`_
    - _Requirements: 36.1, 36.2, 36.3, 36.4, 36.5_
  - [x]* 17.6 Perf / bundle audit → `src/app/__tests__/inclusion-perf.test.tsx`
    - Static-graph: the three route pages do not statically import recharts/chart wrappers; the
      Idea Bank island is plain React state; assert First Load JS ≤ 150KB per route
      (informational from build).
    - _Depends: 10.5, 12.6, 15.3_
    - _Verify: `npm run build` then `npm run test:run -- src/app/__tests__/inclusion-perf.test.tsx`_
    - _Requirements: 34.1, 34.2_
  - [x]* 17.7 No-IO smoke → `src/app/__tests__/inclusion-no-io.smoke.test.ts`
    - Static scan: no `fetch`/XHR/`localStorage`/`sessionStorage`/cookie/`indexedDB` in the three
      routes, the context, and the libs; generators + matching engine + id generator reference no
      `Math.random` or time/date source; the CSR brief uses `Blob` (no network); the literal
      `rural-innovation-center` appears nowhere.
    - _Depends: 10.5, 12.6, 15.3_
    - _Verify: `npm run test:run -- src/app/__tests__/inclusion-no-io.smoke.test.ts`_
    - _Requirements: 33.1, 33.2, 33.3, 33.4, 4.12, 5.6, 38.2_
  - [x]* 17.8 Visual-discipline smoke → `src/app/__tests__/inclusion-visual.test.ts`
    - Source scan: no gradient/blob/emoji/glassmorphism/glow classes; no `text-h4`; cards use
      `rounded-xl`/`shadow-sm`/border; sections `py-16 md:py-24`; header strips `py-8`/`py-12`;
      `max-w-7xl`.
    - _Depends: 10.5, 12.6, 15.3_
    - _Verify: `npm run test:run -- src/app/__tests__/inclusion-visual.test.ts`_
    - _Requirements: 36.1, 36.2, 36.3, 36.4, 36.5, 36.6_
  - [x] 17.9 Bundle-discipline housekeeping
    - Confirm only the scheme-list filters, the CSR brief download, and the Idea Bank form/board
      are client islands; every hero/editorial/resources/get-involved/featured/impact section is
      a Server Component; no route eagerly imports a chart (charts only via the dynamic barrel);
      heavier below-the-fold grids use `LazySection`. Grep to confirm no recharts/heavy-dep leak
      into any route's initial bundle.
    - _Depends: 10.5, 12.6, 15.3_
    - _Verify: `npm run build`; inspect First Load JS per route ≤ 150KB_
    - _Requirements: 34.1, 34.2_

- [x] 18. Final checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run`, `npx tsc --noEmit`, `npm run lint`, `npm run build`_

## Notes

- Tasks marked `*` are optional for a fast MVP but required for full conformance; they hold the
  17 Correctness Properties (one PBT each, `fast-check`, `{ numRuns: 100 }`, tagged
  `// Feature: kite-inclusion-grassroots, Property {n}`) plus component/e2e/a11y/responsive/perf/
  smoke coverage, in the exact files from the design's Test architecture table.
- Phase A is the hard prerequisite for B/C/D/E: types → everything; the id generator + matching
  engine → `IdeaBankContext` and `synthetic-ideas`; `scheme-tagging` → the three scheme lists;
  `ideas-board-filters` → the public board and the filter islands; the synthetic generators →
  the featured grids and the seed board; the mentor `illustrativeGender` extension → the Women
  Hub mentor section.
- Frontend-only / session-only throughout: no backend, DB, API, network/`fetch`, or persistence;
  the `IdeaBankContext` `ideas` array is in-memory React state that resets on refresh; the CSR
  `Blob` brief download is the only permitted output.
- Verified Karnataka data is canonical and reproduced exactly (25% women-led ELEVATE; 51%
  founder-stake and 51% women-employee thresholds; ₹5cr Women-Led Accelerator grant over 5yr;
  ELEVATE Unnati; exactly 22 schemes). All scheme references — including every engine match — use
  only real ids; there is NO `rural-innovation-center` (grassroot/rural references map to
  `grassroot-innovation`).
- All synthetic figures (founders, partnerships, NGO partners, seed ideas, CSR impact, mentor
  gender) are deterministic, hash-seeded via `synthetic-prng` (no `Math.random`/`Date`/
  `Date.now`/`performance.now`), and labeled illustrative via `IllustrativeBadge`; all CSR
  aggregate numbers are illustrative.
- Type extensions are additive only; `MentorProfile` gains exactly one optional
  `illustrativeGender` field and no existing export is altered or removed.
- Bundle discipline is first-class: server-first composition with three small client islands,
  plain-React form state, plain CSR stat cards (no chart), `LazySection` for heavy below-the-fold
  grids, and ≤ 150KB First Load JS per route asserted by the perf audit.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "3.1", "4.1", "5.1", "7.1", "7.3", "7.5", "7.7", "8.1", "10.1", "12.1", "12.3", "12.5", "14.1", "14.6", "15.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.2", "5.2", "7.2", "7.4", "7.6", "7.8", "8.2", "6.1", "7.9", "10.2", "10.3", "10.4", "12.2", "12.4", "12.9", "14.2", "14.3", "15.2"] },
    { "id": 3, "tasks": ["6.2", "6.3", "6.4", "7.10", "10.5", "10.7", "12.6", "12.8", "14.4", "14.5", "15.4"] },
    { "id": 4, "tasks": ["14.7", "10.6", "12.7", "15.5", "15.6"] },
    { "id": 5, "tasks": ["15.3"] },
    { "id": 6, "tasks": ["15.7", "17.1", "17.3", "17.4", "17.5", "17.6", "17.7", "17.8", "17.9"] },
    { "id": 7, "tasks": ["17.2"] }
  ]
}
```
