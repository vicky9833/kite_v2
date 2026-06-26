# Implementation Plan — KITE Events, GIA, AI Assistant & Support (Prompt 8, Closing)

## Overview

Closing slice of the eight-prompt build. Adds four public surfaces (`/events`,
`/gia` + `/gia/[country]`, the functional AI Chat Assistant, `/support` +
`/support/faqs`) and a final polish pass, on top of the existing Next.js 14 /
App Router / TypeScript-strict project. Dependency-ordered into five phases:

- **Phase A — Foundation.** Additive types; synthetic media data; synthetic GIA
  per-country data; region-summary + region-editorial; AI system-prompt builder;
  rule engine + route extraction; chat reducer; events-format + blob-download
  helpers; support FAQ + department-contact data.
- **Phase B — Events & Media Hub.**
- **Phase C — GIA index + 32 country detail pages.**
- **Phase D — AI Chat Assistant wiring.**
- **Phase E — Support Center + final polish + GitHub push.**

Operating discipline: frontend-only / session-only; verified data canonical;
synthetic data deterministic + `Illustrative`; additive types only; ≤150KB First
Load JS per route; WCAG 2.1 AA. Tests marked `*` are optional for a fast MVP,
required for full conformance.

**Verify commands:** `npx tsc --noEmit`, `npm run lint`, `npm run test:run -- <file>`,
`npm run test:run`, `npm run build`.

## Tasks

### Phase A — Foundation

- [x] 1. Additive types
  - [x] 1.1 Append Prompt-8 types to `src/types/index.ts`
    - Add `PressType`, `PressMention`, `GovAnnouncement`, `RecentEngagement`,
      `BilateralProgram`, `CountrySuccessStory`, `CountryStartupEngagement`,
      `GiaRegionSummary`, `FaqCategory`, `FaqItem`, `DepartmentContact`,
      `SupportTicketDraft`, `ChatRole`, `ChatSuggestion`, `ChatMessage`,
      `AssistantResponse`, `ChatState`, `ChatAction`. Reuse existing `GIARegion`,
      `GIACountry`, `EcosystemEvent`, `EventCategory`.
    - _Verify: `npx tsc --noEmit`_  _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Synthetic media data
  - [x] 2.1 Implement `src/lib/synthetic-media-data.ts`
    - Determinism header. `generatePressMentions()` (12–18) + `generateAnnouncements()`
      (8–12), pure hash-seeded, byte-stable, EITBT source links.
    - _Verify: `npx tsc --noEmit`_  _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x]* 2.2 Property test → `src/lib/__tests__/synthetic-media-data.pbt.test.ts`
    - Count ranges, non-empty fields, determinism, ambient-free. `{ numRuns: 100 }`.
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Synthetic GIA per-country data
  - [x] 3.1 Implement `src/lib/synthetic-gia-data.ts`
    - `generateBilateralPrograms(code)` (3–5), `generateCountrySuccessStories(code)`
      (2–3), `generateCountryStartupEngagements(code)` (6), `generateRecentEngagements()`
      (12–15). Pure, hash-seeded by code, byte-stable, sectors from focus areas.
    - _Verify: `npx tsc --noEmit`_  _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x]* 3.2 Property test → `src/lib/__tests__/synthetic-gia-data.pbt.test.ts`
    - Count ranges per code, determinism, ambient-free. `{ numRuns: 100 }`.
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. GIA region summary + editorial
  - [x] 4.1 Implement `src/lib/gia-region-summary.ts` + `src/data/gia-region-editorial.ts`
    - `buildRegionSummaries(countries)` derives counts/focus from verified data;
      `REGION_OPPORTUNITY_COPY` per-region template + featured programs list.
    - _Verify: `npx tsc --noEmit`_  _Requirements: 7.2, 8.3_
  - [x]* 4.2 Property test → `src/lib/__tests__/gia-region-summary.pbt.test.ts`
    - Sum of counts === input length; every region present; counts ≥ 0. `{ numRuns: 100 }`.
    - _Requirements: 7.2_

- [x] 5. AI system-prompt builder + rule engine + chat reducer
  - [x] 5.1 Implement `src/lib/ai-assistant-system-prompt.ts`
    - Pure `buildSystemPrompt()` with canonical facts from `ecosystemStats`/
      `schemes`/`clusters`/`flagshipPrograms`, routing guidance, portal rec,
      length + next-step instruction.
    - _Verify: `npx tsc --noEmit`_  _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 5.2 Implement `src/lib/kite-assistant-rules.ts`
    - Pure `generateRuleResponse(message)` keyword table (Req 4.2) + default
      (Req 4.3) + `extractRouteSuggestions(text)`.
    - _Verify: `npx tsc --noEmit`_  _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 5.3 Implement `src/lib/chat-reducer.ts`
    - Pure `chatReducer` + `INITIAL_CHAT_STATE` + id/message helpers.
    - _Verify: `npx tsc --noEmit`_  _Requirements: 9.3_
  - [x]* 5.4 Property/example tests → `src/lib/__tests__/kite-assistant-rules.pbt.test.ts`,
    `ai-assistant-system-prompt.test.ts`, `chat-reducer.test.ts`
    - Rule engine determinism + family routing; prompt contains canonical facts;
      reducer transitions. 
    - _Requirements: 4, 5, 9.3_

