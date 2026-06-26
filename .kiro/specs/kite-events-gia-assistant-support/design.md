# Design — KITE Events, GIA, AI Assistant & Support (Prompt 8, Closing)

## Overview

Prompt 8 closes the eight-prompt build by landing the four remaining public
surfaces and a final polish pass. It reuses every primitive established in
Prompts 1–7: the `synthetic-prng` determinism kit, `IllustrativeBadge`,
`LazySection`, `buttonVariants`, the `flag-icons` SVG sprite (already imported in
`globals.css`), the verified data modules (`events.ts`, `gia-countries.ts`,
`schemes.ts`, `clusters.ts`, `flagship-programs.ts`, `ecosystem-stats.ts`,
`footer.ts`), and the section-component idiom (server components, `py-16 md:py-24`,
`max-w-7xl`, `rounded-xl border bg-card shadow-sm`, single `h1` then sequential
`h2`).

The single network exception is the **AI Chat Assistant**, which attempts the
Anthropic Messages API via the Artifacts pattern when the runtime exposes it and
otherwise uses a pure deterministic rule engine. In the Next.js execution
environment the Artifacts runtime is not present, so the **rule engine is the
de-facto path** — this is a known, surfaced drift point. The assistant adds only
native `fetch`, a plain reducer, and a string template to the shared baseline.

## Architecture

### Route inventory

| Route | File | Rendering | Replaces |
| --- | --- | --- | --- |
| `/events` | `app/events/page.tsx` | Server shell + client islands (event detail panel + media filter + subscribe + reports download) | StubPage |
| `/gia` | `app/gia/page.tsx` | Server shell + client island (country grid filter/sort) | StubPage |
| `/gia/[country]` | `app/gia/[country]/page.tsx` | Server (dynamic, `generateStaticParams` × 32) | (new) |
| `/support` | `app/support/page.tsx` | Server shell + client islands (FAQ accordion + ticket form) | StubPage |
| `/support/faqs` | `app/support/faqs/page.tsx` | Server shell + FAQ accordion island | StubPage |
| AI panel | `components/layout/AIAssistantButton.tsx` | Client (extended) | static placeholder |

### Module & file map

```
src/
  lib/
    synthetic-prng.ts                 ← REUSED
    synthetic-media-data.ts           ← NEW (press mentions + announcements)
    synthetic-gia-data.ts             ← NEW (bilateral programs / stories / engagements / recent)
    gia-region-summary.ts             ← NEW pure (derive region counts from giaCountries)
    ai-assistant-system-prompt.ts     ← NEW pure (buildSystemPrompt)
    kite-assistant-rules.ts           ← NEW pure (generateRuleResponse + route extraction)
    chat-reducer.ts                   ← NEW pure (chatReducer + initial state + helpers)
    events-format.ts                  ← NEW pure (date-block formatting, chronological sort)
    blob-download.ts                  ← NEW pure-ish helper (client Blob download)
  data/
    events.ts                         ← REUSED (8 verified events)
    gia-countries.ts                  ← REUSED (32 verified countries)
    gia-region-editorial.ts           ← NEW verified-ish editorial (per-region copy + featured programs)
    support-faqs.ts                   ← NEW curated FAQ content (founder judgment)
    department-contacts.ts            ← NEW (KDEM/KITS/ELEVATE/Investor/International cells)
  components/
    events/                           ← NEW (hero, featured, grid+panel island, media island, announcements, reports island, subscribe island, social, resources)
    gia/                              ← NEW (index sections + country detail sections)
    support/                          ← NEW (hero, help, faq accordion island, contacts, ticket island, sla, resources)
    layout/AIAssistantButton.tsx      ← EDITED (full chat)
  app/
    events/page.tsx                   ← replaces stub
    gia/page.tsx                      ← replaces stub
    gia/[country]/page.tsx            ← NEW dynamic
    support/page.tsx                  ← replaces stub
    support/faqs/page.tsx             ← replaces stub
  types/index.ts                      ← EDITED additively
```

### Data-flow

Verified data (events, countries, schemes, clusters, programs, footer contacts)
is rendered verbatim. Synthetic generators (media, announcements, bilateral
content) are pure and hash-seeded. The AI assistant reads only its system prompt
and the rule engine; no synthetic content touches the network.

