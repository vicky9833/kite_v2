# Implementation Plan: KITE Investor Suite (Prompt 4)

## Overview

This plan implements the investor side of the KITE marketplace — Investor Connect (`/investors`),
the Onboarding Wizard (`/investors/onboard`), the Investor Dashboard (`/dashboard/investor`), and the
Deal Pipeline (`/dashboard/investor/pipeline`) — on top of the existing Next.js 14 app, exactly as
specified in `design.md` and satisfying all 40 requirements. It is dependency-ordered into the five
founder-fixed phases:

- **Phase A — Foundation.** Additive types, the `INV-YYYY-XXXXXX` id generator, the session-only
  `InvestorContext`, the pure matching engine, the two deterministic synthetic-data modules, the
  dashboard selectors, the pure pipeline helpers, the onboarding validators, and the one new chart
  wrapper. Hard prerequisite for B/C/D.
- **Phase B — Investor Connect + Onboarding.** The nine `/investors` sections, the `/investors` page,
  the 4-step onboarding wizard, and the `/investors/onboard` Suspense page + redirect island.
- **Phase C — Investor Dashboard.** Shared gate, preview banner, header, six-KPI grid, matched
  startups (engine-driven), portfolio, deal-flow summary, ecosystem signals, schemes-for-portfolio,
  events, resources, and the page composition.
- **Phase D — Deal Pipeline.** Header + add-deal, filter bar, kanban board + columns + deal cards
  (native-select Move, Remove, Add Note), dynamic analytics + recent activity, Blob export, and the
  gated page composition.
- **Phase E — Integration & polish.** Navigation, footer, home repoint; e2e, a11y, responsive,
  perf/bundle, and no-IO audits; bundle housekeeping; final checkpoint.

The 22 Correctness Properties are folded in as one property-based test each (`fast-check`,
`{ numRuns: 100 }`), tagged `// Feature: kite-investor-suite, Property {n}`, placed in the phase where
the code under test is built, in the exact test files from the design's Test architecture table. Test
sub-tasks are marked `*` (optional for a fast MVP, required for full conformance).

**Operating discipline carried into every task:** frontend-only / session-only (no backend, DB, API,
network, or persistence beyond in-memory context); verified investor stats are canonical ($79B,
183 soonicorns, 21,000 DPIIT startups, 46% VC share, 2.5M / 350K workforce, ₹100 Cr KITVEN corpus);
all other investor numbers are synthetic, deterministic (hash-seeded, no `Math.random`/time), and
labeled illustrative; canonical counts honored (22 schemes, 20 sectors, 6 clusters, 6 programs, 32 GIA
countries); additive types only; WCAG AA; ≤150KB First Load JS per route; charts only via the dynamic
barrel.

**Verify commands:** `npx tsc --noEmit` (types), `npm run lint`, `npm run test:run -- <file>` (single
file), `npm run test:run` (full suite), `npm run build` (bundle).

## Tasks

### Phase A — Foundation

- [x] 1. Additive investor types and the INV id generator
  - [x] 1.1 Add additive investor type definitions to `src/types/index.ts`
    - Append (never alter/remove existing exports): `InvestorRole`, `FirmType`, `InvestmentStage`,
      `DealStage`, `PortfolioStatus`, `MatchSignal` union types; `DEAL_STAGE_ORDER` const; `PortfolioCompany`,
      `TrackedDeal`, `InvestorProfile`, `InvestorContextValue`, `MatchResult`, `RelevanceResult`,
      `StartupCandidate`, `OpportunityCardData`, `DealFlowEvent`, `SectorFundingDatum`, `SectorCountSeries`,
      `ClusterFraming`, `KitvenCoInvestment`, `EcosystemSignalsData`, `StageAnalytics` interfaces (exact shapes
      from design Data Models).
    - _Depends: none (wave 0)_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_
  - [x] 1.2 Implement `src/lib/investor-id-generator.ts`
    - `INV_ID_ALPHABET` (excludes O/0/I/1), `INV_ID_PATTERN`, `generateInvestorId(rng = Math.random, year = new Date().getFullYear())` → `INV-YYYY-XXXXXX`. Pure/deterministic given injected rng/year. Model on `kite-id-generator.ts`.
    - _Depends: none (wave 0)_
    - _Verify: `npx tsc --noEmit`; `INV_ID_PATTERN.test(generateInvestorId())` true_
    - _Requirements: 2.2_
  - [x]* 1.3 Property test → `src/lib/__tests__/investor-id-generator.pbt.test.ts`
    - `// Feature: kite-investor-suite, Property 7` — for any seeded rng and four-digit year, output matches `INV_ID_PATTERN`. `{ numRuns: 100 }`.
    - _Depends: 1.2_
    - _Verify: `npm run test:run -- src/lib/__tests__/investor-id-generator.pbt.test.ts`_
    - _Requirements: 2.2_

