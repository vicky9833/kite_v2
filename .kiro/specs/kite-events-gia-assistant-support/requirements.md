# Requirements Document

KITE Events, GIA, AI Assistant & Support (Prompt 8, Closing)

## Introduction

This is the closing slice of the eight-prompt KITE build. It completes every
remaining public surface so that every route referenced in navigation, footer,
home, and the verified data resolves to a real working page. It adds four new
surfaces — the **Events & Media Hub** (`/events`), the **Global Innovation
Alliance** index and **32 country detail pages** (`/gia`, `/gia/[country]`), the
**AI Chat Assistant** (wiring the existing floating panel to actually respond),
and the **Support Center** (`/support` + sub-routes) — and then runs a final
polish pass (stub audit, accessibility, responsive, performance, visual QA,
README, GitHub push) across the entire build.

Operating discipline carried from Prompts 1–7: **frontend-only / session-only**
— NO backend, database, or persistence — with **one exception**: the AI Chat
Assistant may call the Anthropic Messages API via the documented Artifacts
pattern when that runtime is available, and otherwise falls back to a pure,
deterministic rule-based response engine. Verified Karnataka data is canonical
and never fabricated; all synthetic data is deterministic (hash-seeded via the
existing `synthetic-prng`), visibly labeled `Illustrative`. Type extensions are
additive only. First Load JS ≤ 150KB per route. Visual restraint holds: no
gradients, blobs, emoji, glassmorphism, or glow; Lucide icons only; institutional
credibility throughout. WCAG 2.1 AA across every surface.

## Requirements

### Requirement 1: Additive types (Foundation)

**User Story:** As a developer, I want all new shapes appended additively to
`src/types/index.ts`, so that prior exports remain unchanged and the build stays
type-safe.

#### Acceptance Criteria
1. THE type module SHALL append (never alter/remove an existing export):
   `PressMention`, `PressType`, `GovAnnouncement`, `RecentEngagement`,
   `BilateralProgram`, `CountrySuccessStory`, `CountryStartupEngagement`,
   `GiaRegionSummary`, `FaqItem`, `FaqCategory`, `DepartmentContact`,
   `ChatRole`, `ChatMessage`, `ChatState`, `ChatAction`, `AssistantResponse`,
   `SupportTicketDraft`.
2. ALL new types SHALL compile under `strict` + `noUncheckedIndexedAccess` with
   zero errors.
3. THE new types SHALL reuse existing `GIARegion`, `GIACountry`,
   `EcosystemEvent`, and `EventCategory` rather than redeclaring them.

### Requirement 2: Synthetic media & announcements data

**User Story:** As a content owner, I want deterministic synthetic press and
announcement data, so that the Events Hub reads as a credible news surface
without fabricating real coverage.

#### Acceptance Criteria
1. THE `synthetic-media-data` module SHALL export `generatePressMentions()`
   returning 12–18 `PressMention` records, each with a synthetic publication
   name, `publicationType`, synthetic headline, relative date label, synthetic
   excerpt, and an illustrative `href`.
2. THE module SHALL export `generateAnnouncements()` returning 8–12
   `GovAnnouncement` records, each with title, department, relative date label,
   summary, and a source link to the EITBT portal.
3. BOTH generators SHALL be pure and hash-seeded (no `Math.random`/`Date`/
   ambient input) and byte-stable across calls.
4. EVERY press/announcement surface SHALL be marked `Illustrative`.

### Requirement 3: Synthetic GIA per-country data

**User Story:** As a partner-country visitor, I want each country page populated
with plausible bilateral content, so that the international story is visible
while remaining clearly illustrative.

#### Acceptance Criteria
1. THE `synthetic-gia-data` module SHALL export, keyed by country code:
   `generateBilateralPrograms(countryCode)` (3–5 `BilateralProgram`),
   `generateCountrySuccessStories(countryCode)` (2–3 `CountrySuccessStory`),
   and `generateCountryStartupEngagements(countryCode)` (exactly 6
   `CountryStartupEngagement`).
2. THE module SHALL export `generateRecentEngagements()` returning 12–15
   `RecentEngagement` records for the GIA index.
3. ALL generators SHALL be pure, hash-seeded by the country code (or a fixed
   key), and byte-stable; every startup-sector reference SHALL draw from the
   country's verified `focusAreas` where applicable.
4. EVERY synthetic GIA surface SHALL be marked `Illustrative`.

### Requirement 4: AI assistant rule engine (deterministic fallback)

**User Story:** As any visitor, I want the AI assistant to respond usefully even
without a live model, so that the assistant always works.

#### Acceptance Criteria
1. THE `kite-assistant-rules` module SHALL export a pure
   `generateRuleResponse(message: string): AssistantResponse` returning a text
   answer plus a list of suggested KITE route chips.
