# Requirements Document

## Introduction

This document specifies the requirements for the foundation slice of **KITE — Karnataka Innovation & Technology Ecosystem**, a production-ready Next.js 14 (App Router) website. KITE is a government technology platform owned by the Department of Electronics, IT, Bt and S&T, Government of Karnataka, operated by Karnataka Innovation and Technology Society (KITS) and Karnataka Digital Economy Mission (KDEM). Its tagline is "One Portal. One Login. One Ecosystem."

This slice (Prompt 1 of a multi-prompt build) covers four concerns only:

1. **Project foundation / scaffolding** — Next.js 14 App Router project, Tailwind, shadcn/ui, fonts, configuration, and route stubs.
2. **The KITE Design System** — color palette, typography, spacing, component primitives, and theming tokens.
3. **The Global Layout** — Header, Footer, MobileNav, Command palette search, and a floating AI Assistant panel.
4. **A complete, data-dense Home Page** — ten sections rendered from typed TypeScript data files.

There is **no backend** in this slice. All content is sourced from typed TypeScript files under `src/data/`. There are no network/API calls and no use of `localStorage` or other client storage. Interactive features that depend on a backend (real AI responses, real search submission, notifications, language switching) are visual-only placeholders in this slice. Pages other than Home exist as route stubs so that navigation resolves without errors.

The design goal is a world-class government technology platform feel: gov.uk clarity, Stripe polish, and Y Combinator data density. The UI must not look like a generic template and must not look AI-generated.

## Glossary

- **KITE**: Karnataka Innovation & Technology Ecosystem — the website/platform produced by this project.
- **KITE_App**: The Next.js 14 application as a whole, including its build configuration and runtime.
- **Design_System**: The set of KITE design tokens (colors, typography, spacing, radii, shadows, icon sizing) and their Tailwind configuration.
- **Header**: The fixed top navigation bar component rendered on all pages.
- **Footer**: The mega footer component rendered on all pages.
- **MobileNav**: The mobile navigation component presented in a left-side Sheet, triggered by a hamburger control on small viewports.
- **Command_Palette**: The shadcn `command` search overlay opened from the Header search control.
- **AI_Assistant**: The floating bottom-right button and its right slide-over chat panel titled "Ask KITE AI".
- **Home_Page**: The KITE home page route (`/`) composed of ten ordered sections.
- **Data_Layer**: The collection of typed TypeScript modules under `src/data/` plus `src/lib/utils.ts` that supply all content.
- **Route_Stub**: A minimal placeholder page for a route referenced by navigation but not built in this slice.
- **Stat_Card**: A card in the Live Ecosystem Metrics section that displays a single numeric metric statically (value, label, and source attribution).
- **Scheme**: A government scheme record from `src/data/schemes.ts`.
- **Cluster**: A "Beyond Bengaluru" regional cluster record from `src/data/clusters.ts`.
- **Sector**: An industry sector record from `src/data/sectors.ts`.
- **Event**: An ecosystem event record from `src/data/events.ts`.
- **GIA_Country**: A Global Innovation Alliance partner country record from `src/data/gia-countries.ts`.
- **Policy**: A vertical policy record from `src/data/policies.ts`.
- **Source_Context**: A textual source attribution and/or date accompanying a displayed data point.
- **WCAG_AA**: Web Content Accessibility Guidelines 2.1 Level AA conformance criteria.
- **Viewport_Mobile**: Viewport widths below 768px.
- **Viewport_Desktop**: Viewport widths of 1024px and above.

## Requirements

### Requirement 1: Project Scaffolding and Configuration

**User Story:** As a developer, I want a correctly configured Next.js 14 App Router project, so that I can build and run the KITE platform reliably.

#### Acceptance Criteria

1. THE KITE_App SHALL be structured as a Next.js 14 project using the App Router with a `src/app/` directory.
2. THE KITE_App SHALL use TypeScript for all application source files.
3. THE KITE_App SHALL configure Tailwind CSS version 3.4 or higher.
4. THE KITE_App SHALL install and configure shadcn/ui with the following components available: button, card, badge, dialog, sheet, tabs, dropdown-menu, navigation-menu, input, select, separator, avatar, tooltip, accordion, command, popover, scroll-area, skeleton, table, and chart.
5. THE KITE_App SHALL declare Recharts, Lucide React, and Framer Motion in its package manifest dependencies and SHALL resolve them without missing-module errors at build time.
6. THE KITE_App SHALL load the Inter font for body text via the Next.js font system.
7. THE KITE_App SHALL load the Plus Jakarta Sans font for headings via the Next.js font system.
8. WHEN the type-check command is executed, THE KITE_App SHALL report zero TypeScript errors.
9. WHEN the production build command is executed, THE KITE_App SHALL complete and produce build output without errors.
10. IF the production build command encounters a compilation error, THEN THE KITE_App SHALL fail the build with a non-zero exit status and report the error.
11. WHEN the lint command is executed, THE KITE_App SHALL report zero lint errors.

