# Requirements Document

## Introduction

The KITE Investor Suite (Prompt 4) builds the investor side of the KITE two-sided
marketplace inside the existing Next.js 14 / App Router project. It adds three new
routes — Investor Connect (`/investors`, public), Investor Dashboard
(`/dashboard/investor`), and Deal Pipeline (`/dashboard/investor/pipeline`) — plus a
4-step investor onboarding wizard at `/investors/onboard`. State for the investor
side is held in a new in-memory `InvestorContext`, and startup/investor matching is
driven by a pure matching engine.

The suite follows the same operating discipline established in Prompts 1–3: it is
frontend-only and session-only. There is NO backend, NO database, NO API, and NO
persistence beyond in-memory React context (which resets on refresh). Verified
Karnataka ecosystem data is canonical and is never fabricated; all investor-specific
numbers (portfolios, deals, match candidates, ticker events, analytics) are synthetic,
deterministic, and visibly labeled "illustrative for preview". Acceptance criteria
follow the EARS format. Type extensions are additive. The suite targets WCAG 2.1 AA
and a 150KB First Load JS budget per route.

This document defines the requirements for that suite. It does not introduce scope
beyond the founder brief.

## Glossary

### Systems and Components

- **Investor_Suite**: The complete set of investor-side routes, context, matching
  engine, and synthetic data modules defined by this document.
- **Investor_Context**: The client-side React provider at `src/context/InvestorContext.tsx`
  holding session-only investor state and exposing investor mutators and selectors.
- **Matching_Engine**: The pure module at `src/lib/investor-matching.ts` exposing
  `evaluateMatch` and `evaluateSchemeRelevance`.
- **Investor_Connect**: The public discovery route at `/investors`.
- **Onboarding_Wizard**: The 4-step investor onboarding flow at `/investors/onboard`.
- **Investor_Dashboard**: The personalized route at `/dashboard/investor`.
- **Deal_Pipeline**: The kanban workflow route at `/dashboard/investor/pipeline`.
- **Synthetic_Investor_Module**: The pure module at `src/lib/synthetic-investor-data.ts`
  generating public Investor Connect data (featured opportunities, deal-flow ticker,
  50-candidate matching pool, sector-intelligence chart data).
- **Synthetic_Dashboard_Module**: The pure module at `src/lib/investor-dashboard-data.ts`
  generating dashboard data (portfolio, deal flow, KITVEN co-investments, ecosystem
  signals chart data).
- **Chart_Barrel**: The existing dynamic chart barrel at `src/components/charts/index.ts`
  through which all charts are imported.
- **Navigation_Data**: The navigation source of truth at `src/data/navigation.ts`.
- **Footer_Data**: The footer source of truth at `src/data/footer.ts`.
- **Investor_ID_Generator**: The pure generator producing identifiers of the form
  `INV-YYYY-XXXXXX`, modeled on the existing KITE ID generator.

### Domain Terms

- **Investor_Profile**: The investor data object held by Investor_Context.
- **Portfolio_Company**: A record of a company the investor has invested in.
- **Tracked_Deal**: A record of a deal the investor is evaluating, carrying a current
  stage, a manual order within that stage, and optional notes.
- **Match_Result**: The output of `evaluateMatch` — `{ startupId, score, signal, reasons }`.
- **Relevance_Result**: The output of `evaluateSchemeRelevance` —
  `{ schemeId, isRelevant, reason }`.
- **Match_Score**: An integer 0–100 expressing thesis fit between an investor and a startup.
- **Synthetic_Data**: Generated, non-real data, deterministic and labeled illustrative.
- **Verified_Data**: Canonical Karnataka ecosystem figures that are never fabricated
  (see Verified Data Constants).
- **Illustrative_Label**: A visible text label marking a surface or card as synthetic
  preview data.
- **Active_Deal**: A Tracked_Deal whose `currentStage` is not `Closed` and not `Passed`.

### Verified Data Constants (canonical, never fabricated)

- **$79 billion** raised since 2010
- **183 soonicorns** (startups valued $100M+)
- **21,000 DPIIT startups**
- **46%** of India's VC since 2016
- **2.5M** tech workforce
- **350K** chip-design/embedded workforce
- **₹100 crore** KITVEN corpus, **2–10%** of corpus per investment, **max 30%** stake
- Canonical ecosystem counts kept consistent: **22 schemes**, **20 sectors**,
  **6 Beyond Bengaluru clusters**, **6 flagship programs**, **32 GIA countries**

### States

- **Not_Onboarded_State**: Investor_Context has `isOnboarded === false` (the default state).
- **Onboarded_State**: Investor_Context has `isOnboarded === true` with a generated
  `investorId` and an `onboardedAt` timestamp.
- **Redirecting_State**: The Investor_Dashboard is mounted while Not_Onboarded_State,
  performing a redirect to the Onboarding_Wizard.
- **DealStage_Sourced**, **DealStage_Screening**, **DealStage_Diligence**,
  **DealStage_TermSheet**, **DealStage_Closed**, **DealStage_Passed**: The six values
  of a Tracked_Deal's `currentStage`.
