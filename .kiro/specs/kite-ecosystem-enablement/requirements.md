# Requirements Document

## Introduction

The KITE Ecosystem Enablement Layer (Prompt 5) builds the bridge between the founder
side and the investor side of the KITE marketplace inside the existing Next.js 14 /
App Router / TypeScript-strict project. Incubators and accelerators are where founders
develop and where investors source; mentors are the founder-facing discovery surface
that supports that development. This layer adds four routes:

1. **Incubators & Accelerators Index** at `/incubators` — a public discovery surface
   listing Karnataka's incubators, accelerators, and research parks, filterable by
   cluster, sector/focus, and type, with click-through to detail content.
2. **KAN (Karnataka Acceleration Network)** at `/programs/kan` — an editorial program
   detail page reading as a credible government program page.
3. **K-Combinator** at `/programs/k-combinator` — an editorial program detail page
   mirroring KAN's section structure with K-Combinator specifics.
4. **Mentor Connect** at `/mentors` — a public discovery surface for founder-mentor
   matching, populated by a deterministically-generated synthetic mentor directory.

These pages must read as institutional, credible, and useful — not promotional. Mentor
Connect is the most promotional surface and therefore exercises the most restraint.

This layer follows the operating discipline established in Prompts 1–4: it is
frontend-only and session-only. There is NO backend, NO database, NO API, NO network or
`fetch`, and NO persistence (no `localStorage`, `sessionStorage`, cookies, or
`indexedDB`); blob-based downloads are the only permitted output. Verified Karnataka
ecosystem data is canonical and is never fabricated; all non-verified figures are
synthetic, deterministic (hash-seeded via the existing `synthetic-prng`, never using
`Math.random` or any time/date source), and visibly labeled illustrative via the
existing `IllustrativeBadge` component. Acceptance criteria follow the EARS format.
Type extensions are additive only. Each route targets WCAG 2.1 AA and a 150KB First
Load JS budget.

This document defines the requirements for that layer. It does not introduce scope
beyond the founder brief.

## Glossary

### Systems and Components

- **Enablement_Layer**: The complete set of four routes, their data modules, and the
  synthetic generators defined by this document.
- **Incubators_Index**: The public discovery route at `/incubators`.
- **Incubator_Detail**: The verified-plus-illustrative detail surface for a single
  incubator, rendered either as an inline panel or as a separate route (founder
  judgment).
- **KAN_Page**: The editorial program detail page at `/programs/kan`.
- **KCombinator_Page**: The editorial program detail page at `/programs/k-combinator`.
- **Mentor_Connect**: The public discovery route at `/mentors`.
- **Mentor_Detail**: The detail surface for a single mentor, rendered either as an
  inline panel or as a separate route (founder judgment).
- **Synthetic_Mentor_Module**: The pure module generating the mentor directory.
- **Synthetic_Incubator_Detail_Module**: The pure module generating illustrative
  detail-page content for incubators beyond their verified fields.
- **Synthetic_PRNG**: The existing pure hash-seeded generator at
  `src/lib/synthetic-prng.ts` (`seededRng`, `seededInt`, `seededPick`,
  `seededShuffle`).
- **Illustrative_Badge**: The existing visible marker component at
  `src/components/investors/IllustrativeBadge.tsx`.
- **Lazy_Section**: The existing below-the-fold lazy-loading wrapper at
  `src/components/shared/LazySection.tsx`.
- **Chart_Barrel**: The existing dynamic chart barrel at
  `src/components/charts/index.ts` (`next/dynamic`, `ssr: false`).
- **Navigation_Data**: The navigation source of truth at `src/data/navigation.ts`.
- **Incubator_Data**: The verified data file at `src/data/incubators.ts`.
- **Sector_Data**: The canonical 20-sector taxonomy at `src/data/sectors.ts`.
- **Types_Module**: The shared type module at `src/types/index.ts`.
- **Apply_CTA**: A call-to-action that links to an official Karnataka portal via an
  external `https` link.

### Domain Terms

- **Verified_Data**: Canonical, real Karnataka ecosystem data that is never fabricated
  (see Verified Data Constants).
- **Synthetic_Data**: Generated, non-real data that is deterministic and visibly
  labeled illustrative.
- **Illustrative_Label**: A visible marker (the Illustrative_Badge) identifying a
  surface, card, section, or field as synthetic preview content.
- **Cluster**: One of the six Beyond Bengaluru regional clusters plus the Bengaluru
  cluster as represented in Incubator_Data.
