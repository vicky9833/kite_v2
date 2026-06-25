# Requirements Document

## Introduction

This feature (Prompt 3 of the KITE multi-prompt build) adds two authenticated-surface dashboards plus shared infrastructure to the existing KITE Next.js 14 application. It builds on the completed foundation (Prompt 1) and registration/schemes/calculator slice (Prompt 2).

The two surfaces are:

1. **Startup Dashboard** at `/dashboard/startup` — a personalized, client-rendered surface gated by the in-memory `RegistrationContext`. It surfaces the registered founder's eligibility results, profile completeness, eligible schemes, an empty applications tracker, sector intelligence charts, recommended next steps, events, and resources.
2. **Government Admin Dashboard** at `/dashboard/admin` — a publicly accessible (no auth gate in this preview) aggregate analytics surface presenting synthetic-but-plausible ecosystem data: KPIs, funding timelines, a sortable scheme performance table, regional and sector analysis, founder demographics, flagship program performance, international partnerships, an activity feed, and export controls.

Shared infrastructure adds a code-split chart wrapper architecture over Recharts, two deterministic synthetic data modules, navigation entries, and a home-page integration link.

**Operating discipline (absolute constraints):**
- Frontend-only, session-only. NO backend, NO database, NO API calls, NO network I/O, NO persistence beyond the existing in-memory `RegistrationContext`. State resets on page refresh.
- Verified canonical data (22 schemes, 20 sectors, 6 Beyond Bengaluru clusters, 6 flagship programs, 32 GIA countries) is authoritative and must never be fabricated or contradicted.
- All synthetic values must be clearly labeled "illustrative for preview" (or equivalent) and produced by pure, deterministic, hash-seeded functions (no `Math.random` at runtime).
- Additive type extensions are allowed; no existing export may be removed or altered.
- EARS-format acceptance criteria; WCAG AA accessibility; 150 KB First Load JS per route.

## Glossary

### Systems and Components

- **Startup_Dashboard**: The client page composed at `src/app/dashboard/startup/page.tsx` rendering personalized founder content from `RegistrationContext`.
- **Admin_Dashboard**: The page composed at `src/app/dashboard/admin/page.tsx` rendering synthetic aggregate ecosystem analytics, publicly accessible with no auth gate.
- **Registration_Context**: The existing in-memory `RegistrationContext` provider exposing `registrationProfile`, `isRegistered`, `zone`, `qualifyingCount`, and `evaluate`.
- **Eligibility_Engine**: The existing pure module `src/lib/eligibility-engine.ts` exposing `evaluateAllSchemes`, `totalEstimatedBenefit`, `confidenceForStatus`, and related functions.
- **Synthetic_Dashboard_Data**: The pure deterministic module `src/lib/synthetic-dashboard-data.ts` returning per-sector startup-dashboard chart data from a `sectorId` key.
- **Synthetic_Admin_Data**: The pure deterministic module `src/lib/synthetic-admin-data.ts` returning all admin chart/table/feed data.
- **Startup_Recommendations**: The pure module `src/lib/startup-recommendations.ts` computing ordered recommended-action arrays from a profile.
- **Chart_Wrapper**: A single-purpose component file under `src/components/charts/` that is the ONLY file importing from `recharts` for its chart type.
- **Chart_Barrel**: The barrel `src/components/charts/index.ts` re-exporting Chart_Wrappers via `next/dynamic` with `ssr:false` and skeleton fallbacks.
- **Lazy_Section**: The existing `src/components/shared/LazySection.tsx` deferring child rendering until near the viewport with a reserved-height skeleton.
- **Flagship_Program_Card**: The existing `FlagshipProgramCard` component from Prompt 1, reused with additive extended fields on the admin surface.
- **Next_Router**: The Next.js App Router navigation API used for `router.push`.

### States

- **Unregistered_State**: `Registration_Context.isRegistered === false`.
- **Registered_State**: `Registration_Context.isRegistered === true` (a non-null `registrationProfile` is always present).
- **Redirecting_State**: The interim state on Startup_Dashboard while Unregistered_State triggers a `router.push` to `/register`, before navigation completes.
- **Profile_Set_State**: `registrationProfile !== null` while `isRegistered === false` (a quick-profile draft from the Calculator).
- **Viewport_Mobile**: Viewport width below the `md` (768px) breakpoint.
- **Viewport_Tablet**: Viewport width at or above `md` (768px) and below `lg` (1024px).
- **Viewport_Desktop**: Viewport width at or above the `lg` (1024px) breakpoint.
- **Chart_Loading_State**: A Chart_Wrapper / dynamic import state before chart code or data is ready, rendering a reserved-height skeleton.
- **Chart_Empty_State**: A Chart_Wrapper state where its data prop is empty, rendering an internal empty message instead of axes.
- **Chart_Loaded_State**: A Chart_Wrapper state with valid data rendered as the Recharts visualization.
- **Sort_Ascending_State / Sort_Descending_State**: The two directions of the Admin_Dashboard scheme table sort for a given column.