- **Signal_StrongMatch**: Match_Result signal when Match_Score ≥ 80.
- **Signal_PossibleMatch**: Match_Result signal when Match_Score is 50–79.
- **Signal_OutOfThesis**: Match_Result signal when Match_Score < 50.
- **Ticker_Playing**: The Live Deal Flow ticker auto-scrolling.
- **Ticker_Paused**: The Live Deal Flow ticker paused on hover.
- **Viewport_Mobile**: Viewport width below the `md` breakpoint.
- **Viewport_Tablet**: Viewport width at or above `md` and below `lg`.
- **Viewport_Desktop**: Viewport width at or above the `lg` breakpoint.
- **Wizard_Step_State**: The current step (1–4) of the Onboarding_Wizard.
- **Onboarding_Success_State**: The terminal state of the Onboarding_Wizard after a
  successful, accuracy-gated submit.

## Requirements

### Requirement 1: InvestorContext session-only state

**User Story:** As a developer, I want a session-only investor context, so that investor
state is available across the investor routes without any backend or persistence.

#### Acceptance Criteria

1. THE Investor_Context SHALL initialize with a null `investorProfile` and `isOnboarded`
   equal to false.
2. THE Investor_Context SHALL hold all state in in-memory React state only, performing
   NO localStorage, sessionStorage, cookie, IndexedDB, or network operation.
3. WHEN a page refresh occurs, THE Investor_Context SHALL reset to the initial null
   profile and `isOnboarded` false (Not_Onboarded_State).
4. THE Investor_Suite SHALL wrap the Investor_Context provider in the RootLayout
   alongside the LanguageProvider and RegistrationProvider.
5. WHERE a component consumes the investor context outside an Investor_Context provider,
   THE Investor_Context SHALL expose a `useOptionalInvestor` hook that returns a safe
   default value without throwing.
6. WHEN `useInvestor` is called outside an Investor_Context provider, THE Investor_Context
   SHALL throw a descriptive error.

### Requirement 2: InvestorContext profile mutators

**User Story:** As an investor user, I want my profile and deal data to update in the
session, so that the investor surfaces reflect my inputs during preview.

#### Acceptance Criteria

1. WHEN `updateInvestorProfile` is called with a partial profile, THE Investor_Context
   SHALL merge the partial onto the current profile while preserving every untouched field.
2. WHEN `completeOnboarding` is called, THE Investor_Context SHALL set `isOnboarded` to
   true, generate an `investorId` in the format `INV-YYYY-XXXXXX`, and stamp `onboardedAt`
   with an ISO 8601 timestamp (Onboarded_State).
3. WHEN `addDeal` is called with a deal, THE Investor_Context SHALL append the deal to
   `dealsTracked` with a manual order within its `currentStage`.
4. WHEN `updateDealStage` is called with a deal identifier and a target stage, THE
   Investor_Context SHALL set that deal's `currentStage` to the target stage.
5. WHEN `removeDeal` is called with a deal identifier, THE Investor_Context SHALL remove
   that deal from `dealsTracked`.
6. WHEN `addPortfolioCompany` is called with a portfolio company, THE Investor_Context
   SHALL append the company to `portfolioCompanies`.
7. WHEN `resetInvestor` is called, THE Investor_Context SHALL return to the initial null
   profile and `isOnboarded` false.
8. THE Investor_Context SHALL expose `investorProfile`, `updateInvestorProfile`,
   `completeOnboarding`, `addDeal`, `updateDealStage`, `removeDeal`, `addPortfolioCompany`,
   and `resetInvestor` through its context value.

### Requirement 3: Investor type definitions

**User Story:** As a developer, I want typed investor models, so that the investor
surfaces are type-safe and consistent.

#### Acceptance Criteria

1. THE Investor_Suite SHALL add the type definitions to `src/types/index.ts` additively
   without modifying or removing existing exported types.
2. THE Investor_Suite SHALL define an `InvestorRole` union of `GP`, `Partner`, `Principal`,
   `Associate`, `Angel`, `Family Office`, `Corporate VC`, and `Government Fund`.
3. THE Investor_Suite SHALL define a `FirmType` union of `VC`, `Angel Network`,
   `Family Office`, `Corporate VC`, `Government Fund`, and `Accelerator Fund`.
4. THE Investor_Suite SHALL define an `InvestmentStage` union of `Pre-Seed`, `Seed`,
   `Series A`, `Series B Plus`, and `Growth`.
5. THE Investor_Suite SHALL define a `DealStage` union of `Sourced`, `Screening`,
   `Diligence`, `Term-Sheet`, `Closed`, and `Passed`.
6. THE Investor_Suite SHALL define a `PortfolioCompany` interface with `id`, `companyName`,
   `sector`, `stage`, `investedAmountLakhs`, `investedDate`, and a `currentStatus` of
   `Active`, `Exited`, `Written-Off`, or `Folded`.
