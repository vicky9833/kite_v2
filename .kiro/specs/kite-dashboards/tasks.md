# Implementation Plan: KITE Dashboards (Prompt 3)

## Overview

This plan implements the two dashboard surfaces (`/dashboard/startup`, `/dashboard/admin`) and their
shared infrastructure on top of the existing KITE Next.js 14 app, exactly as specified in `design.md`
and satisfying all 30 requirements. It is dependency-ordered into the four founder-fixed phases:

- **Phase A — Foundation.** Additive types, shared pure PRNG, the two deterministic synthetic-data
  modules, recommendations + completeness, startup selectors, and the code-split chart-wrapper
  architecture (wrappers + shared primitives + dynamic barrel). Phase A is the hard prerequisite for
  Phases B and C (PRNG → synthetic data → charts; selectors/recommendations → startup;
  sort/synthetic-admin → admin).
- **Phase B — Startup Dashboard.** Gating + `/register` redirect round-trip, header, hero metrics,
  eligible schemes, applications empty state, sector-intelligence charts, recommended next steps,
  events, resources, page composition, and lazy loading.
- **Phase C — Government Admin Dashboard.** Header/banner/KPIs, funding timeline, sortable scheme table,
  regional, sector analysis, demographics, flagship programs (additive `performance`), partnerships,
  activity feed, and client-side export Blob.
- **Phase D — Integration & polish.** Navigation + footer + home integration, e2e, a11y audit,
  responsive audit, perf/bundle audit, no-IO smoke, bundle-discipline housekeeping, and final checkpoint.

The 15 Correctness Properties are folded in as one property-based test each (`fast-check`,
`{ numRuns: 100 }`), tagged `// Feature: kite-dashboards, Property {n}`, placed in the phase where the
code under test is built, and located in the exact test files from the design's Test file map. Test
sub-tasks are marked `*` (optional for a fast MVP, **required for full conformance**).

**Operating discipline carried into every task:** frontend-only / session-only, canonical counts are
authoritative (22 schemes, 20 sectors, 6 clusters, 6 programs, 32 GIA countries — never fabricated),
synthetic values deterministic + labelled illustrative, additive types only, WCAG AA, and ≤150 KB First
Load JS per route.

**Verify commands** (from `package.json`): `npx tsc --noEmit` (types), `npm run lint`,
`npm run test:run -- <file>` (single file), `npm run test:run` (full suite), `npm run build` (bundle).

## Tasks

### Phase A — Foundation

- [x] 1. Additive types and shared PRNG
  - [x] 1.1 Add additive dashboard type definitions to `src/types/index.ts`
    - Append (never alter/remove existing exports) the chart-data shapes (`FundingPoint`,
      `FundingTimelinePoint`, `ClusterCountDatum`, `SchemeDisbursementDatum`,
      `StackedDisbursementDatum`, `SectorTreemapDatum`, `SectorGrowthDatum`, `DemographicSlice`,
      `DemographicsData`), the startup bundle `SectorDashboardData`, admin aggregates (`KpiCard`,
      `SchemePerformanceRow`, `ActivityType`, `ActivityEntry`, `RegionPartnership`,
      `ProgramPerformance`), `Recommendation`, and the table-sort types (`SchemeSortKey`,
      `SortDirection`).
    - Add the optional `performance?: ProgramPerformance` field to `FlagshipProgramCardProps`.
    - _Depends: none (wave 0)_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 30.5, 24.8, 14 (types), 18.5_
  - [x] 1.2 Implement shared pure PRNG `src/lib/synthetic-prng.ts`
    - Implement `xmur3`, `mulberry32`, `seededRng`, `seededInt` (inclusive, clamped), `seededFloat`,
      `seededPick`, `seededShuffle` (Fisher–Yates, returns new array). No `Math.random`, no `Date`/time
      input. Document the determinism contract in the module header.
    - _Depends: none (wave 0)_
    - _Verify: `npx tsc --noEmit`; node probe `import('./synthetic-prng').then(m => { const r = m.seededRng('x'); console.log(m.seededInt(r,1,10)) })`_
    - _Requirements: 24.3, 24.4, 24.7_
  - [x]* 1.3 Property test for the PRNG → `src/lib/__tests__/synthetic-prng.pbt.test.ts`
    - `// Feature: kite-dashboards, Property 1` — determinism (same key → identical sequence),
      `mulberry32` output ∈ `[0,1)`, `seededInt` ∈ `[min,max]` for `min ≤ max`, `seededPick`/
      `seededShuffle` return only elements of (and a permutation of) the input. `fc.assert(..., { numRuns: 100 })`.
    - _Depends: 1.2_
    - _Verify: `npm run test:run -- src/lib/__tests__/synthetic-prng.pbt.test.ts`_
    - _Requirements: 24.3, 24.4_

