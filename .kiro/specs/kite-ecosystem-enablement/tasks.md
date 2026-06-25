# Implementation Plan: KITE Ecosystem Enablement Layer (Prompt 5)

## Overview

This plan implements the Ecosystem Enablement Layer — the bridge between the founder side
(registration, schemes, dashboards — Prompts 2–3) and the investor side (Investor Suite —
Prompt 4) — on top of the existing Next.js 14 / App Router / TypeScript-strict project, exactly
as specified in `design.md` and satisfying all 17 requirements. It adds **four routes**:
`/incubators` (filterable index + illustrative detail), `/programs/kan` (editorial), `/programs/k-combinator`
(editorial), and `/mentors` (synthetic directory + detail). It is dependency-ordered into the five
founder-fixed phases:

- **Phase A — Foundation.** Additive types appended to `src/types/index.ts`; the two verified
  program-data modules (`kan-program.ts`, `k-combinator-program.ts`); the pure hash-seeded synthetic
  generators (`synthetic-mentors.ts`, `synthetic-incubator-detail.ts`, and the success-stories
  generator); the pure filter modules (`incubator-filters.ts`, `mentor-filters.ts`) and `deriveInitials`.
  Hard prerequisite for B/C/D/E.
- **Phase B — Incubators Index + Detail.** Header strip, filter bar, card grid, card, detail panel,
  and the `/incubators` client island page.
- **Phase C — KAN + K-Combinator editorial pages.** The shared `ProgramEditorial` component + the
  seven section components, the two static route segments `app/programs/kan/page.tsx` and
  `app/programs/k-combinator/page.tsx`, with a lazy success-stories section.
- **Phase D — Mentor Connect.** Directory header, filter bar, card grid, card, detail panel, and the
  `/mentors` client island page.
- **Phase E — Integration & polish.** Navigation (add the `/programs/kan` entry), e2e, a11y,
  responsive, perf/bundle, and no-IO smoke audits; bundle housekeeping; final checkpoint.

The 10 Correctness Properties are folded in as one property-based test each (`fast-check`,
`{ numRuns: 100 }`), tagged `// Feature: kite-ecosystem-enablement, Property {n}`, placed in the phase
where the code under test is built, in the exact test files from the design's Test architecture table.
Test sub-tasks are marked `*` (optional for a fast MVP, required for full conformance).

**Operating discipline carried into every task:** frontend-only / session-only (no backend, DB, API,
network/`fetch`, or persistence — only in-memory React state; blob downloads the sole permitted output).
Verified Karnataka ecosystem data is canonical and never fabricated (164+ incubators/accelerators with
24 representative verified records; KAN 6-month cohorts / 306 startups over 3 years; the full verified
K-Combinator spec — KDEM + TiE Mangaluru, wrkwrk in Silicon Beach Mangaluru, 4–6 startups/cohort,
3 cohorts/year, 90 startups over 5 years, target 5 soonicorns by 2034, exact nine sectors, ₹10 lakh per
qualifying startup at 0% equity, ₹9.5 crore from GoK + ₹50 lakh in-kind from TiE; canonical counts —
22 schemes, 20 sectors, 6 clusters, 6 flagship programs, 32 GIA countries, 21,000+ DPIIT startups,
183 soonicorns, $79 billion raised, 46% VC share). All non-verified figures are synthetic, deterministic
(hash-seeded via `synthetic-prng`, never `Math.random` / `Date` / time), and visibly labeled via
`IllustrativeBadge`. Type extensions are additive only. WCAG 2.1 AA throughout. First Load JS ≤ 150KB per
route. Charts (if ever added) only via the dynamic chart barrel.

**Verify commands:** `npx tsc --noEmit` (types), `npm run lint`, `npm run test:run -- <file>` (single
file), `npm run test:run` (full suite), `npm run build` (bundle).

## Tasks

### Phase A — Foundation