7. THE Investor_Suite SHALL define a `TrackedDeal` interface with `id`, `companyName`,
   `sector`, `stage`, `askLakhs`, `currentStage`, a manual order within stage, and optional
   notes.
8. THE Investor_Suite SHALL define an `InvestorProfile` interface with identity fields
   (`investorName`, `firmName`, `investorEmail`, `investorPhone`, `role`), firm fields
   (`firmType`, `assetsUnderManagement`, `foundedYear`), thesis fields (`focusSectors`,
   `focusStages`, `ticketSizeMinLakhs`, `ticketSizeMaxLakhs`, `geographicFocus`),
   portfolio (`portfolioCompanies`), deals (`dealsTracked`), and status fields
   (`isOnboarded`, `investorId`, `onboardedAt`).
9. THE Investor_Suite SHALL define an `InvestorContextValue` interface describing the
   context value exposed by Investor_Context.

### Requirement 4: Matching engine — evaluateMatch scoring

**User Story:** As an investor, I want startups scored against my thesis, so that I can
focus on the strongest fits.

#### Acceptance Criteria

1. THE Matching_Engine SHALL expose a pure `evaluateMatch(investorProfile, startupProfile)`
   function that returns a Match_Result of `{ startupId, score, signal, reasons }`.
2. THE Matching_Engine SHALL derive `startupId` from the startup's `kiteId`.
3. THE Matching_Engine SHALL compute `score` as the sum of sector overlap (weight 40),
   stage match (weight 30), geographic match (weight 20), and ticket-size compatibility
   (weight 10).
4. THE Matching_Engine SHALL produce a `score` that is always within the inclusive range
   0 to 100.
5. WHEN `score` is greater than or equal to 80, THE Matching_Engine SHALL set `signal` to
   Signal_StrongMatch.
6. WHEN `score` is between 50 and 79 inclusive, THE Matching_Engine SHALL set `signal` to
   Signal_PossibleMatch.
7. WHEN `score` is less than 50, THE Matching_Engine SHALL set `signal` to Signal_OutOfThesis.
8. THE Matching_Engine SHALL return a non-empty `reasons` array that explains each scoring
   factor's contribution.
9. WHEN `evaluateMatch` is called more than once with identical inputs, THE Matching_Engine
   SHALL return identical Match_Results (deterministic).

### Requirement 5: Matching engine — evaluateSchemeRelevance

**User Story:** As an investor, I want government schemes assessed against my profile, so
that I can identify schemes relevant to my portfolio.

#### Acceptance Criteria

1. THE Matching_Engine SHALL expose a pure `evaluateSchemeRelevance(investorProfile, scheme)`
   function that returns a Relevance_Result of `{ schemeId, isRelevant, reason }`.
2. THE Matching_Engine SHALL determine relevance using a pure rules table keyed on scheme
   id and investor fields.
3. WHERE a scheme is `KITVEN Fund-5`, THE Matching_Engine SHALL mark it relevant to all
   investors as a co-investor opportunity.
4. WHERE a scheme is `Beyond Bengaluru Cluster Seed Fund` and the investor's geographic
   focus includes `Karnataka Beyond Bengaluru`, THE Matching_Engine SHALL mark it relevant.
5. WHERE a scheme is `R&D Project Grant` and the investor's focus sectors include
   Deep Tech, THE Matching_Engine SHALL mark it relevant.
6. THE Matching_Engine SHALL return a non-empty `reason` string for every Relevance_Result.
7. WHEN `evaluateSchemeRelevance` is called more than once with identical inputs, THE
   Matching_Engine SHALL return identical Relevance_Results (deterministic).

### Requirement 6: Synthetic data determinism

**User Story:** As a developer, I want all synthetic investor data to be deterministic, so
that the preview is byte-stable across reloads and test runs.

#### Acceptance Criteria

1. THE Synthetic_Investor_Module SHALL generate featured opportunities, the live deal-flow
   ticker events, the 50-candidate matching pool, and sector-intelligence chart data.
2. THE Synthetic_Dashboard_Module SHALL generate dashboard portfolio data, deal-flow data,
   KITVEN co-investment data, and ecosystem-signals chart data.
3. THE Synthetic_Investor_Module and Synthetic_Dashboard_Module SHALL derive all values
   from hash-seeded pseudo-random generation only, using NO `Math.random` and NO
   time-dependent values.
4. WHEN a synthetic generator is invoked more than once with the same seed key, THE
   producing module SHALL return identical output.
5. THE Synthetic_Investor_Module and Synthetic_Dashboard_Module SHALL document their
   determinism contract in module-level comments.
6. THE Investor_Suite SHALL never present Synthetic_Data as Verified_Data and SHALL never
   alter Verified_Data Constants.

### Requirement 7: Investor Connect hero strip

**User Story:** As a prospective investor, I want a clear entry point, so that I can begin
engaging with the Karnataka ecosystem.

#### Acceptance Criteria