- [x] 2. Synthetic data modules
  - [x] 2.1 Implement `src/lib/synthetic-dashboard-data.ts`
    - Export `getSectorDashboardData(sectorId)` (12 `monthlyFunding` fixed month labels, 7
      `clusterStartups` = 6 `clusters.ts` names + "Bengaluru", 5 `topSchemes` descending by `rupees`
      from canonical scheme names) and `getEcosystemRankLabel(sectorId, stage)` → "Top NN%". All
      hash-seeded via `synthetic-prng`; deep-equal on repeat calls. Document determinism contract.
    - _Depends: 1.1, 1.2_
    - _Verify: `npx tsc --noEmit`; probe `getSectorDashboardData('fintech')` twice and deep-compare_
    - _Requirements: 6.4, 6.5, 6.6, 6.7, 24.1, 24.3, 24.4, 24.5, 24.7, 24.8, 3.10_
  - [x]* 2.2 Property test → `src/lib/__tests__/synthetic-dashboard-data.pbt.test.ts`
    - `// Feature: kite-dashboards, Property 2` — for any `sectorId`, two calls deep-equal; result has 12
      `monthlyFunding`, 7 `clusterStartups` (6 Beyond Bengaluru + Bengaluru), 5 `topSchemes` descending
      by `rupees`. `{ numRuns: 100 }`.
    - _Depends: 2.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/synthetic-dashboard-data.pbt.test.ts`_
    - _Requirements: 6.5, 6.7, 24.1, 24.3, 24.5, 24.8_
  - [x] 2.3 Implement `src/lib/synthetic-admin-data.ts`
    - Export `ADMIN_KPIS` (fixed Req-12 values), `getFundingTimeline` (8 quarters), `getSchemePerformance`
      (iterate canonical `schemes` → 22 rows, `approved = floor(applications*ratio)` so `approved ≤
      applications`, `type`/`status` from canonical data), `getRegionalStartupCounts` (7),
      `getRegionalDisbursement` (7), `getSectorTreemap` (iterate canonical `sectors` → 20 nodes,
      `fundingIntensity ∈ [0,1]`), `getSectorGrowth` (top 10 by `growthPct`), `getDemographics`,
      `getProgramPerformance` (iterate `flagshipPrograms` → 6, `completionPct ∈ [0,100]`),
      `getInternationalPartnerships` (group 32 GIA countries by `region`, sum `countryCount` = 32),
      `getActivityFeed` (length seeded into `[15,20]`). All hash-seeded; document determinism contract.
    - _Depends: 1.1, 1.2_
    - _Verify: `npx tsc --noEmit`; probe each generator twice and deep-compare_
    - _Requirements: 12.4–12.9, 13.5, 14.2, 14.5, 15.6, 16.2, 16.3, 16.4, 17.4–17.7, 18.3, 18.4, 19.2, 19.3, 20.1, 20.3, 24.2, 24.3, 24.4, 24.6, 24.7, 24.8_
  - [x]* 2.4 Property tests → `src/lib/__tests__/synthetic-admin-data.pbt.test.ts`
    - `// Feature: kite-dashboards, Property 3` — every admin generator is deep-equal on repeated calls.
    - `// Feature: kite-dashboards, Property 4` — `getSchemePerformance` has exactly 22 rows; each row
      `approved ≤ applications`, `applications ≥ 0`, `disbursed ≥ 0`.
    - `// Feature: kite-dashboards, Property 6` — `getSectorTreemap` `sectorId` set equals canonical 20;
      each `startupCount ≥ 0`, `fundingIntensity ∈ [0,1]`.
    - `// Feature: kite-dashboards, Property 7` — `getSectorGrowth` length 10, from canonical sectors,
      non-increasing by `growthPct`.
    - `// Feature: kite-dashboards, Property 8` — `getInternationalPartnerships` sum of `countryCount` =
      32, regions ⊆ canonical `GIARegion`, each `jointPrograms ≥ 0`.
    - `// Feature: kite-dashboards, Property 9` — `getProgramPerformance` length 6; each `completionPct ∈
      [0,100]`, `enrolled ≥ 0`, `disbursed ≥ 0`.
    - `// Feature: kite-dashboards, Property 10` — `getActivityFeed` length ∈ `[15,20]`; each entry has
      non-empty `description`/`timestampLabel` and a valid internal `href`; repeated calls deep-equal.
    - Each property is its own `fc.assert(..., { numRuns: 100 })` block.
    - _Depends: 2.3_
    - _Verify: `npm run test:run -- src/lib/__tests__/synthetic-admin-data.pbt.test.ts`_
    - _Requirements: 24.2, 24.3, 24.4, 24.6, 14.2, 14.5, 16.2, 16.3, 18.1, 18.4, 19.1, 19.2, 20.1, 20.3, 24.8_