- [x] 1. Additive enablement-layer types
  - [x] 1.1 Append enablement-layer types to `src/types/index.ts`
    - Append, after the Investor Suite block (never alter/remove an existing export): `MentorType` +
      `MENTOR_TYPES`, `MentorAvailability` + `MENTOR_AVAILABILITY`, `ExperienceLevel`, `MentorProfile`,
      `IncubatorDetail`, `IncubatorFilters`, `MentorFilters`, `ExperienceBand`, `ProgramApplyCta`,
      `ProgramCohortStructure`, `ProgramEditorialData`, `ProgramSuccessStory` (exact shapes from design
      Data Models). Reuse existing `Incubator` / `IncubatorType` — do not redefine. Must compile under
      `strict` + `noUncheckedIndexedAccess`.
    - _Depends: none (wave 0)_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  - [x]* 1.2 Type-compile guard → `src/app/__tests__/enablement-types.test-d.ts`
    - Assert the new types compile and that existing `Incubator`/`IncubatorType` (and other prior
      exports) are unchanged and still assignable.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 2. Verified program-data modules
  - [x] 2.1 Implement `src/data/kan-program.ts`
    - Export a single `ProgramEditorialData` built verbatim from verified KAN facts: `slug: 'kan'`,
      name, declarative third-person overview, `provides[]`, `cohortStructure` (cadence "6-month
      acceleration cohorts"), `verifiedFigures` including "6-month acceleration cohorts" and
      "306 startups supported over 3 years", `applicationSteps[]`, `partnerIncubatorIds[]` (ids into
      `incubators.ts`), `applyCta` (external `https` Karnataka portal), `successStoriesSeed:
      'kan|success-stories'`. No superlatives/exclamation/urgency copy.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 4.2, 4.3, 4.4, 4.7, 4.8, 11.1, 11.2_
  - [x] 2.2 Implement `src/data/k-combinator-program.ts`
    - Export a single `ProgramEditorialData` carrying the full verified K-Combinator constant set:
      KDEM + TiE Mangaluru partnership; located at wrkwrk in Silicon Beach Mangaluru; 4–6 startups per
      cohort; 3 cohorts per year; 90 startups over 5 years; target 5 soonicorns by 2034; the exact nine
      sectors (Deep Tech, Space, Drone, AI, Robotics, HealthTech, AgriTech, FinTech, MarineTech) as a
      program-specific verified `string[]` in `sectors`; grant ₹10 lakh per qualifying startup at 0%
      equity; 5-year budget ₹9.5 crore from GoK plus ₹50 lakh in-kind from TiE; `applyCta` external
      `https`; `successStoriesSeed: 'k-combinator|success-stories'`. Declarative third-person copy only.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.13, 5.14, 11.1, 11.2_

- [x] 3. Pure filter modules and `deriveInitials`
  - [x] 3.1 Implement `src/lib/incubator-filters.ts`
    - `EMPTY_INCUBATOR_FILTERS`; `deriveClusterOptions(data)` (distinct clusters in source order);
      `deriveFocusOptions(data)` (distinct values across all `focus[]`); pure
      `filterIncubators(data, filters)` (cluster equality AND focus membership AND type equality, `null`
      = inactive, subset-preserving); `describeActiveFilters(filters)` (one human line per active filter).
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 2.9, 2.10_
  - [x] 3.2 Implement `src/lib/mentor-filters.ts` (incl. `deriveInitials`)
    - `EXPERIENCE_BANDS` (emerging 2–7, established 8–15, veteran 16+); `EMPTY_MENTOR_FILTERS`; pure
      `filterMentors(mentors, filters)` (sector membership AND mentorType equality AND yearsExperience
      within the selected band's `[min,max]`, `null` = inactive, subset-preserving);
      `describeActiveMentorFilters(filters)`; and `deriveInitials(name)` returning 1–2 uppercase letters
      from the first up-to-two whitespace tokens (no image reference; usable as avatar text alternative).
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 8.2, 14.7_
  - [x]* 3.3 Property tests → `src/lib/__tests__/incubator-filters.pbt.test.ts`
    - `// Feature: kite-ecosystem-enablement, Property 5` (options equal distinct values, no dups, none
      omitted), `Property 6` (filtering sound, AND-composed, subset), `Property 8` (empty filters return
      full set), `Property 9` (count = result length, bounded `[0, n]`, empty-state names active
      filters). Each `{ numRuns: 100 }`.
    - _Depends: 3.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/incubator-filters.pbt.test.ts`_
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 2.9, 2.10, 2.11_
  - [x]* 3.4 Property tests → `src/lib/__tests__/mentor-filters.pbt.test.ts`
    - `// Feature: kite-ecosystem-enablement, Property 7` (filtering sound incl. experience band,
      AND-composed, subset), `Property 8` (empty filters return full set), `Property 9` (count = result
      length, bounded, empty-state names active filters). Each `{ numRuns: 100 }`.
    - _Depends: 3.2_
    - _Verify: `npm run test:run -- src/lib/__tests__/mentor-filters.pbt.test.ts`_
    - _Requirements: 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_
  - [x]* 3.5 Property test → `src/lib/__tests__/derive-initials.pbt.test.ts`
    - `// Feature: kite-ecosystem-enablement, Property 4` — for any non-empty name, `deriveInitials`
      returns 1–2 uppercase letters equal to the first letters of the first up-to-two whitespace tokens,
      contains no image reference, and is suitable as the avatar text alternative. `{ numRuns: 100 }`.
    - _Depends: 3.2_
    - _Verify: `npm run test:run -- src/lib/__tests__/derive-initials.pbt.test.ts`_
    - _Requirements: 8.2, 14.7_

- [x] 4. Pure synthetic generators
  - [x] 4.1 Implement `src/lib/synthetic-mentors.ts`
    - Determinism contract in the header (pure, hash-seeded from string keys only; NO `Math.random`,
      `Date`, `Date.now`, `performance.now`, locale, or ambient input). `getMentorCount()` →
      `seededInt` in `[24,30]`; `generateMentors()` → byte-stable `MentorProfile[]`; `generateMentor(key)`
      deriving name, `initialsAvatar` via `deriveInitials`, title, firm, 1–3 sectors drawn from the 20
      canonical `sectors.ts` ids, positive-integer `yearsExperience`, `mentorType` from `MENTOR_TYPES`,
      `availability` from `MENTOR_AVAILABILITY`, one-paragraph illustrative third-person bio, and stable
      `id`.
    - _Depends: 1.1, 3.2_
    - _Verify: `npx tsc --noEmit`; probe `generateMentors()` twice and deep-compare; length in `[24,30]`_
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  - [x] 4.2 Implement `src/lib/synthetic-incubator-detail.ts`
    - Same determinism contract, seeded ONLY by the incubator id. `generateIncubatorDetail(incubatorId)`
      → `IncubatorDetail` with templated `aboutParagraph`, `cohortsPerYear` (`seededInt 1..4`),
      `startupsSupported` (`seededInt 20..240`), `illustrativeOfferings` (seeded shuffle/slice of a fixed
      pool), and a fixed `illustrativeContactLabel` (never a real address). Verified fields are NOT part
      of this shape.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`; probe same id twice and deep-compare (byte-identical)_
    - _Requirements: 3.3, 3.6_
  - [x] 4.3 Implement `src/lib/synthetic-program-stories.ts`
    - Same determinism contract. `generateSuccessStories(seed)` → `ProgramSuccessStory[]` (illustrative,
      declarative third-person `outcomeLine`s; `startupName`/`sector` seeded from canonical pools),
      byte-stable for a fixed seed. Consumed by the editorial success-stories section.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`; probe same seed twice and deep-compare_
    - _Requirements: 4.5, 5.11, 11.3_
  - [x]* 4.4 Property tests → `src/lib/__tests__/synthetic-mentors.pbt.test.ts`
    - `// Feature: kite-ecosystem-enablement, Property 1` (deterministic & ambient-free — identical
      `MentorProfile[]` on every call), `Property 2` (cardinality in `[24,30]`), `Property 3` (every
      profile well-formed: non-empty name/title/firm/bio, sectors non-empty subset of the 20 canonical
      ids, positive-integer years, mentorType and availability from canonical sets). Each `{ numRuns: 100 }`.
    - _Depends: 4.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/synthetic-mentors.pbt.test.ts`_
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 11.3_
  - [x]* 4.5 Property test → `src/lib/__tests__/synthetic-incubator-detail.pbt.test.ts`
    - `// Feature: kite-ecosystem-enablement, Property 1` — for any incubator id, `generateIncubatorDetail`
      returns deep-equal (byte-identical) output on every call, with no dependence on `Math.random`/`Date`/
      ambient input, and all numeric fields within declared ranges. `{ numRuns: 100 }`.
    - _Depends: 4.2_
    - _Verify: `npm run test:run -- src/lib/__tests__/synthetic-incubator-detail.pbt.test.ts`_
    - _Requirements: 3.3, 3.6, 11.3_
  - [x]* 4.6 Property test → `src/lib/__tests__/verified-data-integrity.pbt.test.ts`
    - `// Feature: kite-ecosystem-enablement, Property 10` — for any incubator record passed through
      `filterIncubators`/detail lookup, `name`/`cluster`/`type` are unaltered character-for-character and
      `focus[]` produces exactly one tag per entry in stored order (never altered or reordered).
      `{ numRuns: 100 }`.
    - _Depends: 3.1, 4.2_
    - _Verify: `npm run test:run -- src/lib/__tests__/verified-data-integrity.pbt.test.ts`_
    - _Requirements: 1.3, 3.2, 11.1_

- [x] 5. Phase A checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npx tsc --noEmit`_

### Phase B — Incubators Index + Detail

- [x] 6. Incubators Index + Detail
  - [x] 6.1 Implement `IncubatorsHeaderStrip` + `IncubatorCard` + `IncubatorCardGrid`
    - `src/components/incubators/IncubatorsHeaderStrip.tsx` (py-8/py-12 strip stating Karnataka hosts
      164+ incubators/accelerators and a visible "representative verified subset" label for the 24
      entries); `IncubatorCard.tsx` (name, cluster, type, one tag per `focus[]` entry verbatim;
      `rounded-xl shadow-sm border`; focusable, pointer + Enter/Space activatable); `IncubatorCardGrid.tsx`
      (one card per record; `max-w-7xl`, responsive grid).
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 15.1, 15.2, 15.3_
  - [x] 6.2 Implement `IncubatorFilterBar` + `IncubatorEmptyState`
    - `IncubatorFilterBar.tsx` (cluster select from `deriveClusterOptions`, focus select from
      `deriveFocusOptions`, type select with `Incubator`/`Accelerator`/`Research Park`, clear-all; each
      control with a visible `<label>` + accessible name; `aria-live="polite"` matching-count region);
      `IncubatorEmptyState.tsx` (names each active filter's dimension and selected value).
    - _Depends: 3.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 2.1, 2.2, 2.3, 2.8, 2.10, 2.11, 14.2, 14.4, 14.6_
  - [x] 6.3 Implement `IncubatorDetailPanel`
    - `IncubatorDetailPanel.tsx` (conditional, at most one open): renders the selected record's verified
      `name`/`cluster`/`type`/`focus` tags verbatim with NO badge; renders the synthetic sections from
      `generateIncubatorDetail(id)` each wrapped in exactly one `IllustrativeBadge`; close control +
      Escape; null-guards an unknown id (no-op, never enters Detail_Open_State).
    - _Depends: 4.2_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.8, 14.3, 14.5_
  - [x] 6.4 Compose `src/app/incubators/page.tsx` (client island)
    - Replace the StubPage with a `"use client"` island holding `IncubatorFilters` in `useState`
      (no URL/storage); `useMemo` over `filterIncubators` keyed on filters; update the `aria-live` count;
      conditionally render `IncubatorDetailPanel` for `openDetailId`; closing the panel clears only
      `openDetailId`, preserving filters. `max-w-7xl`, section padding.
    - _Depends: 6.1, 6.2, 6.3, 3.1_
    - _Verify: `npm run build` succeeds; `/incubators` renders 24 cards with no stub content_
    - _Requirements: 1.1, 1.6, 2.7, 2.8, 2.9, 3.1, 3.7, 12.3, 12.4, 13.1_
  - [x]* 6.5 Component test → `src/components/incubators/__tests__/IncubatorsIndex.test.tsx`
    - Replaces stub; 24 cards; "164+" text + representative-subset label; card fields/treatment;
      filter labels; `aria-live` count updates; empty-state names active filters.
    - _Depends: 6.4_
    - _Verify: `npm run test:run -- src/components/incubators/__tests__/IncubatorsIndex.test.tsx`_
    - _Requirements: 1, 2.3, 2.8, 2.10, 2.11, 15_
  - [x]* 6.6 Component test → `src/components/incubators/__tests__/IncubatorDetailPanel.test.tsx`
    - Open via click and Enter/Space; ≤1 open; verified fields verbatim; `IllustrativeBadge` only on
      synthetic sections; close (control + Escape) preserves filters; unknown id is a no-op.
    - _Depends: 6.3, 6.4_
    - _Verify: `npm run test:run -- src/components/incubators/__tests__/IncubatorDetailPanel.test.tsx`_
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.7, 3.8_

- [x] 7. Phase B checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npm run build`_

### Phase C — KAN + K-Combinator editorial pages

- [x] 8. Editorial program pages
  - [x] 8.1 Implement the six verified section components
    - In `src/components/programs/`: `ProgramOverviewSection`, `ProgramProvidesSection`,
      `CohortStructureSection`, `ApplicationProcessSection`, `PartnerIncubatorsSection` (resolves
      `partnerIncubatorIds` against `incubators.ts`), `ApplyCtaSection` (external `https` CTA, the only
      call-to-action). All driven by `ProgramEditorialData`; declarative third-person copy; NO
      `IllustrativeBadge` (verified-only); sequential `h2` headings; section landmarks with `aria-label`.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 4.2, 4.6, 4.7, 4.8, 5.2, 5.12, 5.13, 5.14, 11.1, 14.1, 14.5_
  - [x] 8.2 Implement `SuccessStoriesSection` (synthetic, lazy)
    - `src/components/programs/SuccessStoriesSection.tsx` renders `generateSuccessStories(data.successStoriesSeed)`
      wrapped in `LazySection` (reserved minHeight, no CLS) with exactly one `IllustrativeBadge` marking
      the whole section.
    - _Depends: 4.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 4.5, 5.11, 13.3_
  - [x] 8.3 Implement `ProgramEditorial` composition
    - `src/components/programs/ProgramEditorial.tsx` (server component, props `ProgramEditorialData`)
      composing the seven sections in fixed order: overview, provides, cohort structure, application
      process, success stories (lazy), partner incubators/accelerators, Apply CTA.
    - _Depends: 8.1, 8.2_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 4.2, 5.2_
  - [x] 8.4 Implement `src/app/programs/kan/page.tsx`
    - New static route segment: `return <ProgramEditorial data={kanProgram} />;`. Resolves the editorial
      page (not the dynamic `[slug]` humanized stub). Leaves `app/programs/[slug]/page.tsx` untouched.
    - _Depends: 8.3, 2.1_
    - _Verify: `npm run build` succeeds; `/programs/kan` renders editorial (6-month + 306) not stub_
    - _Requirements: 4.1, 4.3, 4.4, 13.1_
  - [x] 8.5 Implement `src/app/programs/k-combinator/page.tsx`
    - New static route segment: `return <ProgramEditorial data={kCombinatorProgram} />;`, replacing the
      StubPage reached via `[slug]`. Leaves `app/programs/[slug]/page.tsx` untouched.
    - _Depends: 8.3, 2.2_
    - _Verify: `npm run build` succeeds; `/programs/k-combinator` renders the verified K-Combinator spec_
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 13.1_
  - [x]* 8.6 Component test → `src/components/programs/__tests__/ProgramEditorial.test.tsx`
    - Seven ordered sections; KAN 6-month + 306; K-Combinator KDEM/TiE, wrkwrk, 4–6/3-per-yr, 90/5yr,
      5 soonicorns 2034, exact nine sectors, ₹10L@0%, ₹9.5Cr + ₹50L; success-stories badge present;
      verified sections badge-free; external `https` Apply CTA.
    - _Depends: 8.3_
    - _Verify: `npm run test:run -- src/components/programs/__tests__/ProgramEditorial.test.tsx`_
    - _Requirements: 4, 5, 11.5_
  - [x]* 8.7 Integration test → `src/app/__tests__/programs-routing.test.tsx`
    - `/programs/kan` and `/programs/k-combinator` resolve to editorial pages (not the stub); any other
      `/programs/<slug>` still falls through to the existing humanized stub.
    - _Depends: 8.4, 8.5_
    - _Verify: `npm run test:run -- src/app/__tests__/programs-routing.test.tsx`_
    - _Requirements: 4.1, 5.1_

- [x] 9. Phase C checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npm run build`_

### Phase D — Mentor Connect

- [x] 10. Mentor Connect directory + Detail
  - [x] 10.1 Implement `MentorDirectoryHeaderStrip` + `MentorCard` + `MentorCardGrid`
    - `src/components/mentors/MentorDirectoryHeaderStrip.tsx` (py-8/py-12 strip with exactly one
      directory-level `IllustrativeBadge` marking the whole directory synthetic; declarative
      third-person copy); `MentorCard.tsx` (name, initials-avatar placeholder with text alternative
      equal to the name, title, firm, sectors, years, mentorType, availability; `rounded-xl shadow-sm
      border`; focusable + Enter/Space activatable); `MentorCardGrid.tsx` (one card per `MentorProfile`,
      `max-w-7xl`, responsive grid).
    - _Depends: 4.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 8.2, 8.9, 14.7, 15.1, 15.2, 15.3_
  - [x] 10.2 Implement `MentorFilterBar` + `MentorEmptyState`
    - `MentorFilterBar.tsx` (sector select from the 20 canonical sectors, mentorType select with the
      four values, experience-level select from `EXPERIENCE_BANDS`, clear-all; each with a visible
      `<label>` + accessible name; `aria-live="polite"` matching-count region); `MentorEmptyState.tsx`
      (names the active filters).
    - _Depends: 3.2_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 9.1, 9.2, 9.3, 9.9, 9.10, 14.2, 14.4, 14.6_
  - [x] 10.3 Implement `MentorDetailPanel`
    - `MentorDetailPanel.tsx` (conditional): displays name, initials-avatar, title, firm, sectors,
      years, mentorType, availability, and the one-paragraph bio, with an `IllustrativeBadge` (all
      mentor content is synthetic); close control + Escape returns to prior state.
    - _Depends: 4.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 14.3, 14.5_
  - [x] 10.4 Compose `src/app/mentors/page.tsx` (client island)
    - Replace the StubPage with a `"use client"` island that generates the directory once
      (`generateMentors()`), holds `MentorFilters` in `useState` (no URL/storage), `useMemo` over
      `filterMentors` keyed on filters + the once-generated directory, updates the `aria-live` count, and
      conditionally renders `MentorDetailPanel` for `openDetailId`; closing clears only `openDetailId`.
      `max-w-7xl`, section padding.
    - _Depends: 10.1, 10.2, 10.3, 3.2, 4.1_
    - _Verify: `npm run build` succeeds; `/mentors` renders one card per mentor with no stub content_
    - _Requirements: 6.1, 6.4, 9.7, 9.8, 10.1, 10.4, 12.3, 12.4, 13.1_
  - [x]* 10.5 Component test → `src/components/mentors/__tests__/MentorConnect.test.tsx`
    - Replaces stub; exactly one directory-level badge; one card per mentor; card fields/treatment;
      filter labels; `aria-live` count updates; empty-state names active filters.
    - _Depends: 10.4_
    - _Verify: `npm run test:run -- src/components/mentors/__tests__/MentorConnect.test.tsx`_
    - _Requirements: 6, 8.9, 9.1, 9.2, 9.3, 9.9, 9.10, 15_
  - [x]* 10.6 Component test → `src/components/mentors/__tests__/MentorDetailPanel.test.tsx`
    - Open detail; all fields + bio rendered; `IllustrativeBadge` present; close preserves prior
      No_Filter/Filtered state.
    - _Depends: 10.3, 10.4_
    - _Verify: `npm run test:run -- src/components/mentors/__tests__/MentorDetailPanel.test.tsx`_
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 11. Phase D checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npm run build`_

### Phase E — Integration & polish

- [x] 12. Navigation, audits, and housekeeping
  - [x] 12.1 Add the KAN navigation entry in `src/data/navigation.ts`
    - Append `{ label: 'KAN — Karnataka Acceleration Network', href: '/programs/kan' }` under Schemes &
      Benefits (alongside K-Combinator). Keep the existing `/incubators`, `/mentors`, and
      `/programs/k-combinator` entries; remove none.
    - _Depends: 8.4_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  - [x]* 12.2 Navigation test → `src/app/__tests__/navigation-enablement.test.ts`
    - Nav keeps `/incubators`, `/mentors`, `/programs/k-combinator`; adds `/programs/kan`; removes no
      existing entry.
    - _Depends: 12.1_
    - _Verify: `npm run test:run -- src/app/__tests__/navigation-enablement.test.ts`_
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  - [x]* 12.3 E2E → `src/app/__tests__/enablement.e2e.test.tsx`
    - For both directories: filter → grid recompute → open detail → close → filters preserved.
    - _Depends: 6.4, 10.4_
    - _Verify: `npm run test:run -- src/app/__tests__/enablement.e2e.test.tsx`_
    - _Requirements: 2, 3, 9, 10_
  - [x]* 12.4 A11y audit (axe) → `src/app/__tests__/enablement-a11y.test.tsx`
    - All four routes: heading order, control names, keyboard operability, filter labels, region
      `aria-label`s, `aria-live` counts, initials-avatar text alternatives.
    - _Depends: 6.4, 8.4, 8.5, 10.4_
    - _Verify: `npm run test:run -- src/app/__tests__/enablement-a11y.test.tsx`_
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_
  - [x]* 12.5 Responsive audit → `src/app/__tests__/enablement-responsive.test.tsx`
    - Header strips / filter bars / card grids / detail panels and editorial sections at mobile / tablet
      / desktop.
    - _Depends: 6.4, 8.4, 10.4_
    - _Verify: `npm run test:run -- src/app/__tests__/enablement-responsive.test.tsx`_
    - _Requirements: 13.1, 15.1, 15.2, 15.3_
  - [x]* 12.6 Perf / bundle audit → `src/app/__tests__/enablement-perf.test.tsx`
    - Static-graph: the four route pages do not statically import recharts/chart wrappers; success-stories
      is lazy; assert First Load JS ≤ 150KB per route (informational from build).
    - _Depends: 8.4, 8.5, 6.4, 10.4_
    - _Verify: `npm run build` then `npm run test:run -- src/app/__tests__/enablement-perf.test.tsx`_
    - _Requirements: 13.1, 13.2, 13.3_
  - [x]* 12.7 No-IO smoke → `src/app/__tests__/enablement-no-io.smoke.test.ts`
    - Static scan: no `fetch`/XHR/`localStorage`/`sessionStorage`/cookie/`indexedDB` in the enablement
      slice source; the synthetic generators reference no `Math.random` or time/date source; Apply CTAs
      are external `https`.
    - _Depends: 6.4, 8.4, 8.5, 10.4_
    - _Verify: `npm run test:run -- src/app/__tests__/enablement-no-io.smoke.test.ts`_
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  - [x] 12.8 Bundle-discipline housekeeping
    - Confirm the editorial success-stories section is the only deferred-heavy section and is wrapped in
      `LazySection`; no route eagerly imports a chart (charts, if ever added, only via the dynamic
      barrel); the four directory/editorial pages ship only filter UI + in-memory data. Grep to confirm
      no recharts/deep-wrapper leak into any route's initial bundle.
    - _Depends: 6.4, 8.4, 8.5, 10.4_
    - _Verify: `npm run build`; inspect First Load JS per route ≤ 150KB_
    - _Requirements: 13.1, 13.2, 13.3_

- [x] 13. Final checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run`, `npx tsc --noEmit`, `npm run lint`, `npm run build`_

## Notes

- Tasks marked `*` are optional for a fast MVP but required for full conformance; they hold the 10
  Correctness Properties (one PBT each, `fast-check`, `{ numRuns: 100 }`, tagged
  `// Feature: kite-ecosystem-enablement, Property {n}`) plus component/integration/e2e/a11y/responsive/
  perf/smoke coverage, in the exact files from the design's Test architecture table.
- Phase A is the hard prerequisite for B/C/D/E (types → everything; filters + `deriveInitials` →
  directories; synthetic generators → mentor directory, incubator detail, and editorial success
  stories; verified program-data modules → editorial pages).
- Verified Karnataka data is canonical and never fabricated; all non-verified figures are synthetic,
  deterministic (hash-seeded via `synthetic-prng`, no `Math.random`/`Date`/time), and labeled
  illustrative via `IllustrativeBadge`.
- Bundle discipline is first-class: the editorial success-stories section is lazy via `LazySection`;
  no route imports a chart eagerly (charts only through the dynamic barrel); the perf audit asserts
  ≤ 150KB First Load JS per route.
- Type extensions are additive only; existing `Incubator`/`IncubatorType` and all prior exports remain
  unchanged. The editorial pages use dedicated static route segments, leaving `programs/[slug]/page.tsx`
  untouched.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "2.2", "3.1", "3.2", "4.2", "4.3", "6.1", "8.1"] },
    { "id": 2, "tasks": ["3.3", "3.4", "3.5", "4.1", "4.5", "4.6", "6.2", "6.3", "8.2", "10.2"] },
    { "id": 3, "tasks": ["4.4", "6.4", "8.3", "10.1", "10.3"] },
    { "id": 4, "tasks": ["6.5", "6.6", "8.4", "8.5", "8.6", "10.4"] },
    { "id": 5, "tasks": ["8.7", "10.5", "10.6", "12.1", "12.3", "12.4", "12.5", "12.6", "12.7", "12.8"] },
    { "id": 6, "tasks": ["12.2"] }
  ]
}
```