2. Keyword families SHALL route to the correct surface: register/sign-up →
   `/register`; scheme/eligibility/calculator → `/schemes` + `/calculator`;
   named schemes (ELEVATE, KITVEN, K-Combinator, KAN, LEAP, GCK) → their detail
   routes; cluster names (Mysuru, Mangaluru, HDB, Kalaburagi, Shivamogga,
   Tumakuru, Beyond Bengaluru) → `/clusters` or the cluster detail route;
   investor → `/investors`; incubator → `/incubators`; mentor → `/mentors`;
   women → `/women`; idea → `/ideas`; events → `/events`; GIA/international →
   `/gia`; support/help → `/support`.
3. AN unmatched message SHALL return a helpful default pointing to `/schemes`,
   `/register`, and `/support`.
4. THE engine SHALL be pure and deterministic (same input → same output, no
   I/O, no `Math.random`, no `Date`).

### Requirement 5: AI assistant system prompt builder

**User Story:** As a maintainer, I want the assistant's grounding prompt built
by a pure function, so that the canonical facts are testable.

#### Acceptance Criteria
1. THE `ai-assistant-system-prompt` module SHALL export a pure
   `buildSystemPrompt(): string`.
2. THE prompt SHALL include the canonical ecosystem facts (21,000+ DPIIT
   startups, 183 soonicorns, $79B VC, 730+ GCCs, 22 schemes, 6 clusters, 32 GIA
   countries, 16 CoEs), the 22 scheme names, the 6 cluster names with focus,
   and the four flagship programs (LEAP, K-Combinator, ELEVATE, KITVEN).
3. THE prompt SHALL instruct the assistant to direct users to specific KITE
   routes, recommend the official portal `eitbt.karnataka.gov.in/startup` for
   applications, keep responses to 3–5 sentences, and end with a next-step.
4. THE function SHALL be pure (no network, no I/O).

### Requirement 6: Events & Media Hub (`/events`)

**User Story:** As an ecosystem participant, I want a single hub for events and
media, so that I can discover what's happening and how Karnataka is covered.

#### Acceptance Criteria
1. THE `/events` route SHALL replace the StubPage with a hub composing, in order:
   hero strip (`py-12 bg-dark`, two CTAs), Featured Event, Upcoming Events grid
   (all 8 verified events, chronological, category-filterable, inline detail
   panel), Media & Press section (12–18 synthetic mentions, type-filterable),
   Government Announcements (8–12 synthetic), Reports & Publications (3 cards
   with client-side Blob download), Subscribe (visual-only with success
   message), Social & Community, Resources.
2. THE Featured Event SHALL highlight the flagship Bengaluru Tech Summit 2026
   with a registration CTA and a "See All Events" link.
3. THE Upcoming Events grid SHALL render every verified event with a date block,
   name, location, category badge, description, and Learn More; clicking a card
   SHALL open an inline detail panel (Escape/close returns focus), and a
   category filter SHALL narrow the grid with a no-results message when empty.
4. ALL synthetic media/announcement surfaces SHALL carry `Illustrative`.
5. THE route SHALL hold First Load JS ≤ 150KB and meet WCAG 2.1 AA.

### Requirement 7: GIA index (`/gia`)

**User Story:** As an international partner, I want a GIA index, so that I can
browse Karnataka's 32 partner countries and engagement framework.

#### Acceptance Criteria
1. THE `/gia` route SHALL replace the StubPage with an index composing: hero
   (`py-12 bg-dark`, two CTAs), Why GIA (3-column editorial), Region Overview (5
   region cards with verified counts derived from `giaCountries`), All Countries
   grid (all 32, flag-icons SVG, focus chips, region label, clickable to
   `/gia/[code]`, region filter + name/region sort), Recent Engagements (12–15
   synthetic), Featured Programs, Contact for International Partners, Resources.
2. THE region counts SHALL be derived from the verified `giaCountries` data, not
   hardcoded.
3. EACH country tile SHALL link to `/gia/{countryCode}` (lowercase) and be
   keyboard accessible.
4. ALL synthetic GIA surfaces SHALL carry `Illustrative`.
5. THE route SHALL hold First Load JS ≤ 150KB and meet WCAG 2.1 AA.

### Requirement 8: GIA country detail pages (`/gia/[country]`)

**User Story:** As a visitor interested in a specific country, I want a detail
page, so that I can see the bilateral relationship with Karnataka.

#### Acceptance Criteria
1. THE dynamic `/gia/[country]` route SHALL resolve for all 32 verified country
   codes and return `notFound()` for any unknown code.
2. EACH country page SHALL render: breadcrumb (Home > GIA > Country), hero
   (`py-12 bg-dark`, large flag, two CTAs), Country at a Glance (3-column),
   Bilateral Programs (3–5 synthetic), Investment & Partnership Opportunities
   (per-region editorial template), Featured Karnataka Startups (6 synthetic),
   Success Stories (2–3 synthetic), Country Resources (3 cards), and Related
   Countries (3 from the same region).
3. THE opportunities copy SHALL be selected from a small per-region editorial
   template (Europe / Middle East / Asia-Pacific / Americas / Africa), not
   invented per country.
4. `generateStaticParams` SHALL pre-render all 32 country codes.
5. ALL synthetic surfaces SHALL carry `Illustrative`; the route SHALL hold First
   Load JS ≤ 150KB and meet WCAG 2.1 AA.