1. THE Investor_Connect SHALL render at `/investors` as a public route with no onboarding gate.
2. THE Investor_Connect SHALL render a compact hero strip with `py-12` and a dark background,
   the headline "Investor Connect", and the subhead "Discover the Karnataka startup ecosystem
   from an investor's lens".
3. WHEN the "Get Investor Access" call-to-action is activated, THE Investor_Connect SHALL
   navigate to `/investors/onboard`.
4. WHEN the "View Live Deal Flow" call-to-action is activated, THE Investor_Connect SHALL
   navigate to the in-page section with id `deals`.
5. THE Investor_Connect hero SHALL display the Verified_Data headline stats: 183 soonicorns,
   $79 billion raised since 2010, 21,000 DPIIT startups, and 46% of India's VC since 2016.

### Requirement 8: Investor Connect — Why Karnataka

**User Story:** As a prospective investor, I want evidence of Karnataka's strengths, so that
I can justify engaging with the ecosystem.

#### Acceptance Criteria

1. THE Investor_Connect SHALL render a "Why Karnataka" section with three cards built from
   Verified_Data.
2. THE Investor_Connect SHALL render a "Largest Tech Workforce" card stating 2.5M tech
   professionals and 350K chip-design/embedded professionals.
3. THE Investor_Connect SHALL render a "Highest VC Concentration" card stating 46% of India's
   VC since 2016.
4. THE Investor_Connect SHALL render a "Soonicorn Capital" card stating 183 startups valued
   $100M+ with the highest concentration in India.
5. WHILE Viewport_Desktop, THE Investor_Connect SHALL lay the three cards out in three columns;
   WHILE Viewport_Mobile, THE Investor_Connect SHALL stack the three cards.

### Requirement 9: Investor Connect — Featured Opportunities

**User Story:** As an investor, I want to see example deal opportunities, so that I can
gauge the kind of startups in the ecosystem.

#### Acceptance Criteria

1. THE Investor_Connect SHALL render a "Featured Opportunities" section with six synthetic
   startup opportunity cards sourced from the Synthetic_Investor_Module.
2. THE Investor_Connect SHALL display, on each opportunity card, company name, sector badge,
   stage badge, ask amount (lakhs or crore), a one-sentence pitch, location, and a Connect button.
3. THE Investor_Connect SHALL display an Illustrative_Label as a corner label on each
   opportunity card.
4. WHILE Viewport_Desktop, THE Investor_Connect SHALL lay opportunity cards out in three
   columns; WHILE Viewport_Tablet, in two columns; WHILE Viewport_Mobile, in one column.

### Requirement 10: Investor Connect — Live Deal Flow ticker

**User Story:** As an investor, I want a live sense of deal activity, so that the ecosystem
feels active and current.

#### Acceptance Criteria

1. THE Investor_Connect SHALL render a "Live Deal Flow" section with the section id `deals`.
2. THE Investor_Connect SHALL render twenty synthetic recent deal events, each showing a
   relative timestamp, sector, stage, deal type, and amount.
3. WHILE Viewport_Desktop, THE Investor_Connect SHALL present the deal events as a horizontal
   auto-scrolling ticker (Ticker_Playing); WHILE Viewport_Mobile, THE Investor_Connect SHALL
   present the deal events as a vertical list.
4. WHILE Ticker_Playing, THE Investor_Connect SHALL auto-scroll the ticker slowly from left
   to right using plain CSS animation and NOT framer-motion or react-spring.
5. WHEN a pointer hovers over the ticker, THE Investor_Connect SHALL pause the ticker
   (Ticker_Paused).
6. THE Investor_Connect SHALL display an Illustrative_Label on the deal-flow section.
7. WHEN the deal-flow section first renders, THE Investor_Connect SHALL announce the deal
   activity through an `aria-live="polite"` region, and SHALL NOT announce on subsequent
   scroll because the scroll is decorative.

### Requirement 11: Investor Connect — KITVEN co-investment

**User Story:** As an investor, I want KITVEN co-investment terms, so that I can consider
co-investing alongside the state fund.

#### Acceptance Criteria

1. THE Investor_Connect SHALL render a "Co-invest with KITVEN" section stating the Verified_Data
   terms: ₹100 crore corpus, 2–10% of corpus per investment, and max 30% stake.
2. THE Investor_Connect SHALL render a "Submit Co-investment Proposal" ghost call-to-action
   that is visual-only and references `eitbt.karnataka.gov.in/startup`.
3. WHEN the "View Active Co-investments" call-to-action is activated, THE Investor_Connect
   SHALL navigate to the in-page section with id `kitven-portfolio`.

### Requirement 12: Investor Connect — Beyond Bengaluru

**User Story:** As an investor, I want cluster-level deal context, so that I can find
opportunities outside Bengaluru.

#### Acceptance Criteria

1. THE Investor_Connect SHALL render a "Beyond Bengaluru" section with six cluster cards
   reusing the existing ClusterCard pattern.