- **Focus**: A sector/focus tag on an incubator record (`Incubator.focus[]`).
- **Incubator_Type**: One of `Incubator`, `Accelerator`, `Research Park`.
- **Mentor_Profile**: A synthetic mentor record (see Requirement 8 fields).
- **Mentor_Type**: One of `Domain Expert`, `Founder Mentor`, `Investor Mentor`,
  `Government Liaison`.
- **Experience_Level**: A banding of a mentor's years of experience used for filtering.
- **Editorial_Section_Set**: The shared set of sections that both KAN_Page and
  KCombinator_Page render: program overview, what the program provides, cohort
  structure, application process, success stories (illustrative), partner
  incubators/accelerators, and an Apply_CTA.

### Verified Data Constants (canonical, never fabricated)

- **Incubators**: 164+ incubators/accelerators across Karnataka; Incubator_Data
  contains 24 representative verified entries (id, name, cluster, focus[], type).
- **KAN**: 6-month acceleration cohorts; 306 startups over 3 years.
- **K-Combinator**: partnership with KDEM and TiE Mangaluru; located at wrkwrk in
  Silicon Beach Mangaluru; 4–6 startups per cohort; 3 cohorts per year; 90 startups
  over 5 years; target 5 soonicorns by 2034; sectors = Deep Tech, Space, Drone, AI,
  Robotics, HealthTech, AgriTech, FinTech, MarineTech; grant ₹10 lakh per qualifying
  startup at 0% equity; 5-year budget ₹9.5 crore from GoK plus ₹50 lakh in-kind from
  TiE.
- **Canonical ecosystem counts** kept consistent across the build: 22 schemes, 20
  sectors, 6 Beyond Bengaluru clusters, 6 flagship programs, 32 GIA countries, 21,000+
  DPIIT startups, 183 soonicorns, $79 billion raised, 46% VC share.

### States

- **No_Filter_State**: A discovery surface (Incubators_Index or Mentor_Connect) with no
  active filters; all records are displayed.
- **Filtered_State**: A discovery surface with one or more active filters; only matching
  records are displayed.
- **No_Results_State**: A Filtered_State whose active filters match zero records.
- **Detail_Open_State**: A discovery surface where a single record's detail surface is
  open (inline panel or separate route).

## Requirements

### Requirement 1: Incubators & Accelerators Index Listing

**User Story:** As a founder or investor exploring Karnataka's support
infrastructure, I want to browse the incubators, accelerators, and research parks, so
that I can identify relevant programs to engage with.

#### Acceptance Criteria

1. THE Incubators_Index SHALL replace the current StubPage at `/incubators` such that no
   StubPage placeholder content remains on the route.
2. THE Incubators_Index SHALL render exactly one card per entry in Incubator_Data (24
   cards in No_Filter_State).
3. THE Incubators_Index SHALL display, on each card, the incubator name, cluster,
   incubator type (one of `Incubator`, `Accelerator`, `Research Park`), and one distinct
   tag for every value in the record's focus[] list, drawn verbatim from the verified
   Incubator_Data record.
4. THE Incubators_Index SHALL display visible text stating that Karnataka hosts 164+
   incubators and accelerators.
5. THE Incubators_Index SHALL display a visible label marking the 24 listed entries as a
   representative verified subset.
6. WHEN the Incubators_Index is first rendered, THE Incubators_Index SHALL be in
   No_Filter_State with all 24 verified entries displayed.
7. THE Incubators_Index SHALL render each card with the institutional visual treatment
   defined in Requirement 14 (rounded-xl, shadow-sm, border).

### Requirement 2: Incubators Index Filtering

**User Story:** As a visitor with a specific interest, I want to filter the incubator
list by cluster, sector/focus, and type, so that I can narrow results to what is
relevant to me.

#### Acceptance Criteria

1. THE Incubators_Index SHALL provide a filter control for cluster populated from the
   distinct cluster values present in Incubator_Data.
2. THE Incubators_Index SHALL provide a filter control for sector/focus populated from
   the distinct focus values present in Incubator_Data.
3. THE Incubators_Index SHALL provide a filter control for incubator type with the
   values `Incubator`, `Accelerator`, and `Research Park`.
4. WHEN a visitor selects a cluster filter value, THE Incubators_Index SHALL display
   only incubators whose cluster is exactly equal (case-sensitive string equality) to the
   selected value.
5. WHEN a visitor selects a sector/focus filter value, THE Incubators_Index SHALL
   display only incubators whose focus list contains a value exactly equal
   (case-sensitive string equality) to the selected value.