### Requirement 9: AI Chat Assistant (functional)

**User Story:** As any visitor, I want the floating AI panel to actually answer
my questions, so that KITE feels like an intelligent platform.

#### Acceptance Criteria
1. THE existing `AIAssistantButton` panel SHALL be extended into a full chat
   interface: a scrollable conversation, user (right) and assistant (left)
   bubbles with a "KITE AI" label, a text input, and a send button.
2. SENDING a message SHALL append a user bubble, show a loading indicator
   (three pulsing dots), obtain a response, and append an assistant bubble.
3. CHAT state SHALL be managed by a pure typed reducer (`messages`, `input`,
   `loading`, `error`), session-only, reset on close/refresh.
4. THE assistant SHALL attempt the Anthropic Artifacts API path when available
   and otherwise use `generateRuleResponse`; failures SHALL surface a friendly
   error with a "Try Again" button that resends the last user message.
5. THE five sample-question chips SHALL become click-to-send quick starts; after
   the first message they move to a suggested-follow-ups area.
6. AFTER each assistant response, KITE route mentions SHALL surface as clickable
   suggestion chips that navigate on click.
7. THE conversation SHALL cap at 20 exchanges with a "Clear Conversation"
   control.
8. ACCESSIBILITY: labeled input; `aria-label` on send; assistant messages
   `aria-live="polite"`; loading announced politely; error `role="alert"`; Enter
   sends, Shift+Enter newline, Escape closes.
9. THE panel SHALL never expose API keys and SHALL add no measurable bundle
   weight beyond lean native `fetch` + reducer + string template (code-split if
   it threatens the shared baseline).

### Requirement 10: Support Center (`/support` + sub-routes)

**User Story:** As a user needing help, I want a Support Center, so that I can
find answers, contacts, and escalation paths.

#### Acceptance Criteria
1. THE `/support` route SHALL replace the StubPage with: hero (`py-12`, two
   CTAs incl. "Ask KITE AI"), How Can We Help (3 cards), FAQs (accordion of
   20–30 curated items with related links), Contact KITS (helpline
   `080-22231007`, email `startupcell@karnataka.gov.in`, office + map link),
   Department Contacts (KDEM, KITS, ELEVATE Cell, Investor Cell, International
   Cell), Submit a Ticket (visual-only, success with `SUP-YYYY-XXXXXX` id),
   Helpline Hours & SLA, Resources.
2. THE `/support/faqs` route SHALL render the FAQ accordion surface.
3. CONTACT details SHALL come from the verified footer data.
4. THE FAQ accordion SHALL use proper ARIA; the ticket form SHALL be fully
   labeled; the route SHALL hold First Load JS ≤ 150KB and meet WCAG 2.1 AA.

### Requirement 11: Final polish across the build

**User Story:** As the project owner, I want a production-ready handoff, so that
every route resolves and the build passes all audits.

#### Acceptance Criteria
1. EVERY route still rendering a bare StubPage SHALL be upgraded to a real page
   or a credible content-forthcoming page (no dead ends across navigation,
   footer, home, and verified data links).
2. ALL routes SHALL pass an accessibility audit (axe-core, zero violations on
   the audited set) and render correctly at 320/768/1024/1280px.
3. EVERY route SHALL stay under 150KB First Load JS; the production build SHALL
   succeed.
4. THE visual QA SHALL confirm zero gradients/blobs/emoji/glassmorphism/glow.
5. THE root README SHALL be updated to the final state (all eight prompts, tech
   stack, how to run, spec-driven workflow principles).
6. THE full test suite SHALL pass and the final state SHALL be pushed to GitHub
   tagged `v1.0.0`.

### Requirement 12: Navigation, footer & assistant integration

**User Story:** As a visitor, I want Events, GIA, and Support reachable
everywhere, so that no surface is orphaned.

#### Acceptance Criteria
1. NAVIGATION SHALL surface `/events`, `/gia`, and `/support` (Events & Media
   and GIA already exist under Connect; Support reachable from header/footer).
2. FOOTER columns SHALL keep `/events`, `/gia`, and `/support` reachable.
3. THE Support "Ask KITE AI" CTA SHALL open the global AI assistant panel.

## Glossary

- **GIA** — Global Innovation Alliance; Karnataka's 32 verified international
  partner-country engagement framework.
- **Artifacts pattern** — The documented Anthropic Messages API access path
  available inside the Claude.ai artifacts runtime; absent in the standard
  Next.js runtime, where the deterministic rule engine is used instead.
- **Rule engine** — The pure, deterministic `generateRuleResponse` keyword
  matcher that grounds the AI assistant when no live model is available.
- **Illustrative** — Synthetic, deterministically generated, clearly-labeled
  preview content that is never presented as verified fact.
- **Verified data** — Canonical Karnataka figures and records authored verbatim
  from official sources; never fabricated.
- **First Load JS** — Next.js per-route initial JavaScript payload; capped at
  150KB.