### Terms

- **kiteId**: The session-generated KITE identifier on the registered profile.
- **founderName**: The `registrationProfile.founderName` value.
- **Total_Estimated_Benefit**: `totalEstimatedBenefit(evaluateAllSchemes(profile))` in rupees.
- **Eligible_Schemes_Count**: The count of schemes with status `definitely-eligible` or `likely-eligible` (equals `Registration_Context.qualifyingCount`).
- **Profile_Completeness**: A percentage derived from how many optional registration fields are filled.
- **Ecosystem_Rank**: A synthetic percentile label (e.g. "Top 35%") flagged as illustrative.
- **Confidence_Dot**: The existing visual confidence indicator derived from an `EligibilityResult.confidence`.
- **Beyond_Bengaluru_Clusters**: The 6 canonical clusters in `src/data/clusters.ts` (Mysuru, Mangaluru, HDB, Kalaburagi, Shivamogga, Tumakuru).
- **Hash_Seeded**: Derived from a deterministic string/number hash of an input key such that the same key always yields the same output, with no `Math.random` and no time-based input at runtime.
- **Illustrative_Label**: A visible textual marker (e.g. "illustrative for preview") or an info tooltip identifying a value as synthetic/non-canonical.
- **First_Load_JS**: The Next.js per-route First Load JS bundle size metric.

## Requirements

### Requirement 1: Startup Dashboard Registration Gating

**User Story:** As an unregistered visitor, I want to be redirected to registration when I open the startup dashboard, so that I only see personalized content after I have a session profile.

#### Acceptance Criteria

1. WHILE Unregistered_State, THE Startup_Dashboard SHALL invoke Next_Router `push` to `/register?redirectFrom=dashboard/startup`.
2. WHILE Redirecting_State, THE Startup_Dashboard SHALL render an interim loading state instead of the dashboard content.
3. WHILE Redirecting_State, THE Startup_Dashboard SHALL announce the redirect through an `aria-live="polite"` region before navigation completes.
4. WHILE Registered_State, THE Startup_Dashboard SHALL render the full dashboard content.
5. WHEN the `/register` page loads with a `redirectFrom` query parameter, THE register page SHALL read the `redirectFrom` value.
6. WHEN registration completes on the `/register` page AND a `redirectFrom` value of `dashboard/startup` was provided, THE register page SHALL invoke Next_Router `push` to `/dashboard/startup`.
7. IF the `/register` page loads without a `redirectFrom` query parameter, THEN THE register page SHALL preserve the existing post-registration behavior unchanged.

### Requirement 2: Startup Dashboard Header Strip

**User Story:** As a registered founder, I want a compact header summarizing my identity and status, so that I can confirm whose dashboard I am viewing at a glance.

#### Acceptance Criteria

1. WHILE Registered_State, THE Startup_Dashboard SHALL render a header strip with vertical padding `py-8` displaying "Welcome back, {founderName}".
2. WHILE Registered_State, THE Startup_Dashboard SHALL display the kiteId in caption style within the header strip.
3. WHILE Registered_State, THE Startup_Dashboard SHALL render three quick stat tiles on the header right showing days since registration, scheme applications status, and a Status badge labeled "Active".
4. WHILE Registered_State, THE Startup_Dashboard SHALL compute days since registration as the whole-day difference between the current date and `registrationProfile.registeredAt`.
5. THE Startup_Dashboard SHALL display the scheme applications status tile value as 0 in this preview AND mark the tile value with an Illustrative_Label.
6. WHILE Registered_State, THE Startup_Dashboard SHALL render a thin row of label/value pairs below the name strip showing company name, primary sector, location, current stage, and DPIIT recognized status.
7. THE Startup_Dashboard SHALL resolve the primary sector label from the canonical `src/data/sectors.ts` entry matching `registrationProfile.primarySector`.

### Requirement 3: Startup Dashboard Hero Metrics