## Components and Interfaces

### Data Models — additive types (`src/types/index.ts`)

```ts
// --- Events & media ---
export type PressType = 'major-press' | 'business-press' | 'tech-press' | 'international-press';
export interface PressMention {
  id: string; publication: string; publicationType: PressType;
  headline: string; dateLabel: string; excerpt: string; href: string;
}
export interface GovAnnouncement {
  id: string; title: string; department: string; dateLabel: string;
  summary: string; sourceHref: string;
}

// --- GIA synthetic ---
export interface RecentEngagement {
  id: string; countryCode: string; title: string; dateLabel: string; summary: string;
}
export interface BilateralProgram {
  id: string; name: string; focusArea: string; sinceYear: number;
  description: string; status: 'active' | 'upcoming';
}
export interface CountrySuccessStory {
  id: string; startupName: string; sector: string; outcome: string;
}
export interface CountryStartupEngagement {
  id: string; startupName: string; sector: string; engagementType: string; description: string;
}
export interface GiaRegionSummary {
  region: GIARegion; countryCount: number; focusAreas: string[];
}

// --- Support ---
export type FaqCategory =
  | 'Registration' | 'Eligibility' | 'Schemes' | 'Application'
  | 'Disbursement' | 'Women Founders' | 'Beyond Bengaluru'
  | 'Programs' | 'International' | 'Escalation';
export interface FaqItem {
  id: string; category: FaqCategory; question: string; answer: string;
  relatedLinks: { label: string; href: string }[];
}
export interface DepartmentContact {
  id: string; name: string; email: string; phone: string; illustrative: boolean;
}
export interface SupportTicketDraft {
  name: string; email: string; subject: string; message: string;
}

// --- AI chat ---
export type ChatRole = 'user' | 'assistant';
export interface ChatMessage {
  id: string; role: ChatRole; content: string; suggestions?: ChatSuggestion[];
}
export interface ChatSuggestion { label: string; href: string; }
export interface AssistantResponse { text: string; suggestions: ChatSuggestion[]; }
export interface ChatState {
  messages: ChatMessage[]; input: string; loading: boolean; error: string | null;
  exchanges: number;
}
export type ChatAction =
  | { type: 'SET_INPUT'; value: string }
  | { type: 'SEND'; message: ChatMessage }
  | { type: 'START_LOADING' }
  | { type: 'RECEIVE'; message: ChatMessage }
  | { type: 'ERROR'; error: string }
  | { type: 'CLEAR' };
```

All reuse existing `GIARegion`, `GIACountry`, `EcosystemEvent`, `EventCategory`.

### `synthetic-media-data.ts` (pure, hash-seeded)

Determinism header per `synthetic-mentors.ts`. Fixed pools of synthetic
publication names (per type), headline templates, excerpt fragments, department
names, and announcement-title templates. `generatePressMentions()` →
`seededInt(seededRng('press|count'), 12, 18)` records keyed `press|{i}`;
`generateAnnouncements()` → 8–12 records keyed `announce|{i}`. Relative date
labels (e.g. "3 days ago", "2 weeks ago") are seeded from a fixed pool, never
from `Date`. Source links point at `https://eitbt.karnataka.gov.in/startup`.

### `synthetic-gia-data.ts` (pure, hash-seeded by country code)

`generateBilateralPrograms(code)` → `seededInt(rng, 3, 5)` programs keyed
`gia-bilateral|{code}|{i}`, names composed from "Karnataka–{Country} {focus}
{programType}" using the country's verified `focusAreas`;
`generateCountrySuccessStories(code)` → 2–3; `generateCountryStartupEngagements(code)`
→ exactly 6 (sector drawn from focus areas); `generateRecentEngagements()` →
12–15 records keyed `gia-recent|{i}` referencing real country codes.

### `gia-region-summary.ts` (pure)

`buildRegionSummaries(countries): GiaRegionSummary[]` groups verified
`giaCountries` by `region`, counts members, and collects the most common focus
areas. Used by the region overview cards so counts are never hardcoded.

### `gia-region-editorial.ts` (verified editorial template)