### Requirement 2: KITE Design System and Theming

**User Story:** As a developer, I want a centralized KITE design system, so that all components share a consistent, government-grade visual language.

#### Acceptance Criteria

1. THE Design_System SHALL define the following named color tokens in the Tailwind configuration: primary (#1B4D8E), secondary (#E85D26), dark (#0F1B2D), surface (#F7F8FA), card (#FFFFFF), muted (#64748B), and border (#E2E8F0).
2. THE Design_System SHALL define exactly four semantic color tokens named success, warning, danger, and info.
3. THE Design_System SHALL define exactly three accent color tokens named teal, purple, and pink.
4. THE Design_System SHALL define a typography scale with distinct font sizes for display, h1, h2, h3, body, and caption, where display is the largest size, caption is the smallest size, and each level from display through caption is no larger than the level preceding it.
5. THE Design_System SHALL apply the Plus Jakarta Sans font to heading elements and the Inter font to body elements.
6. THE Design_System SHALL render card containers with `rounded-xl` corners and a single, consistent shadow style applied uniformly across all cards.
7. THE Design_System SHALL render buttons with `rounded-lg` corners.
8. THE Design_System SHALL render badges with `rounded-md` corners.
9. THE Design_System SHALL render Lucide icons at a default size of 20 by 20 pixels.
10. THE Design_System SHALL NOT apply gradient backgrounds to any page section.
11. THE Design_System SHALL NOT render any decorative blob shapes.
12. THE Design_System SHALL NOT use any emoji characters in user interface elements.
13. WHILE an interactive element has keyboard focus, THE Design_System SHALL display a focus ring with a contrast ratio of at least 3:1 against adjacent colors.
14. THE Design_System SHALL maintain a text contrast ratio of at least 4.5:1 for normal-size text and at least 3:1 for large-size text against its background.
15. THE Design_System SHALL maintain a contrast ratio of at least 3:1 for non-text user interface components and meaningful graphics against adjacent colors.
16. IF a configured web font fails to load, THEN THE Design_System SHALL fall back to a system sans-serif font.

### Requirement 3: Global Header and Navigation

**User Story:** As a visitor, I want a persistent header with full navigation, so that I can reach any area of the ecosystem from anywhere on the site.

#### Acceptance Criteria

1. THE Header SHALL render fixed to the top of the viewport with a background of the kite-dark color and a height of 64 pixels.
2. THE Header SHALL display the KITE logo text, a kite icon, and a sub-line identifying the platform.
3. THE Header SHALL display a center navigation region containing exactly five dropdown-parent navigation items in this order: Ecosystem, Schemes & Benefits, For Stakeholders, Beyond Bengaluru, and Connect.
4. THE Header SHALL display exactly one direct-link primary call-to-action labeled "Register" that is not a dropdown and that targets the route `/register`.
5. WHEN a visitor activates the Ecosystem navigation item by pointer click or by keyboard (Enter or Space), THE Header SHALL present a dropdown containing About KITE, Karnataka Startup Policy 2025-30, All 10 Vertical Policies, Ecosystem Intelligence, Beyond Bengaluru Clusters, and Annual Reports.
6. WHEN a visitor activates the Schemes & Benefits navigation item by pointer click or by keyboard (Enter or Space), THE Header SHALL present a dropdown containing All Schemes (22+), Fiscal Incentives, Grant-in-Aid Programs, ELEVATE (Idea2PoC), KITVEN Fund-5, K-Combinator, LEAP (₹1,000 Cr), and Policy Calculator.
7. WHEN a visitor activates the For Stakeholders navigation item by pointer click or by keyboard (Enter or Space), THE Header SHALL present a dropdown containing Startups, Investors, Incubators & Accelerators, Mentors, Corporates, NGOs & CSR, Universities, Women Founders, and Student Entrepreneurs.
8. WHEN a visitor activates the Beyond Bengaluru navigation item by pointer click or by keyboard (Enter or Space), THE Header SHALL present a dropdown containing All 6 Clusters, Mysuru — Cybersecurity & ESDM, Mangaluru — Silicon Beach, Hubballi-Dharwad-Belagavi — AI & Aerospace, Kalaburagi — AgriTech, Shivamogga — Manufacturing, and Tumakuru — ESDM.
9. WHEN a visitor activates the Connect navigation item by pointer click or by keyboard (Enter or Space), THE Header SHALL present a dropdown containing Mentor Connect, Investor Connect, Global Innovation Alliance (32 countries), Events & Media, Idea Bank, and Startup Jobs.
10. THE Header SHALL display a utility cluster to the right of the center navigation region containing, in this order: a search control labeled with the ⌘K / Ctrl+K shortcut, a bilingual toggle labeled "EN | ಕನ್ನಡ", a notification bell, a "Sign In" link targeting `/signin`, and the "Register" primary call-to-action targeting `/register`.
11. WHEN a visitor activates a navigation link or dropdown item, THE Header SHALL navigate to the route corresponding to that item.
12. WHILE the viewport is Viewport_Mobile, THE Header SHALL display a hamburger control in place of the center navigation region.
13. THE bilingual toggle and notification bell SHALL be visual-only in this slice and SHALL NOT trigger language change or notification behavior.
14. WHILE the viewport is Viewport_Desktop, THE Header SHALL display the center navigation region and SHALL NOT display the hamburger control.
15. WHEN a visitor presses the Escape key or activates a point outside an open Header dropdown, THE Header SHALL close the dropdown and return keyboard focus to the navigation item that opened it.

### Requirement 4: Mobile Navigation

**User Story:** As a mobile visitor, I want a touch-friendly navigation drawer, so that I can browse the ecosystem on a small screen.

#### Acceptance Criteria

1. WHILE the viewport is Viewport_Mobile, WHEN a visitor activates the hamburger control, THE MobileNav SHALL open as a Sheet sliding in from the left edge over a dimming overlay, with the slide-in animation completing within 150 to 400 milliseconds.
2. THE MobileNav SHALL present the six top-level navigation items, WHERE the five dropdown parents (Ecosystem, Schemes & Benefits, For Stakeholders, Beyond Bengaluru, and Connect) render as accordions that expose their children, and WHERE "Register" renders as a direct call-to-action link at the bottom of the drawer, such that the MobileNav presents exactly five accordions plus one direct Register link.
3. WHEN a visitor activates a leaf navigation item in the MobileNav, THE MobileNav SHALL navigate to the corresponding route and close.
4. WHEN a visitor activates a parent navigation item in the MobileNav, THE MobileNav SHALL toggle the visibility of that item's nested items and SHALL remain open.
5. WHEN a visitor activates the close control or the overlay outside the MobileNav, THE MobileNav SHALL close.
6. IF a visitor presses the Escape key WHILE the MobileNav is open, THEN THE MobileNav SHALL close.
7. WHILE the MobileNav is open, THE MobileNav SHALL trap keyboard focus within the Sheet.
8. WHEN the MobileNav closes, THE MobileNav SHALL return keyboard focus to the hamburger control.

### Requirement 5: Global Footer

**User Story:** As a visitor, I want a comprehensive footer, so that I can find programs, resources, and contact information from any page.

#### Acceptance Criteria

1. WHEN any page renders, THE Footer SHALL render with a background of the kite-dark color.
2. THE Footer SHALL display exactly five link columns in this order with these exact titles and link counts: "For Startups" with exactly 9 links; "For Investors" with exactly 7 links; "For Ecosystem Partners" with exactly 6 links; "Programs & Policies" with exactly 7 links; and "Support & Resources" with exactly 9 links.
3. THE Footer SHALL display the "For Startups" column with exactly these 9 links in this order, each labeled and targeting the stated route: Register Your Startup (/register), Browse All Schemes (/schemes), ELEVATE Program (/schemes/elevate), K-Combinator (/programs/k-combinator), Policy Calculator (/calculator), Find Incubator (/incubators), Find Mentor (/mentors), Apply for Grants (/schemes?type=grant), and Startup Jobs (/jobs).
4. THE Footer SHALL display the "For Investors" column with exactly these 7 links in this order, each labeled and targeting the stated route: Investor Connect (/investors), Deal Pipeline (/investors/pipeline), KITVEN Fund-5 (/schemes/kitven), Beyond Bengaluru Clusters (/clusters), Co-investment Opportunities (/investors/co-invest), Sector Reports (/intelligence/reports), and Submit Term Sheet (/investors/submit).
5. THE Footer SHALL display the "For Ecosystem Partners" column with exactly these 6 links in this order, each labeled and targeting the stated route: Incubators & Accelerators (/incubators), Corporates & GCCs (/corporates), NGOs & CSR Partners (/csr), Universities & R&D (/universities), International Partners (GIA) (/gia), and Government Procurement (/procurement).
6. THE Footer SHALL display the "Programs & Policies" column with exactly these 7 links in this order, each labeled and targeting the stated route: Karnataka Startup Policy 2025-30 (/policies/startup-2025-30), All 10 Vertical Policies (/policies), LEAP (₹1,000 Cr) (/programs/leap), Centres of Excellence (16) (/coe), NAIN 2.0 (/programs/nain), Grand Challenge Karnataka (/schemes/gck), and Beyond Bengaluru (/clusters).
7. THE Footer SHALL display the "Support & Resources" column with exactly these 9 links in this order, each labeled and targeting the stated route: Help Center (/support), FAQs (/support/faqs), Contact KITS (/contact), Helpline: 080-22231007 (tel:+918022231007), Email: startupcell@karnataka.gov.in (mailto:startupcell@karnataka.gov.in), Events & Media (/events), Annual Reports (/reports), Tenders & RFPs (/tenders), and API Documentation (/developers).
8. THE Footer SHALL mark the "Helpline: 080-22231007" (tel:) link and the "Email: startupcell@karnataka.gov.in" (mailto:) link as external links.
9. THE Footer SHALL display a bottom utility row containing exactly these three legal lines in this order: "© 2025 Government of Karnataka. All rights reserved."; "Department of Electronics, IT, Bt and S&T"; and "Operated by KITS (Karnataka Innovation and Technology Society) and KDEM (Karnataka Digital Economy Mission)".
10. THE Footer SHALL display exactly these five bottom-right links in this order, each labeled and targeting the stated route: Privacy Policy (/privacy), Terms of Use (/terms), Accessibility (/accessibility), Sitemap (/sitemap), and RTI (/rti).
11. THE Footer SHALL display the centered tagline "One Portal. One Login. One Ecosystem.".
12. THE Footer SHALL display a textual Karnataka state emblem watermark rendered behind the footer content such that all footer text and links remain fully legible and the watermark does not overlap or obscure any interactive element.
13. WHEN a visitor activates a footer link, THE Footer SHALL navigate to the route corresponding to that link's label within 2 seconds.
14. IF a visitor activates a footer link whose target route is unavailable or invalid, THEN THE Footer SHALL display an indication that the destination could not be reached and SHALL keep the visitor on the current page.

### Requirement 6: Floating AI Assistant Panel

**User Story:** As a visitor, I want an accessible AI assistant entry point, so that I can see how to ask KITE for help even before the assistant is connected.

#### Acceptance Criteria

1. THE AI_Assistant SHALL render a floating button fixed to the bottom-right corner of the viewport on every page, and SHALL keep the button visible in that position while the page scrolls.
2. THE AI_Assistant button SHALL display a continuously looping glow and pulse effect implemented using CSS-only animation.
3. WHEN a visitor activates the AI_Assistant button by pointer click or by keyboard (Enter or Space), THE AI_Assistant SHALL open a right slide-over panel titled "Ask KITE AI" and SHALL move keyboard focus into the panel.
4. THE AI_Assistant panel SHALL display one static welcome message and between three and six sample questions.
5. WHEN a visitor activates the close control of the AI_Assistant panel, THE AI_Assistant SHALL close the panel and SHALL return keyboard focus to the AI_Assistant button.
6. IF a visitor presses the Escape key WHILE the AI_Assistant panel is open, THEN THE AI_Assistant SHALL close the panel and SHALL return keyboard focus to the AI_Assistant button.
7. THE AI_Assistant SHALL be visual-only in this slice and SHALL NOT send messages to any backend or external service, including when a visitor activates a sample question.
8. WHILE the AI_Assistant panel is open, THE AI_Assistant SHALL trap keyboard focus within the panel such that Tab from the last focusable element moves to the first and Shift+Tab from the first focusable element moves to the last.

### Requirement 7: Command Palette Search

**User Story:** As a visitor, I want a keyboard-friendly search palette, so that I can quickly find sections of the ecosystem.

#### Acceptance Criteria

1. WHEN a visitor activates the Header search control by pointer click or by keyboard (Enter or Space), THE Command_Palette SHALL open as an overlay built on the shadcn command component and SHALL move keyboard focus to the text input.
2. THE Command_Palette SHALL display a list of navigable destinations sourced from the navigation structure.
3. WHEN a visitor types text in the Command_Palette, THE Command_Palette SHALL filter the displayed destinations to those whose label contains the entered text using a case-insensitive substring match.
4. IF no destination label matches the entered text, THEN THE Command_Palette SHALL display a no-match indication and SHALL remain open.
5. WHEN a visitor selects a destination by pointer click or by pressing Enter on the highlighted item, THE Command_Palette SHALL navigate to the corresponding route and close.
6. WHEN a visitor presses the Escape key WHILE the Command_Palette is open, THE Command_Palette SHALL close and return keyboard focus to the Header search control.
7. THE Command_Palette SHALL allow the visitor to move the highlighted item using the ArrowUp and ArrowDown keys and to activate the highlighted item using the Enter key.

### Requirement 8: Home Page — Hero Section

**User Story:** As a visitor, I want a compelling hero section, so that I immediately understand Karnataka's innovation scale and primary actions.

#### Acceptance Criteria

1. THE Home_Page SHALL render the Hero section as the first section in the page's main content, with a background of the kite-dark color and a CSS-only grid pattern that does not reduce Hero text contrast below 4.5:1 for normal-size text and 3:1 for large-size text.
2. THE Hero section SHALL display the heading "Karnataka's Innovation & Technology Ecosystem".
3. THE Hero section SHALL display a subheading referencing the verified ecosystem scale: 21,000+ DPIIT startups, 183 soonicorns, 730+ GCCs, and a 25,000 startups target by 2030.
4. THE Hero section SHALL display exactly two call-to-action controls, the first labeled "Register Your Startup" and the second labeled "Explore Schemes & Benefits".
5. WHEN a visitor activates the "Register Your Startup" control by pointer click or by keyboard (Enter or Space), THE Home_Page SHALL navigate to the startup registration route within 2 seconds.
6. WHEN a visitor activates the "Explore Schemes & Benefits" control by pointer click or by keyboard (Enter or Space), THE Home_Page SHALL navigate to the Schemes & Benefits route within 2 seconds.
7. IF a visitor activates a Hero call-to-action control whose target route is unavailable or invalid, THEN THE Home_Page SHALL display an indication that the destination could not be reached and SHALL keep the visitor on the current page.
8. THE Hero section SHALL display a trust badges row containing exactly four understated, text-only credibility signals (not boxed or pilled chips, no icons) with the text "DPIIT Recognized", "25% Women-Led", "#14 GSER 2025", and "32 GIA Partner Countries", rendered as a thin single row that wraps gracefully on mobile, positioned beneath the verified stat strip and above the department attribution line.

### Requirement 9: Home Page — Live Ecosystem Metrics Section

**User Story:** As a visitor, I want clear ecosystem metrics, so that I can grasp Karnataka's digital landscape at a glance.

#### Acceptance Criteria

1. THE Home_Page SHALL render a Live Ecosystem Metrics section with a white background and the title "Karnataka's Digital Landscape".
2. THE Live Ecosystem Metrics section SHALL display exactly six Stat_Cards, rendering the six curated metric ids from the full stat set defined in `src/data/ecosystem-stats.ts`.
3. THE six Stat_Cards SHALL present the metrics: 21,000+ DPIIT-recognized startups, $79B VC raised, 183 soonicorns, 730+ Global Capability Centres, #14 Global Startup Ecosystem Rank, and 32 GIA partner countries.
4. THE Stat_Card SHALL render its metric's final value statically (the count-up animation requirement is superseded per founder direction — Stat_Card is a static Server Component), displaying the metric's display value directly.
5. THE Stat_Card SHALL present its value, label, and source attribution as static content with no per-session animation state.
6. THE Stat_Card SHALL display a Source_Context, presented as a visible source-attribution text label, for its metric.
7. IF the ecosystem statistics data fails to load, THEN THE Live Ecosystem Metrics section SHALL display an indication that the metrics are unavailable instead of values.

### Requirement 10: Home Page — Quick Actions Section

**User Story:** As a visitor, I want a grid of common actions, so that I can quickly reach the task I came to perform.

#### Acceptance Criteria

1. THE Home_Page SHALL render a Quick Actions section with a background of the kite-surface color and the title "What are you looking for?".
2. THE Quick Actions section SHALL display exactly eight action cards, each containing a Lucide icon, a title of at most 40 characters, a description of at most 120 characters, and a target route.
3. THE eight action cards SHALL cover Register Your Startup, Find a Scheme, Policy Calculator, Find an Incubator, Find a Mentor, Investor Connect, Explore Beyond Bengaluru, and Events & Media.
4. WHILE the viewport is Viewport_Desktop, THE Quick Actions section SHALL arrange the eight action cards in a 4-column by 2-row grid, AND WHILE the viewport is a tablet width, THE Quick Actions section SHALL arrange the action cards in a 2-column by 4-row grid, AND WHILE the viewport is Viewport_Mobile, THE Quick Actions section SHALL arrange the action cards in a single column.
5. WHEN a visitor activates an action card by pointer click or by keyboard (Enter or Space), THE Home_Page SHALL navigate to the route associated with that card within 2 seconds.
6. IF a visitor activates an action card whose target route is unavailable or invalid, THEN THE Home_Page SHALL display an indication that the destination could not be reached and SHALL keep the visitor on the current page.

### Requirement 11: Home Page — Featured Flagship Programs Section

**User Story:** As a visitor, I want to see flagship programs, so that I can understand Karnataka's startup policy offerings.

#### Acceptance Criteria

1. THE Home_Page SHALL render a Featured Programs section with a background of the kite-card color (#FFFFFF) and the title "Karnataka Startup Policy 2025-2030".
2. THE Featured Programs section SHALL present exactly six programs — LEAP, K-Combinator, KITVEN Fund-5, ELEVATE (ELEVATE Idea2PoC), Beyond Bengaluru Cluster Fund, and Grand Challenge Karnataka — WHERE each program is represented either by a distinct card or within a distinct tab, such that all six programs are reachable within the section.
3. THE Featured Programs section SHALL display for each of the six programs a non-empty description text of at most 300 characters.
4. THE Featured Programs section SHALL display for each of the six programs a status badge whose visible label is one value drawn from a fixed, enumerated set of program status values.
5. THE Featured Programs section SHALL display for each of the six programs a call-to-action control that exposes a programmatically determinable accessible name.
6. WHILE the viewport is Viewport_Desktop, THE Featured Programs section SHALL arrange the six programs in a 3-column by 2-row grid.
7. WHEN a visitor activates a program call-to-action control by pointer click or by keyboard (Enter or Space), THE Home_Page SHALL navigate to the route corresponding to that program within 2 seconds.
8. IF a visitor activates a program call-to-action control whose target route is unavailable or invalid, THEN THE Home_Page SHALL display an indication that the destination could not be reached and SHALL keep the visitor on the current page.

### Requirement 12: Home Page — Beyond Bengaluru Clusters Section

**User Story:** As a visitor, I want to explore regional clusters, so that I can find innovation opportunities beyond Bengaluru.

#### Acceptance Criteria

1. THE Home_Page SHALL render a Beyond Bengaluru Clusters section with a background of the kite-surface color.
2. THE Clusters section SHALL display exactly six unique Cluster cards sourced from `src/data/clusters.ts` for Mysuru, Mangaluru, Hubballi-Dharwad-Belagavi, Kalaburagi, Shivamogga, and Tumakuru, in the order defined in that source.
3. IF the cluster data fails to load or a Cluster record is missing a required field, THEN THE Clusters section SHALL preserve its layout and SHALL skip any Cluster card missing required fields.
4. THE Cluster card SHALL display a focus area and infrastructure information.
5. THE Cluster card SHALL display a single call-to-action control with a label sourced from the cluster data.
6. WHEN a visitor activates a Cluster card call-to-action control, THE Home_Page SHALL navigate in the same tab to the route defined in that Cluster's data.
7. IF a Cluster's route is undefined or invalid, THEN THE Home_Page SHALL NOT navigate and SHALL keep the visitor on the current page.

### Requirement 13: Home Page — All Schemes At A Glance Section

**User Story:** As a visitor, I want a scannable overview of all schemes, so that I can identify which schemes apply to me.

#### Acceptance Criteria

1. WHEN the Home_Page loads, THE Home_Page SHALL render an All Schemes section with a white background presenting a curated preview of approximately twelve Schemes (8–12) selected from the 22 Schemes defined in `src/data/schemes.ts`.
2. THE All Schemes section SHALL display each previewed Scheme as a row containing the columns Scheme Name, Benefit, Duration, and Eligibility, WHERE Benefit renders the Scheme's amount and maximum benefit (amount/maxBenefit) and Eligibility renders the Scheme's eligibility list, with every column populated from the corresponding Scheme's data.
3. THE All Schemes section SHALL display exactly three filter tabs labeled All, Fiscal Incentives, and Grant-in-Aid.
4. WHEN the Home_Page loads, THE All Schemes section SHALL preselect the "All" filter tab and display the curated preview.
5. WHEN a visitor selects the "Fiscal Incentives" filter tab, THE All Schemes section SHALL display only the previewed Schemes whose Type equals 'fiscal' and hide all non-matching Schemes.
6. WHEN a visitor selects the "Grant-in-Aid" filter tab, THE All Schemes section SHALL display only the previewed Schemes whose Type equals 'grant' and hide all non-matching Schemes.
7. WHEN a visitor selects the "All" filter tab, THE All Schemes section SHALL display the full curated preview.
8. IF the selected filter tab matches zero Schemes, THEN THE All Schemes section SHALL display a message indicating that no Schemes match the selected filter while keeping the filter tabs visible.
9. THE All Schemes section SHALL display a single call-to-action control labeled "View All 22 Schemes".
10. WHEN a visitor activates the "View All 22 Schemes" control, THE Home_Page SHALL navigate to the Schemes index route (`/schemes`).

### Requirement 14: Home Page — Sector Explorer Section

**User Story:** As a visitor, I want to browse sectors, so that I can orient myself by industry.

#### Acceptance Criteria

1. THE Home_Page SHALL render a Sector Explorer section with a background set to the kite-surface color token.
2. WHEN the Sector Explorer section renders, THE Sector Explorer section SHALL display a single horizontal row of clickable sector chips sourced from `src/data/sectors.ts`, in the order defined in that source.
3. THE Sector Explorer section SHALL display one clickable chip for each Sector defined in `src/data/sectors.ts`, in the order defined in that source, WHERE each chip is labeled with its Sector name.
4. THE Sector Explorer section SHALL display a number of chips equal to the number of Sectors defined in `src/data/sectors.ts`, WHERE that source provides a curated taxonomy of between 15 and 20 Sectors.
5. WHILE the combined width of all sector chips exceeds the width of the Sector Explorer section, THE Sector Explorer section SHALL allow horizontal scrolling so that every chip becomes reachable, and THE chips SHALL remain on a single row without wrapping.
6. WHEN a visitor clicks a sector chip, THE Sector Explorer section SHALL apply a visually distinct selected state to that chip and remove the selected state from any previously selected chip, such that no more than one chip is in the selected state at a time.
7. THE Sector Explorer section SHALL be visual-only in this slice and SHALL NOT alter, filter, reorder, or remove any data displayed elsewhere on the Home_Page when a chip is selected.
8. IF `src/data/sectors.ts` provides zero sectors, THEN THE Sector Explorer section SHALL render the section container with no chips and SHALL NOT display a broken or empty chip element.

### Requirement 15: Home Page — Events Preview Section

**User Story:** As a visitor, I want a preview of upcoming events, so that I can plan to participate.

#### Acceptance Criteria

1. WHEN the Home_Page loads, THE Home_Page SHALL render an Events Preview section with a white background.
2. WHEN the Home_Page loads, THE Events Preview section SHALL display no fewer than four and no more than six Event cards sourced from `src/data/events.ts`, ordered by event start date in ascending order.
3. THE Event cards SHALL include Bengaluru Tech Summit 2026, Beyond Bengaluru BLUE Mysuru Pitch Day, K-Combinator Demo Day, GIA Annual Meet, ELEVATE NXT 2026, and KAN Cohort 4 Demo Day.
4. THE Events Preview section SHALL display each Event card with the event name and event date as visible text.
5. THE Events Preview section SHALL display a "View All" control that, WHEN activated by the visitor, navigates the Home_Page to the Events route.
6. IF the events data source in `src/data/events.ts` is empty or cannot be loaded, THEN THE Events Preview section SHALL display a message indicating no upcoming events are available and SHALL suppress the Event cards.

### Requirement 16: Home Page — GIA Partner Countries Section

**User Story:** As a visitor, I want to see the partner countries, so that I understand Karnataka's global reach.

#### Acceptance Criteria

1. THE Home_Page SHALL render a GIA Partner Countries section with a background of the kite-dark color and the visible title "32 Partner Countries".
2. WHEN the GIA Partner Countries section renders, THE GIA Partner Countries section SHALL display a grid of GIA_Country entries from `src/data/gia-countries.ts`, each entry showing a flag and a non-empty country name.
3. IF a GIA_Country entry is missing its flag or has an empty country name, THEN THE GIA Partner Countries section SHALL omit that entry and continue rendering the remaining valid entries.
4. IF zero valid GIA_Country entries are available, THEN THE GIA Partner Countries section SHALL render its title and call-to-action control without an empty grid.
5. WHERE the number of GIA_Country entries displayed is fewer than the total number of valid entries, THE GIA Partner Countries section SHALL display an "and N more" indicator where N equals the total number of valid entries minus the number displayed.
6. WHERE all valid GIA_Country entries are displayed, THE GIA Partner Countries section SHALL NOT display the "and N more" indicator.
7. THE GIA Partner Countries section SHALL display a single call-to-action control that, WHEN activated by the visitor, navigates to the GIA route.

### Requirement 17: Home Page — Social Proof Trust Bar Section

**User Story:** As a visitor, I want to see ecosystem partners, so that I trust the platform's credibility.

#### Acceptance Criteria

1. WHEN the Home_Page loads, THE Home_Page SHALL render a Social Proof section with a white background, a visible top border, and a visible bottom border.
2. WHEN the Social Proof section renders, THE Social Proof section SHALL display the heading text "Ecosystem Partners".
3. WHEN the Social Proof section renders, THE Social Proof section SHALL display exactly 10 text logos with the labels NASSCOM, TiE, IESA, STPI, DPIIT, KITVEN, IISc, IIM-B, IIIT-B, and ARTPARK.
4. WHEN the Social Proof section renders, THE Social Proof section SHALL display each of the 10 text logos rendered in a single grayscale color with no chromatic fill.
5. WHILE the viewport width is between 320 pixels and 1920 pixels, THE Social Proof section SHALL display all 10 text logos fully visible without horizontal scrolling and without text truncation.

### Requirement 18: Data Layer

**User Story:** As a developer, I want all content in typed TypeScript data files, so that the site renders real data without a backend.

#### Acceptance Criteria

1. THE Data_Layer SHALL provide the modules `ecosystem-stats.ts`, `schemes.ts`, `clusters.ts`, `sectors.ts`, `events.ts`, `incubators.ts`, `gia-countries.ts`, and `policies.ts` under `src/data/`.
2. THE Data_Layer SHALL provide a `src/lib/utils.ts` module containing shared utility functions.
3. THE Data_Layer SHALL export one TypeScript type or interface for each record collection it provides, and each exported collection SHALL be annotated with that type.
4. WHEN the project is type-checked using the configured TypeScript compiler, THE Data_Layer SHALL produce zero type errors.
5. THE `schemes.ts` module SHALL contain exactly 22 Scheme records, each populated with the fields id, name, type (one of 'fiscal' or 'grant'), shortDescription, amount, maxBenefit, duration, eligibility (a non-empty string array), documents (a non-empty string array), and status (one of 'open' or 'upcoming'), with an optional note field.
6. THE `clusters.ts` module SHALL contain exactly six Cluster records.
7. THE `policies.ts` module SHALL contain exactly ten Policy records.
8. THE `gia-countries.ts` module SHALL contain exactly 32 GIA_Country records, one per partner country.
9. THE Data_Layer SHALL ensure that every required field of every record is non-null, non-undefined, and, for string fields, a non-empty value.
10. THE Data_Layer SHALL contain only documented real values and SHALL NOT contain placeholder text (including empty strings, "TBD", "TODO", "N/A", "lorem ipsum", or repeated filler characters) or fabricated numeric values not traceable to a documented source.
11. WHILE rendering any content covered by this slice, THE KITE_App SHALL source all displayed content from the Data_Layer.
12. IF content covered by this slice is requested, THEN THE KITE_App SHALL NOT issue any network or API call to retrieve it.
13. THE KITE_App SHALL NOT read from or write to browser storage (including localStorage, sessionStorage, cookies, and IndexedDB) for content covered by this slice.

### Requirement 19: Route Stubs

**User Story:** As a visitor, I want all navigation links to resolve, so that I never encounter a broken link while exploring.

#### Acceptance Criteria

1. THE KITE_App SHALL provide a Route_Stub for every navigation destination referenced by the Header, MobileNav, Footer, and Home_Page that is not already implemented as a built page, such that no referenced destination resolves to a missing route.
2. WHEN a visitor navigates to a Route_Stub, THE KITE_App SHALL render the Route_Stub page within 2 seconds without producing a not-found or routing error.
3. WHEN a Route_Stub renders, THE KITE_App SHALL render the Header and Footer on the Route_Stub page so that the visitor can continue navigating.
4. THE Route_Stub SHALL display a visible heading containing a name that identifies the destination and a visible message indicating that the page content is forthcoming.
5. IF a visitor navigates to a route that has neither a built page nor a Route_Stub, THEN THE KITE_App SHALL render a not-found page that displays the Header and Footer and SHALL keep navigation available to the visitor.

### Requirement 20: Responsive Layout

**User Story:** As a visitor on any device, I want the layout to adapt to my screen, so that the site is usable on desktop and mobile.

#### Acceptance Criteria

1. WHILE the viewport is Viewport_Desktop, THE Home_Page SHALL render each of its grid-based sections in a layout of two or more columns.
2. WHILE the viewport is Viewport_Mobile, THE Home_Page SHALL render every one of its sections in a single-column layout in which sections are stacked vertically in their defined source order with no two sections placed side by side.
3. WHILE the viewport width is from 768 pixels to 1023 pixels inclusive, THE Home_Page SHALL render each of its grid-based sections in a layout of one or more columns and SHALL render the section content without horizontal overflow.
4. WHILE the viewport is Viewport_Mobile, THE Header SHALL present navigation through the MobileNav and SHALL NOT display the center navigation region.
5. WHILE the viewport width is from 360 pixels to 1920 pixels inclusive, THE Home_Page SHALL render all content within the viewport width such that no rendered content extends beyond the viewport width and no horizontal scroll mechanism is presented.

### Requirement 21: Accessibility

**User Story:** As a visitor using assistive technology, I want an accessible interface, so that I can use the platform regardless of ability.

#### Acceptance Criteria

1. THE KITE_App SHALL expose, on every page, exactly one banner landmark for the Header, exactly one navigation landmark for the primary navigation, exactly one main landmark for the page's main content, and exactly one contentinfo landmark for the Footer, using semantic HTML landmark elements.
2. THE KITE_App SHALL provide a programmatically determinable, non-empty accessible name for every interactive control that lacks a visible text label.
3. WHEN a visitor navigates using the keyboard, THE KITE_App SHALL move focus between interactive elements in an order that matches their DOM reading order, and SHALL display a visible focus indicator on the focused element with a contrast ratio of at least 3:1 against adjacent colors.
4. WHEN an overlay among the MobileNav, AI_Assistant panel, and Command_Palette is open, THE KITE_App SHALL move keyboard focus into that overlay, SHALL confine subsequent Tab and Shift+Tab navigation to elements within that overlay such that focus cannot reach elements outside it, and SHALL return keyboard focus to the control that opened the overlay when the overlay closes.
5. THE KITE_App SHALL provide a non-empty text alternative for every non-text element that conveys meaning, including icons and country flags, and SHALL mark every purely decorative non-text element so that assistive technologies ignore it.
6. THE KITE_App SHALL maintain a text contrast ratio of at least 4.5:1 for normal-size text and at least 3:1 for large-size text against its background.
7. WHILE the visitor's system indicates a reduced-motion preference, THE KITE_App SHALL suppress non-essential animation and present affected content in its final static state.

### Requirement 22: Performance

**User Story:** As a visitor, I want fast page loads, so that I can access information without delay.

#### Acceptance Criteria

1. THE KITE_App SHALL implement decorative visual effects, including the hero grid pattern and the pulse and glow animations, using CSS only and SHALL NOT drive these effects with JavaScript animation loops or timers.
2. WHEN the Home_Page first renders, THE Home_Page SHALL load only the sections within or above the initial viewport fold and SHALL defer loading of sections positioned entirely below the fold.
3. THE KITE_App SHALL serve all application fonts through the Next.js font optimization system.
4. WHEN a deferred section approaches within 200 pixels of the viewport edge, THE Home_Page SHALL load that section and complete the content swap within 1 second.
5. WHILE a deferred section is loading, THE Home_Page SHALL render a skeleton placeholder that reserves vertical space equal to the loaded content so that no cumulative layout shift occurs when the content replaces the placeholder.
6. WHEN a visitor navigates to the Home_Page, THE Home_Page SHALL render its above-the-fold content within 3 seconds of navigation start.