- [x] 6. Shared helpers + support data
  - [x] 6.1 Implement `src/lib/events-format.ts` + `src/lib/blob-download.ts`
    - Pure date-block formatting + chronological sort; client Blob download.
    - _Verify: `npx tsc --noEmit`_  _Requirements: 6.1, 6.3_
  - [x] 6.2 Implement `src/data/support-faqs.ts` + `src/data/department-contacts.ts`
    - 20–30 curated FAQs across the 10 categories with related links; 5
      department contacts (some illustrative). Contacts from verified footer data.
    - _Verify: `npx tsc --noEmit`_  _Requirements: 10.1, 10.3_

- [x] 7. Phase A checkpoint — `npm run test:run` + `npx tsc --noEmit`.

### Phase B — Events & Media Hub (`/events`)

- [x] 8. Events sections + page
  - [x] 8.1 Server sections: `EventsHeroStrip`, `FeaturedEvent`,
    `GovAnnouncementsSection`, `SocialCommunity`, `EventsResources`.
    - _Requirements: 6.1, 6.2, 6.4_
  - [x] 8.2 Client islands: `UpcomingEventsGrid` (+ `EventDetailPanel`),
    `MediaPressSection`, `ReportsPublications` (Blob), `SubscribeSection`.
    - _Requirements: 6.1, 6.3, 6.4_
  - [x] 8.3 Compose `src/app/events/page.tsx` (replace stub).
    - _Verify: `npm run build`; `/events` renders all sections_  _Requirements: 6.1, 6.5_
  - [x]* 8.4 Component tests → `src/components/events/__tests__/EventsHub.test.tsx`.
    - _Requirements: 6_

- [x] 9. Phase B checkpoint.

### Phase C — GIA index + country detail

- [x] 10. GIA index
  - [x] 10.1 Server sections + `AllCountriesGrid` client island; compose
    `src/app/gia/page.tsx` (replace stub).
    - _Verify: `npm run build`; `/gia` renders all 32 tiles_  _Requirements: 7.1–7.5_
- [x] 11. GIA country detail
  - [x] 11.1 Country detail sections + `src/app/gia/[country]/page.tsx` with
    `generateStaticParams` × 32 and `notFound()` fallback.
    - _Verify: every code resolves; unknown → 404_  _Requirements: 8.1–8.5_
  - [x]* 11.2 Tests: all 32 codes resolve; unknown 404; synthetic determinism.
    - _Requirements: 8.1, 8.4_
- [x] 12. Phase C checkpoint.

### Phase D — AI Chat Assistant

- [x] 13. Wire the panel
  - [x] 13.1 Extend `AIAssistantButton.tsx` to a full chat (reducer, request
    helper with API-attempt + rule fallback, quick-starts, suggestion chips,
    loading/error, clear, accessibility, 20-exchange cap).
    - _Verify: `npx tsc --noEmit`; `npm run build`_  _Requirements: 9.1–9.9_
  - [x]* 13.2 Tests: mocked request, message/error handling, a11y, fallback.
    - _Requirements: 9_
- [x] 14. Phase D checkpoint.

### Phase E — Support Center + final polish

- [x] 15. Support Center
  - [x] 15.1 Sections + islands (`SupportFaqAccordion`, `SubmitTicket`); compose
    `src/app/support/page.tsx` + `src/app/support/faqs/page.tsx` (replace stubs).
    - _Verify: `npm run build`_  _Requirements: 10.1–10.4_
  - [x]* 15.2 Component tests.
    - _Requirements: 10_
- [x] 16. Final polish
  - [x] 16.1 Stub audit: upgrade/seal every remaining bare StubPage route.
    - _Requirements: 11.1_
  - [x] 16.2 Accessibility + responsive + visual audits across the build.
    - _Requirements: 11.2, 11.4_
  - [x] 16.3 Performance/bundle audit (`npm run build`, all routes ≤150KB).
    - _Requirements: 11.3_
  - [x] 16.4 README update + spec reconciliation.
    - _Requirements: 11.5_
  - [x] 16.5 Full suite run + GitHub push tagged `v1.0.0`.
    - _Requirements: 11.6_
- [x] 17. Phase E checkpoint — closing report.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 0, "tasks": ["1"], "description": "Additive types" },
    { "wave": 1, "tasks": ["2", "3", "4", "5", "6"], "description": "Foundation libs and data (depend on 1)" },
    { "wave": 2, "tasks": ["7"], "description": "Phase A checkpoint" },
    { "wave": 3, "tasks": ["8", "10", "13", "15"], "description": "Surfaces (events/gia-index/ai/support) depend on foundation" },
    { "wave": 4, "tasks": ["11"], "description": "GIA country detail depends on index + synthetic GIA" },
    { "wave": 5, "tasks": ["9", "12", "14"], "description": "Phase B/C/D checkpoints" },
    { "wave": 6, "tasks": ["16"], "description": "Final polish depends on all surfaces" },
    { "wave": 7, "tasks": ["17"], "description": "Closing report and GitHub push" }
  ]
}
```


## Notes

- Tests marked `*` are optional for a fast MVP and required for full conformance.
- The AI assistant attempts the Anthropic Artifacts API first and falls back to
  the deterministic rule engine; in the Next.js runtime the rule engine is the
  de-facto path (surfaced drift).
- All synthetic generators are pure and hash-seeded via `synthetic-prng`; never
  `Math.random`/`Date`/ambient input.
- Verified data is canonical; synthetic surfaces always carry `IllustrativeBadge`.
- Each new route must hold First Load JS ≤ 150KB and meet WCAG 2.1 AA.