6. WHEN a visitor selects an incubator type filter value, THE Incubators_Index SHALL
   display only incubators whose type is exactly equal to the selected value.
7. WHEN a visitor activates filter values across two or more of the three dimensions
   (cluster, focus, type), THE Incubators_Index SHALL display only incubators that
   satisfy the logical AND of all active filters.
8. WHEN filter selections change, THE Incubators_Index SHALL recompute and re-render the
   results and the matching count without a page reload and without any network request.
9. WHEN a visitor clears all active filters, THE Incubators_Index SHALL return to
   No_Filter_State and display all 24 verified entries.
10. IF the active filter combination matches zero incubators, THEN THE Incubators_Index
    SHALL enter No_Results_State and display an empty-state message naming each active
    filter's dimension and selected value.
11. WHILE the Incubators_Index is in Filtered_State, THE Incubators_Index SHALL display
    the integer count (0–24 inclusive) of matching incubators.

### Requirement 3: Incubator Detail Content

**User Story:** As a visitor evaluating a specific incubator, I want to open a detail
view, so that I can understand what the program offers in more depth.

#### Acceptance Criteria

1. WHEN a visitor activates an incubator card by pointer click or by keyboard (Enter or
   Space), THE Incubators_Index SHALL enter Detail_Open_State and present the
   Incubator_Detail for that incubator, with at most one Incubator_Detail open at a time.
2. THE Incubator_Detail SHALL display the verified fields of the selected incubator
   (name, cluster, type, focus tags) exactly as stored, without altering characters or
   tag order.
3. WHERE the Incubator_Detail presents content beyond the verified fields, THE
   Incubator_Detail SHALL generate that content via Synthetic_Incubator_Detail_Module
   using Synthetic_PRNG seeded by the incubator id, without using `Math.random`, `Date`,
   or any other ambient input.
4. THE Incubator_Detail SHALL render exactly one Illustrative_Badge on every section or
   field that contains Synthetic_Data.
5. THE Incubator_Detail SHALL NOT render an Illustrative_Badge on sections that contain
   only Verified_Data.
6. WHEN the Incubator_Detail for a given incubator id is generated two or more times
   within a session, THE Synthetic_Incubator_Detail_Module SHALL produce byte-for-byte
   identical content on every generation.
7. WHEN a visitor closes the Incubator_Detail (via a close control or Escape), THE
   Incubators_Index SHALL return to the prior No_Filter_State or Filtered_State with
   prior filter selections preserved.
8. IF an incubator id has no matching Incubator_Data record, THEN THE Incubators_Index
   SHALL NOT enter Detail_Open_State and SHALL preserve the current state.

### Requirement 4: KAN Editorial Program Page

**User Story:** As a founder considering acceleration support, I want a credible
program page for the Karnataka Acceleration Network, so that I can understand the
program and how to apply.

#### Acceptance Criteria

1. THE KAN_Page SHALL render a real editorial page at `/programs/kan` rather than the
   humanized dynamic-route stub fallback.
2. THE KAN_Page SHALL render the Editorial_Section_Set as exactly seven non-empty,
   labeled sections in this order: program overview, what KAN provides, cohort structure,
   application process, success stories, partner incubators/accelerators, and an
   Apply_CTA.
3. THE KAN_Page SHALL present the verified figure that KAN operates 6-month
   acceleration cohorts.
4. THE KAN_Page SHALL present the verified figure that KAN has supported 306 startups
   over 3 years.
5. THE KAN_Page SHALL render success stories as Synthetic_Data generated via
   Synthetic_PRNG and SHALL mark the success-stories section with the
   Illustrative_Badge.
6. THE KAN_Page SHALL NOT render the Illustrative_Badge on sections that present only
   verified KAN figures.
7. THE KAN_Page SHALL provide an Apply_CTA that links to the official Karnataka portal
   via an external `https` link.
8. THE KAN_Page SHALL use declarative, third-person factual copy and SHALL NOT use
   superlatives, exclamation marks, or urgency/scarcity phrasing (the Apply_CTA is the
   only call-to-action permitted).

### Requirement 5: K-Combinator Editorial Program Page

**User Story:** As a founder in a deep-tech or frontier sector, I want a credible
program page for K-Combinator, so that I can evaluate the program's terms and apply.

#### Acceptance Criteria

1. THE KCombinator_Page SHALL replace the current StubPage at `/programs/k-combinator`
   with a real editorial page.