**User Story:** As a registered founder, I want four headline metrics about my benefits and profile, so that I understand my standing in the ecosystem quickly.

#### Acceptance Criteria

1. WHILE Viewport_Desktop, THE Startup_Dashboard SHALL render the hero metrics as four stat cards in a four-column row.
2. WHILE Viewport_Tablet, THE Startup_Dashboard SHALL render the hero metrics as a two-by-two grid.
3. WHILE Viewport_Mobile, THE Startup_Dashboard SHALL render the hero metrics as a single column.
4. THE Startup_Dashboard SHALL display the Total Estimated Benefits card value as the rupee value of Total_Estimated_Benefit from the Eligibility_Engine.
5. THE Startup_Dashboard SHALL display the Total Estimated Benefits caption as "Across X eligible schemes" where X equals Eligible_Schemes_Count.
6. THE Startup_Dashboard SHALL display the Eligible Schemes Count card value as Eligible_Schemes_Count.
7. THE Startup_Dashboard SHALL display the Eligible Schemes Count caption as "Of 22 schemes total".
8. THE Startup_Dashboard SHALL display the Profile Completeness card value as Profile_Completeness computed from the proportion of filled optional registration fields.
9. IF Profile_Completeness is below 100 percent, THEN THE Startup_Dashboard SHALL display a "Complete Profile" link.
10. THE Startup_Dashboard SHALL display the Ecosystem Rank card value as a synthetic percentile label referencing the founder's sector and stage.
11. THE Startup_Dashboard SHALL attach an info tooltip to the Ecosystem Rank card noting the value is illustrative.

### Requirement 4: Startup Dashboard Eligible Schemes Section

**User Story:** As a registered founder, I want to see the top schemes I qualify for, so that I can act on the best-value opportunities first.

#### Acceptance Criteria

1. WHILE Registered_State, THE Startup_Dashboard SHALL render a section titled "Schemes You Qualify For".
2. THE Startup_Dashboard SHALL select the eligible schemes as those with status `definitely-eligible` or `likely-eligible` from the Eligibility_Engine.
3. THE Startup_Dashboard SHALL order the eligible schemes by descending `estimatedBenefit` and display at most the top six.
4. THE Startup_Dashboard SHALL display each scheme card with the scheme name, a Confidence_Dot, the estimated benefit, and a "View Details" link to the scheme detail route.
5. WHILE Viewport_Desktop, THE Startup_Dashboard SHALL render the eligible scheme cards in a four-column layout.
6. WHILE Viewport_Tablet, THE Startup_Dashboard SHALL render the eligible scheme cards in a three-column layout.
7. WHILE Viewport_Mobile, THE Startup_Dashboard SHALL render the eligible scheme cards in a horizontally scrolling row.
8. THE Startup_Dashboard SHALL render a "See All 22 Schemes" link that navigates to `/schemes` filtered to eligible schemes.

### Requirement 5: Startup Dashboard Applications Empty State

**User Story:** As a registered founder, I want a clear applications tracker, so that I know how to start tracking applications even though I have none yet.

#### Acceptance Criteria

1. WHILE Registered_State, THE Startup_Dashboard SHALL render a section titled "Your Applications".
2. THE Startup_Dashboard SHALL render an editorial empty-state card containing a Lucide `FileText` icon, the headline "No applications yet", and the subhead "Apply to schemes you qualify for to start tracking your progress here".
3. THE Startup_Dashboard SHALL render a primary button labeled "Browse Eligible Schemes" within the empty-state card that navigates to `/schemes`.

### Requirement 6: Startup Dashboard Sector Intelligence Charts

**User Story:** As a registered founder, I want charts about my primary sector, so that I can understand sector funding, regional distribution, and top schemes.

#### Acceptance Criteria

1. WHILE Registered_State, THE Startup_Dashboard SHALL render a section titled "Your Sector at a Glance" with a subhead equal to the primary sector name.
2. WHILE Viewport_Desktop, THE Startup_Dashboard SHALL render the three sector charts in a three-column layout.
3. WHILE Viewport_Mobile, THE Startup_Dashboard SHALL render the three sector charts stacked vertically.
4. THE Startup_Dashboard SHALL render a line chart of synthetic monthly sector funding totals over the last 12 months with months on the x-axis and rupees crore on the y-axis.
5. THE Startup_Dashboard SHALL render a bar chart of DPIIT-recognized startup counts across the six Beyond_Bengaluru_Clusters plus Bengaluru with cluster on the x-axis and count on the y-axis.
6. THE Startup_Dashboard SHALL render a horizontal bar chart of the top five schemes by historical disbursement to the sector with rupees on the x-axis and scheme name on the y-axis.
7. THE Startup_Dashboard SHALL source all three sector charts' data from Synthetic_Dashboard_Data keyed by `registrationProfile.primarySector`.
8. THE Startup_Dashboard SHALL render each sector chart through its own Chart_Wrapper file imported from the Chart_Barrel.
9. THE Startup_Dashboard SHALL mark the sector intelligence data with an Illustrative_Label.