- [x] 3. Recommendations, completeness, and startup selectors
  - [x] 3.1 Implement `src/lib/startup-recommendations.ts`
    - Implement `computeProfileCompleteness(p)` over the fixed 10 `COMPLETENESS_CHECKS` (rounded to
      `[0,100]`), `RecommendationContext`, `buildRecommendations(ctx)` (priority rules
      `complete-profile`/`register-dpiit`/`register-gst`/`try-calculator`/`browse-schemes` then evergreen
      `explore-clusters`/`upcoming-events`/`find-mentor`, de-duped by `id`), and
      `selectDisplayRecommendations(recs)` (length clamped to `[3,4]`). Pure; absent fields treated as
      unfilled/false via nullish coalescing.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 3.8, 7.2, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_
  - [x]* 3.2 Property tests → `src/lib/__tests__/startup-recommendations.pbt.test.ts`
    - `// Feature: kite-dashboards, Property 11` — `computeProfileCompleteness ∈ [0,100]`; filling any
      currently-unfilled counted field never decreases completeness (monotonic).
    - `// Feature: kite-dashboards, Property 12` — every `buildRecommendations` item has non-empty
      `id`/`iconName`/`heading`/`description`/`ctaLabel`/`href`; `selectDisplayRecommendations` length ∈
      `[3,4]`; each rule's recommendation id present when its condition holds and absent otherwise.
    - Two `fc.assert(..., { numRuns: 100 })` blocks.
    - _Depends: 3.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/startup-recommendations.pbt.test.ts`_
    - _Requirements: 3.8, 7.2, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_
  - [x] 3.3 Implement `src/lib/startup-selectors.ts`
    - Export pure `selectTopEligibleSchemes(results, limit=6)` (filter `definitely-eligible`/
      `likely-eligible`, sort descending by `estimatedBenefit`, slice top 6) and
      `daysSince(iso, now)` = `floor((now − registeredAt) / 86_400_000)`.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 2.4, 4.2, 4.3_
  - [x]* 3.4 Property tests → `src/lib/__tests__/startup-selectors.pbt.test.ts`
    - `// Feature: kite-dashboards, Property 13` — `selectTopEligibleSchemes` returns ≤6 items, each with
      eligible status, each present in input, ordered non-increasing by `estimatedBenefit`.
    - `// Feature: kite-dashboards, Property 14` — for any `registeredAt ≤ now`, `daysSince` is a
      non-negative integer equal to `floor((now − registeredAt)/86_400_000)`.
    - Two `fc.assert(..., { numRuns: 100 })` blocks.
    - _Depends: 3.3_
    - _Verify: `npm run test:run -- src/lib/__tests__/startup-selectors.pbt.test.ts`_
    - _Requirements: 2.4, 4.2, 4.3_

- [x] 4. Chart-wrapper architecture (bundle-critical)
  - [x] 4.1 Implement shared chart primitives under `src/components/charts/`
    - Create `ChartFrame.tsx` (`figure role="group"`, `aria-label`, reserved-height container, sr-only
      `figcaption` summary), `ChartSkeleton.tsx` (reserved-height pulse, `height` prop), `ChartTooltip.tsx`
      (small rounded `bg-card` hairline tooltip, caption text), `ChartEmpty.tsx` (internal empty message),
      and a `chart-tokens.ts` constants module (primary/accent/grid/axis colors from KITE tokens).
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 23.4, 23.5, 23.6, 28.1, 28.2, 29.6, 29.7_
  - [x] 4.2 Implement the nine chart wrappers under `src/components/charts/`
    - `ChartLineFunding.tsx`, `ChartBarSectorStartups.tsx`, `ChartBarHorizontalSchemes.tsx`,
      `ChartAreaFundingTimeline.tsx`, `ChartBarRegionStartups.tsx`, `ChartBarStackedDisbursement.tsx`,
      `ChartTreemapSectors.tsx`, `ChartBarHorizontalSectorGrowth.tsx`, `ChartPieGeneric.tsx`. These are
      the ONLY files importing from `recharts`. Each takes typed data props, branches Empty/Loaded,
      wraps in `ChartFrame` with an sr-only summary, and styles with KITE tokens only.
    - _Depends: 4.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 6.4, 6.5, 6.6, 13.2, 13.3, 15.4, 15.5, 16.2, 16.3, 17, 23.1, 23.2, 23.3, 23.4, 23.6, 28.1, 28.2, 29.6, 29.7_
  - [x] 4.3 Implement the dynamic barrel `src/components/charts/index.ts`
    - Re-export each of the 9 wrappers via `next/dynamic` with `ssr:false` and a reserved-height
      `ChartSkeleton` `loading` fallback (no CLS); also re-export `ChartFrame` and `ChartSkeleton`.
    - _Depends: 4.2_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 23.7, 23.8, 27.4_
  - [x]* 4.4 Unit test the chart primitives/wrappers → `src/components/charts/__tests__/charts.test.tsx`
    - Assert Empty and Loading states render, `ChartFrame` emits `aria-label` + adjacent sr-only summary,
      and KITE-token styling (no gradients/blobs/glow) is applied.
    - _Depends: 4.1, 4.2_
    - _Verify: `npm run test:run -- src/components/charts/__tests__/charts.test.tsx`_
    - _Requirements: 23.4, 23.5, 23.6, 28.1, 28.2, 29.6, 29.7_
  - [x]* 4.5 Property test (static import scan) → `src/components/charts/__tests__/recharts-isolation.test.ts`
    - `// Feature: kite-dashboards, Property 15` — scan every source file under `src/` that imports from
      `recharts`; assert its path is under `src/components/charts/`. `fc.assert(..., { numRuns: 100 })`
      over the discovered file set.
    - _Depends: 4.2, 4.3_
    - _Verify: `npm run test:run -- src/components/charts/__tests__/recharts-isolation.test.ts`_
    - _Requirements: 23.2, 23.9_