A fixed record `REGION_OPPORTUNITY_COPY: Record<GIARegion, string>` (Europe →
regulatory alignment & deep tech; Middle East → capital deployment & smart
cities; Asia-Pacific → manufacturing partnerships & supply chain; Americas →
technology transfer & capital; Africa → capacity building & south-south
cooperation) plus the GIA index "Featured International Programs" list.

### `ai-assistant-system-prompt.ts` (pure)

`buildSystemPrompt()` composes the persona, canonical facts (pulled from
`ecosystemStats`, `schemes`, `clusters`, `flagshipPrograms` so the figures stay
canonical), routing guidance, the official portal recommendation, and the
3–5-sentence + next-step instruction into one string.

### `kite-assistant-rules.ts` (pure)

```ts
export interface RuleMatcher { keywords: string[]; respond: () => AssistantResponse; }
export function generateRuleResponse(message: string): AssistantResponse;
export function extractRouteSuggestions(text: string): ChatSuggestion[]; // scans for known /routes
```

A keyword table maps families to responses (Req 4.2). Matching is case-insensitive
substring on the normalized message; the highest-priority match wins; an unmatched
message returns the default. `extractRouteSuggestions` scans response text for
known route tokens and maps them to labeled chips (also used to enrich
API-returned responses).

### `chat-reducer.ts` (pure)

`chatReducer(state, action)` and `INITIAL_CHAT_STATE`. `SEND` appends a user
message and increments `exchanges`; `START_LOADING` sets `loading`; `RECEIVE`
appends an assistant message and clears loading/error; `ERROR` sets error +
clears loading; `CLEAR` resets to initial. Pure and typed.

### AI panel (`AIAssistantButton.tsx`, extended client component)

Keeps the floating button + Radix `Sheet`. Inside: a scroll region of message
bubbles, a loading row (three `animate-pulse` dots, `aria-live="polite"`), an
error row (`role="alert"` + Try Again), the quick-start chips (pre-first-message)
or suggested-follow-up chips (after), and a footer `<form>` with a labeled
`<textarea>` + send `<button aria-label="Send Message">`. `onSubmit` dispatches
`SEND` + `START_LOADING`, then calls `requestAssistant(messages)` which tries the
Artifacts API (`window.claude?.complete` / `fetch` to the messages endpoint) and
falls back to `generateRuleResponse`. Enter sends, Shift+Enter newlines, Escape
closes (Radix default). Caps at 20 exchanges with a Clear control. The request
helper and rule engine are dynamically importable to keep the global baseline
lean.

### Events components (`src/components/events/`)

`EventsHeroStrip`, `FeaturedEvent`, `UpcomingEventsGrid` (client island: category
filter `useState`, inline `EventDetailPanel`), `MediaPressSection` (client island:
type filter), `GovAnnouncementsSection`, `ReportsPublications` (client island:
Blob download), `SubscribeSection` (client island: visual-only success),
`SocialCommunity`, `EventsResources`.

### GIA components (`src/components/gia/`)

Index: `GiaHeroStrip`, `WhyGia`, `RegionOverview`, `AllCountriesGrid` (client
island: region filter + sort), `RecentEngagements`, `FeaturedPrograms`,
`GiaContact`, `GiaResources`. Country detail: `CountryHero`, `CountryBreadcrumb`,
`CountryAtAGlance`, `CountryBilateralPrograms`, `CountryOpportunities`,
`CountryStartups`, `CountrySuccessStories`, `CountryResources`, `RelatedCountries`.

### Support components (`src/components/support/`)

`SupportHero`, `SupportHelpGrid`, `SupportFaqAccordion` (client island, reuses
Radix accordion), `ContactKits`, `DepartmentContacts`, `SubmitTicket` (client
island: visual-only success with `SUP-YYYY-XXXXXX`), `HelplineSla`,
`SupportResources`.

## Design decisions