- [x] 2. InvestorContext provider
  - [x] 2.1 Implement `src/context/InvestorContext.tsx`
    - Mirror `RegistrationContext`: in-memory state `{ investorProfile: null, isOnboarded: false }`; mutators `updateInvestorProfile` (merge, seed-on-null), `completeOnboarding` (set isOnboarded + `generateInvestorId` + ISO `onboardedAt`), `addDeal` (append w/ `orderInStage`), `updateDealStage` (change only that deal + next order in destination), `removeDeal`, `addPortfolioCompany`, `addDealNote` (note on deal via targeted update), `resetInvestor`; throwing `useInvestor`; non-throwing `useOptionalInvestor` with NOT_ONBOARDED_FALLBACK. No persistence/IO.
    - _Depends: 1.1, 1.2_
    - _Verify: `npx tsc --noEmit`; no `localStorage`/`sessionStorage`/`cookie`/`indexedDB`/`fetch` in file_
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 30.4_
  - [x] 2.2 Wire `InvestorProvider` into `src/app/layout.tsx`
    - Mount `InvestorProvider` additively alongside `LanguageProvider` + `RegistrationProvider`, wrapping SiteChrome/main/Footer. No change to existing provider identity.
    - _Depends: 2.1_
    - _Verify: `npm run build` succeeds; every page can read investor context_
    - _Requirements: 1.4_
  - [x]* 2.3 Context unit tests → `src/context/__tests__/InvestorContext.test.tsx`
    - Initial null/false state, refresh reset (remount), `completeOnboarding` sets investorId/onboardedAt, `resetInvestor`, outside-provider throw, `useOptionalInvestor` fallback.
    - _Depends: 2.1_
    - _Verify: `npm run test:run -- src/context/__tests__/InvestorContext.test.tsx`_
    - _Requirements: 1.1, 1.3, 1.5, 1.6, 2.2, 2.7_
  - [x]* 2.4 Context property tests → `src/context/__tests__/InvestorContext.pbt.test.tsx`
    - `// Feature: kite-investor-suite, Property 10` (updateInvestorProfile merge preserves untouched fields), `Property 11` (addDeal/addPortfolioCompany grow by 1 and contain the item), `Property 12` (updateDealStage changes only the targeted deal), `Property 13` (removeDeal removes exactly the targeted deal). Each `{ numRuns: 100 }`.
    - _Depends: 2.1_
    - _Verify: `npm run test:run -- src/context/__tests__/InvestorContext.pbt.test.tsx`_
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Matching engine
  - [x] 3.1 Implement `src/lib/investor-matching.ts`
    - Pure `evaluateMatch(investor, startup): MatchResult` — `scoreSectorOverlap` (0..40), `scoreStageMatch` (0..30), `scoreGeoMatch` (0..20), `scoreTicketCompat` (0..10), `clamp` to [0,100], `toSignal` (≥80 strong / 50–79 possible / <50 out-of-thesis), non-empty `buildReasons`, `startupId = startup.kiteId`. Pure `evaluateSchemeRelevance(investor, scheme): RelevanceResult` via documented `RELEVANCE_RULES` table (KITVEN Fund-5 → all; beyond-bengaluru-cluster-fund → geo includes "Karnataka Beyond Bengaluru"; rd-project-grant → focusSectors includes deep-tech; default heuristic) with non-empty reason.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`; probe `evaluateMatch` returns well-formed result; `evaluateSchemeRelevance(any, kitven-fund-5).isRelevant === true`_
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  - [x]* 3.2 Property tests → `src/lib/__tests__/investor-matching.pbt.test.ts`
    - `// Feature: kite-investor-suite, Property 1` (score ∈ [0,100]), `Property 2` (signal bins correctly), `Property 3` (reasons non-empty), `Property 4` (deterministic + startupId from kiteId), `Property 5` (relevance deterministic + non-empty reason), `Property 6` (KITVEN relevant to every investor). Each `{ numRuns: 100 }`.
    - _Depends: 3.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/investor-matching.pbt.test.ts`_
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.3, 5.6, 5.7_

- [x] 4. Synthetic data modules + selectors + pipeline helpers + validators
  - [x] 4.1 Implement `src/lib/synthetic-investor-data.ts`
    - `getFeaturedOpportunities()` (6), `getDealFlowTicker()` (20), `getCandidatePool(seedKey)` (50 `StartupCandidate` with synthetic kiteId), `getSectorFundingTop10()` (10, desc by fundingCrore), `getSectorCountGrowth()` (top 5 × 24 months), `getClusterInvestorFraming(clusterId)`. All hash-seeded via `synthetic-prng`; no Math.random/time; determinism contract in header. Canonical sectors/clusters.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`; probe each twice and deep-compare_
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 9.1, 10.2, 12.2, 13.2, 13.3, 20.2_
  - [x] 4.2 Implement `src/lib/investor-dashboard-data.ts`
    - `getPortfolioSeed(seedKey)`, `getKitvenCoInvestments(seedKey)` (3–4 rows), `getEcosystemSignals(focusSectors, focusStages)` (12-pt funding line + stage distribution bar), `getLastLoginLabel(seedKey)`, `getExitsThisYear(seedKey)`, `getCurrentEstimatedValue(company)`, `getDaysInStage(dealId)`. Hash-seeded; no Math.random/time; determinism contract in header.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`; probe each twice and deep-compare_
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 18.2, 19.6, 21.1, 23.2, 23.3, 23.4, 28.3_
  - [x]* 4.3 Property tests → `src/lib/__tests__/synthetic-investor-data.pbt.test.ts`
    - `// Feature: kite-investor-suite, Property 8` (deterministic, no Math.random/time) and `Property 9` (cardinalities: 6 featured, 20 ticker, 50 candidates, 10 sector-funding desc, 5×24 growth). `{ numRuns: 100 }`.
    - _Depends: 4.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/synthetic-investor-data.pbt.test.ts`_
    - _Requirements: 6.1, 6.3, 6.4, 9.1, 10.2, 13.2, 13.3, 20.2_
  - [x]* 4.4 Property tests → `src/lib/__tests__/investor-dashboard-data.pbt.test.ts`
    - `// Feature: kite-investor-suite, Property 8` (determinism) and `Property 9` (getKitvenCoInvestments returns 3–4 rows). `{ numRuns: 100 }`.
    - _Depends: 4.2_
    - _Verify: `npm run test:run -- src/lib/__tests__/investor-dashboard-data.pbt.test.ts`_
    - _Requirements: 6.2, 6.3, 6.4, 23.4_
  - [x] 4.5 Implement `src/lib/investor-dashboard-selectors.ts`
    - Pure `selectPortfolioValue`, `selectActiveDealCount`, `selectPipelineValue`, `selectActiveCompanyCount`, `selectExitsThisYear`, `selectKarnatakaAllocation` (0–100, 0 when empty). Active deal = currentStage not Closed/Passed.
    - _Depends: 1.1, 4.2_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_
  - [x]* 4.6 Property tests → `src/lib/__tests__/investor-dashboard-selectors.pbt.test.ts`
    - `// Feature: kite-investor-suite, Property 14` (active-deal selectors sound), `Property 15` (active company count sound), `Property 16` (Karnataka allocation ∈ [0,100], 0 when empty). `{ numRuns: 100 }`.
    - _Depends: 4.5_
    - _Verify: `npm run test:run -- src/lib/__tests__/investor-dashboard-selectors.pbt.test.ts`_
    - _Requirements: 19.3, 19.4, 19.5, 19.7_
  - [x] 4.7 Implement `src/lib/deal-pipeline.ts`
    - Pure `filterDeals(deals, filters)` (sector/stageRange/askRange/dateRange/query; subset + sound), `dealsToCsv(deals)` (header + one row per deal, escaped), `computeStageAnalytics(deals)` (per-stage counts sum to deals.length; conversion rate ∈ [0,1]; velocity ≥ 0).
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 27.2, 30.1, 31.2_
  - [x]* 4.8 Property tests → `src/lib/__tests__/deal-pipeline.pbt.test.ts`
    - `// Feature: kite-investor-suite, Property 18` (filterDeals sound + subset), `Property 19` (dealsToCsv line count = deals+1), `Property 20` (analytics bounds), `Property 21` (within-stage ordering by orderInStage / stage membership). `{ numRuns: 100 }`.
    - _Depends: 4.7_
    - _Verify: `npm run test:run -- src/lib/__tests__/deal-pipeline.pbt.test.ts`_
    - _Requirements: 27.2, 28.5, 30.1, 31.2_
  - [x] 4.9 Implement `src/lib/investor-onboarding-validators.ts`
    - Pure `validateInvestorStep1..3` (`StepValidator`-shaped): step1 name≥2/email/phone=10 digits/role enum; step2 firmType enum/AUM≥0/foundedYear 1900..current; step3 focusSectors non-empty/focusStages non-empty/ticket min≥0/max≥min/geographicFocus non-empty.
    - _Depends: 1.1_
    - _Verify: `npx tsc --noEmit`; probe invalid returns non-empty record, valid returns `{}`_
    - _Requirements: 16.3_