- [x] 5. Phase A checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npx tsc --noEmit`_

### Phase B — Startup Dashboard

- [x] 6. Registration gating + `/register` redirect round-trip
  - [x] 6.1 Add additive `redirectTo?: string` prop to `RegistrationWizard`
    - Modify `src/components/registration/RegistrationWizard.tsx`: when `redirectTo` is set, run
      `router.push(redirectTo)` after `completeRegistration()`/`SUBMIT`; when absent, render
      `RegistrationSuccess` exactly as today (no behavior change).
    - _Depends: none in B (Phase A complete)_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 1.6, 1.7, 30.5_
  - [x] 6.2 Add `RegisterPageClient` + Suspense to the register page
    - Create `src/components/registration/RegisterPageClient.tsx` reading `useSearchParams().get('redirectFrom')`,
      mapping via a `REDIRECT_MAP` (`"dashboard/startup" → "/dashboard/startup"`) to `redirectTo`, and
      rendering `<RegistrationWizard redirectTo={...} />`. Convert `src/app/register/page.tsx` to a thin
      server component wrapping `RegisterPageClient` in a `Suspense` boundary.
    - _Depends: 6.1_
    - _Verify: `npx tsc --noEmit`; `npm run build`_
    - _Requirements: 1.5, 1.6, 1.7_
  - [x] 6.3 Implement `StartupGate`
    - Create `src/components/dashboard/startup/StartupGate.tsx` (client): read `isRegistered`; when false,
      `router.push('/register?redirectFrom=dashboard/startup')` and render Redirecting_State with an
      `aria-live="polite"` region; when true, render children.
    - _Depends: none in B_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 28.4, 30.4_
  - [x]* 6.4 Gating + round-trip integration test → `src/components/dashboard/startup/__tests__/gating.integration.test.tsx`
    - Unregistered redirect + Redirecting_State + `aria-live` (Req 1.1–1.4, 28.4); `/register`
      `redirectFrom` round-trip to `/dashboard/startup` and unchanged default behavior when absent
      (Req 1.5–1.7).
    - _Depends: 6.2, 6.3_
    - _Verify: `npm run test:run -- src/components/dashboard/startup/__tests__/gating.integration.test.tsx`_
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 28.4_

- [x] 7. Startup eager sections (header, hero, eligible schemes, empty state)
  - [x] 7.1 Implement `StartupHeaderStrip`
    - Create `src/components/dashboard/startup/StartupHeaderStrip.tsx`: `py-8` strip, "Welcome back,
      {founderName}", kiteId caption, three quick-stat tiles (days-since via `daysSince`, applications
      status `0` with Illustrative_Label, "Active" badge), and a label/value row (company, primary
      sector resolved from `sectors.ts`, location, stage, DPIIT status).
    - _Depends: 3.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  - [x] 7.2 Implement `StartupHeroMetrics`
    - Create `src/components/dashboard/startup/StartupHeroMetrics.tsx`: four `StatCard`s
      (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`) — Total Estimated Benefits + "Across X eligible
      schemes", Eligible Schemes Count + "Of 22 schemes total", Profile Completeness (with "Complete
      Profile" link when `<100`), Ecosystem Rank (synthetic label + illustrative info tooltip). Compute
      `evaluateAllSchemes(profile)` once.
    - _Depends: 2.1, 3.1, 3.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_
  - [x] 7.3 Implement `EligibleSchemesSection`
    - Create `src/components/dashboard/startup/EligibleSchemesSection.tsx`: "Schemes You Qualify For",
      using `selectTopEligibleSchemes`; each card has scheme name, `ConfidenceDot`, estimated benefit,
      "View Details" → `/schemes/{id}`; layout `lg:grid-cols-4`/`md:grid-cols-3`/mobile horizontal
      scroll; "See All 22 Schemes" link to `/schemes`.
    - _Depends: 3.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  - [x] 7.4 Implement `ApplicationsEmptyState`
    - Create `src/components/dashboard/startup/ApplicationsEmptyState.tsx`: "Your Applications" editorial
      card with Lucide `FileText`, "No applications yet" headline, subhead, and "Browse Eligible Schemes"
      primary button → `/schemes`.
    - _Depends: none in B_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 8. Startup lazy sections
  - [x] 8.1 Implement `SectorIntelligenceSection`
    - Create `src/components/dashboard/startup/SectorIntelligenceSection.tsx`: render inside `LazySection`;
      call `getSectorDashboardData(primarySector)` once; feed `ChartLineFunding`,
      `ChartBarSectorStartups`, `ChartBarHorizontalSchemes` imported ONLY from the dynamic barrel;
      `lg:grid-cols-3`/mobile stacked; subhead = sector name; Illustrative_Label.
    - _Depends: 2.1, 4.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 6.1, 6.2, 6.3, 6.8, 6.9, 23.9, 23.10, 10.4_
  - [x] 8.2 Implement `RecommendedNextSteps`
    - Create `src/components/dashboard/startup/RecommendedNextSteps.tsx`: inside `LazySection`; render
      `selectDisplayRecommendations(buildRecommendations(ctx))` (3–4 cards), Lucide icon via local
      `ICON_MAP`, heading/description/CTA; desktop single row, mobile stacked.
    - _Depends: 3.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [x] 8.3 Implement `DashboardEventsSection`
    - Create `src/components/dashboard/startup/DashboardEventsSection.tsx`: inside `LazySection`; "Events
      for You", three events from canonical `events.ts` (profile-matched first, else next three flagship
      by `startDate`); each card date block, name, location, category badge, "Learn More".
    - _Depends: none in B_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [x] 8.4 Implement `DashboardResourcesSection`
    - Create `src/components/dashboard/startup/DashboardResourcesSection.tsx`: inside `LazySection`;
      "Resources" with three cards — Karnataka Startup Policy 2025-30 → `/policies/startup-2025-30`, Help
      Center → `/support`, Contact KITS with `tel:`/`mailto:` from canonical `footer.ts`.
    - _Depends: none in B_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 9. Startup page composition + tests
  - [x] 9.1 Compose `src/app/dashboard/startup/page.tsx`
    - `"use client"` page wrapping content in `StartupGate`; render header + hero metrics + eligible
      schemes eagerly; sector intelligence and all sections below it inside `LazySection`; `max-w-7xl`,
      section padding `py-16 md:py-24`, header `py-8`.
    - _Depends: 6.3, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4_
    - _Verify: `npx tsc --noEmit`; `npm run build`_
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 29.1, 29.2, 29.3, 30.3_
  - [x]* 9.2 Startup dashboard component test → `src/components/dashboard/startup/__tests__/startup-dashboard.test.tsx`
    - Header (Req 2), hero metrics (Req 3), eligible schemes (Req 4), empty state (Req 5), events/resources
      (Req 8, 9), and eager-vs-lazy composition (Req 10).
    - _Depends: 9.1_
    - _Verify: `npm run test:run -- src/components/dashboard/startup/__tests__/startup-dashboard.test.tsx`_
    - _Requirements: 2, 3, 4, 5, 8, 9, 10_
  - [x]* 9.3 Profile-completeness unit test → `src/lib/__tests__/profile-completeness.test.ts`
    - Completeness boundary cases including the `<100` "Complete Profile" link trigger (Req 3.9) and `<80`
      recommendation trigger.
    - _Depends: 3.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/profile-completeness.test.ts`_
    - _Requirements: 3.8, 3.9, 7.8_

- [x] 10. Phase B checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npm run build`_