2. THE Investor_Connect SHALL display, on each cluster card with investor framing, the cluster
   name, focus sectors, a synthetic soonicorn count, and a synthetic co-investment capacity.
3. WHEN a cluster card's "View Deal Flow" link is activated, THE Investor_Connect SHALL
   navigate to `/clusters/{id}` for that cluster.

### Requirement 13: Investor Connect — Sector intelligence charts

**User Story:** As an investor, I want sector performance charts, so that I can spot funding
trends.

#### Acceptance Criteria

1. THE Investor_Connect SHALL render a "Sector Performance" section with two charts imported
   through the Chart_Barrel.
2. THE Investor_Connect SHALL render a horizontal bar chart of the top-10 sectors by funding
   raised over the last 12 months using Synthetic_Data.
3. THE Investor_Connect SHALL render a line chart of startup-count growth by sector over the
   last 24 months for the top 5 sectors using Synthetic_Data.
4. WHILE Viewport_Desktop, THE Investor_Connect SHALL lay the two charts side by side;
   WHILE Viewport_Mobile, THE Investor_Connect SHALL stack the two charts.

### Requirement 14: Investor Connect — GIA international investors

**User Story:** As an international investor, I want country-level entry points, so that I can
understand how my country connects with Karnataka.

#### Acceptance Criteria

1. THE Investor_Connect SHALL render an "International Investors Welcome" section with six
   country highlight cards.
2. THE Investor_Connect SHALL display, on each country card, a flag-icons SVG, the country
   name, and a one-sentence investment-thesis framing relating to Karnataka.
3. WHEN a country card's "Learn More" link is activated, THE Investor_Connect SHALL navigate
   to `/gia`.

### Requirement 15: Investor Connect — Onboarding CTA

**User Story:** As a prospective investor, I want a clear way to begin onboarding, so that I
can request investor access.

#### Acceptance Criteria

1. THE Investor_Connect SHALL render a centered "Get Investor Access" section.
2. WHEN the "Begin Onboarding" primary call-to-action is activated, THE Investor_Connect SHALL
   navigate to `/investors/onboard`.
3. THE Investor_Connect SHALL display the secondary line: "KITE Investor Access is a free
   verification process for accredited investors looking to engage with the Karnataka
   ecosystem. Real verification opens in Phase 2."

### Requirement 16: Onboarding wizard

**User Story:** As a prospective investor, I want a guided onboarding wizard, so that I can
provide my details and receive an investor identifier.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL render at `/investors/onboard` as a four-step wizard using a
   `useReducer`-based architecture, a progress bar, and per-step validation, matching the
   existing registration wizard architecture.
2. THE Onboarding_Wizard SHALL present Step 1 for investor identity, Step 2 for firm profile,
   Step 3 for investment thesis, and Step 4 for review and submit.
3. IF a step's required fields are invalid, THEN THE Onboarding_Wizard SHALL block advancing
   to the next step and SHALL surface the validation messages.
4. WHILE the accuracy attestation on Step 4 is not confirmed, THE Onboarding_Wizard SHALL keep
   the submit action disabled.
5. WHEN onboarding is submitted successfully, THE Onboarding_Wizard SHALL call `completeOnboarding`
   and enter Onboarding_Success_State displaying the generated `investorId` (Onboarded_State).
6. WHEN onboarding completes successfully AND a `redirectFrom` query parameter is present, THE
   Onboarding_Wizard SHALL navigate to the destination indicated by `redirectFrom`.

### Requirement 17: Investor Dashboard gate and preview banner

**User Story:** As a visitor, I want the investor dashboard to require onboarding, so that the
dashboard reflects an investor profile, and I want a clear preview disclaimer.

#### Acceptance Criteria

1. THE Investor_Dashboard SHALL render at `/dashboard/investor` with no authentication gate.
2. IF the session is in Not_Onboarded_State, THEN THE Investor_Dashboard SHALL redirect to
   `/investors/onboard?redirectFrom=dashboard/investor` (Redirecting_State).
3. WHILE Redirecting_State, THE Investor_Dashboard SHALL announce the redirect through an
   `aria-live="polite"` region and SHALL NOT flash personalized content before the redirect.
4. WHILE Onboarded_State, THE Investor_Dashboard SHALL render a preview banner stating
   "Investor Dashboard Preview. Real authentication and investor verification opens in Phase 2.
   This dashboard shows illustrative portfolio and deal flow data for demonstration."

### Requirement 18: Investor Dashboard header strip

**User Story:** As an onboarded investor, I want a personalized header, so that I can confirm
my identity and status at a glance.

#### Acceptance Criteria

1. THE Investor_Dashboard SHALL render a header strip with "Welcome back, {investorName}" and a
   `firmName` caption.
2. THE Investor_Dashboard SHALL display, on the right of the header strip, the Investor ID, a
   synthetic last-login value, and a Status badge.

### Requirement 19: Investor Dashboard KPI grid

**User Story:** As an onboarded investor, I want headline portfolio and pipeline metrics, so
that I can assess my position quickly.

#### Acceptance Criteria