2. THE KCombinator_Page SHALL render the same Editorial_Section_Set as the KAN_Page.
3. THE KCombinator_Page SHALL present the verified partnership with KDEM and TiE
   Mangaluru.
4. THE KCombinator_Page SHALL present the verified location as wrkwrk in Silicon Beach
   Mangaluru.
5. THE KCombinator_Page SHALL present the verified cohort structure of 4–6 startups per
   cohort and 3 cohorts per year.
6. THE KCombinator_Page SHALL present the verified target of 90 startups over 5 years.
7. THE KCombinator_Page SHALL present the verified target of 5 soonicorns by 2034.
8. THE KCombinator_Page SHALL present exactly these nine verified sectors: Deep Tech,
   Space, Drone, AI, Robotics, HealthTech, AgriTech, FinTech, and MarineTech.
9. THE KCombinator_Page SHALL present the verified grant of ₹10 lakh per qualifying
   startup at 0% equity.
10. THE KCombinator_Page SHALL present the verified 5-year budget of ₹9.5 crore from
    the Government of Karnataka plus ₹50 lakh in-kind from TiE.
11. THE KCombinator_Page SHALL render success stories as Synthetic_Data generated via
    Synthetic_PRNG with a fixed seed (byte-for-byte identical on regeneration) and SHALL
    mark the success-stories section with exactly one Illustrative_Badge.
12. THE KCombinator_Page SHALL NOT render an Illustrative_Badge on sections that present
    only verified K-Combinator figures.
13. THE KCombinator_Page SHALL provide an Apply_CTA that links to the official Karnataka
    portal via an external `https` link and SHALL NOT transmit any user or portal data.
14. THE KCombinator_Page SHALL use declarative, third-person factual copy and SHALL NOT
    use superlatives, exclamation marks, or urgency/scarcity phrasing (the Apply_CTA is
    the only call-to-action permitted).

### Requirement 6: Mentor Connect Directory Listing

**User Story:** As a founder seeking guidance, I want a directory of mentors, so that I
can discover individuals whose expertise matches my needs.

#### Acceptance Criteria

1. THE Mentor_Connect SHALL replace the current StubPage at `/mentors`.
2. THE Mentor_Connect SHALL render a card grid of Mentor_Profile records.
3. THE Mentor_Connect SHALL render exactly one directory-level Illustrative_Badge
   marking the entire directory as illustrative synthetic data, because no verified
   mentor data exists.
4. WHEN the Mentor_Connect is first rendered, THE Mentor_Connect SHALL be in
   No_Filter_State with all generated mentors displayed (one card per Mentor_Profile).
5. THE Mentor_Connect SHALL render each mentor card with the institutional visual
   treatment defined in Requirement 14 (rounded-xl, shadow-sm, border).
6. THE Mentor_Connect SHALL use declarative, third-person factual copy and SHALL NOT use
   superlatives, urgency/scarcity phrasing, or exhortations.

### Requirement 7: Mentor Directory Synthetic Generation

**User Story:** As the system owner, I want the mentor directory generated
deterministically without real data, so that the preview is plausible, stable, and
clearly non-real.

#### Acceptance Criteria

1. THE Synthetic_Mentor_Module SHALL generate between 24 and 30 Mentor_Profile records
   inclusive.
2. THE Synthetic_Mentor_Module SHALL generate all Mentor_Profile data using
   Synthetic_PRNG seeded by a stable per-mentor key.
3. THE Synthetic_Mentor_Module SHALL NOT use `Math.random`, `Date`, `Date.now`,
   `performance.now`, or any other time, locale, or ambient input.
4. WHEN the mentor directory is generated more than once, THE Synthetic_Mentor_Module
   SHALL produce an identical set of Mentor_Profile records on every generation.
5. THE Synthetic_Mentor_Module SHALL draw each mentor's sectors of expertise from the
   20 canonical sectors in Sector_Data.
6. THE Synthetic_Mentor_Module SHALL assign each mentor a Mentor_Type from the set
   `Domain Expert`, `Founder Mentor`, `Investor Mentor`, `Government Liaison`.

### Requirement 8: Mentor Profile Fields

**User Story:** As a founder reviewing a mentor, I want each mentor profile to carry
consistent, useful fields, so that I can compare mentors at a glance.

#### Acceptance Criteria

1. THE Synthetic_Mentor_Module SHALL assign each Mentor_Profile a mentor name.
2. THE Synthetic_Mentor_Module SHALL derive an initials-avatar placeholder for each
   Mentor_Profile and SHALL NOT use any photograph.