### Requirement 7: Startup Dashboard Recommended Next Steps

**User Story:** As a registered founder, I want recommended next actions tailored to my profile, so that I know what to do next to maximize benefits.

#### Acceptance Criteria

1. WHILE Registered_State, THE Startup_Dashboard SHALL render a section titled "Recommended Next Steps".
2. THE Startup_Dashboard SHALL display between three and four action cards, each with a Lucide icon, a heading, a one-sentence description, and a CTA.
3. WHILE Viewport_Desktop, THE Startup_Dashboard SHALL render the recommended action cards in a single row.
4. WHILE Viewport_Mobile, THE Startup_Dashboard SHALL render the recommended action cards stacked vertically.
5. THE Startup_Recommendations module SHALL be a pure function accepting the profile and returning an ordered array of objects with fields `id`, `iconName`, `heading`, `description`, `ctaLabel`, and `href`.
6. IF `registrationProfile.dpiitRecognized` is false, THEN THE Startup_Recommendations module SHALL include a DPIIT registration recommendation linking to `dpiit.gov.in`.
7. IF `registrationProfile.gstRegistered` is false, THEN THE Startup_Recommendations module SHALL include a GST registration recommendation.
8. IF Profile_Completeness is below 80 percent, THEN THE Startup_Recommendations module SHALL include a complete-profile recommendation.
9. WHERE the founder has not visited the Calculator, THE Startup_Recommendations module SHALL include a recommendation linking to `/calculator`.
10. WHERE the founder has not browsed Schemes recently, THE Startup_Recommendations module SHALL include a recommendation linking to `/schemes`.

### Requirement 8: Startup Dashboard Events Section

**User Story:** As a registered founder, I want to see upcoming events relevant to me, so that I can plan to participate.

#### Acceptance Criteria

1. WHILE Registered_State, THE Startup_Dashboard SHALL render a section titled "Events for You" displaying three event cards.
2. THE Startup_Dashboard SHALL source event data from the canonical `src/data/events.ts`.
3. WHERE events matching the founder profile are available, THE Startup_Dashboard SHALL display three events filtered to the founder profile.
4. IF no profile-matching events are available, THEN THE Startup_Dashboard SHALL display the next three flagship events.
5. THE Startup_Dashboard SHALL display each event card with a date block, the event name, the location, a category badge, and a "Learn More" link.

### Requirement 9: Startup Dashboard Resources Section

**User Story:** As a registered founder, I want quick links to key resources, so that I can find policy, help, and contact information.

#### Acceptance Criteria

1. WHILE Registered_State, THE Startup_Dashboard SHALL render a section titled "Resources" with three cards.
2. THE Startup_Dashboard SHALL render a Karnataka Startup Policy 2025-30 card linking to `/policies/startup-2025-30`.
3. THE Startup_Dashboard SHALL render a Help Center card linking to `/support`.
4. THE Startup_Dashboard SHALL render a Contact KITS card with the helpline `tel:` link and the email `mailto:` link sourced from the canonical footer data.

### Requirement 10: Startup Dashboard Composition and Lazy Loading

**User Story:** As a founder on a constrained device, I want heavy dashboard sections to load only when needed, so that the initial view is fast.

#### Acceptance Criteria

1. THE Startup_Dashboard SHALL be composed at `src/app/dashboard/startup/page.tsx` as a client component.
2. THE Startup_Dashboard SHALL place its sections in `src/components/dashboard/startup/`.
3. THE Startup_Dashboard SHALL render the hero metrics row and the eligible schemes section eagerly.
4. THE Startup_Dashboard SHALL render the sector intelligence section and all sections below it within Lazy_Section so they load on intersection.

### Requirement 11: Admin Dashboard Header and Notice Banner