1. THE Investor_Dashboard SHALL render a KPI grid of six stat cards.
2. THE Investor_Dashboard SHALL display a Portfolio Value card computed as a synthetic rupee
   aggregate of `portfolioCompanies`.
3. THE Investor_Dashboard SHALL display an Active Deals card counting Active_Deals.
4. THE Investor_Dashboard SHALL display a Pipeline Value card summing `askLakhs` across Active_Deals.
5. THE Investor_Dashboard SHALL display a Portfolio Companies card counting companies whose
   `currentStatus` is `Active`.
6. THE Investor_Dashboard SHALL display an Exits This Year card using a synthetic value.
7. THE Investor_Dashboard SHALL display a Karnataka Allocation card as the percentage of the
   portfolio in Karnataka companies.

### Requirement 20: Investor Dashboard matched startups

**User Story:** As an onboarded investor, I want startups matched to my thesis, so that I can
review the strongest opportunities.

#### Acceptance Criteria

1. THE Investor_Dashboard SHALL render a "Startups Matching Your Thesis" section.
2. THE Investor_Dashboard SHALL generate a pool of 50 synthetic candidate startups and run each
   through `evaluateMatch` against the investor profile.
3. THE Investor_Dashboard SHALL sort candidates by `score` descending and display the top six.
4. THE Investor_Dashboard SHALL display, on each match card, company name, sector, stage, ask,
   location, the match score as a large number, a match signal badge, and a View Details link.
5. THE Investor_Dashboard SHALL render a "See All Matches" link below the match cards.
6. WHEN the matched-startups section renders, THE Investor_Dashboard SHALL announce match counts
   through an `aria-live="polite"` region.
7. THE Investor_Dashboard SHALL cache the computed matches with `useMemo` so they are not
   recomputed on unrelated re-renders.

### Requirement 21: Investor Dashboard portfolio

**User Story:** As an onboarded investor, I want a portfolio table, so that I can review my
holdings and add companies.

#### Acceptance Criteria

1. THE Investor_Dashboard SHALL render a "Your Portfolio" section as a compact table with the
   columns Company, Sector, Stage at Investment, Invested Amount, Invested Date, Current Status,
   and Current Estimated Value (synthetic).
2. WHEN a company row is activated, THE Investor_Dashboard SHALL expand that row with synthetic
   detail.
3. WHILE `portfolioCompanies` is empty, THE Investor_Dashboard SHALL render an empty state with
   an inline "Add Portfolio Company" form.
4. WHEN the "Add Portfolio Company" form is submitted, THE Investor_Dashboard SHALL add a
   synthetic Portfolio_Company entry to Investor_Context via `addPortfolioCompany`.

### Requirement 22: Investor Dashboard deal flow summary

**User Story:** As an onboarded investor, I want a pipeline summary, so that I can see how my
deals are distributed across stages.

#### Acceptance Criteria

1. THE Investor_Dashboard SHALL render an "Active Pipeline" section grouping `dealsTracked` by
   `currentStage` as small horizontal bars showing the count per stage.
2. WHEN the "Go to Pipeline" link is activated, THE Investor_Dashboard SHALL navigate to
   `/dashboard/investor/pipeline`.

### Requirement 23: Investor Dashboard ecosystem signals

**User Story:** As an onboarded investor, I want ecosystem signal panels, so that I can track
trends relevant to my thesis.

#### Acceptance Criteria

1. THE Investor_Dashboard SHALL render a "Karnataka Signals" section with three panels.
2. THE Investor_Dashboard SHALL render a panel charting `focusSectors` funding trend over 12
   months as a line chart via the Chart_Barrel.
3. THE Investor_Dashboard SHALL render a panel charting stage distribution across `focusStages`
   as a bar chart via the Chart_Barrel.
4. THE Investor_Dashboard SHALL render a panel listing three to four synthetic KITVEN
   co-investments this quarter that match the investor thesis as a table.

### Requirement 24: Investor Dashboard schemes for portfolio

**User Story:** As an onboarded investor, I want relevant government schemes, so that I can
share them with my portfolio companies.

#### Acceptance Criteria

1. THE Investor_Dashboard SHALL render a "Government Schemes for Your Portfolio" section showing
   the top six schemes ranked by `evaluateSchemeRelevance`.
2. THE Investor_Dashboard SHALL display, on each scheme card, the scheme name, a why-it-matters
   reason, and the maximum benefit.
3. THE Investor_Dashboard SHALL render a visual-only "Share with Portfolio" action on each
   scheme card.

### Requirement 25: Investor Dashboard events and resources

**User Story:** As an onboarded investor, I want relevant events and resources, so that I can
engage further with the ecosystem.

#### Acceptance Criteria

1. THE Investor_Dashboard SHALL render an "Investor Events" section with three event cards
   filtered from the events data to investor-relevant categories (summit, demo-day, masterclass).
2. THE Investor_Dashboard SHALL render an "Investor Resources" section with three cards: a
   Karnataka Investment Memo Template (synthetic download), a KITVEN Co-Investment Guide, and a
   Contact Investor Relations card showing the helpline and email from the Footer_Data.