3. THE Synthetic_Mentor_Module SHALL assign each Mentor_Profile a professional title and
   a firm.
4. THE Synthetic_Mentor_Module SHALL assign each Mentor_Profile one or more sectors of
   expertise from the 20 canonical sectors.
5. THE Synthetic_Mentor_Module SHALL assign each Mentor_Profile a years-of-experience
   value as a positive integer.
6. THE Synthetic_Mentor_Module SHALL assign each Mentor_Profile a Mentor_Type.
7. THE Synthetic_Mentor_Module SHALL assign each Mentor_Profile an availability
   indicator.
8. THE Synthetic_Mentor_Module SHALL assign each Mentor_Profile a one-paragraph
   illustrative bio.
9. THE Mentor_Connect SHALL display the mentor name, initials-avatar placeholder,
   professional title, firm, sectors of expertise, years of experience, Mentor_Type,
   and availability indicator on each mentor card.

### Requirement 9: Mentor Directory Filtering

**User Story:** As a founder with specific needs, I want to filter mentors by sector,
type, and experience level, so that I can find the most relevant mentors quickly.

#### Acceptance Criteria

1. THE Mentor_Connect SHALL provide a filter control for sector populated from the 20
   canonical sectors.
2. THE Mentor_Connect SHALL provide a filter control for Mentor_Type with the values
   `Domain Expert`, `Founder Mentor`, `Investor Mentor`, and `Government Liaison`.
3. THE Mentor_Connect SHALL provide a filter control for Experience_Level.
4. WHEN a visitor selects a sector filter value, THE Mentor_Connect SHALL display only
   mentors whose sectors of expertise include the selected value.
5. WHEN a visitor selects a Mentor_Type filter value, THE Mentor_Connect SHALL display
   only mentors whose Mentor_Type matches the selected value.
6. WHEN a visitor selects an Experience_Level filter value, THE Mentor_Connect SHALL
   display only mentors whose years of experience fall within the selected
   Experience_Level band.
7. WHEN a visitor activates more than one filter, THE Mentor_Connect SHALL display only
   mentors that satisfy all active filters.
8. WHEN a visitor clears all active filters, THE Mentor_Connect SHALL return to
   No_Filter_State and display all generated mentors.
9. IF the active filter combination matches zero mentors, THEN THE Mentor_Connect SHALL
   enter No_Results_State and display an empty-state message naming the active filters.
10. WHILE the Mentor_Connect is in Filtered_State, THE Mentor_Connect SHALL display the
    count of matching mentors.

### Requirement 10: Mentor Detail View

**User Story:** As a founder interested in a specific mentor, I want to open a detail
view, so that I can read the mentor's full bio and expertise.

#### Acceptance Criteria

1. WHEN a visitor activates a mentor card, THE Mentor_Connect SHALL enter
   Detail_Open_State and present the Mentor_Detail for that mentor.
2. THE Mentor_Detail SHALL display the mentor name, initials-avatar placeholder,
   professional title, firm, sectors of expertise, years of experience, Mentor_Type,
   availability indicator, and one-paragraph illustrative bio.
3. THE Mentor_Detail SHALL render the Illustrative_Badge because all mentor content is
   synthetic.
4. WHEN a visitor closes the Mentor_Detail, THE Mentor_Connect SHALL return to the prior
   No_Filter_State or Filtered_State.

### Requirement 11: Canonical and Verified Data Integrity

**User Story:** As the system owner, I want verified data treated as canonical and all
synthetic data clearly labeled, so that the portal remains credible.

#### Acceptance Criteria

1. THE Enablement_Layer SHALL render Verified_Data exactly as defined in the Verified
   Data Constants without alteration.
2. THE Enablement_Layer SHALL NOT fabricate values presented as verified.
3. THE Enablement_Layer SHALL generate all non-verified values as Synthetic_Data via
   Synthetic_PRNG.
4. THE Enablement_Layer SHALL render the Illustrative_Badge on every surface, section,
   card, or field that presents Synthetic_Data.
5. THE Enablement_Layer SHALL preserve the canonical ecosystem counts (22 schemes, 20
   sectors, 6 clusters, 6 flagship programs, 32 GIA countries, 21,000+ DPIIT startups,
   183 soonicorns, $79 billion raised, 46% VC share) wherever those counts are
   referenced.

### Requirement 12: Frontend-Only and No-IO Discipline