**User Story:** As a viewer of the admin dashboard preview, I want a clear header and preview notice, so that I understand this is illustrative demonstration data.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL be publicly accessible with no registration or authentication gate in this preview.
2. THE Admin_Dashboard SHALL render a header strip with the title "Government Admin Dashboard" and a muted "Preview" badge.
3. THE Admin_Dashboard SHALL render an attribution row reading "Karnataka EITBT Department, KITS, KDEM".
4. THE Admin_Dashboard SHALL render a synthetic "Last updated 14 hours ago" indicator on the header right.
5. THE Admin_Dashboard SHALL render a single-line accent-bordered notice banner reading "Government Admin Preview. Real authentication and role-based access opens in Phase 2. This dashboard shows illustrative aggregate data for demonstration."

### Requirement 12: Admin Dashboard KPI Grid

**User Story:** As a government stakeholder, I want headline ecosystem KPIs, so that I can grasp aggregate performance at a glance.

#### Acceptance Criteria

1. WHILE Viewport_Desktop, THE Admin_Dashboard SHALL render the KPI grid as six stat cards in a three-by-two layout.
2. WHILE Viewport_Tablet, THE Admin_Dashboard SHALL render the KPI grid as a two-by-three layout.
3. WHILE Viewport_Mobile, THE Admin_Dashboard SHALL render the KPI grid as a single column.
4. THE Admin_Dashboard SHALL display a Total Registered Startups card with value 16,234 and trend indicator "+4.2% QoQ".
5. THE Admin_Dashboard SHALL display a Total Benefits Disbursed card with value "₹312 crore".
6. THE Admin_Dashboard SHALL display an Active Schemes card with value 22 and caption "All schemes operational".
7. THE Admin_Dashboard SHALL display a Scheme Applications Last Month card with value 1,847.
8. THE Admin_Dashboard SHALL display an Average Benefit Per Startup card with value "₹19 lakh".
9. THE Admin_Dashboard SHALL display a Soonicorns Tracked card with value 183 and trend indicator "+6".
10. THE Admin_Dashboard SHALL mark the KPI grid values with an Illustrative_Label.

### Requirement 13: Admin Dashboard Funding Timeline

**User Story:** As a government stakeholder, I want a funding timeline, so that I can see disbursement trends over recent quarters.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a section titled "Ecosystem Funding Over Time".
2. THE Admin_Dashboard SHALL render a full-width area chart of total disbursement by quarter for the last eight quarters with quarter on the x-axis and rupees crore on the y-axis.
3. THE Admin_Dashboard SHALL render the area chart with an accent fill and a primary stroke.
4. WHEN a viewer hovers a data point on the funding timeline chart, THE Chart_Wrapper SHALL display a tooltip.
5. THE Admin_Dashboard SHALL source the funding timeline data from Synthetic_Admin_Data.

### Requirement 14: Admin Dashboard Scheme Performance Table

**User Story:** As a government stakeholder, I want a sortable table of scheme performance, so that I can compare all schemes by applications, approvals, and disbursement.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a section titled "Scheme Performance" as a semantic table.
2. THE Admin_Dashboard SHALL render one table row for each of the 22 canonical schemes.
3. THE Admin_Dashboard SHALL render the columns Scheme Name, Type, Applications, Approved, Disbursed, Status, and a View Details action linking to `/schemes/{id}`.
4. THE Admin_Dashboard SHALL display each scheme's Type as `fiscal` or `grant` from the canonical scheme data.
5. THE Admin_Dashboard SHALL source the Applications, Approved, and Disbursed values from Synthetic_Admin_Data and mark them with an Illustrative_Label.
6. THE Admin_Dashboard SHALL default-sort the table by Disbursed in Sort_Descending_State.
7. WHEN a viewer clicks a sortable column header, THE Admin_Dashboard SHALL toggle that column between Sort_Ascending_State and Sort_Descending_State.
8. THE Admin_Dashboard SHALL set the `aria-sort` attribute on the active sortable column header to reflect the current sort direction.
9. WHILE Viewport_Mobile, THE Admin_Dashboard SHALL render the scheme performance data as stacked cards containing the same data fields.

### Requirement 15: Admin Dashboard Regional Distribution

**User Story:** As a government stakeholder, I want regional breakdowns, so that I can see startup and disbursement distribution across clusters.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a section titled "Regional Distribution".
2. WHILE Viewport_Desktop, THE Admin_Dashboard SHALL render the two regional charts side by side.
3. WHILE Viewport_Mobile, THE Admin_Dashboard SHALL render the two regional charts stacked vertically.
4. THE Admin_Dashboard SHALL render a bar chart of startup count across the six Beyond_Bengaluru_Clusters plus Bengaluru.
5. THE Admin_Dashboard SHALL render a stacked bar chart of disbursement by cluster split into fiscal and grant series with rupees crore on the y-axis.
6. THE Admin_Dashboard SHALL source the regional chart data from Synthetic_Admin_Data.