### Requirement 26: Deal Pipeline header and add deal

**User Story:** As an onboarded investor, I want a pipeline header with an add-deal action, so
that I can manage and grow my deal list.

#### Acceptance Criteria

1. THE Deal_Pipeline SHALL render at `/dashboard/investor/pipeline` with state held in
   Investor_Context.
2. IF the session is in Not_Onboarded_State, THEN THE Deal_Pipeline SHALL redirect to
   `/investors/onboard?redirectFrom=dashboard/investor/pipeline` consistent with the dashboard gate.
3. THE Deal_Pipeline SHALL render a compact `py-8` header strip with the title "Your Deal Pipeline"
   and the subhead "managing N active deals across six stages", where N is the count of Active_Deals.
4. WHEN the "Add Deal" primary action is activated, THE Deal_Pipeline SHALL open an inline form
   to add a synthetic Tracked_Deal to Investor_Context via `addDeal`.

### Requirement 27: Deal Pipeline filter bar

**User Story:** As an onboarded investor, I want to filter and search my deals, so that I can
focus on a subset of the pipeline.

#### Acceptance Criteria

1. THE Deal_Pipeline SHALL render a filter bar with filters for sector, stage range, ask range,
   and date range, plus a search input on the right.
2. WHEN any filter or the search input changes, THE Deal_Pipeline SHALL filter `dealsTracked`
   client-side against the active criteria.
3. THE Deal_Pipeline SHALL provide accessible labels for every filter control and the search input.

### Requirement 28: Deal Pipeline kanban board

**User Story:** As an onboarded investor, I want a kanban board, so that I can see my deals
organized by stage.

#### Acceptance Criteria

1. THE Deal_Pipeline SHALL render six columns: Sourced, Screening, Diligence, Term-Sheet, Closed,
   and Passed.
2. THE Deal_Pipeline SHALL display, on each column header, the stage name and the count of deals
   in that stage.
3. THE Deal_Pipeline SHALL render each column as a scrollable area of deal cards showing company
   name, sector badge, ask, and a synthetic days-in-stage value.
4. WHILE a column has no deals, THE Deal_Pipeline SHALL render a "Drop deals here / Add deal"
   placeholder in that column.
5. THE Deal_Pipeline SHALL order deal cards within a stage by the manual order stored in
   Investor_Context, and SHALL allow reordering within the stage via that manual order.
6. THE Deal_Pipeline SHALL NOT use drag-and-drop.

### Requirement 29: Deal Pipeline move and remove

**User Story:** As an onboarded investor, I want to move and remove deals, so that I can advance
deals through stages without drag-and-drop.

#### Acceptance Criteria

1. WHEN a deal card receives hover or focus, THE Deal_Pipeline SHALL reveal a Move control
   implemented as a native `<select>` listing target stages and a Remove button.
2. WHEN a target stage is selected in the Move control, THE Deal_Pipeline SHALL call
   `updateDealStage` to move the deal to that stage.
3. WHEN the Remove button is activated, THE Deal_Pipeline SHALL call `removeDeal` to remove the
   deal from Investor_Context.

### Requirement 30: Deal Pipeline analytics, activity, and notes

**User Story:** As an onboarded investor, I want pipeline analytics, activity, and notes, so
that I can understand pipeline health and record context.

#### Acceptance Criteria

1. THE Deal_Pipeline SHALL render a stage-analytics row below the board showing synthetic average
   days in each stage, synthetic conversion rates between stages, and synthetic velocity (deals
   moved this week).
2. THE Deal_Pipeline SHALL render a "Recent Activity" vertical list of synthetic activity entries
   covering stage transitions, deal additions, and notes.
3. THE Deal_Pipeline SHALL render an "Add Note" inline input on each deal card.
4. WHEN a note is submitted on a deal card, THE Deal_Pipeline SHALL store the note on that deal's
   record in Investor_Context.
5. THE Deal_Pipeline SHALL dynamically import the stage-analytics row and the Recent Activity
   list from the start to protect the route's First Load JS budget.

### Requirement 31: Deal Pipeline export

**User Story:** As an onboarded investor, I want to export my pipeline, so that I can use the
data outside the preview.

#### Acceptance Criteria

1. THE Deal_Pipeline SHALL render an export action at the bottom of the route.
2. WHEN the export action is activated, THE Deal_Pipeline SHALL produce a client-side Blob
   download of the pipeline in CSV/text form, consistent with the existing admin dashboard
   export pattern, with no network request.

### Requirement 32: Deal Pipeline accessibility

**User Story:** As a keyboard or assistive-technology user, I want the kanban board to be
accessible, so that I can manage deals without a mouse.

#### Acceptance Criteria

1. THE Deal_Pipeline SHALL make the kanban board keyboard-navigable.
2. THE Deal_Pipeline SHALL render each column as a region with an `aria-label`.
3. THE Deal_Pipeline SHALL make each deal card focusable with an accessible name.
4. THE Deal_Pipeline SHALL implement the Move control as a native `<select>` element.