**User Story:** As the system owner, I want the layer to remain frontend-only and
session-only, so that it carries no backend, persistence, or data-transmission risk.

#### Acceptance Criteria

1. THE Enablement_Layer SHALL NOT call any backend, database, or API.
2. THE Enablement_Layer SHALL NOT use `fetch` or any other network request.
3. THE Enablement_Layer SHALL NOT use `localStorage`, `sessionStorage`, cookies, or
   `indexedDB`.
4. THE Enablement_Layer SHALL NOT persist any state beyond the in-memory session.
5. WHERE the Enablement_Layer offers a file download, THE Enablement_Layer SHALL produce
   the download from an in-memory blob without any network request.
6. WHERE the Enablement_Layer presents an Apply_CTA, THE Apply_CTA SHALL link to an
   external official Karnataka portal via an `https` link and SHALL NOT transmit any
   user or portal data.

### Requirement 13: Bundle Budget and Lazy Loading

**User Story:** As a visitor on a constrained connection, I want each route to load
within a strict budget, so that the pages remain fast.

#### Acceptance Criteria

1. THE Enablement_Layer SHALL keep First Load JS at or below 150KB for each of the four
   routes.
2. WHERE a route renders a chart, THE route SHALL import the chart only through the
   Chart_Barrel using `next/dynamic` with `ssr: false`.
3. WHERE a route has below-the-fold sections, THE route SHALL lazy-load those sections
   via Lazy_Section.

### Requirement 14: Accessibility (WCAG 2.1 AA)

**User Story:** As a visitor using assistive technology, I want the four routes to be
fully accessible, so that I can use them with a keyboard and screen reader.

#### Acceptance Criteria

1. THE Enablement_Layer SHALL render headings on each route in correct semantic order
   without skipping levels.
2. THE Enablement_Layer SHALL provide an accessible name for every interactive control.
3. THE Enablement_Layer SHALL make every interactive control operable by keyboard.
4. THE Enablement_Layer SHALL associate a visible label with every filter control.
5. THE Enablement_Layer SHALL provide an `aria-label` for every region landmark.
6. WHEN a filter result count changes, THE Enablement_Layer SHALL announce the updated
   count via an `aria-live` region.
7. THE Enablement_Layer SHALL provide a text alternative for each initials-avatar
   placeholder.

### Requirement 15: Visual Discipline

**User Story:** As the system owner, I want a consistent institutional visual style, so
that the pages read as government-grade rather than as a SaaS product.

#### Acceptance Criteria

1. THE Enablement_Layer SHALL render cards with `rounded-xl`, `shadow-sm`, and a border.
2. THE Enablement_Layer SHALL apply section padding of `py-16` / `md:py-24` and header
   strip padding of `py-8` / `py-12`.
3. THE Enablement_Layer SHALL constrain content width to `max-w-7xl`.
4. THE Enablement_Layer SHALL use Plus Jakarta Sans for headings and Inter for body
   text.
5. THE Enablement_Layer SHALL use Lucide icons exclusively for iconography.
6. THE Enablement_Layer SHALL NOT use gradients, blobs, emoji, glassmorphism, glow
   effects, or SaaS-style rounding.
7. THE Enablement_Layer SHALL NOT use the `text-h4` class.

### Requirement 16: Additive Type Extensions

**User Story:** As a maintainer, I want all new types appended without altering existing
types, so that prior features remain intact.

#### Acceptance Criteria

1. THE Enablement_Layer SHALL append all new types (including `MentorProfile`,
   `MentorType`, incubator filter shapes, and any KAN or K-Combinator page data
   structures) to Types_Module.
2. THE Enablement_Layer SHALL NOT alter any existing export in Types_Module.
3. THE Enablement_Layer SHALL NOT remove any existing export from Types_Module.
4. THE Enablement_Layer SHALL compile under TypeScript strict mode without errors.

### Requirement 17: Navigation Integration

**User Story:** As a visitor, I want the four routes reachable through the site
navigation, so that I can find them without typing URLs.

#### Acceptance Criteria

1. THE Enablement_Layer SHALL keep the existing navigation links to `/incubators`,
   `/mentors`, and `/programs/k-combinator` resolving to the routes defined by this
   document.
2. THE Enablement_Layer SHALL add a navigation or link entry for the KAN_Page at
   `/programs/kan`.
3. THE Enablement_Layer SHALL NOT remove any existing navigation entry.
4. WHEN a visitor activates any of the four navigation entries, THE Enablement_Layer
   SHALL route the visitor to the corresponding route.