### Requirement 16: Admin Dashboard Sector Analysis

**User Story:** As a government stakeholder, I want sector analysis, so that I can see relative sector size and growth.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a section titled "Sector Performance".
2. THE Admin_Dashboard SHALL render a treemap of the 20 canonical sectors sized by synthetic startup count and shaded by funding intensity.
3. THE Admin_Dashboard SHALL render a horizontal bar chart of the top 10 sectors by year-over-year growth percentage.
4. THE Admin_Dashboard SHALL source the sector analysis data from Synthetic_Admin_Data and mark it with an Illustrative_Label.

### Requirement 17: Admin Dashboard Founder Demographics

**User Story:** As a government stakeholder, I want founder demographic breakdowns, so that I can understand the composition of the ecosystem.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a section titled "Founder Demographics" with three pie charts.
2. WHILE Viewport_Desktop, THE Admin_Dashboard SHALL render the three pie charts in a row.
3. WHILE Viewport_Mobile, THE Admin_Dashboard SHALL render the three pie charts stacked vertically.
4. THE Admin_Dashboard SHALL render a women-led pie chart showing 25 percent women-led versus other from verified data.
5. THE Admin_Dashboard SHALL render a stage distribution pie chart with the segments Idea, PoC, Early Revenue, Growth, and Scale.
6. THE Admin_Dashboard SHALL render a founder age groups pie chart with the segments under 25, 25 to 35, 35 to 45, and 45 plus.
7. THE Admin_Dashboard SHALL mark the synthetic demographic segments with an Illustrative_Label while keeping the 25 percent women-led figure attributed to verified data.

### Requirement 18: Admin Dashboard Flagship Programs

**User Story:** As a government stakeholder, I want flagship program performance, so that I can monitor enrollment and completion.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a section titled "Flagship Programs" with six cards.
2. WHILE Viewport_Desktop, THE Admin_Dashboard SHALL render the flagship program cards in a three-by-two layout.
3. THE Admin_Dashboard SHALL source the six programs from the canonical `src/data/flagship-programs.ts`.
4. THE Admin_Dashboard SHALL display each flagship program card with the program name, a synthetic disbursed value, a synthetic enrolled startup count, a synthetic completion percentage rendered as a progress bar, and a status indicator.
5. THE Admin_Dashboard SHALL render the flagship program cards using the existing Flagship_Program_Card component with additive extended fields.
6. THE Admin_Dashboard SHALL mark the synthetic flagship program values with an Illustrative_Label.

### Requirement 19: Admin Dashboard International Partnerships

**User Story:** As a government stakeholder, I want international partnership groupings, so that I can see global engagement by region.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a section titled "International Partnerships" grouping partner countries by world region.
2. THE Admin_Dashboard SHALL source partner country data from the canonical `src/data/gia-countries.ts` covering 32 countries.
3. THE Admin_Dashboard SHALL display each region with its partner-country count, a synthetic joint-program-engagement count, and a "Learn More" link to `/gia`.
4. THE Admin_Dashboard SHALL mark the synthetic joint-program-engagement counts with an Illustrative_Label.

### Requirement 20: Admin Dashboard Recent Activity Feed

**User Story:** As a government stakeholder, I want a recent activity feed, so that I can see illustrative recent ecosystem events.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a section titled "Recent Ecosystem Activity" as a vertical list of between 15 and 20 entries.
2. THE Admin_Dashboard SHALL display each activity entry with a timestamp, an activity-type icon, a description, and an entity link.
3. THE Admin_Dashboard SHALL source the activity entries from Synthetic_Admin_Data as deterministic entries.
4. THE Admin_Dashboard SHALL constrain the activity feed to a scrollable area with a maximum height of approximately 600px.
5. THE Admin_Dashboard SHALL mark the activity feed entries with an Illustrative_Label.

### Requirement 21: Admin Dashboard Export and Reports

**User Story:** As a government stakeholder, I want export and report controls, so that I can preview report generation without a backend.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a section titled "Export and Reports" with three cards.
2. THE Admin_Dashboard SHALL render a Generate Monthly Report card with a "Download Report Sample" button.
3. WHEN a viewer clicks the "Download Report Sample" button, THE Admin_Dashboard SHALL trigger a client-side Blob download of a placeholder report using a temporary anchor element with no network request.
4. THE Admin_Dashboard SHALL render a Schedule Email Briefings card with an inline "opens in Phase 2" indicator.
5. THE Admin_Dashboard SHALL render an API Access card linking to `/developers`.