- [x] 5. New chart wrapper
  - [x] 5.1 Implement `src/components/charts/ChartBarHorizontalFunding.tsx` + barrel export
    - Recharts horizontal `BarChart` keyed `name`/`fundingCrore` ("₹ Cr"), KITE tokens, internal empty/loaded states, wrapped in `ChartFrame` with sr-only summary. Re-export via `next/dynamic` ssr:false + `ChartSkeleton` in `src/components/charts/index.ts`. Only file (besides existing wrappers) importing recharts for this type.
    - _Depends: none in A (charts barrel exists)_
    - _Verify: `npx tsc --noEmit`; `npm run test:run -- src/components/charts/__tests__/recharts-isolation.test.ts`_
    - _Requirements: 13.2, 36.1, 36.3_

- [x] 6. Phase A checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npx tsc --noEmit`_

### Phase B — Investor Connect + Onboarding

- [x] 7. Investor Connect sections
  - [x] 7.1 Implement hero + Why Karnataka + onboarding CTA
    - `src/components/investors/InvestorHeroStrip.tsx` (py-12 bg-dark, two CTAs → `/investors/onboard` + `#deals`, verified stats), `WhyKarnatakaSection.tsx` (3 verified cards), `InvestorOnboardingCta.tsx` (centered, "Begin Onboarding" → `/investors/onboard`, Phase-2 secondary line).
    - _Depends: Phase A_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 15.1, 15.2, 15.3_
  - [x] 7.2 Implement Featured Opportunities + KITVEN + GIA sections
    - `FeaturedOpportunitiesSection.tsx` (6 `OpportunityCard` from `getFeaturedOpportunities`, illustrative corner label, 3/2/1 responsive), `KitvenCoInvestSection.tsx` (#kitven-portfolio, verified terms, ghost proposal CTA → eitbt.karnataka.gov.in/startup, View Active → `#kitven-portfolio`), `GiaInvestorsSection.tsx` (6 country cards flag-icons + "Learn More" → `/gia`).
    - _Depends: Phase A_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 11.1, 11.2, 11.3, 14.1, 14.2, 14.3_
  - [x] 7.3 Implement Live Deal Flow ticker + Beyond Bengaluru + Sector charts
    - `LiveDealFlowSection.tsx` (#deals, 20 events, plain-CSS marquee `animation-play-state: paused` on hover, vertical list on mobile, illustrative label, aria-live polite once), `BeyondBengaluruSection.tsx` (6 reused `ClusterCard` w/ investor framing → `/clusters/{id}`), `SectorPerformanceSection.tsx` (ChartBarHorizontalFunding + ChartLineFunding via barrel, side-by-side/stacked).
    - _Depends: 5.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 12.1, 12.2, 12.3, 13.1, 13.2, 13.3, 13.4, 36.1_
  - [x] 7.4 Compose `src/app/investors/page.tsx`
    - Replace the foundation stub with the nine sections in order; eager hero/why/featured; below-the-fold (ticker/kitven/beyond/charts/gia/cta) via `next/dynamic` + `LazySection`. `max-w-7xl`, section padding.
    - _Depends: 7.1, 7.2, 7.3_
    - _Verify: `npm run build` succeeds; `/investors` renders_
    - _Requirements: 7.1, 37.1, 37.4, 39.1, 39.2_
  - [x]* 7.5 Investor Connect component test → `src/components/investors/__tests__/InvestorConnect.test.tsx`
    - Sections 7–15 render, copy, illustrative labels, verified stats.
    - _Depends: 7.4_
    - _Verify: `npm run test:run -- src/components/investors/__tests__/InvestorConnect.test.tsx`_
    - _Requirements: 7, 8, 9, 10, 11, 12, 13, 14, 15_
  - [x]* 7.6 Hero-anchor e2e → `src/app/__tests__/investor-connect.e2e.test.tsx`
    - "View Live Deal Flow" anchors `#deals`; CTAs → `/investors/onboard`.
    - _Depends: 7.4_
    - _Verify: `npm run test:run -- src/app/__tests__/investor-connect.e2e.test.tsx`_
    - _Requirements: 7.3, 7.4, 15.2_

- [x] 8. Onboarding wizard
  - [x] 8.1 Implement the wizard + steps + progress + success
    - `src/components/investors/InvestorOnboardingWizard.tsx` (pure `investorWizardReducer` + `initialState`, aria-disabled accuracy-gated submit, focus management), `OnboardingProgress.tsx` (role=progressbar 1..4), `OnboardStep01Identity/02Firm/03Thesis/04Review.tsx`, `OnboardingSuccess.tsx` (shows investorId). On submit: updateInvestorProfile + completeOnboarding + optional `redirectTo` push.
    - _Depends: 2.1, 4.9_
    - _Verify: `npx tsc --noEmit`; reducer importable as pure function_
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_
  - [x] 8.2 Compose `/investors/onboard` + `OnboardPageClient`
    - `src/components/investors/OnboardPageClient.tsx` reads `useSearchParams().get('redirectFrom')` → `REDIRECT_MAP` (`dashboard/investor`, `dashboard/investor/pipeline`) → `redirectTo`; `src/app/investors/onboard/page.tsx` wraps it in `<Suspense>`.
    - _Depends: 8.1_
    - _Verify: `npx tsc --noEmit`; `npm run build`_
    - _Requirements: 16.1, 16.6_
  - [x]* 8.3 Wizard component test → `src/components/investors/__tests__/InvestorOnboardingWizard.test.tsx`
    - 4 steps, progress, validate-blocks-advance, accuracy-gated submit, success investorId.
    - _Depends: 8.1_
    - _Verify: `npm run test:run -- src/components/investors/__tests__/InvestorOnboardingWizard.test.tsx`_
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_
  - [x]* 8.4 Validators unit test → `src/lib/__tests__/investor-onboarding-validators.test.ts`
    - Per-step rules + edge cases.
    - _Depends: 4.9_
    - _Verify: `npm run test:run -- src/lib/__tests__/investor-onboarding-validators.test.ts`_
    - _Requirements: 16.3_
  - [x]* 8.5 Onboard redirect e2e → `src/app/__tests__/onboard-redirect.e2e.test.tsx`
    - REDIRECT_MAP round-trip for both destinations; default success when absent.
    - _Depends: 8.2_
    - _Verify: `npm run test:run -- src/app/__tests__/onboard-redirect.e2e.test.tsx`_
    - _Requirements: 16.6_

- [x] 9. Phase B checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npm run build`_

### Phase C — Investor Dashboard

- [x] 10. Gate, banner, header, KPI grid
  - [x] 10.1 Implement shared `InvestorGate` + `InvestorPreviewBanner`
    - `src/components/dashboard/investor/InvestorGate.tsx` (client; props `redirectFrom`; Not_Onboarded → push `/investors/onboard?redirectFrom=...` + aria-live Redirecting_State; Onboarded → children), `InvestorPreviewBanner.tsx` (fixed Phase-2 disclaimer copy).
    - _Depends: 2.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 26.2, 40.3_
  - [x] 10.2 Implement `InvestorHeaderStrip` + `InvestorKpiGrid`
    - Header: "Welcome back, {investorName}", firmName caption; right Investor ID + synthetic last-login + Status badge. KPI grid: six `StatCard`s from `investor-dashboard-selectors` (Portfolio Value, Active Deals, Pipeline Value, Portfolio Companies, Exits This Year, Karnataka Allocation).
    - _Depends: 4.5, 4.2_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 18.1, 18.2, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

- [x] 11. Matched startups, portfolio, deal-flow, signals, schemes, events, resources
  - [x] 11.1 Implement `MatchedStartupsSection` + signal badge helper
    - `getCandidatePool(investorId)` (50) → `evaluateMatch` → sort desc (tie-break startupId) → top 6, in `useMemo` keyed on profile; `MatchCard` (large match score, signal badge success/warning/muted never danger, View Details); "See All Matches" link; aria-live match count. Signal badge style resolver in a small shared helper.
    - _Depends: 3.1, 4.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 39.3, 39.4_
  - [x]* 11.2 Matched-startups property test → `src/lib/__tests__/matched-startups.pbt.test.ts`
    - `// Feature: kite-investor-suite, Property 17` — top-6 are highest scorers in non-increasing order. `{ numRuns: 100 }`.
    - _Depends: 11.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/matched-startups.pbt.test.ts`_
    - _Requirements: 20.3_
  - [x]* 11.3 Signal-badge property test → `src/lib/__tests__/signal-badge.pbt.test.ts`
    - `// Feature: kite-investor-suite, Property 22` — strong→success, possible→warning, out-of-thesis→muted, never danger. `{ numRuns: 100 }`.
    - _Depends: 11.1_
    - _Verify: `npm run test:run -- src/lib/__tests__/signal-badge.pbt.test.ts`_
    - _Requirements: 39.4_
  - [x] 11.4 Implement `PortfolioSection` + `ActivePipelineSection`
    - Portfolio compact table (Company/Sector/Stage at Investment/Invested Amount/Invested Date/Current Status/Current Estimated Value synthetic), row expand, empty-state inline Add Portfolio Company form → `addPortfolioCompany`. Active pipeline: group dealsTracked by currentStage as small horizontal bars; "Go to Pipeline" → `/dashboard/investor/pipeline`.
    - _Depends: 2.1, 4.2_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 22.1, 22.2_
  - [x] 11.5 Implement `KarnatakaSignalsSection` + `SchemesForPortfolioSection`
    - Signals: focus-sectors funding line (`ChartLineFunding` via barrel), stage distribution bar (`ChartBarSectorStartups` via barrel), KITVEN co-investments table (`getKitvenCoInvestments` 3–4). Schemes: top 6 by `evaluateSchemeRelevance`, each card name + why-it-matters + max benefit + visual-only "Share with Portfolio".
    - _Depends: 3.1, 4.2_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 24.1, 24.2, 24.3, 36.1_
  - [x] 11.6 Implement `InvestorEventsSection` + `InvestorResourcesSection`
    - Events: 3 `EventCard` filtered to investor categories (summit, demo-day, masterclass). Resources: Investment Memo Template (synthetic download), KITVEN Co-Investment Guide, Contact Investor Relations (helpline + email from `footer.ts`).
    - _Depends: Phase A_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 25.1, 25.2_

- [x] 12. Dashboard page composition + tests
  - [x] 12.1 Compose `src/app/dashboard/investor/page.tsx`
    - Client page wrapping content in `InvestorGate` (redirectFrom `dashboard/investor`); preview banner + header + KPI grid eager; matched-startups eager; portfolio/active-pipeline/signals/schemes/events/resources via `next/dynamic` + `LazySection`. `max-w-7xl`, padding.
    - _Depends: 10.1, 10.2, 11.1, 11.4, 11.5, 11.6_
    - _Verify: `npm run build` succeeds; report `/dashboard/investor` First Load JS ≤150KB_
    - _Requirements: 17, 37.1, 37.3, 39.1_
  - [x]* 12.2 Dashboard component test → `src/components/dashboard/investor/__tests__/InvestorDashboard.test.tsx`
    - Banner, header, KPI grid, sections render under gate (seeded Onboarded).
    - _Depends: 12.1_
    - _Verify: `npm run test:run -- src/components/dashboard/investor/__tests__/InvestorDashboard.test.tsx`_
    - _Requirements: 17, 18, 19, 20, 21, 22, 23, 24, 25_
  - [x]* 12.3 Portfolio-mutation integration → `src/components/dashboard/investor/__tests__/portfolio-mutation.test.tsx`
    - Empty add-form → `addPortfolioCompany` grows the table.
    - _Depends: 11.4_
    - _Verify: `npm run test:run -- src/components/dashboard/investor/__tests__/portfolio-mutation.test.tsx`_
    - _Requirements: 21.3, 21.4_
  - [x]* 12.4 Matching-drives-section integration → `src/components/dashboard/investor/__tests__/matching-drives-section.test.tsx`
    - Profile thesis change re-derives matched startups + schemes ranking.
    - _Depends: 11.1, 11.5_
    - _Verify: `npm run test:run -- src/components/dashboard/investor/__tests__/matching-drives-section.test.tsx`_
    - _Requirements: 20, 24_

- [x] 13. Phase C checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npm run build`_

### Phase D — Deal Pipeline

- [x] 14. Header, filters, board, cards
  - [x] 14.1 Implement `PipelineHeaderStrip` + `AddDealForm`
    - py-8 header "Your Deal Pipeline" + subhead "managing N active deals across six stages" (N = active deals); "Add Deal" opens inline `AddDealForm` building a synthetic `TrackedDeal` → `addDeal`.
    - _Depends: 2.1_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 26.1, 26.3, 26.4_
  - [x] 14.2 Implement `PipelineFilterBar`
    - Sector / stage range / ask range / date range filters + search input, all with accessible labels, calling `filterDeals` client-side.
    - _Depends: 4.7_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 27.1, 27.2, 27.3_
  - [x] 14.3 Implement `KanbanBoard` + `KanbanColumn` + `DealCard`
    - Six columns (Sourced/Screening/Diligence/Term-Sheet/Closed/Passed), each `role="region"` + aria-label + count; cards ordered by `orderInStage` with up/down reorder; empty placeholder "Drop deals here / Add deal"; no DnD. DealCard tight, focusable, accessible name, sector badge/ask/days-in-stage; on hover/focus reveals Move native `<select>` → `updateDealStage`, Remove → `removeDeal`, inline Add Note → note on deal.
    - _Depends: 2.1, 4.2, 4.7_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 29.1, 29.2, 29.3, 30.3, 30.4, 32.1, 32.2, 32.3, 32.4_

- [x] 15. Analytics, activity, export, page composition
  - [x] 15.1 Implement `StageAnalyticsRow` + `RecentActivityList` (dynamic)
    - Analytics row from `computeStageAnalytics` (avg days/stage, conversion, weekly velocity); Recent Activity vertical list of synthetic entries (transitions/additions/notes). Both authored so the page dynamic-imports them.
    - _Depends: 4.7_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 30.1, 30.2, 30.5_
  - [x] 15.2 Implement `PipelineExportButton`
    - Client Blob CSV download via pure `dealsToCsv` + transient anchor (no network), mirroring admin export.
    - _Depends: 4.7_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 31.1, 31.2_
  - [x] 15.3 Compose `src/app/dashboard/investor/pipeline/page.tsx`
    - Client page wrapping content in `InvestorGate` (redirectFrom `dashboard/investor/pipeline`); header + filter bar + kanban eager; `StageAnalyticsRow` + `RecentActivityList` via `next/dynamic` + `LazySection`; export at bottom. `max-w-7xl`.
    - _Depends: 14.1, 14.2, 14.3, 15.1, 15.2_
    - _Verify: `npm run build` succeeds; report `/dashboard/investor/pipeline` First Load JS ≤150KB_
    - _Requirements: 26.1, 26.2, 28, 30.5, 37.1, 37.2, 39.1_
  - [x]* 15.4 Pipeline component test → `src/components/dashboard/investor/pipeline/__tests__/DealPipeline.test.tsx`
    - Six columns + counts, empty placeholder, focusable cards, Move select, Remove.
    - _Depends: 15.3_
    - _Verify: `npm run test:run -- src/components/dashboard/investor/pipeline/__tests__/DealPipeline.test.tsx`_
    - _Requirements: 26, 27, 28, 29, 32_
  - [x]* 15.5 Stage-transition integration → `src/components/dashboard/investor/pipeline/__tests__/stage-transition.test.tsx`
    - Move select → `updateDealStage` moves card across columns; Remove → `removeDeal`.
    - _Depends: 15.3_
    - _Verify: `npm run test:run -- src/components/dashboard/investor/pipeline/__tests__/stage-transition.test.tsx`_
    - _Requirements: 29.1, 29.2, 29.3_
  - [x]* 15.6 Filter integration → `src/components/dashboard/investor/pipeline/__tests__/pipeline-filter.test.tsx`
    - Each filter + search narrows the board; labels present.
    - _Depends: 15.3_
    - _Verify: `npm run test:run -- src/components/dashboard/investor/pipeline/__tests__/pipeline-filter.test.tsx`_
    - _Requirements: 27.1, 27.2, 27.3_

- [x] 16. Phase D checkpoint
  - Ensure all tests pass; ask the user if questions arise.
  - _Verify: `npm run test:run` and `npm run build`_

### Phase E — Integration & polish

- [x] 17. Navigation, footer, home integration
  - [x] 17.1 Add investor links under the "Connect" dropdown in `src/data/navigation.ts`
    - Children "Investor Connect" → `/investors`, "Investor Dashboard" → `/dashboard/investor`, "Deal Pipeline" → `/dashboard/investor/pipeline`; flows into mobile nav.
    - _Depends: 12.1, 15.3_
    - _Verify: `npx tsc --noEmit`; `npm run test:run -- src/components/layout`_
    - _Requirements: 33.1, 33.2_
  - [x] 17.2 Expand the "For Investors" footer column in `src/data/footer.ts`
    - Add `/investors`, `/dashboard/investor`, `/dashboard/investor/pipeline` links (additive; sync any layout link-count test).
    - _Depends: 12.1, 15.3_
    - _Verify: `npx tsc --noEmit`_
    - _Requirements: 34.1_
  - [x] 17.3 Repoint the home "Investor Connect" quick action to `/investors`
    - `src/data/quick-actions.ts`: ensure the existing Investor Connect action targets `/investors`; keep the 8-action grid count unchanged.
    - _Depends: 7.4_
    - _Verify: `npx tsc --noEmit`; `npm run test:run -- src/data/__tests__/quick-actions.pbt.test.ts`_
    - _Requirements: 35.1, 35.2_

- [x] 18. Audits, housekeeping, and final checkpoint
  - [x] 18.1 Bundle-discipline housekeeping
    - Verify every investor chart is imported only via the dynamic barrel and only inside LazySection; pipeline analytics + recent activity are dynamic; ticker uses plain CSS; eager content chart-free. Grep to confirm no recharts/deep-wrapper leak.
    - _Depends: 7.4, 12.1, 15.3_
    - _Verify: `npm run test:run -- src/components/charts/__tests__/recharts-isolation.test.ts`; `npx tsc --noEmit`_
    - _Requirements: 36.1, 37.2, 37.3, 37.4_
  - [x]* 18.2 E2E → `src/app/__tests__/investor-suite.e2e.test.tsx`
    - onboard → dashboard → pipeline full journey incl. gate redirect.
    - _Depends: 17.1, 18.1_
    - _Verify: `npm run test:run -- src/app/__tests__/investor-suite.e2e.test.tsx`_
    - _Requirements: 16, 17, 26_
  - [x]* 18.3 A11y audit (axe) → `src/app/__tests__/investor-a11y.test.tsx`
    - All four routes: contrast/focus/keyboard, accessible names, kanban regions, Move select, chart aria + sr-only, gate + matched aria-live, ticker aria-live-once.
    - _Depends: 7.4, 12.1, 15.3_
    - _Verify: `npm run test:run -- src/app/__tests__/investor-a11y.test.tsx`_
    - _Requirements: 32, 38.1, 38.2, 38.3_
  - [x]* 18.4 Responsive audit → `src/app/__tests__/investor-responsive.test.tsx`
    - Hero/cards/charts/ticker + kanban + KPI at mobile/tablet/desktop.
    - _Depends: 7.4, 12.1, 15.3_
    - _Verify: `npm run test:run -- src/app/__tests__/investor-responsive.test.tsx`_
    - _Requirements: 8.5, 9.4, 10.3, 13.4_
  - [x]* 18.5 Perf / bundle audit → `src/app/__tests__/investor-perf.test.tsx`
    - Static-graph: `/investors`, `/dashboard/investor`, `/dashboard/investor/pipeline` pages do not statically import recharts/chart wrappers; below-the-fold + analytics/activity via `next/dynamic`; assert ≤150KB First Load JS (informational from build). Remedy: convert eager chart to dynamic.
    - _Depends: 18.1_
    - _Verify: `npm run build` then `npm run test:run -- src/app/__tests__/investor-perf.test.tsx`_
    - _Requirements: 37.1, 37.2, 37.3, 37.4_
  - [x]* 18.6 No-IO smoke → `src/app/__tests__/investor-no-io.smoke.test.ts`
    - Static scan: no fetch/XHR/localStorage/sessionStorage/cookie/indexedDB in investor slice source; export Blob allowed; ticker CSS-only.
    - _Depends: 7.4, 12.1, 15.3_
    - _Verify: `npm run test:run -- src/app/__tests__/investor-no-io.smoke.test.ts`_
    - _Requirements: 1.2, 10.4, 40.1, 40.2, 40.3, 40.4_
  - [x] 18.7 Final checkpoint
    - Ensure all tests pass; ask the user if questions arise.
    - _Verify: `npm run test:run`, `npx tsc --noEmit`, `npm run lint`, `npm run build`_

## Notes

- Tasks marked `*` are optional for a fast MVP but required for full conformance; they hold the 22
  Correctness Properties (one PBT each, `fast-check`, `{ numRuns: 100 }`, tagged
  `// Feature: kite-investor-suite, Property {n}`) plus component/integration/e2e/a11y/responsive/
  perf/smoke coverage, in the exact files from the design's Test architecture table.
- Phase A is the hard prerequisite for B/C/D (types/id/context → everything; matching + synthetic →
  matched startups + relevance; pipeline helpers → kanban; validators → wizard).
- Bundle discipline is first-class: charts only through the dynamic barrel and only inside
  `LazySection`; pipeline analytics + recent activity dynamic-imported; the ticker uses plain CSS;
  the perf audit asserts ≤150KB First Load JS per route.
- Verified investor stats are canonical and never fabricated; all other investor numbers are
  synthetic, deterministic (hash-seeded, no `Math.random`/time), and labeled illustrative.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "5.1"] },
    { "id": 1, "tasks": ["1.3", "2.1", "3.1", "4.1", "4.2", "4.7", "4.9"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.2", "4.3", "4.4", "4.5", "4.8"] },
    { "id": 3, "tasks": ["4.6", "7.1", "7.2", "7.3", "8.1", "10.1", "10.2", "11.1", "11.4", "11.5", "11.6", "14.1", "14.2", "14.3", "15.1", "15.2"] },
    { "id": 4, "tasks": ["7.4", "8.2", "11.2", "11.3", "12.1", "15.3"] },
    { "id": 5, "tasks": ["7.5", "7.6", "8.3", "8.4", "8.5", "12.2", "12.3", "12.4", "15.4", "15.5", "15.6"] },
    { "id": 6, "tasks": ["17.1", "17.2", "17.3", "18.1"] },
    { "id": 7, "tasks": ["18.2", "18.3", "18.4", "18.5", "18.6"] }
  ]
}
```