### Requirement 33: Navigation integration

**User Story:** As a user, I want investor links in the existing navigation, so that I can reach
the investor surfaces from anywhere.

#### Acceptance Criteria

1. THE Navigation_Data SHALL add three links under the existing "Connect" dropdown without
   creating a new top-level navigation item: "Investor Connect" to `/investors`, "Investor
   Dashboard" to `/dashboard/investor`, and "Deal Pipeline" to `/dashboard/investor/pipeline`.
2. THE Navigation_Data SHALL expose the three investor links in the mobile navigation consistently
   with the desktop navigation.

### Requirement 34: Footer integration

**User Story:** As a user, I want investor links in the footer, so that I can reach the investor
routes from the site footer.

#### Acceptance Criteria

1. THE Footer_Data SHALL expand the existing "For Investors" column with links to `/investors`,
   `/dashboard/investor`, and `/dashboard/investor/pipeline`.

### Requirement 35: Home integration

**User Story:** As a home-page visitor, I want the Investor Connect quick action to work, so
that I can reach the new investor surface.

#### Acceptance Criteria

1. THE Investor_Suite SHALL keep the home page's eight-action quick-action grid unchanged in count.
2. THE Investor_Suite SHALL repoint the existing "Investor Connect" quick action to `/investors`.

### Requirement 36: Chart reuse

**User Story:** As a developer, I want charts imported through the existing barrel, so that the
chart bundle stays code-split and consistent.

#### Acceptance Criteria

1. THE Investor_Suite SHALL import all charts through the Chart_Barrel and SHALL NOT import from
   `recharts` directly.
2. WHERE an existing barrel chart wrapper satisfies a chart need, THE Investor_Suite SHALL reuse
   that wrapper rather than adding a new one.
3. WHERE a genuinely new chart type is required, THE Investor_Suite SHALL add a new wrapper file
   and export it from the Chart_Barrel.

### Requirement 37: Bundle and performance budget

**User Story:** As a user, I want fast investor pages, so that the routes load quickly.

#### Acceptance Criteria

1. THE Investor_Connect, Investor_Dashboard, and Deal_Pipeline routes SHALL each keep First Load
   JS at or below 150KB.
2. THE Deal_Pipeline SHALL dynamically import the stage-analytics row and Recent Activity list
   from the start.
3. THE Investor_Dashboard SHALL load chart sections through the Chart_Barrel so the chart library
   is excluded from the route's initial bundle.
4. THE Investor_Connect ticker SHALL use plain CSS animation rather than a JavaScript animation
   library.

### Requirement 38: Accessibility (WCAG AA)

**User Story:** As a user with disabilities, I want the investor suite to meet accessibility
standards, so that I can use it with assistive technology.

#### Acceptance Criteria

1. THE Investor_Suite SHALL meet WCAG 2.1 AA for color contrast, focus visibility, and keyboard
   operability across all new routes.
2. THE Investor_Suite SHALL provide accessible names for all interactive controls, including
   filter controls, Move selects, Connect buttons, and call-to-action links.
3. WHEN match counts or redirect status change, THE Investor_Suite SHALL announce them through
   `aria-live="polite"` regions while keeping decorative ticker scroll non-announced.

### Requirement 39: Visual discipline

**User Story:** As a stakeholder, I want the investor suite to match the KITE visual system, so
that the investor side feels consistent with the rest of the portal.

#### Acceptance Criteria

1. THE Investor_Suite SHALL use the established visual system: `rounded-xl shadow-sm border`
   cards, `py-16`/`md:py-24` content sections, `py-8`/`py-12` header strips, `max-w-7xl`
   containers, Plus Jakarta Sans headings, and Inter body text.
2. THE Investor_Suite SHALL use Lucide icons only and SHALL NOT use gradients, blobs, emoji,
   glassmorphism, glow effects, or SaaS-style rounding.
3. THE Investor_Suite SHALL render the match score as the largest numeric moment using large,
   bold Plus Jakarta Sans in an accent or primary color.
4. THE Investor_Suite SHALL render match signal badges using only success, warning, and muted
   styles and SHALL NEVER use a danger style for Signal_OutOfThesis.

### Requirement 40: Frontend-only constraint

**User Story:** As a stakeholder, I want the investor suite to remain frontend-only, so that the
preview adheres to the project's session-only discipline.

#### Acceptance Criteria

1. THE Investor_Suite SHALL operate with NO backend, NO database, NO API, and NO network request.
2. THE Investor_Suite SHALL hold all investor state in in-memory React context only, with NO
   localStorage, sessionStorage, cookie, or IndexedDB persistence.
3. WHEN a page refresh occurs, THE Investor_Suite SHALL reset all investor session state to the
   Not_Onboarded_State default.
4. THE Investor_Suite SHALL label all Synthetic_Data as illustrative for preview wherever it is
   displayed.