### Phase C — Government Admin Dashboard

- [x] 11. Admin eager top (header, banner, KPIs)
  - [x] 11.1 Implement `AdminHeaderStrip` + `AdminNoticeBanner`
    - Create `src/components/dashboard/admin/AdminHeaderStrip.tsx` (title "Government Admin Dashboard",
      muted "Preview" badge, attribution "Karnataka EITBT Department, KITS, KDEM", "Last updated 14 hours
      ago") and `AdminNoticeBanner.tsx` (single-line accent-bordered Phase-2 notice). No auth gate.
    - _Depends: none in C (Phase A complete)_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  - [x] 11.2 Implement `AdminKpiGrid`
    - Create `src/components/dashboard/admin/AdminKpiGrid.tsx`: six `StatCard`s from `ADMIN_KPIS`
      (`lg` 3×2, `md` 2×3, mobile single column) with the fixed Req-12 values + Illustrative_Label.
    - _Depends: 2.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10_

- [x] 12. Admin chart sections (lazy)
  - [x] 12.1 Implement `FundingTimelineSection`
    - Create `src/components/dashboard/admin/FundingTimelineSection.tsx`: inside `LazySection`;
      full-width `ChartAreaFundingTimeline` (barrel) fed `getFundingTimeline()`; accent fill, primary
      stroke, hover tooltip.
    - _Depends: 2.3, 4.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 22.4, 23.9_
  - [x] 12.2 Implement `RegionalDistributionSection`
    - Create `src/components/dashboard/admin/RegionalDistributionSection.tsx`: inside `LazySection`;
      `ChartBarRegionStartups` + `ChartBarStackedDisbursement` (barrel) fed `getRegionalStartupCounts()`
      / `getRegionalDisbursement()`; side-by-side desktop, stacked mobile.
    - _Depends: 2.3, 4.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 22.4_
  - [x] 12.3 Implement `SectorAnalysisSection`
    - Create `src/components/dashboard/admin/SectorAnalysisSection.tsx`: inside `LazySection`;
      `ChartTreemapSectors` (20 sectors) + `ChartBarHorizontalSectorGrowth` (top 10) from barrel fed
      `getSectorTreemap()` / `getSectorGrowth()`; Illustrative_Label.
    - _Depends: 2.3, 4.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 22.4_
  - [x] 12.4 Implement `FounderDemographicsSection`
    - Create `src/components/dashboard/admin/FounderDemographicsSection.tsx`: inside `LazySection`; three
      `ChartPieGeneric` (women-led 25% verified, stage, age) fed `getDemographics()`; row desktop,
      stacked mobile; synthetic segments Illustrative_Label while 25% women-led stays attributed.
    - _Depends: 2.3, 4.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 22.4_

- [x] 13. Admin scheme performance table + pure sort
  - [x] 13.1 Implement pure `sortSchemeRows` in `src/lib/scheme-sort.ts`
    - Implement `sortSchemeRows(rows, key, direction)` (numeric compare for numeric keys, `localeCompare`
      otherwise, sign by direction; returns a new array).
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 14.6, 14.7_
  - [x]* 13.2 Property test → `src/lib/__tests__/scheme-sort.pbt.test.ts`
    - `// Feature: kite-dashboards, Property 5` — for any rows/key/direction, `sortSchemeRows` is a
      permutation of the input and ordered non-decreasingly (asc) / non-increasingly (desc) by the key.
      `fc.assert(..., { numRuns: 100 })`.
    - _Depends: 13.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/scheme-sort.pbt.test.ts`_
    - _Requirements: 14.6, 14.7_
  - [x] 13.3 Implement `SchemePerformanceSection`
    - Create `src/components/dashboard/admin/SchemePerformanceSection.tsx` (`"use client"` for sort state)
      inside `LazySection`: semantic `<table>` of 22 rows from `getSchemePerformance()`; columns Scheme
      Name, Type, Applications, Approved, Disbursed, Status, View Details → `/schemes/{id}`; default sort
      Disbursed desc via `sortSchemeRows`; header click toggles asc/desc; `aria-sort` on active header;
      mobile (`<md`) stacked cards. Applications/Approved/Disbursed marked Illustrative_Label.
    - _Depends: 13.1, 2.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 28.3, 22.4_
  - [x]* 13.4 Scheme-table integration test → `src/components/dashboard/admin/__tests__/scheme-table.integration.test.tsx`
    - Default Disbursed-desc sort, header-click toggle, `aria-sort` reflection, mobile stacked-card
      collapse.
    - _Depends: 13.3_
    - _Verify: `npm run test:run -- src/components/dashboard/admin/__tests__/scheme-table.integration.test.tsx`_
    - _Requirements: 14.6, 14.7, 14.8, 14.9_

- [x] 14. Admin flagship, partnerships, activity, export (lazy)
  - [x] 14.1 Add additive `performance` rendering to `FlagshipProgramCard`
    - Modify `src/components/shared/FlagshipProgramCard.tsx`: when `performance` prop present, render
      disbursed value, enrolled count, a completion progress bar, and a status indicator; when absent,
      behave exactly as today.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 18.4, 18.5, 30.5_
  - [x] 14.2 Implement `AdminFlagshipProgramsSection`
    - Create `src/components/dashboard/admin/AdminFlagshipProgramsSection.tsx`: inside `LazySection`; six
      `FlagshipProgramCard`s (3×2 desktop) from canonical `flagship-programs.ts` with
      `getProgramPerformance()` values + Illustrative_Label.
    - _Depends: 14.1, 2.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 22.4_
  - [x] 14.3 Implement `InternationalPartnershipsSection`
    - Create `src/components/dashboard/admin/InternationalPartnershipsSection.tsx`: inside `LazySection`;
      group 32 GIA countries by region from `getInternationalPartnerships()`; each region shows
      country count, synthetic joint-program count (Illustrative_Label), and "Learn More" → `/gia`.
    - _Depends: 2.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 22.4_
  - [x] 14.4 Implement `ActivityFeedSection`
    - Create `src/components/dashboard/admin/ActivityFeedSection.tsx`: inside `LazySection`; "Recent
      Ecosystem Activity" vertical list of 15–20 entries from `getActivityFeed()`; each entry timestamp,
      type icon, description, entity link; scrollable `max-h ~600px`; Illustrative_Label.
    - _Depends: 2.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 22.4_
  - [x] 14.5 Implement `ExportReportsSection`
    - Create `src/components/dashboard/admin/ExportReportsSection.tsx` (`"use client"`) inside
      `LazySection`: three cards — Generate Monthly Report with "Download Report Sample" triggering a
      client-side `Blob` download via temporary anchor (no network); Schedule Email Briefings with inline
      "opens in Phase 2"; API Access → `/developers`.
    - _Depends: none in C_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 30.6_

- [x] 15. Admin page composition + test
  - [x] 15.1 Compose `src/app/dashboard/admin/page.tsx`
    - Public preview page: header strip + notice banner + KPI grid eagerly; every section below the KPI
      grid inside `LazySection`; charts imported only via the dynamic barrel; `max-w-7xl`,
      `py-16 md:py-24` sections, `py-8` header.
    - _Depends: 11.1, 11.2, 12.1, 12.2, 12.3, 12.4, 13.3, 14.2, 14.3, 14.4, 14.5_
    - _Verify: `npx tsc --noEmit`; `npm run build`_
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 29.1, 29.2, 29.3_
  - [x]* 15.2 Admin dashboard component test → `src/components/dashboard/admin/__tests__/admin-dashboard.test.tsx`
    - Header/banner/KPIs (Req 11, 12), sections render inside `LazySection` (Req 22), demographics
      segments (Req 17), flagship `performance` card (Req 18), partnerships (Req 19), activity feed
      (Req 20), and export Blob (Req 21.3).
    - _Depends: 15.1_
    - _Verify: `npm run test:run -- src/components/dashboard/admin/__tests__/admin-dashboard.test.tsx`_
    - _Requirements: 11, 12, 17, 18, 19, 20, 21, 22_

- [x] 16. Phase C checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npm run build`_

### Phase D — Integration & polish

- [x] 17. Navigation, footer, and home integration
  - [x] 17.1 Add "Dashboard" dropdown to `src/data/navigation.ts`
    - Insert a "Dashboard" top-level dropdown between "For Stakeholders" and "Connect" with children "My
      Startup Dashboard" → `/dashboard/startup` and "Government Admin Dashboard" → `/dashboard/admin`
      (additive; desktop + mobile render generically).
    - _Depends: 9.1, 15.1_
    - _Verify: `npx tsc --noEmit`; `npm run test:run -- src/app/__tests__/route-stubs.test.tsx`_
    - _Requirements: 25.1, 25.2, 25.3, 25.4_
  - [x] 17.2 Add "Dashboards" link to `src/data/footer.ts`
    - Append `{ label: "Dashboards", href: "/dashboard/startup" }` to the "For Startups" column (additive).
    - _Depends: 9.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 25.5_
  - [x] 17.3 Add "Go to Dashboard" link to the home Register quick action card
    - Modify `RegisterQuickActionCard` registered branch to add a primary "Go to Dashboard" →
      `/dashboard/startup` alongside "See Your Schemes"; unregistered branch unchanged.
    - _Depends: 9.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 26.1, 26.2_

- [x] 18. Audits, housekeeping, and final checkpoint
  - [x] 18.6 Bundle-discipline housekeeping
    - Verify (and fix if needed) that every chart on both dashboards is imported ONLY via the dynamic
      barrel `src/components/charts/index.ts` and is mounted ONLY inside a `LazySection`; confirm eager
      content on both routes is chart-free (startup: header + hero + eligible schemes; admin: header +
      banner + KPI grid). Use a `recharts`/barrel import grep to confirm no direct wrapper imports leak
      into eager paths.
    - _Depends: 9.1, 15.1_
    - _Verify: `npm run test:run -- src/components/charts/__tests__/recharts-isolation.test.ts`; `npx tsc --noEmit`_
    - _Requirements: 23.9, 23.10, 27.3, 27.4_
  - [x]* 18.1 E2E test → `src/app/__tests__/dashboards.e2e.test.tsx`
    - home → register (with `redirectFrom`) → startup dashboard happy path; admin public access (no gate).
    - _Depends: 17.1, 17.3, 18.6_
    - _Verify: `npm run test:run -- src/app/__tests__/dashboards.e2e.test.tsx`_
    - _Requirements: 1, 26, 11.1_
  - [x]* 18.2 A11y audit (axe) → `src/app/__tests__/dashboards-a11y.test.tsx`
    - Both dashboards: chart `aria-label` + sr-only summaries, table `aria-sort`, visible focus states,
      `aria-live` redirect announcement.
    - _Depends: 9.1, 15.1_
    - _Verify: `npm run test:run -- src/app/__tests__/dashboards-a11y.test.tsx`_
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5_
  - [x]* 18.3 Responsive audit → `src/app/__tests__/dashboards-responsive.test.tsx`
    - Hero/KPI grids, chart column/stack layouts, table→cards at `md`.
    - _Depends: 9.1, 15.1_
    - _Verify: `npm run test:run -- src/app/__tests__/dashboards-responsive.test.tsx`_
    - _Requirements: 3.1, 3.2, 3.3, 6.2, 6.3, 12.1, 12.2, 12.3, 14.9, 15.2, 15.3, 17.2, 17.3_
  - [x]* 18.4 Perf / bundle audit → `src/app/__tests__/dashboards-perf.test.tsx`
    - Assert First Load JS ≤ 150 KB for `/dashboard/startup` and `/dashboard/admin` and that chart
      wrappers/`recharts` are absent from each route's initial bundle. Remedy if exceeded: convert any
      eagerly-loaded chart to a dynamic barrel import (`next/dynamic`, `ssr:false`).
    - _Depends: 9.1, 15.1, 18.6_
    - _Verify: `npm run build` then `npm run test:run -- src/app/__tests__/dashboards-perf.test.tsx`_
    - _Requirements: 27.1, 27.2, 27.3, 27.4_
  - [x]* 18.5 No-IO smoke test → `src/app/__tests__/dashboards-no-io.smoke.test.ts`
    - No network/storage on either dashboard; session-reset (Unregistered_State on refresh) behavior.
    - _Depends: 9.1, 15.1_
    - _Verify: `npm run test:run -- src/app/__tests__/dashboards-no-io.smoke.test.ts`_
    - _Requirements: 30.1, 30.2, 30.4, 30.6_
  - [x] 18.7 Final checkpoint
    - Ensure all tests pass; ask the user if questions arise.
    - _Verify: `npm run test:run`, `npx tsc --noEmit`, `npm run lint`, `npm run build`_

## Notes

- Tasks marked with `*` are optional for a fast MVP but **required for full conformance**; they hold the
  15 Correctness Properties (one PBT each, `fast-check`, `{ numRuns: 100 }`, tagged
  `// Feature: kite-dashboards, Property {n}`) plus the component/integration/e2e/a11y/responsive/perf/
  smoke coverage. Test file paths match the design's Test file map exactly.
- The model MUST NOT implement `*` sub-tasks unless explicitly requested; it MUST implement all
  non-`*` sub-tasks.
- Phase A is the hard prerequisite for Phases B and C: PRNG → synthetic data → charts;
  selectors/recommendations → startup; sort/synthetic-admin → admin.
- Bundle discipline is first-class: charts are imported only through the dynamic barrel and only inside
  `LazySection`; the recharts-isolation property (4.5) and the housekeeping task (18.6) enforce this, and
  the perf audit (18.4) asserts the ≤150 KB First Load JS budget with the "convert eager chart to
  dynamic" remedy.
- Canonical counts are authoritative and never fabricated: 22 schemes, 20 sectors, 6 Beyond Bengaluru
  clusters, 6 flagship programs, 32 GIA countries.
- All synthetic values are deterministic (hash-seeded, no `Math.random`, no time input) and carry a
  visible Illustrative_Label.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1", "2.3", "3.1", "3.3", "4.1"] },
    { "id": 2, "tasks": ["2.2", "2.4", "3.2", "3.4", "4.2"] },
    { "id": 3, "tasks": ["4.3", "4.4", "4.5"] },
    { "id": 4, "tasks": ["6.1", "6.3", "7.1", "7.2", "7.3", "7.4", "11.1", "11.2", "13.1", "14.1", "14.5"] },
    { "id": 5, "tasks": ["6.2", "8.1", "8.2", "8.3", "8.4", "12.1", "12.2", "12.3", "12.4", "13.2", "13.3", "14.2", "14.3", "14.4"] },
    { "id": 6, "tasks": ["6.4", "9.1", "9.3", "13.4", "15.1"] },
    { "id": 7, "tasks": ["9.2", "15.2"] },
    { "id": 8, "tasks": ["17.1", "17.2", "17.3", "18.6"] },
    { "id": 9, "tasks": ["18.1", "18.2", "18.3", "18.4", "18.5"] }
  ]
}
```
