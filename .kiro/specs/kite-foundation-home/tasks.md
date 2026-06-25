# Implementation Plan: KITE Foundation + Home Page

## Overview

This plan implements the KITE foundation slice (Next.js 14 App Router, TypeScript strict) top-to-bottom in five dependency-ordered phases: Foundation → Layout → Data Layer → Home Sections → Stubs & Polish. Each task names the exact file(s) it touches (paths from the design's file structure), the earlier task(s) it depends on, and a concrete "how do I know it's done" verification step. Test sub-tasks are marked `*` and are optional for a fast MVP but are required for full conformance. The 20 correctness properties from the design are folded in as one property-based test (PBT) each, tagged `// Feature: kite-foundation-home, Property {n}: ...` and run with `fc.assert(..., { numRuns: 100 })`.

Tasks deliberately do NOT invent unspecified content (scheme details, country lists, event dates, marketing copy, etc.). Where the design fixes only cardinality/enums/names but not concrete values, the data task instructs sourcing REAL verified values and the specific gaps are listed under "Open Questions / Needs Decision" at the end rather than baked into a task as fabricated values.

> Cross-phase note: The layout components in Phase 2 (Header, MobileNav, CommandPalette, Footer) consume `src/data/navigation.ts` and `src/data/footer.ts`. Those two modules are grouped under the Data Layer (Phase 3, tasks 3.1 and 3.2) per the spec, but they are data prerequisites for Phase 2. The Task Dependency Graph schedules 3.1 and 3.2 ahead of the layout components so there is no orphaned code. Build them first.

## Tasks

### Phase 1: Foundation

- [x] 1.1 Scaffold Next.js 14 App Router project with TypeScript strict mode
  - Create/initialize: `package.json`, `tsconfig.json` (`"strict": true`, `noUncheckedIndexedAccess`, no implicit `any`), `next.config.mjs`, `.eslintrc.json`, `src/app/layout.tsx` (minimal placeholder), `src/app/page.tsx` (minimal placeholder)
  - _Depends on: none_
  - _Verify:_ `npx tsc --noEmit` reports zero errors and `npm run lint` runs; project structure has `src/app/`
  - _Requirements: 1.1, 1.2, 1.8, 1.11_

- [x] 1.2 Install and declare runtime dependencies
  - Modify: `package.json` — add `tailwindcss@^3.4`, `recharts`, `lucide-react`, `framer-motion`, `flag-icons`, plus dev deps for testing (`vitest`, `fast-check`, `@testing-library/react`, `jsdom`, `axe-core`/`@axe-core/react`)
  - _Depends on: 1.1_
  - _Verify:_ `npm install` completes and `npm ls recharts lucide-react framer-motion flag-icons` resolves each without "missing" errors
  - _Requirements: 1.5_

- [x] 1.3 Configure Tailwind with canonical KITE design tokens
  - Create/modify: `tailwind.config.ts` — map canonical tokens (`primary`, `accent`, `dark`, `surface`, `card`, `muted`, `border`, `success`, `warning`, `danger`, `info`, `teal`, `purple`, `pink`) to `hsl(var(--token))`; define typography scale (display > h1 > h2 > h3 > body > caption, monotonically non-increasing); radii (`xl`/`lg`/`md`/`full`); default icon sizing convention; card shadow as `shadow-sm`. No `secondary` alias, no `kite-*` prefixes.
  - _Depends on: 1.1_
  - _Verify:_ a probe element using `bg-primary`, `bg-accent`, `bg-dark`, `bg-surface`, `text-display`, `text-caption` compiles via `npm run build` with no unknown-class errors
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 2.8, 2.9_

- [x] 1.4 Author `globals.css` with token variables, flag-icons import, decorations, reduced-motion
  - Create: `src/app/globals.css` — `@tailwind base/components/utilities`; `:root` CSS variables (HSL values from the design token table) in `@layer base`; `@import "flag-icons/css/flag-icons.min.css"`; CSS-only hero grid-pattern utility; `@media (prefers-reduced-motion: reduce)` rule disabling animations/transitions; CSS-only pulse/glow keyframes for the AI button
  - _Depends on: 1.2 (flag-icons), 1.3_
  - _Verify:_ `npm run build` succeeds; importing `globals.css` in the layout shows tokenized backgrounds and a `.fi` flag span renders an SVG (visual check)
  - _Requirements: 2.1, 2.10, 2.11, 2.12, 2.16, 8.1, 22.1, 21.7_

- [x] 1.5 Initialize shadcn/ui and install required primitives
  - Run shadcn CLI to create `components.json` and generate into `src/components/ui/`: button, card, badge, dialog, sheet, tabs, dropdown-menu, navigation-menu, input, select, separator, avatar, tooltip, accordion, command, popover, scroll-area, skeleton, table, chart, and a toast/sonner primitive
  - _Depends on: 1.3, 1.4_
  - _Verify:_ all listed files exist under `src/components/ui/`; a test import of `Button` and `Command` compiles via `npx tsc --noEmit`
  - _Requirements: 1.4_

- [x] 1.6 Load fonts via `next/font/google`
  - Modify: `src/app/layout.tsx` — load Inter (`--font-inter`, body) and Plus Jakarta Sans (`--font-jakarta`, headings) with `display: 'swap'` and system-sans fallback; expose CSS variables on `<html>`/`<body>`; wire Tailwind `fontFamily` to the variables in `tailwind.config.ts`
  - _Depends on: 1.3, 1.5_
  - _Verify:_ `npm run build` succeeds; computed body font resolves to Inter and headings to Plus Jakarta Sans (visual/devtools check); no network font `<link>` is hand-added
  - _Requirements: 1.6, 1.7, 2.5, 22.3, 2.16_

- [x] 1.7 Define all TypeScript interfaces
  - Create: `src/types/index.ts` — `SchemeType`, `SchemeStatus`, `Scheme`, `Cluster`, `Stat`, `Incubator`, `Sector`, `EcosystemEvent`, `GIACountry` (with `countryCode` ISO alpha-2), `PolicyVertical`, `Policy`, `ProgramStatus`, `FlagshipProgram`, `NavItem`, `QuickAction`, `TrustBadge`, `PartnerLogo`, `FooterLink`, `FooterColumn` (exactly as in the design's Type Definitions)
  - _Depends on: 1.1_
  - _Verify:_ `npx tsc --noEmit` reports zero errors
  - _Requirements: 18.3_

- [x] 1.8 Implement shared utilities and validation guards
  - Create: `src/lib/utils.ts` — `cn`; display formatters; `isValidRoute(href)` (non-empty internal path shape); `safeNavigate(router, href)` (navigate iff valid, else non-blocking toast + stay on page); `isValidCluster`, `isValidGIACountry`; `filterSchemes(schemes, tab)`; case-insensitive `filterDestinations(list, query)`; events `selectPreview(events)` (ascending by `startDate`, bounded 4–6); `assertDataIntegrity` (cardinality/completeness/no-placeholder) for use in tests
  - _Depends on: 1.7_
  - _Verify:_ `npx tsc --noEmit` reports zero errors; quick REPL/unit check that `isValidRoute('')` is false and `isValidRoute('/schemes')` is true
  - _Requirements: 18.2, 5.9, 8.7, 10.5, 11.7, 12.7, 7.3_

- [x]* 1.9 Set up Vitest + fast-check test harness
  - Create: `vitest.config.ts` (jsdom env), `src/test/setup.ts`; add `test` and `test:run` scripts (use `--run` for single execution) to `package.json`
  - _Depends on: 1.2_
  - _Verify:_ `npm run test:run` executes a trivial sample test and exits zero
  - _Requirements: (testing infrastructure for Testing Strategy)_

- [x]* 1.10 PBT — safe navigation rejects invalid destinations
  - Create: `src/lib/__tests__/safeNavigate.pbt.test.ts`
  - **Property 1: Safe navigation rejects invalid destinations** — `// Feature: kite-foundation-home, Property 1`, `numRuns: 100`; generate valid internal / empty / malformed / external hrefs; assert push happens iff `isValidRoute(href)`, otherwise no-navigation + unreachable indication
  - _Depends on: 1.8, 1.9_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 5.9, 8.7, 10.5, 11.7, 12.7 — Property 1_

### Phase 2: Layout

- [x] 2.1 Implement LanguageContext (UI-only EN/ಕನ್ನಡ)
  - Create: `src/context/LanguageContext.tsx` — provider + hook; toggle changes a state value only, performs no storage/network
  - _Depends on: 1.1_
  - _Verify:_ `npx tsc --noEmit` passes; a probe consumer can read/flip the language value (no `localStorage` reference present)
  - _Requirements: 3.12, 18.13_

- [x] 2.2 Implement shared layout primitives
  - Create: `src/components/shared/SectionHeading.tsx` (h2 in Plus Jakarta Sans + optional eyebrow/description), `src/components/shared/StubPage.tsx` (`{ title, description }` → heading + "content forthcoming" message), `src/components/shared/LazySection.tsx` (renders equal-height `Skeleton` until within `rootMargin: '200px'`, then swaps content)
  - _Depends on: 1.5_
  - _Verify:_ `npx tsc --noEmit` passes; rendering `StubPage` shows the heading + forthcoming message (component test or visual)
  - _Requirements: 19.4, 22.4, 22.5_

- [x] 2.3 Implement Header
  - Create: `src/components/layout/Header.tsx` (`"use client"`) — fixed top, `h-16`, `bg-dark`; kite icon + "KITE" wordmark + sub-line; desktop center `NavigationMenu` with the five dropdown parents (Ecosystem, Schemes & Benefits, For Stakeholders, Beyond Bengaluru, Connect) with dropdowns from `navigation.ts` and Register as the primary CTA; right cluster: search trigger (⌘K/Ctrl+K), "EN | ಕನ್ನಡ" toggle, notification bell, Sign In link, `bg-accent` Register CTA — there is NO header AI button (the floating AIAssistantButton is the AI entry point); Escape closes dropdown and restores focus to trigger; hamburger replaces center nav < 768px; links use `safeNavigate`
  - _Depends on: 1.8, 2.1, 3.1 (navigation.ts)_
  - _Verify:_ rendered Header shows the five dropdown parents + Register CTA and the utility cluster; activating Ecosystem opens its children (About KITE, etc.); Escape restores focus (component test or manual)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.13, 3.14, 20.4_

- [x] 2.4 Implement MobileNav
  - Create: `src/components/layout/MobileNav.tsx` (`"use client"`) — left `Sheet` over dimming overlay, slide-in 150–400ms; six top-level items: the five dropdown parents (Ecosystem, Schemes & Benefits, For Stakeholders, Beyond Bengaluru, Connect) expandable via `Accordion`, plus Register as a direct CTA link; leaf activation navigates + closes; parent toggles and stays open; close control/overlay/Escape close; focus trapped while open and returned to hamburger on close; items from `navigation.ts`
  - _Depends on: 1.8, 2.3, 3.1 (navigation.ts)_
  - _Verify:_ on a < 768px viewport the hamburger opens the Sheet, a parent expands nested items, a leaf navigates and closes, Escape closes and focus returns to hamburger (component test or manual)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 2.5 Implement CommandPalette
  - Create: `src/components/layout/CommandPalette.tsx` (`"use client"`) — shadcn `command` overlay opened from Header search; focus moves to input; destinations from flattened `navigation.ts`; uses `filterDestinations` (case-insensitive substring); no-match indication stays open; select via click/Enter navigates + closes; Arrow keys move highlight; Escape closes + restores focus to search control
  - _Depends on: 1.8, 2.3, 3.1 (navigation.ts)_
  - _Verify:_ opening focuses input; typing filters list; a non-matching query shows the no-match message; Enter on a highlighted item navigates (component test or manual)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x]* 2.6 PBT — command palette filters by case-insensitive substring
  - Create: `src/lib/__tests__/filterDestinations.pbt.test.ts`
  - **Property 2: Command palette filters by case-insensitive substring** — `// Feature: kite-foundation-home, Property 2`, `numRuns: 100`; generate destination lists and query strings (empty, whitespace, unicode, mixed-case); assert every shown item matches and every hidden item does not
  - _Depends on: 1.8, 1.9_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 7.3, 7.4 — Property 2_

- [x] 2.7 Implement AIAssistantButton + panel
  - Create: `src/components/layout/AIAssistantButton.tsx` (`"use client"`) — fixed bottom-right, visible on scroll; CSS-only looping glow/pulse (disabled under reduced-motion); activation opens right `Sheet` titled "Ask KITE AI" and moves focus into panel; panel shows one static welcome message + 3–6 sample questions; close/Escape close and restore focus to button; focus trapped while open; no backend calls
  - _Depends on: 1.4, 1.5_
  - _Verify:_ button stays bottom-right while scrolling; activating opens the panel with welcome + between 3 and 6 sample questions; Escape closes and focus returns to button (component test or manual)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 21.4_

- [x] 2.8 Implement Footer
  - Create: `src/components/layout/Footer.tsx` — `bg-dark`; five columns (For Startups (9), For Investors (7), For Ecosystem Partners (6), Programs & Policies (7), Support & Resources (9)) from `footer.ts` bound via `footerColumns`/`footerBottom`; tel:/mailto: links marked external are rendered as native anchors; bottom row with 3 legal lines, 5 right-side links (Privacy, Terms, Accessibility, Sitemap, RTI), and the centered tagline; visible helpline `080-22231007` and `startupcell@karnataka.gov.in`; `aria-hidden` low-opacity `pointer-events-none` textual Karnataka emblem watermark; links use `safeNavigate`
  - _Depends on: 1.8, 3.2 (footer.ts)_
  - _Verify:_ Footer renders the 9/7/6/7/9 columns, tel:/mailto: native anchors, helpline/email text, the 3 legal lines, 5 right-side links and centered tagline, and the watermark does not overlap interactive elements (component test or visual)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [x] 2.9 Compose RootLayout and wire global chrome
  - Modify: `src/app/layout.tsx` — wrap children in `LanguageProvider`; semantic landmarks `<header>` (banner) → `<main>` → `<footer>` (contentinfo); mount `Header`, `Footer`, floating `AIAssistantButton`, and the toast region
  - _Depends on: 1.6, 2.1, 2.3, 2.7, 2.8_
  - _Verify:_ `npm run build` succeeds; every page shows Header + main + Footer + AI button; exactly one of each landmark present (devtools/axe spot check)
  - _Requirements: 21.1_

- [x]* 2.10 Component tests — layout structure and interactions
  - Create: `src/components/layout/__tests__/layout.test.tsx` — assert Header nav items/dropdown contents and focus restoration; MobileNav open/expand/close/focus-return; Footer column order + counts 9/7/6/7/9 + tel:/mailto: anchors + tagline; AI panel sample-question count in [3,6]; CommandPalette focus-to-input on open
  - _Depends on: 2.3, 2.4, 2.5, 2.7, 2.8_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 3, 4, 5, 6, 7 (fixed-content/interaction criteria)_

### Phase 3: Data Layer

> All modules below export a collection annotated with its `src/types` interface (no `any`). Populate with REAL verified Karnataka ecosystem values; every number must trace to the design's "Verified Source Data" table and no field may contain placeholder/fabricated text (Property 16). Where concrete values are not fixed by the spec, see "Open Questions / Needs Decision" before authoring.

- [x] 3.1 Author `navigation.ts`
  - Create: `src/data/navigation.ts` — `NavItem[]` mirroring the Header/MobileNav structure with six top-level items: the five dropdown parents Ecosystem, Schemes & Benefits, For Stakeholders, Beyond Bengaluru, Connect plus Register (a direct link), with `href`s matching the design's route inventory; also exports `utilityNav` and `primaryCtaHref`; `NavItem.description?` was added to the type
  - _Depends on: 1.7_
  - _Verify:_ `npx tsc --noEmit` passes; every leaf `href` is a non-empty internal path
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 7.2_

- [x] 3.2 Author `footer.ts`
  - Create: `src/data/footer.ts` — `FooterColumn[]` + contact info; 5 columns: For Startups (9), For Investors (7), For Ecosystem Partners (6), Programs & Policies (7), Support & Resources (9); plus `footerBottom` (legal lines, links, tagline); helpline + email; `FooterLink.external?` and `FooterBottom` were added to the types
  - _Depends on: 1.7_
  - _Verify:_ `npx tsc --noEmit` passes; array shapes match; column counts 9/7/6/7/9; tel:/mailto: external
  - _Requirements: 5.2, 5.3, 5.4, 5.6_

- [x] 3.3 Author `ecosystem-stats.ts`
  - Create: `src/data/ecosystem-stats.ts` — `Stat[]` storing all 20 verified stats (fields id, label, value, displayValue, source, asOf); plus `homeStatsStripIds` (6 curated ids the home strip renders)
  - _Depends on: 1.7_
  - _Verify:_ `npx tsc --noEmit` passes; array length === 20; homeStatsStripIds length === 6
  - _Requirements: 9.2, 9.3, 9.6_

- [x] 3.4 Author `schemes.ts`
  - Create: `src/data/schemes.ts` — `Scheme[]` of exactly 22 records, each fully populated (id, name, type ∈ {fiscal,grant}, shortDescription, amount, maxBenefit, duration, eligibility[], documents[], status ∈ {open,upcoming}, note?); `type` is fiscal or grant
  - _Depends on: 1.7_ (also see Open Questions for source data)
  - _Verify:_ `npx tsc --noEmit` passes; array length === 22 and no field empty
  - _Requirements: 18.5, 13.1, 13.2_

- [x] 3.5 Author `clusters.ts`
  - Create: `src/data/clusters.ts` — `Cluster[]` of exactly 6 in order: Mysuru, Mangaluru, Hubballi-Dharwad-Belagavi, Kalaburagi, Shivamogga, Tumakuru; each with tagline, focusAreas[], infrastructure[], seedFund, anchorInstitutions[], ctaLabel, href, note?
  - _Depends on: 1.7_ (also see Open Questions for source data)
  - _Verify:_ `npx tsc --noEmit` passes; array length === 6 in the specified order
  - _Requirements: 18.6, 12.2_

- [x] 3.6 Author `sectors.ts`
  - Create: `src/data/sectors.ts` — `Sector[]` of ~20 sectors derived from the union of focus areas across the verified data (Sector gains optional description? and icon?)
  - _Depends on: 1.7_
  - _Verify:_ `npx tsc --noEmit` passes; array length between 15 and 20 (currently 20)
  - _Requirements: 14.3_

- [x] 3.7 Author `events.ts`
  - Create: `src/data/events.ts` — `EcosystemEvent[]` of exactly 8 (the verified set) including Bengaluru Tech Summit 2026, Beyond Bengaluru BLUE Mysuru Pitch Day, K-Combinator Demo Day, GIA Annual Meet, ELEVATE NXT 2026, KAN Cohort 4 Demo Day; each with startDate, endDate (ISO-8601), location, category ∈ EventCategory, description, href
  - _Depends on: 1.7_ (also see Open Questions for dates)
  - _Verify:_ `npx tsc --noEmit` passes; array length ≥ 6; every `startDate` parses as a valid ISO date
  - _Requirements: 15.2, 15.3_

- [x] 3.8 Author `gia-countries.ts`
  - Create: `src/data/gia-countries.ts` — `GIACountry[]` of exactly 32, each with non-empty `name`, a valid lowercase ISO 3166-1 alpha-2 `countryCode` (drives `fi fi-${code}`), plus focusAreas[] and region ∈ GIARegion
  - _Depends on: 1.7_ (also see Open Questions for the country list)
  - _Verify:_ `npx tsc --noEmit` passes; array length === 32; every `countryCode` is two letters
  - _Requirements: 18.8, 16.2_

- [x] 3.9 Author `policies.ts`
  - Create: `src/data/policies.ts` — `Policy[]` of exactly 10, each with name, vertical ∈ PolicyVertical (lowercase set), period, summary, href
  - _Depends on: 1.7_ (also see Open Questions for source data)
  - _Verify:_ `npx tsc --noEmit` passes; array length === 10
  - _Requirements: 18.7_

- [x] 3.10 Author `quick-actions.ts`
  - Create: `src/data/quick-actions.ts` — `QuickAction[]` of exactly 8 covering Register, Schemes, Calculator, Investors, Mentors, Women, Incubators, Idea Bank, Jobs, GIA Market Access; each with label (≤40), description (≤120), Lucide `icon`, href
  - _Depends on: 1.7_ (also see Open Questions for icon/description copy)
  - _Verify:_ `npx tsc --noEmit` passes; array length === 8; every label ≤ 40 and description ≤ 120 chars
  - _Requirements: 10.2, 10.3_

- [x] 3.11 Author `flagship-programs.ts`
  - Create: `src/data/flagship-programs.ts` — `FlagshipProgram[]` of exactly 6 (the verified set): ELEVATE, ELEVATE Unnati, LEAP, K-Combinator, KAN, Grand Challenges Karnataka, RGEP, NAIN 2.0; each with tagline, description (≤300), keyMetric, status ∈ {active,upcoming}, ctaLabel, href
  - _Depends on: 1.7_ (also see Open Questions for descriptions/status)
  - _Verify:_ `npx tsc --noEmit` passes; array length === 6; every description non-empty and ≤ 300 chars
  - _Requirements: 11.2, 11.3, 11.4_

- [x] 3.12 Author `social-proof.ts`
  - Create: `src/data/social-proof.ts` — `PartnerLogo[]` of exactly 10: NASSCOM, TiE, IESA, STPI, DPIIT, KITVEN, IISc, IIM-B, IIIT-B, ARTPARK
  - _Depends on: 1.7_
  - _Verify:_ `npx tsc --noEmit` passes; array length === 10 with the specified labels
  - _Requirements: 17.3_

- [x] 3.13 Author `incubators.ts`
  - Create: `src/data/incubators.ts` — `Incubator[]` representative set, each with cluster, focus[], type ∈ {Incubator,Accelerator,Research Park}; 24 representative records; home preview shows 8
  - _Depends on: 1.7_ (also see Open Questions for set contents)
  - _Verify:_ `npx tsc --noEmit` passes; every record fully populated
  - _Requirements: 18.1, 18.3_

- [x]* 3.14 PBT — data module cardinality
  - Create: `src/data/__tests__/cardinality.pbt.test.ts`
  - **Property 14: Data module cardinality** — `// Feature: kite-foundation-home, Property 14`, `numRuns: 100`; assert exported lengths: schemes=22, clusters=6, policies=10, gia-countries=32, sectors=20, ecosystem-stats=20 (home strip 6), quick-actions=8, flagship-programs=6, social-proof=10
  - _Depends on: 1.9, 3.3, 3.4, 3.5, 3.6, 3.8, 3.9, 3.10, 3.11, 3.12_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 18.5, 18.6, 18.7, 18.8 — Property 14_

- [x]* 3.15 PBT — data completeness
  - Create: `src/data/__tests__/completeness.pbt.test.ts`
  - **Property 15: Data completeness** — `// Feature: kite-foundation-home, Property 15`, `numRuns: 100`; for any record in any module, every required field is non-null/non-undefined and every required string is non-empty (via `assertDataIntegrity`)
  - _Depends on: 1.8, 1.9, 3.1–3.13_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 18.9 — Property 15_

- [x]* 3.16 PBT — no placeholder or fabricated content
  - Create: `src/data/__tests__/no-placeholder.pbt.test.ts`
  - **Property 16: No placeholder or fabricated content** — `// Feature: kite-foundation-home, Property 16`, `numRuns: 100`; assert no string field matches placeholder patterns (empty, "TBD", "TODO", "N/A", "lorem ipsum", repeated filler)
  - _Depends on: 1.8, 1.9, 3.1–3.13_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 18.10 — Property 16_

- [x]* 3.17 PBT — quick action field limits
  - Create: `src/data/__tests__/quick-actions.pbt.test.ts`
  - **Property 5: Quick action field limits hold** — `// Feature: kite-foundation-home, Property 5`, `numRuns: 100`; for any quick action, title ≤ 40, description ≤ 120, route non-empty
  - _Depends on: 1.9, 3.10_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 10.2 — Property 5_

- [x]* 3.18 PBT — flagship program field validity
  - Create: `src/data/__tests__/flagship-programs.pbt.test.ts`
  - **Property 6: Flagship program field validity** — `// Feature: kite-foundation-home, Property 6`, `numRuns: 100`; for any program, description non-empty and ≤ 300, status ∈ ProgramStatus
  - _Depends on: 1.9, 3.11_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 11.3, 11.4 — Property 6_

### Phase 4: Home Sections

- [x] 4.1 Implement StatCard (static)
  - Create: `src/components/shared/StatCard.tsx` — Build as a Server Component (no interactivity, no count-up — superseded per founder direction); props are the `Stat` record; render `displayValue` prominently (Plus Jakarta Sans bold), `label` below in muted body, and `source` + `asOf` as a small caption. Canonical token colors. Reusable beyond the home page.
  - _Depends on: 1.4, 3.3_
  - _Verify:_ StatCard renders displayValue, label, and source/asOf from a Stat record (component test or manual)
  - _Requirements: 9.4, 9.5, 9.6, 21.7_

- [x]* 4.2 PBT — StatCard rendering completeness (supersedes count-up Properties 3 & 4)
  - Create: `src/components/shared/__tests__/countup.pbt.test.ts`
  - **Properties 3 & 4 SUPERSEDED** (StatCard is static — no count-up). Replaced by a rendering-completeness property: `// Feature: kite-foundation-home, Property: StatCard rendering completeness`, `numRuns: 100`; for any valid `Stat`, rendering `<StatCard>` surfaces `displayValue`, `label`, `source`, and `asOf`.
  - _Depends on: 1.9, 4.1_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 9.4, 9.5 (static rendering) — supersedes Properties 3, 4_

- [x] 4.3 Implement LiveMetricsSection
  - Create: `src/components/home/LiveMetricsSection.tsx` — white background, title "Karnataka's Digital Landscape", renders exactly 6 StatCards selected via `homeStatsStripIds` from `ecosystem-stats.ts`, in a 3-column × 2-row desktop grid (2×3 tablet, 1-column mobile); SectionHeading eyebrow 'Live Metrics'; an 'Explore Full Intelligence Dashboard' caption link to /intelligence; empty/unavailable data → "metrics unavailable" message instead of cards
  - _Depends on: 2.2, 3.3, 4.1_
  - _Verify:_ section renders 6 cards with title; with an empty stats array it shows the unavailable message (component test or manual)
  - _Requirements: 9.1, 9.2, 9.3, 9.7_

- [x] 4.4 Implement HeroSection
  - Create: `src/components/home/HeroSection.tsx` — `bg-dark` + CSS grid pattern (contrast preserved); heading "Karnataka's Innovation & Technology Ecosystem"; verified-scale subheading (21,000+ DPIIT startups, 183 soonicorns, 730+ GCCs, 25,000 target by 2030); exactly two CTAs "Register Your Startup" (→ startup registration) and "Explore Schemes & Benefits" (→ schemes) via `safeNavigate`; a verified stat strip; trust-badges row of exactly four text-only credibility signals: "DPIIT Recognized", "25% Women-Led", "#14 GSER 2025", "32 GIA Partner Countries"
  - _Depends on: 1.8, 2.2_
  - _Verify:_ Hero shows the verified heading, two CTAs, and four trust badges; CTAs route via safeNavigate (component test or manual)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 4.5 Implement QuickActionCard + QuickActionsSection
  - Create: `src/components/shared/QuickActionCard.tsx`, `src/components/home/QuickActionsSection.tsx` — `bg-surface`, title "What are you looking for?"; renders the 8 actions from `quick-actions.ts` in a 4-column × 2-row desktop grid (2×4 tablet, 1-column mobile); each card is fully clickable via safeNavigate with a chevron-right that nudges right on hover
  - _Depends on: 1.8, 2.2, 3.10_
  - _Verify:_ section renders 8 cards with title; clicking a card navigates via safeNavigate; an invalid route keeps the visitor on page (component test or manual)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 4.6 Implement FlagshipProgramCard + FlagshipProgramsSection
  - Create: `src/components/shared/FlagshipProgramCard.tsx`, `src/components/home/FlagshipProgramsSection.tsx` — white (`card`) background, title "Karnataka Startup Policy 2025-2030"; all 6 programs in a 3-column × 2-row desktop grid (2 cols tablet, 1 mobile); editorial cards with name, accent tagline, keyMetric callout, description, status Badge (variant by status), and ctaLabel button to href; CTA uses `safeNavigate`
  - _Depends on: 1.8, 2.2, 3.11_
  - _Verify:_ all 6 programs reachable with description + status badge + named CTA; CTA routes via safeNavigate (component test or manual)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 4.7 Implement ClusterCard + ClustersSection
  - Create: `src/components/shared/ClusterCard.tsx`, `src/components/home/ClustersSection.tsx` — `bg-surface`; renders 6 clusters from `clusters.ts` in source order, filtered through `isValidCluster` (skip malformed, preserve layout/order); each card shows focusArea + infrastructure + single CTA from data; CTA navigates in same tab via `safeNavigate`; undefined/invalid route → no navigation
  - _Depends on: 1.8, 2.2, 3.5_
  - _Verify:_ section renders the valid clusters in order; a record missing required fields is skipped without breaking layout (component test or manual)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [x]* 4.8 PBT — invalid clusters skipped, valid preserved
  - Create: `src/components/home/__tests__/clusters.pbt.test.ts`
  - **Property 7: Invalid clusters are skipped, valid clusters preserved** — `// Feature: kite-foundation-home, Property 7`, `numRuns: 100`; for any list (some malformed), rendered set equals exactly the `isValidCluster` subset in source order
  - _Depends on: 1.8, 1.9, 4.7_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 12.3 — Property 7_

- [x] 4.9 Implement SchemeRow/SchemeTable + AllSchemesSection
  - Create: `src/components/shared/SchemeRow.tsx`, `src/components/shared/SchemeTable.tsx`, `src/components/home/AllSchemesSection.tsx` (`"use client"`) — white background; 3 filter tabs (All, Fiscal Incentives, Grant-in-Aid) via shadcn Tabs using `filterSchemes`; renders a curated PREVIEW of 8–12 schemes (prioritizing fiscal incentives + flagship grants ELEVATE/KITVEN/GCK/K-Combinator) as rows/cards showing scheme name, amount+maxBenefit benefit summary, duration, and an Eligibility column (eligibility[] joined); each row links to the scheme route; a 'View All 22 Schemes' link to /schemes; 'All' preselected; zero-match keeps tabs visible
  - _Depends on: 1.8, 2.2, 3.4_
  - _Verify:_ loads with All selected showing the preview of 8–12 schemes with an Eligibility column; the 3 tabs (All, Fiscal Incentives, Grant-in-Aid) filter the preview; a 'View All 22 Schemes' link routes to /schemes; an empty filter shows the no-match message with tabs still visible (component test or manual)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9_

- [x]* 4.10 PBT — scheme filtering selects by type
  - Create: `src/components/home/__tests__/schemes.pbt.test.ts`
  - **Property 8: Scheme filtering selects by type** — `// Feature: kite-foundation-home, Property 8`, `numRuns: 100`; "All" → full set; otherwise visible == those whose `type` equals the tab and no hidden scheme matches the tab
  - _Depends on: 1.8, 1.9, 4.9_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 13.4, 13.5, 13.6, 13.7 — Property 8_

- [x] 4.11 Implement SectorChip + SectorExplorerSection
  - Create: `src/components/shared/SectorChip.tsx`, `src/components/home/SectorExplorerSection.tsx` (`"use client"`) — `bg-surface`; a flexible wrapping tag-cloud of ~20 sector chips from `sectors.ts` (currently 20), each chip clickable; single-select visual-only; SectionHeading above; single-select (at most one selected, most-recent wins); selection is visual-only with no side effects elsewhere; zero sectors → container with no broken/empty chip
  - _Depends on: 2.2, 3.6_
  - _Verify:_ ~20 chips (currently 20) clickable; clicking selects exactly one; empty sectors renders no chips and no broken element (component test or manual)
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

- [x]* 4.12 PBT — sector chip selection behavior
  - Create: `src/components/home/__tests__/sectors.pbt.test.ts`
  - **Property 9: Sector chip single-selection** — `// Feature: kite-foundation-home, Property 9`, `numRuns: 100`; for any click sequence, at most one chip selected and it is the most-recently clicked
  - **Property 10: Sector selection has no side effects** — `// Feature: kite-foundation-home, Property 10`, `numRuns: 100`; selection reducer changes only the selected id, nothing else
  - _Depends on: 1.9, 4.11_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 14.5, 14.6 — Properties 9, 10_

- [x] 4.13 Implement EventCard + EventsPreviewSection
  - Create: `src/components/shared/EventCard.tsx`, `src/components/home/EventsPreviewSection.tsx` — white background; uses `selectPreview` to show 4–6 events from `events.ts` ascending by `startDate`; each card shows event name + date; "View All" navigates to `/events`; empty/failed events → "no upcoming events" message and suppress cards
  - _Depends on: 1.8, 2.2, 3.7_
  - _Verify:_ section shows between 4 and 6 cards sorted ascending by date with name+date; empty source shows the no-events message (component test or manual)
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [x]* 4.14 PBT — events preview is sorted and bounded
  - Create: `src/components/home/__tests__/events.pbt.test.ts`
  - **Property 11: Events preview is sorted and bounded** — `// Feature: kite-foundation-home, Property 11`, `numRuns: 100`; for any source ≥ 6, preview is a source subset ordered ascending by `startDate` with length in [4,6]
  - _Depends on: 1.8, 1.9, 4.13_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 15.2 — Property 11_

- [x] 4.15 Implement GIACountryTile + GIACountriesSection
  - Create: `src/components/shared/GIACountryTile.tsx`, `src/components/home/GIACountriesSection.tsx` — `bg-dark`, title "32 Partner Countries"; grid from `gia-countries.ts`, each tile a `fi fi-${code}` SVG span (`aria-hidden`) + country name; filtered by `isValidGIACountry` (skip invalid); zero valid → title + CTA with no empty grid; "and N more" indicator where N = validTotal − displayed, hidden when all displayed; single CTA navigates to `/gia`
  - _Depends on: 1.4, 1.8, 2.2, 3.8_
  - _Verify:_ grid renders valid countries with flag + name; invalid entries omitted; "and N more" shows correct N and disappears when all shown (component test or manual)
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [x]* 4.16 PBT — GIA validity and "and N more" arithmetic
  - Create: `src/components/home/__tests__/gia.pbt.test.ts`
  - **Property 12: Invalid GIA countries are skipped, valid preserved** — `// Feature: kite-foundation-home, Property 12`, `numRuns: 100`; rendered set equals exactly the valid subset (non-empty name + valid ISO alpha-2), order preserved
  - **Property 13: "And N more" indicator arithmetic** — `// Feature: kite-foundation-home, Property 13`, `numRuns: 100`; for valid total V and displayed D (0≤D≤V), show N=V−D when D<V, none when D=V
  - _Depends on: 1.8, 1.9, 4.15_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 16.3, 16.4, 16.5, 16.6 — Properties 12, 13_

- [x] 4.17 Implement SocialProofSection
  - Create: `src/components/home/SocialProofSection.tsx` — white background with visible top + bottom borders; heading "Ecosystem Partners"; exactly 10 text logos from `social-proof.ts` rendered in a single grayscale color; all 10 fully visible 320–1920px without horizontal scroll or truncation
  - _Depends on: 2.2, 3.12_
  - _Verify:_ section shows heading + 10 grayscale logos with top/bottom borders, no overflow at 320px (component test or visual)
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 4.18 Compose the Home Page
  - Modify: `src/app/page.tsx` — render the ten sections in order (Hero, LiveMetrics, QuickActions, FlagshipPrograms, Clusters, AllSchemes, SectorExplorer, EventsPreview, GIACountries, SocialProof); wrap below-fold sections in `LazySection`; above-fold loads eagerly
  - _Depends on: 4.3, 4.4, 4.5, 4.6, 4.7, 4.9, 4.11, 4.13, 4.15, 4.17_
  - _Verify:_ `npm run build` succeeds; Home renders all ten sections in order; below-fold sections defer-load with reserved-height skeletons (manual/devtools)
  - _Requirements: 8.1, 22.2, 20.2_

- [x] 4.19 Checkpoint — Home page builds and section logic verified
  - Ensure all tests pass, ask the user if questions arise.
  - _Depends on: 4.18_

- [x]* 4.20 Example/component tests — section fixed content and backgrounds
  - Create: `src/components/home/__tests__/sections.test.tsx` — assert each section's title/heading, background token, and fixed content (Hero text/CTAs/badges, metric labels, logo labels, event names) per the Testing Strategy example list
  - _Depends on: 4.3, 4.4, 4.5, 4.6, 4.7, 4.9, 4.11, 4.13, 4.15, 4.17_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 8.1–8.4/8.8, 9.1–9.3/9.6, 10.1/10.3, 11.1/11.2, 12.1/12.2, 13.1–13.3, 14.1–14.4, 15.1/15.3–15.5, 16.1/16.2/16.7, 17_

### Phase 5: Stubs & Polish

- [x] 5.1 Generate all route stubs and not-found page
  - Create: one `page.tsx` per route in the design's route inventory (startups/investors/schemes subtrees, More routes, top-level `/support` `/login` `/register`, 8 `programs/<slug>`, footer resources, footer bottom-bar routes), each rendering `<StubPage title=... description=... />`; create `src/app/not-found.tsx` rendering Header/Footer + heading + message
  - _Depends on: 2.2, 2.9, 3.1, 3.2_
  - _Verify:_ `npm run build` succeeds; visiting each referenced route renders a heading + "content forthcoming" with Header/Footer; an unknown URL renders not-found with Header/Footer (manual/route smoke)
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [x]* 5.2 Integration test — route-stub navigation
  - Create: `src/app/__tests__/route-stubs.test.tsx` — for each collected route, assert it renders within budget with Header + Footer + heading + "forthcoming" message
  - _Depends on: 1.9, 5.1_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 19.2, 19.3, 19.4_

- [x]* 5.3 PBT — every referenced route resolves
  - Create: `src/app/__tests__/routes.pbt.test.ts`
  - **Property 17: Every referenced route resolves** — `// Feature: kite-foundation-home, Property 17`, `numRuns: 100`; for any destination referenced by navigation data, footer data, or Home CTAs, a corresponding route (built page or stub) exists
  - _Depends on: 1.9, 3.1, 3.2, 5.1_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 19.1 — Property 17_

- [x]* 5.4 Responsive tests
  - Create: `src/app/__tests__/responsive.test.tsx` — render Home at 360, 768, 1023, 1440, 1920px; assert desktop multi-column grids, mobile single-column stacking in source order, MobileNav presence < 768px, and no horizontal overflow across 360–1920px
  - _Depends on: 1.9, 4.18, 2.9_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [x]* 5.5 Accessibility tests — landmarks, names, alternatives
  - Create: `src/app/__tests__/a11y.test.tsx` — `axe-core` audit per page; plus property-driven checks
  - **Property 18: Landmark uniqueness per page** — `// Feature: kite-foundation-home, Property 18`, `numRuns: 100`; exactly one banner/navigation/main/contentinfo per route
  - **Property 19: Accessible names for label-less controls** — `// Feature: kite-foundation-home, Property 19`, `numRuns: 100`; every icon-only/CTA control exposes a non-empty accessible name
  - **Property 20: Text alternatives and decorative marking** — `// Feature: kite-foundation-home, Property 20`, `numRuns: 100`; meaningful non-text elements have non-empty alternatives; decorative flag spans are marked ignored
  - _Depends on: 1.9, 2.9, 4.18, 5.1_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 21.1, 21.2, 21.5, 11.5 — Properties 18, 19, 20_

- [x]* 5.6 Reduced-motion and lazy-load/CLS integration tests
  - Create: `src/app/__tests__/perf.test.tsx` — mock `IntersectionObserver`: assert below-fold deferral, skeletons reserve equal height (no CLS), content swaps in; assert reduced-motion disables the AI-button pulse/glow (StatCard is static — no count-up)
  - _Depends on: 1.9, 2.2, 4.1, 4.18_
  - _Verify:_ `npm run test:run` passes this file
  - _Requirements: 21.7, 22.2, 22.4, 22.5_

- [x] 5.7 Final smoke checks — build, lint, type-check, static scan
  - Run: `npx tsc --noEmit`, `npm run lint`, `npm run build`; static scan asserting no `fetch`/`XMLHttpRequest`/`localStorage`/`sessionStorage`/`cookie`/`indexedDB` usage in slice source and that decorative effects are CSS-only and fonts load via `next/font`
  - _Depends on: 4.18, 5.1_
  - _Verify:_ all three commands exit zero; the static scan finds no forbidden API usages
  - _Requirements: 1.8, 1.9, 1.10, 1.11, 18.4, 18.12, 18.13, 22.1, 22.3_

- [x] 5.8 Final checkpoint — full conformance
  - Ensure all tests pass, ask the user if questions arise.
  - _Depends on: 5.7_

## Notes

- Tasks marked with `*` are optional (tests) and can be skipped for a faster MVP; they are required for full conformance with the design's Testing Strategy.
- Each task references the specific requirements/properties it implements for traceability.
- Property-based tests use `fast-check` with `numRuns: 100` minimum and the tag `// Feature: kite-foundation-home, Property {n}: ...`; each of the 20 properties is one test, placed next to the code/data it validates so failures surface early.
- Checkpoints (4.19, 5.8) are validation gates and are not part of the dependency graph.
- No task fabricates unspecified content. Concrete data values not fixed by requirements.md/design.md are listed below for the user to provide before authoring the affected data module.

## Open Questions / Needs Decision

These items require verified-source values or a decision the spec does not pin down. The corresponding data tasks must use the real values you provide rather than inventing them (Property 16 forbids fabricated/placeholder content). Resolve before/while doing the referenced task.

1. `schemes.ts` (Task 3.4): requirements fix only the count (22), the column set, and the `SchemeType`/`SchemeStatus` enums. The 22 scheme names and per-field values (maxAmount, whoCanApply, eligibility, geographicArea, status, applyLink, keyConditions, mandatoryDocs) need verified source data (e.g., Startup Karnataka / KITS scheme documents).
2. `clusters.ts` (Task 3.5): the 6 cluster names and order are fixed, but `focusArea`, `infrastructure`, `ctaLabel`, and `route` values need verified content per cluster.
3. `events.ts` (Task 3.7): the 6 event names are fixed, but `startDate` (ISO), `location`, `category`, and `route` are not specified. Confirm real dates (the preview sorts by `startDate`).
4. `gia-countries.ts` (Task 3.8): the count is fixed at 32 but the specific partner countries and their ISO 3166-1 alpha-2 codes are not enumerated in the spec. Provide the authoritative 32-country list.
5. `policies.ts` (Task 3.9): 10 records with the `PolicyVertical` enum are required, but policy names, summaries, and routes need verified values.
6. `incubators.ts` (Task 3.13): described only as a "representative set" (164+ context). Confirm which incubators and how many to include.
7. `ecosystem-stats.ts` (Task 3.3): metric values are specified, but the exact `sourceContext` attribution wording for each stat is not. Provide citation text.
8. `quick-actions.ts` (Task 3.10): the 10 categories and target routes are derivable, but the Lucide icon choice and the ≤120-char description copy for each action need confirmation.
9. `flagship-programs.ts` (Task 3.11): the 8 program names are fixed, but each program's ≤300-char description, specific `ProgramStatus` value, `ctaLabel`, and `route` need verified content.
10. `footer.ts` (Task 3.2): the Programs (8) and Resources (7) columns are fully specified; the "For Startups" and "For Investors" column link sets are not enumerated and need a decision.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "1.5", "1.9"] },
    { "id": 3, "tasks": ["1.6", "1.7"] },
    { "id": 4, "tasks": ["1.8", "2.1", "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.11", "3.12", "3.13"] },
    { "id": 5, "tasks": ["1.10", "2.2", "2.6", "3.14", "3.15", "3.16", "3.17", "3.18"] },
    { "id": 6, "tasks": ["2.3", "2.7", "2.8", "4.1", "4.4"] },
    { "id": 7, "tasks": ["2.4", "2.5", "4.2", "4.3", "4.5", "4.6", "4.7", "4.9", "4.11", "4.13", "4.15", "4.17"] },
    { "id": 8, "tasks": ["2.9", "2.10", "4.8", "4.10", "4.12", "4.14", "4.16", "4.20"] },
    { "id": 9, "tasks": ["4.18", "5.1"] },
    { "id": 10, "tasks": ["5.2", "5.3", "5.4", "5.5", "5.6", "5.7"] }
  ]
}
```