| Decision | Rationale | Req |
| --- | --- | --- |
| Rule engine is the de-facto AI path; Artifacts API attempted first | Artifacts runtime absent in Next.js; engine guarantees the assistant always works | 4, 9.4 |
| Region counts derived from verified data via a pure helper | Never hardcode counts; stays correct if data changes | 7.2 |
| Per-region opportunity copy from a fixed template | Avoids inventing per-country prose; honest illustrative framing | 8.3 |
| `generateStaticParams` × 32 for country pages | Pre-render every verified code; `notFound()` otherwise | 8.1, 8.4 |
| Chat state via pure typed reducer | Testable message/loading/error handling in isolation | 9.3 |
| Subscribe & ticket forms are visual-only with honest success copy | Frontend-only discipline; sets expectations | 6.1, 10.1 |
| Synthetic generators hash-seeded, byte-stable, badged | Mirrors prior synthetic modules | 2, 3 |

## Testing strategy

Pure logic (system prompt builder, rule engine, route extraction, chat reducer,
region summary, synthetic media/GIA generators, events-format) is covered by
property-based and example tests (`fast-check`, `{ numRuns: 100 }`). Components
(events hub, GIA index, GIA country detail resolving all 32 codes, support,
chat panel with mocked request) are covered by example/integration tests.
Final-audit suites cover accessibility (axe-core), responsive, performance/bundle,
no-IO smoke, and an end-to-end journey. Target ~100–150 new tests on top of the
existing suite.

## Data Models

The additive type definitions are specified above under "Data Models — additive
types (`src/types/index.ts`)". In summary, the data models added are: events &
media (`PressType`, `PressMention`, `GovAnnouncement`); GIA synthetic
(`RecentEngagement`, `BilateralProgram`, `CountrySuccessStory`,
`CountryStartupEngagement`, `GiaRegionSummary`); support (`FaqCategory`,
`FaqItem`, `DepartmentContact`, `SupportTicketDraft`); and AI chat (`ChatRole`,
`ChatSuggestion`, `ChatMessage`, `AssistantResponse`, `ChatState`, `ChatAction`).
All reuse the existing `GIARegion`, `GIACountry`, `EcosystemEvent`, and
`EventCategory` models from earlier prompts.

## Error Handling

- **AI request failure** — `requestAssistant` wraps the Artifacts/API attempt in
  `try/catch`; any throw or non-OK result falls back to `generateRuleResponse`,
  so a user always receives a response. A hard failure (both paths throwing)
  dispatches `ERROR`, rendering a `role="alert"` message and a "Try Again"
  button that resends the last user message.
- **Unknown GIA country code** — `/gia/[country]` calls `notFound()` for any code
  not present in the verified `giaCountries` data.
- **Empty filter results** — Events category filter and GIA region filter render
  an explicit no-results message rather than an empty region.
- **Blob download** — guarded for `URL.createObjectURL` availability; revokes the
  object URL after triggering the download.

## Correctness Properties

### Property 1: Press mention well-formedness & determinism
`generatePressMentions()` returns 12–18 records, each field non-empty, and is
byte-stable across calls (deterministic, ambient-free). **Validates: Requirements 2.1, 2.3**

### Property 2: Announcement well-formedness & determinism
`generateAnnouncements()` returns 8–12 records and is byte-stable. **Validates: Requirements 2.2, 2.3**

### Property 3: Per-country synthetic counts
For every verified country code, `generateBilateralPrograms(code)` returns 3–5,
`generateCountrySuccessStories(code)` 2–3, and `generateCountryStartupEngagements(code)`
exactly 6, deterministically. **Validates: Requirements 3.1, 3.3**

### Property 4: Region summary conservation
`buildRegionSummaries(countries)` total count equals the input length and every
`GIARegion` present in the input appears exactly once. **Validates: Requirements 7.2**

### Property 5: Rule engine totality & determinism
`generateRuleResponse(message)` is deterministic and always returns a non-empty
`text` with a `suggestions` array of valid routes. **Validates: Requirements 4.1, 4.3, 4.4**

### Property 6: System prompt completeness
`buildSystemPrompt()` is pure and contains every canonical headline figure.
**Validates: Requirements 5.2, 5.4**

### Property 7: Chat reducer purity
`chatReducer` transitions are pure: `SEND` increments `exchanges` by one and
appends exactly one user message; `RECEIVE` clears `loading` and `error`.
**Validates: Requirements 9.3**