### Requirement 22: Admin Dashboard Composition and Lazy Loading

**User Story:** As a viewer of the admin dashboard, I want only the top of the page to load eagerly, so that the heavy charts do not block the initial view.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL be composed at `src/app/dashboard/admin/page.tsx`.
2. THE Admin_Dashboard SHALL place its sections in `src/components/dashboard/admin/`.
3. THE Admin_Dashboard SHALL render the header strip, the notice banner, and the KPI grid eagerly.
4. THE Admin_Dashboard SHALL render every section below the KPI grid within Lazy_Section.
5. THE Admin_Dashboard SHALL import each chart through a per-chart Chart_Wrapper file dynamically via the Chart_Barrel.

### Requirement 23: Chart Wrapper Architecture

**User Story:** As a developer, I want all Recharts usage isolated behind code-split wrappers, so that chart code is lazy-loaded and bundle budgets are met.

#### Acceptance Criteria

1. THE Chart_Wrapper files SHALL reside under `src/components/charts/`.
2. THE Chart_Wrapper files SHALL be the ONLY files in the codebase that import from `recharts`.
3. THE Chart_Wrapper files SHALL each render one chart type with typed data props.
4. THE Chart_Wrapper files SHALL render the chart using KITE design tokens for color, axes, gridlines, and tooltip styling.
5. WHILE Chart_Loading_State, THE Chart_Wrapper SHALL render a reserved-height loading skeleton.
6. WHILE Chart_Empty_State, THE Chart_Wrapper SHALL render an internal empty state instead of axes.
7. THE Chart_Barrel `src/components/charts/index.ts` SHALL re-export each Chart_Wrapper via `next/dynamic` with `ssr: false` and a named skeleton fallback.
8. THE Chart_Barrel skeleton fallbacks SHALL reserve height so that swapping in the chart causes no cumulative layout shift.
9. THE dashboard consumer components SHALL import charts from the Chart_Barrel and SHALL NOT import from `recharts` directly.
10. THE Chart_Wrapper components SHALL render only inside Lazy_Section or below-the-fold content.

### Requirement 24: Synthetic Data Determinism

**User Story:** As a developer, I want synthetic data generated by pure deterministic functions, so that the same inputs always produce the same outputs and the preview is stable.

#### Acceptance Criteria

1. THE Synthetic_Dashboard_Data module `src/lib/synthetic-dashboard-data.ts` SHALL export a pure function that accepts a `sectorId` and returns the startup-dashboard chart data.
2. THE Synthetic_Admin_Data module `src/lib/synthetic-admin-data.ts` SHALL export pure functions returning scheme performance, regional, sector analysis, demographics, program performance, and activity feed data.
3. THE Synthetic_Dashboard_Data and Synthetic_Admin_Data modules SHALL derive all values Hash_Seeded from their input key.
4. THE Synthetic_Dashboard_Data and Synthetic_Admin_Data modules SHALL NOT call `Math.random` at runtime and SHALL NOT use time-based inputs.
5. WHEN Synthetic_Dashboard_Data is called more than once with the same `sectorId`, THE Synthetic_Dashboard_Data module SHALL return equal data on every call.
6. WHEN Synthetic_Admin_Data is called more than once with the same input key, THE Synthetic_Admin_Data module SHALL return equal data on every call.
7. THE Synthetic_Dashboard_Data and Synthetic_Admin_Data modules SHALL document the determinism contract in their module headers.
8. THE Synthetic_Dashboard_Data and Synthetic_Admin_Data modules SHALL keep scheme, sector, cluster, program, and GIA counts consistent with the canonical data (22 schemes, 20 sectors, 6 Beyond Bengaluru clusters, 6 flagship programs, 32 GIA countries).

### Requirement 25: Navigation Integration

**User Story:** As a visitor, I want dashboard links in the main navigation, so that I can reach both dashboards from anywhere.

#### Acceptance Criteria

1. THE navigation data file `src/data/navigation.ts` SHALL include a "Dashboard" top-level dropdown positioned between "For Stakeholders" and "Connect".
2. THE "Dashboard" dropdown SHALL include a child "My Startup Dashboard" linking to `/dashboard/startup`.
3. THE "Dashboard" dropdown SHALL include a child "Government Admin Dashboard" linking to `/dashboard/admin`.
4. THE mobile navigation SHALL render the "Dashboard" dropdown and its two children.
5. THE footer "For Startups" column SHALL include a "Dashboards" link.

### Requirement 26: Home Page Dashboard Integration

**User Story:** As a registered founder on the home page, I want a quick link to my dashboard, so that I can jump to it from the Register quick action card.

#### Acceptance Criteria

1. WHILE Registered_State, THE Register quick action card SHALL render a "Go to Dashboard" primary link to `/dashboard/startup` alongside the existing "See Your Schemes" link.
2. WHILE Unregistered_State, THE Register quick action card SHALL preserve its existing unregistered behavior unchanged.

### Requirement 27: Bundle and Performance Budget

**User Story:** As a developer, I want each dashboard route to stay within the bundle ceiling, so that load performance remains acceptable.

#### Acceptance Criteria

1. THE Startup_Dashboard route SHALL have a First_Load_JS of 150 KB or less.
2. THE Admin_Dashboard route SHALL have a First_Load_JS of 150 KB or less.
3. WHERE a dashboard route exceeds the First_Load_JS budget, THE chart loading strategy SHALL convert eagerly-loaded charts to dynamically imported charts.
4. THE Chart_Wrapper code SHALL be excluded from each route's initial bundle through dynamic import.

### Requirement 28: Accessibility

**User Story:** As a user relying on assistive technology, I want the dashboards to be accessible, so that I can perceive the data and operate the controls.

#### Acceptance Criteria

1. THE Chart_Wrapper components SHALL provide an `aria-label` describing the chart.
2. THE Startup_Dashboard and Admin_Dashboard SHALL render a screen-reader-only prose summary of each chart's primary data adjacent to the chart.
3. THE Admin_Dashboard scheme performance table SHALL use semantic table markup with `aria-sort` on sortable headers.
4. WHILE Redirecting_State, THE Startup_Dashboard SHALL announce the redirect through an `aria-live="polite"` region.
5. THE Startup_Dashboard and Admin_Dashboard interactive controls SHALL expose visible focus states and accessible names.

### Requirement 29: Visual Discipline

**User Story:** As a stakeholder, I want the dashboards to follow the KITE visual system, so that they feel consistent with the rest of the product.

#### Acceptance Criteria

1. THE Startup_Dashboard and Admin_Dashboard SHALL render cards with `rounded-xl`, `shadow-sm`, and a border.
2. THE Startup_Dashboard and Admin_Dashboard content sections SHALL use vertical padding `py-16` on mobile and `py-24` on desktop, except header strips which use `py-8`.
3. THE Startup_Dashboard and Admin_Dashboard SHALL constrain content width to `max-w-7xl`.
4. THE Startup_Dashboard and Admin_Dashboard SHALL use Plus Jakarta Sans for headings and Inter for body text, with stat-card numbers in Plus Jakarta Sans bold.
5. THE Startup_Dashboard and Admin_Dashboard SHALL use only Lucide icons.
6. THE Chart_Wrapper components SHALL use only the canonical KITE palette, applying primary blue for primary data, accent orange for highlights and CTAs, and success, warning, or danger colors only for status and never for decoration.
7. THE Chart_Wrapper components SHALL render charts on white or surface backgrounds with very-low-opacity gridlines, muted caption axis labels, and small crisp-shadow rounded tooltips.
8. THE Startup_Dashboard and Admin_Dashboard SHALL NOT use gradients, decorative blobs, emoji, glassmorphism, glow effects, or SaaS-style rounding.

### Requirement 30: Frontend-Only Session-Only Constraint

**User Story:** As the project owner, I want the dashboards to remain frontend-only and session-only, so that the preview honors the build discipline.

#### Acceptance Criteria

1. THE Startup_Dashboard and Admin_Dashboard SHALL perform no network requests, no database access, and no API calls.
2. THE Startup_Dashboard and Admin_Dashboard SHALL persist no data beyond the in-memory Registration_Context.
3. THE Startup_Dashboard SHALL read all personalized data from the in-memory Registration_Context and the pure Eligibility_Engine.
4. WHEN the page is refreshed, THE Startup_Dashboard SHALL reflect the reset Unregistered_State because the Registration_Context holds state in memory only.
5. THE feature SHALL extend existing types additively without removing or altering any existing export.
6. THE Admin_Dashboard "Download Report Sample" action SHALL produce its file entirely client-side without any network request.
