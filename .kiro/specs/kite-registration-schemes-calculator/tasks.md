# Implementation Plan: KITE Registration, Schemes & Benefits, Policy Calculator

## Overview

This plan implements the second KITE slice (Registration Wizard, Schemes & Benefits Hub, Policy Calculator, and home personalization) on top of the delivered foundation slice, in five dependency-ordered phases that the founder fixed: **Phase A: Foundation extensions & shared scaffolding** → **Phase B: Registration Wizard** → **Phase C: Schemes & Benefits Hub** → **Phase D: Policy Calculator** → **Phase E: Integration, home personalization & polish**.

Phase A is the foundation for B, C, and D: it adds the additive types to `src/types/index.ts`, the four pure `src/lib/*` modules, the session-only `RegistrationContext`, and the shared `ConfidenceDot`. The pure **eligibility engine** built in Phase A is a hard prerequisite for the Hub/Detail/Compare personalization (Phase C), the Calculator (Phase D), and the home banner (Phase E). Each task names the exact file(s) it touches (paths from the design's File Structure), the earlier task(s) it depends on, and a concrete `_Verify:_` step. Test sub-tasks are marked `*` (optional for a fast MVP, required for full conformance).

The 15 correctness properties from the design are folded in as one property-based test (PBT) each, placed in the phase where their code is built, tagged `// Feature: kite-registration-schemes-calculator, Property {n}` and run with `fc.assert(..., { numRuns: 100 })`. Example/integration/accessibility/smoke tests use the file paths named in the design's Test Architecture table.

This slice is **frontend-only / session-only**: no fetch, no XHR, no `localStorage`/`sessionStorage`/cookies/IndexedDB anywhere in its source. Displayed scheme/sector/contact content is sourced verbatim from the canonical foundation data modules `src/data/schemes.ts` (22 schemes), `src/data/sectors.ts` (20 sectors), and `src/data/footer.ts`. **No scheme names, amounts, eligibility, or contact values are fabricated** — benefit constants live in the documented `SCHEME_MAX_BENEFIT_RUPEES` map in the engine, not in free-text parsing.

> Cross-phase note: `ApplyButton`, `ConfidenceDot`, and the eligibility engine are shared across the Hub, Detail, Compare, and Calculator surfaces. They are built once in Phase A / early Phase C and reused, so there is no orphaned or duplicated code. The Vitest + fast-check harness, `src/data/*` modules, and shadcn `input`/`select`/`tabs`/`tooltip`/`accordion` primitives already exist from the foundation slice; this plan only adds the `checkbox`/`radio-group`/`slider` primitives the wizard needs.

## Tasks

### Phase A: Foundation extensions & shared scaffolding

- [x] 1.1 Add additive registration & eligibility types
  - Create/modify: `src/types/index.ts` — append (no existing export removed/altered): `Zone`, `FundingStage`, `CurrentStage`, `LocationKarnataka`, `EligibilityStatus` union types; `RegistrationProfile` interface (founder/company/team/sector/location/funding/status fields); `EligibilityResult` interface (`schemeId`, `status`, `reasons`, `estimatedBenefit`, `confidence` 0..1); `RegistrationContextValue`; wizard reducer types (`WizardStep`, `WizardFieldErrors`, `WizardState`, `WizardAction`); helper types `StepValidator`, `SchemeEvaluator`
  - _Depends on: none_
  - _Verify:_ `npx tsc --noEmit` reports zero errors; existing foundation type imports still resolve
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 1.2 Add the shadcn primitives the wizard needs
  - Modify: `package.json` (add `@radix-ui/react-checkbox`, `@radix-ui/react-radio-group`, `@radix-ui/react-slider`); create `src/components/ui/checkbox.tsx`, `src/components/ui/radio-group.tsx`, `src/components/ui/slider.tsx` via the shadcn pattern used by existing `ui/` primitives
  - _Depends on: none_
  - _Verify:_ `npm install` completes; `npx tsc --noEmit` passes with a probe import of `Checkbox`, `RadioGroup`, `Slider`
  - _Requirements: 5.3, 6.3, 9.3_

- [x] 1.3 Implement the pure eligibility engine
  - Create: `src/lib/eligibility-engine.ts` — `EQUITY_BENEFIT_PLACEHOLDER_RUPEES`, the documented `SCHEME_MAX_BENEFIT_RUPEES` map (rupee maxima per scheme id), `benefitForStatus`, `confidenceForStatus`, `STAGE_ORDER`, `FUNDING_ORDER`, `deriveZone(location)`, the per-scheme `SCHEME_EVALUATORS` map encoding Req 18 rules, `defaultEvaluator`, a shared `makeResult` normalizer guaranteeing well-formedness, `evaluateScheme`, `evaluateAllSchemes`, `totalEstimatedBenefit`, `weightedAverageConfidence`. Pure TS — no React, no async, no side effects, no deps. Source scheme content from `src/data/schemes.ts`; do not fabricate values
  - _Depends on: 1.1_
  - _Verify:_ `npx tsc --noEmit` passes; a probe call `evaluateScheme(profile, scheme)` returns a well-formed `EligibilityResult`
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9, 18.10, 18.11, 18.12, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 1.7_

- [x] 1.4 Implement the pure step validators
  - Create: `src/lib/registration-validators.ts` — `validateStep1`..`validateStep5` (`StepValidator`), each returning a `WizardFieldErrors` record (invalid field → message) or `{}` when valid; encode exactly the Req 4–8 rules (name ≥2 trimmed, email pattern, phone =10 digits after stripping `+91`/separators, age 18..80, company name ≥2, explicit DPIIT/GST, incorporation present & not future, stage enum, team size 1..5000, stakes 0..100, sectors valid/≤3/exclude primary, location/funding enums, funding raised ≥0). Pure — no mutation, I/O, storage, or network
  - _Depends on: 1.1_
  - _Verify:_ `npx tsc --noEmit` passes; probe `validateStep1({})` returns a non-empty record and a fully-valid input returns `{}`
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 1.5 Implement the pure KITE ID generator
  - Create: `src/lib/kite-id-generator.ts` — `KITE_ID_ALPHABET` (`A–Z`,`2–9`, excluding `O`,`0`,`I`,`1`), `KITE_ID_PATTERN`, `Rng` type, `generateKiteId(rng = Math.random, year = new Date().getFullYear())` → `KITE-YYYY-XXXXXX`. Deterministic given an injected `rng`/`year`
  - _Depends on: 1.1_
  - _Verify:_ `npx tsc --noEmit` passes; `KITE_ID_PATTERN.test(generateKiteId())` is true
  - _Requirements: 29.1, 29.3_

- [x] 1.6 Implement the pure apply-URL resolver
  - Create: `src/lib/scheme-apply-urls.ts` — `DEFAULT_APPLY_URL = 'https://eitbt.karnataka.gov.in/startup'`, the `APPLY_URL_MAP` (kitven-fund-5→kitven.in, kan→karnatakadigital.in/acceleration-network, elevate & elevate-unnati→eitbt.karnataka.gov.in/elevate), and total function `resolveApplyUrl(schemeId)` returning a valid absolute `https` URL for any id
  - _Depends on: 1.1_
  - _Verify:_ `npx tsc --noEmit` passes; `resolveApplyUrl('unknown')` returns the default https URL and mapped ids return their portal URLs
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

- [x] 1.7 Implement the RegistrationContext provider
  - Create: `src/context/RegistrationContext.tsx` (`"use client"`) — `RegistrationProvider` holding in-memory React state `{ registrationProfile: null, isRegistered: false }`; exposes `useRegistration()` returning `registrationProfile`, `isRegistered`, derived `zone` (via `deriveZone`), `qualifyingCount` (via `evaluateAllSchemes`), `updateProfile` (merge partial, preserve untouched fields), `completeRegistration` (set `isRegistered`, generate `kiteId`, set ISO `registeredAt`), `resetRegistration` (back to null/false), and `evaluate(scheme)`. The hook throws when used outside the provider. No storage/network of any kind
  - _Depends on: 1.1, 1.3, 1.5_
  - _Verify:_ `npx tsc --noEmit` passes; no `localStorage`/`sessionStorage`/`cookie`/`indexedDB`/`fetch` reference present in the file
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 12.4_

- [x] 1.8 Wire RegistrationProvider into the root layout
  - Modify: `src/app/layout.tsx` — mount `RegistrationProvider` at the same level as `LanguageProvider`, **above `SiteChrome`**, wrapping `SiteChrome`/`main`/`Footer`/`AIAssistantButton`/`Toaster`. Additive only — no change to existing chrome identity
  - _Depends on: 1.7_
  - _Verify:_ `npm run build` succeeds; every page can read context (header/footer/pages); exactly one provider wraps the tree
  - _Requirements: 1.1_

- [x] 1.9 Implement the shared ConfidenceDot primitive
  - Create: `src/components/shared/ConfidenceDot.tsx` — `props { status: EligibilityStatus; showLabel?: boolean }`; 10px circular dot colored `success`/`warning`/`muted`/`danger` for definitely/likely/check-requirements/not-eligible; non-empty `aria-label` naming the status; optional inline label. Meaning never color-only
  - _Depends on: 1.1_
  - _Verify:_ `npx tsc --noEmit` passes; rendering each status yields a dot with a non-empty accessible name
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 27.8_

- [x]* 1.10 Table-driven unit tests for the eligibility engine
  - Create: `src/lib/__tests__/eligibility-engine.test.ts` — per-scheme `definitely-eligible` boundary cases for the Req 18 rules (SGST, patent, ELEVATE, ELEVATE Unnati, women-led, RGEP, new incubation centers, beyond-Bengaluru cluster fund, KITVEN, internship support, NAIN 2.0) + status→benefit/confidence examples
  - _Depends on: 1.3_
  - _Verify:_ `npm run test:run -- src/lib/__tests__/eligibility-engine.test.ts` passes
  - _Requirements: 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9, 18.10, 18.11, 18.12, 19.2, 19.4_

- [x]* 1.11 PBT — eligibility engine well-formedness, status numbers, totals, zone, count
  - Create: `src/lib/__tests__/eligibility-engine.pbt.test.ts`
  - **Property 3: Eligibility result is well-formed** — `// Feature: kite-registration-schemes-calculator, Property 3`, `numRuns: 100`; for any profile + scheme, `status` ∈ 4 values, `schemeId === scheme.id`, `estimatedBenefit ≥ 0`, `confidence ∈ [0,1]`, `reasons` non-empty when status ≠ `definitely-eligible`
  - **Property 4: Status determines benefit and confidence** — `// Feature: kite-registration-schemes-calculator, Property 4`, `numRuns: 100`; benefit = max / half / 0 and confidence = 1 / 0.7 / 0.3 / 0 per status
  - **Property 5: Total benefit equals the sum over qualifying schemes** — `// Feature: kite-registration-schemes-calculator, Property 5`, `numRuns: 100`; `totalEstimatedBenefit` sums only definitely/likely results
  - **Property 6: Zone derivation is total and correct** — `// Feature: kite-registration-schemes-calculator, Property 6`, `numRuns: 100`; `deriveZone` maps every `LocationKarnataka` to the documented Zone and always returns one of three Zones
  - **Property 11: Qualifying count matches eligible schemes** — `// Feature: kite-registration-schemes-calculator, Property 11`, `numRuns: 100`; count of definitely/likely under `evaluateAllSchemes`
  - _Depends on: 1.3_
  - _Verify:_ `npm run test:run -- src/lib/__tests__/eligibility-engine.pbt.test.ts` passes
  - _Requirements: 19.1, 19.5, 19.6, 30.2, 30.3, 30.4, 30.5, 30.6 (P3); 19.2, 19.4 (P4); 19.7 (P5); 1.7 (P6); 12.4, 24.2 (P11)_

- [x]* 1.12 PBT — KITE ID format
  - Create: `src/lib/__tests__/kite-id-generator.pbt.test.ts`
  - **Property 1: KITE ID format** — `// Feature: kite-registration-schemes-calculator, Property 1`, `numRuns: 100`; for any rng stream and four-digit year, `generateKiteId` matches `KITE-YYYY-XXXXXX` with the supplied year and a 6-char suffix from the unambiguous alphabet (no `O`/`0`/`I`/`1`)
  - _Depends on: 1.5_
  - _Verify:_ `npm run test:run -- src/lib/__tests__/kite-id-generator.pbt.test.ts` passes
  - _Requirements: 29.1, 29.2, 29.3 — Property 1_

- [x]* 1.13 PBT — apply URL validity
  - Create: `src/lib/__tests__/scheme-apply-urls.pbt.test.ts`
  - **Property 2: Apply URL is always a valid external destination** — `// Feature: kite-registration-schemes-calculator, Property 2`, `numRuns: 100`; for any scheme id (all `schemes.ts` ids + arbitrary strings) `resolveApplyUrl` returns a non-empty absolute `https` URL; documented mapping for KITVEN/KAN/ELEVATE, default otherwise; plus specific-mapping example assertions
  - _Depends on: 1.6_
  - _Verify:_ `npm run test:run -- src/lib/__tests__/scheme-apply-urls.pbt.test.ts` passes
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5 — Property 2_

- [x]* 1.14 Per-step unit tests for the validators
  - Create: `src/lib/__tests__/registration-validators.test.ts` — assert the exact error messages/keys for each Req 4–8 rule violation and empty record for valid inputs
  - _Depends on: 1.4_
  - _Verify:_ `npm run test:run -- src/lib/__tests__/registration-validators.test.ts` passes
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 5.2, 5.4, 5.5, 6.2, 8.3, 8.5, 8.7_

- [x]* 1.15 PBT — validator purity and out-of-range flagging
  - Create: `src/lib/__tests__/registration-validators.pbt.test.ts`
  - **Property 8: Step validators accept valid input and are pure** — `// Feature: kite-registration-schemes-calculator, Property 8`, `numRuns: 100`; valid field sets → empty record, identical output on repeat, argument not mutated
  - **Property 9: Step validators flag out-of-range fields** — `// Feature: kite-registration-schemes-calculator, Property 9`, `numRuns: 100`; a single rule-violating field always appears in the returned error record
  - _Depends on: 1.4_
  - _Verify:_ `npm run test:run -- src/lib/__tests__/registration-validators.pbt.test.ts` passes
  - _Requirements: 11.2, 11.3, 11.4 (P8); 4.2, 4.3, 4.4, 4.5, 5.2, 5.4, 5.5, 6.2, 8.3, 8.5, 8.7, 11.5 (P9)_

- [x]* 1.16 Context unit tests
  - Create: `src/context/__tests__/registration-context.test.tsx` — initial null/false state, refresh reset (remount), `updateProfile` merge, `completeRegistration` sets `kiteId`/`registeredAt`/`isRegistered`, `resetRegistration`, and the outside-provider usage error
  - _Depends on: 1.7_
  - _Verify:_ `npm run test:run -- src/context/__tests__/registration-context.test.tsx` passes
  - _Requirements: 1.2, 1.5, 1.6, 1.9, 1.10_

- [x]* 1.17 PBT — updateProfile merges and preserves
  - Create: `src/context/__tests__/registration-context.pbt.test.ts`
  - **Property 7: updateProfile merges and preserves** — `// Feature: kite-registration-schemes-calculator, Property 7`, `numRuns: 100`; for any current state and any partial, the result equals the current state with exactly the partial's keys overwritten and all other keys unchanged
  - _Depends on: 1.7_
  - _Verify:_ `npm run test:run -- src/context/__tests__/registration-context.pbt.test.ts` passes
  - _Requirements: 1.4 — Property 7_

- [x]* 1.18 ConfidenceDot unit tests
  - Create: `src/components/shared/__tests__/confidence-dot.test.tsx` — 10px size, color-per-status, non-empty `aria-label`, never color-only, `showLabel` renders inline text
  - _Depends on: 1.9_
  - _Verify:_ `npm run test:run -- src/components/shared/__tests__/confidence-dot.test.tsx` passes
  - _Requirements: 22.1, 22.2, 22.3, 22.4_

- [x] 1.19 Checkpoint — Phase A foundation
  - Ensure all tests pass, ask the user if questions arise.

### Phase B: Registration Wizard

- [x] 2.1 Implement the wizard controller and pure reducer
  - Create: `src/components/registration/RegistrationWizard.tsx` (`"use client"`) — single `useReducer` (exported pure `wizardReducer` + `initialWizardState`), `max-w-3xl` centered container, step routing 1→6, Back/Continue controls (ghost/accent), Continue label "Continue"/"Submit Registration", `aria-disabled` gating via the Phase A validators, focus move to each step's first input, success transition calling `completeRegistration()`. Reducer handles `SET_FIELD` (incl. Step 4 primary→secondary drop + 4th-secondary ignore), `BLUR_FIELD`, `VALIDATE_STEP`, `NEXT`/`BACK`/`GO_TO_STEP`, `TOGGLE_ACCURACY`, `SUBMIT`
  - _Depends on: 1.1, 1.4, 1.7_
  - _Verify:_ `npx tsc --noEmit` passes; the exported `wizardReducer` is importable as a pure function
  - _Requirements: 3.1, 3.4, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 9.5, 27.1, 27.2_

- [x] 2.2 Implement the progress header
  - Create: `src/components/registration/RegistrationProgress.tsx` (`"use client"`) — "Step N of 6" + step title, six-segment bar (accent for active/completed, muted for future), `role="progressbar"` with `aria-valuenow`/`aria-valuemin={1}`/`aria-valuemax={6}`
  - _Depends on: 1.1_
  - _Verify:_ `npx tsc --noEmit` passes; rendered progressbar exposes the correct aria values for a given step
  - _Requirements: 3.2, 3.3, 27.1_

- [x] 2.3 Implement Step 1 — Founder details
  - Create: `src/components/registration/RegistrationStep01Founder.tsx` (`"use client"`) — name/email/phone/age inputs; `onChange→SET_FIELD`, `onBlur→BLUR_FIELD`; errors shown only after blur inside an adjacent `aria-live="polite"` region with `aria-describedby` linkage
  - _Depends on: 2.1, 1.4_
  - _Verify:_ `npx tsc --noEmit` passes; invalid fields surface errors after blur
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 27.3_

- [x] 2.4 Implement Step 2 — Company basics
  - Create: `src/components/registration/RegistrationStep02Company.tsx` (`"use client"`) — company name input, DPIIT & GST Yes/No `RadioGroup`s requiring explicit selection, incorporation date input (present & not-future), current-stage `Select` (5 values)
  - _Depends on: 2.1, 1.4, 1.2_
  - _Verify:_ `npx tsc --noEmit` passes; absent radio selection and future date are flagged
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 2.5 Implement Step 3 — Team composition
  - Create: `src/components/registration/RegistrationStep03Team.tsx` (`"use client"`) — team size input; `womenFounderStake`/`womenEmployeePercentage` `Slider`s (0–100); SC/ST founder toggle; women-led unlock note when either stake ≥51; ELEVATE Unnati note when SC/ST selected
  - _Depends on: 2.1, 1.4, 1.2_
  - _Verify:_ `npx tsc --noEmit` passes; unlock notes appear at the documented thresholds
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 2.6 Implement Step 4 — Sector selection
  - Create: `src/components/registration/RegistrationStep04Sectors.tsx` (`"use client"`) — single-select primary sector from the 20 `src/data/sectors.ts` (source order); multi-select secondary excluding primary, capped at 3 (4th prevented); changing primary to a secondary id removes it from secondary
  - _Depends on: 2.1, 1.4_
  - _Verify:_ `npx tsc --noEmit` passes; a 4th secondary selection is rejected and primary change prunes the secondary set
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 2.7 Implement Step 5 — Location and funding
  - Create: `src/components/registration/RegistrationStep05Location.tsx` (`"use client"`) — location `Select` (9 values), funding-stage `Select` (5 values), funding-raised number in lakhs defaulting to 0 (≥0)
  - _Depends on: 2.1, 1.4_
  - _Verify:_ `npx tsc --noEmit` passes; out-of-enum and negative funding are flagged
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 2.8 Implement Step 6 — Review and submit
  - Create: `src/components/registration/RegistrationStep06Review.tsx` (`"use client"`) — one review card per section with an Edit control (`GO_TO_STEP`), required accuracy checkbox gating the "Submit Registration" control
  - _Depends on: 2.1_
  - _Verify:_ `npx tsc --noEmit` passes; submit stays disabled until the accuracy checkbox is selected
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 2.9 Implement the registration success state
  - Create: `src/components/registration/RegistrationSuccess.tsx` (`"use client"`) — centered success-token check icon + "Registration Complete"; KITE ID callout with a Copy control (clipboard + confirmation toast); exactly three CTA cards ("See Schemes You Qualify For"→`/schemes`, "Calculate Your Benefits"→`/calculator`, "Explore the Ecosystem"→`/`); session-only disclaimer line
  - _Depends on: 1.7_
  - _Verify:_ `npx tsc --noEmit` passes; copy writes the KITE ID and shows confirmation; three CTAs route correctly
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 2.10 Wire the /register route
  - Modify: `src/app/register/page.tsx` — replace the foundation stub with `RegistrationWizard`
  - _Depends on: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_
  - _Verify:_ `npm run build` succeeds; `/register` renders the full six-step wizard
  - _Requirements: 3.1, 3.2_

- [x]* 2.11 Reducer unit tests + secondary-sector cap PBT
  - Create: `src/components/registration/__tests__/wizard-reducer.test.ts` — pure-reducer transition unit tests (`SET_FIELD` merge into draft, `NEXT` gated by errors, `BACK` retains values, `GO_TO_STEP`, `TOGGLE_ACCURACY`, `SUBMIT`)
  - **Property 13: Secondary sectors are capped and exclude the primary** — `// Feature: kite-registration-schemes-calculator, Property 13`, `numRuns: 100`; for any sequence of primary/secondary selections, `secondarySectors` holds ≤3 ids, never the current primary, and changing primary to a present id removes it
  - _Depends on: 2.1_
  - _Verify:_ `npm run test:run -- src/components/registration/__tests__/wizard-reducer.test.ts` passes
  - _Requirements: 3.8, 3.9 (reducer units); 7.4, 7.5, 7.6 — Property 13_

- [x]* 2.12 Per-step component tests
  - Create: `src/components/registration/__tests__/steps.test.tsx` — per-step render, error-after-blur, focus to first input on activation, women-led/ELEVATE-Unnati unlock notes, progressbar attributes, review-card Edit
  - _Depends on: 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  - _Verify:_ `npm run test:run -- src/components/registration/__tests__/steps.test.tsx` passes
  - _Requirements: 3.11, 4.2, 5.3, 6.4, 6.5, 7.5, 9.2, 27.1, 27.3_

- [x]* 2.13 Full-wizard integration test
  - Create: `src/components/registration/__tests__/wizard.integration.test.tsx` — full six-step walkthrough → success state, KITE ID callout, copy action, three CTA cards
  - _Depends on: 2.10_
  - _Verify:_ `npm run test:run -- src/components/registration/__tests__/wizard.integration.test.tsx` passes
  - _Requirements: 9.5, 10.1, 10.2, 10.3, 10.4_

- [x] 2.14 Checkpoint — Phase B wizard
  - Ensure all tests pass, ask the user if questions arise.

### Phase C: Schemes & Benefits Hub

- [x] 3.1 Implement the ApplyButton client island
  - Create: `src/components/schemes/ApplyButton.tsx` (`"use client"`) — receives `schemeId`; opens `resolveApplyUrl(schemeId)` in a new tab with `target="_blank" rel="noopener noreferrer"`; renders the inline official-portal disclaimer. Reused by card, detail sidebar, and compare columns
  - _Depends on: 1.6_
  - _Verify:_ `npx tsc --noEmit` passes; the rendered anchor carries `rel="noopener noreferrer"` and the resolved URL
  - _Requirements: 23.1, 23.6_

- [x] 3.2 Implement SchemeFilters
  - Create: `src/components/schemes/SchemeFilters.tsx` (`"use client"`) — three type tabs (All / Fiscal Incentives / Grant-in-Aid), secondary-sector multiselect, stage multiselect, status filter (All / Open / Upcoming), and search input; defaults All type + All status
  - _Depends on: 1.1_
  - _Verify:_ `npx tsc --noEmit` passes; controls render with the documented defaults
  - _Requirements: 13.1, 13.2_

- [x] 3.3 Implement SchemeCard
  - Create: `src/components/schemes/SchemeCard.tsx` (`"use client"`, `React.memo`) — name, type badge, status badge, benefit line (`amount`+`maxBenefit`), duration caption (all from `schemes.ts`); eligibility truncated to two lines with expand; documents expander; "View Details"→`/schemes/[id]`; embedded `ApplyButton`; Compare checkbox bound to selection; corner `ConfidenceDot` with reasons tooltip only when registered
  - _Depends on: 1.9, 3.1_
  - _Verify:_ `npx tsc --noEmit` passes; dot renders only in Registered_State
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [x] 3.4 Implement CompareBar
  - Create: `src/components/schemes/CompareBar.tsx` (`"use client"`) — fixed bottom bar while 1–3 selected, showing count + Compare + Clear; hidden when empty; a polite live region announces the selected count; fully keyboard operable
  - _Depends on: 1.1_
  - _Verify:_ `npx tsc --noEmit` passes; bar hides at 0 selections and is keyboard reachable
  - _Requirements: 14.2, 14.4, 14.6, 14.7, 27.4_

- [x] 3.5 Implement PersonalizationBanner
  - Create: `src/components/schemes/PersonalizationBanner.tsx` (`"use client"`) — registered: accent-bordered "Personalized for {kiteId}", "You qualify for X of 22 schemes", Reset control (`resetRegistration`), three quick-filter chips ("Show Only Eligible", "Show All", "Compare Selected"); unregistered: muted banner with "Register Now"→`/register`
  - _Depends on: 1.7_
  - _Verify:_ `npx tsc --noEmit` passes; banner switches between registered/unregistered presentations
  - _Requirements: 12.2, 12.3, 12.5, 12.6_

- [x] 3.6 Implement SchemesHub orchestration
  - Create: `src/components/schemes/SchemesHub.tsx` (`"use client"`) — compact dark hero `py-12`; owns filter state + `compareSelection` (max 3, 4th rejected with toast); exports a pure `filterSchemeList(schemes, filters)` composing all active filters with AND semantics; case-insensitive name search; reads context and computes `evaluateAllSchemes(profile)` once via `useMemo`, passing each card its precomputed `EligibilityResult`; zero-match "no schemes match" message with filters still visible; serializes `compareSelection` to `/schemes/compare?ids=` on Compare
  - _Depends on: 1.3, 1.7, 3.2, 3.3, 3.4, 3.5_
  - _Verify:_ `npx tsc --noEmit` passes; filters compose, compare cap holds at 3, empty result shows the message
  - _Requirements: 12.1, 12.4, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 14.1, 14.3, 14.5_

- [x] 3.7 Wire the /schemes route
  - Modify: `src/app/schemes/page.tsx` — replace the foundation stub with `SchemesHub`
  - _Depends on: 3.6_
  - _Verify:_ `npm run build` succeeds; `/schemes` renders the full hub with all 22 schemes
  - _Requirements: 12.1_

- [x] 3.8 Implement the scheme detail content (server)
  - Create: `src/components/schemes/SchemeDetailContent.tsx` (server) — breadcrumb, name heading, type/status badges, editorial intro, "Benefit at a Glance" trio (amount/maxBenefit/duration), eligibility bullets, numbered documents, a 4–5 step process timeline differing by `type` (illustrative founder-judgment guidance), 5–7 entry FAQ accordion. Canonical content from `schemes.ts`
  - _Depends on: 1.1_
  - _Verify:_ `npx tsc --noEmit` passes; sections render from a sample scheme
  - _Requirements: 16.2, 16.3, 16.4, 16.5, 16.6_

- [x] 3.9 Implement the scheme detail sidebar (server)
  - Create: `src/components/schemes/SchemeDetailSidebar.tsx` (server) — Apply control (`ApplyButton`), Key Facts (id, type, status, owner "Karnataka EITBT Department", note when present), exactly three same-`type` Related Schemes cards, "Talk to KITS" card with `tel:`/`mailto:` from `src/data/footer.ts`, Last Updated line
  - _Depends on: 3.1_
  - _Verify:_ `npx tsc --noEmit` passes; sidebar shows three related cards and the contact links from `footer.ts`
  - _Requirements: 16.7_

- [x] 3.10 Implement the PersonalizedEligibilityCard island
  - Create: `src/components/schemes/PersonalizedEligibilityCard.tsx` (`"use client"` island) — receives the resolved `scheme` as a prop; reads context; unregistered → small "register to see your eligibility" banner; registered → `evaluateScheme(profile, scheme)` and a status-bordered card with "Your Eligibility" title, reasons paragraph, and rupee estimated-benefit line
  - _Depends on: 1.3, 1.7, 1.9_
  - _Verify:_ `npx tsc --noEmit` passes; both registered/unregistered states render
  - _Requirements: 16.8, 16.9_

- [x] 3.11 Wire the /schemes/[id] route
  - Modify: `src/app/schemes/[id]/page.tsx` — replace the stub with a SERVER detail page composing `SchemeDetailContent` + `SchemeDetailSidebar` + the `PersonalizedEligibilityCard`/`ApplyButton` islands; two-column desktop / single-column + sticky bottom action bar mobile; resolve `[id]` in order direct match → `SCHEME_ID_ALIASES` (documented `kitven`→`kitven-fund-5`, `gck`→`grand-challenge-karnataka`) → `notFound()`
  - _Depends on: 3.8, 3.9, 3.10_
  - _Verify:_ `npm run build` succeeds; a real id and an alias resolve; an unknown id 404s with Header/Footer intact
  - _Requirements: 16.1, 16.10_

- [x] 3.12 Implement CompareRow
  - Create: `src/components/schemes/CompareRow.tsx` (`"use client"`) — renders one comparison row (Type/Status/Amount/Max Benefit/Duration/Eligibility bulleted/Documents numbered, and "Your Eligibility" with per-column `ConfidenceDot` + reasons when registered)
  - _Depends on: 1.1, 1.9_
  - _Verify:_ `npx tsc --noEmit` passes; a row renders per-column cells
  - _Requirements: 17.5, 17.6_

- [x] 3.13 Implement CompareView
  - Create: `src/components/schemes/CompareView.tsx` (`"use client"`) — reads ids from `useSearchParams`; exports pure `serializeCompareIds`/`parseCompareIds` helpers; renders a semantic `<table>` with `<th scope="col">` per scheme (name + Remove) and `<th scope="row">` per attribute via `CompareRow`; Remove updates the URL params; registered → extra "Your Eligibility" row; per-column `ApplyButton`; "Back to Schemes"→`/schemes`; fewer than two valid ids → select-schemes prompt with a link back
  - _Depends on: 1.3, 1.7, 3.1, 3.12_
  - _Verify:_ `npx tsc --noEmit` passes; remove-column rewrites the URL and <2 ids shows the prompt
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.7, 17.8, 27.5_

- [x] 3.14 Wire the new /schemes/compare route
  - Create: `src/app/schemes/compare/page.tsx` — new route rendering `CompareView` inside a `<Suspense>` boundary (required for `useSearchParams`)
  - _Depends on: 3.13_
  - _Verify:_ `npm run build` succeeds; `/schemes/compare?ids=elevate,kitven-fund-5` renders the table
  - _Requirements: 17.1_

- [x]* 3.15 Hub tests — filtering, compare cap, banner, no-match
  - Create: `src/components/schemes/__tests__/hub.test.tsx`
  - **Property 10: Scheme filtering composes predicates** — `// Feature: kite-registration-schemes-calculator, Property 10`, `numRuns: 100`; for any scheme set + filter combination, visible = exactly those satisfying all active filters
  - **Property 12: Compare selection never exceeds three** — `// Feature: kite-registration-schemes-calculator, Property 12`, `numRuns: 100`; for any add sequence, size never exceeds 3 and a 4th add leaves it at 3
  - Plus example assertions: registered/unregistered banner states and the no-match message
  - _Depends on: 3.6_
  - _Verify:_ `npm run test:run -- src/components/schemes/__tests__/hub.test.tsx` passes
  - _Requirements: 13.3, 13.4, 13.5, 13.6, 13.7 (P10); 14.1, 14.3 (P12); 12.2, 12.5, 13.9 (examples)_

- [x]* 3.16 Scheme card tests
  - Create: `src/components/schemes/__tests__/scheme-card.test.tsx` — card facts, eligibility/documents expanders, compare checkbox, dot present iff registered
  - _Depends on: 3.3_
  - _Verify:_ `npm run test:run -- src/components/schemes/__tests__/scheme-card.test.tsx` passes
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [x]* 3.17 Scheme detail tests
  - Create: `src/components/schemes/__tests__/scheme-detail.test.tsx` — server detail render, three related-scheme cards, `notFound()` on unknown id, alias resolution, eligibility-island registered/unregistered states
  - _Depends on: 3.11_
  - _Verify:_ `npm run test:run -- src/components/schemes/__tests__/scheme-detail.test.tsx` passes
  - _Requirements: 16.1, 16.7, 16.8, 16.9, 16.10_

- [x]* 3.18 Compare tests — URL round-trip, semantic table, remove, prompt
  - Create: `src/components/schemes/__tests__/compare.test.tsx`
  - **Property 14: Compare URL round-trips the selection** — `// Feature: kite-registration-schemes-calculator, Property 14`, `numRuns: 100`; for any 1–3 valid ids, serialize→parse yields the same set; removing one yields params with exactly the remaining ids
  - Plus example assertions: semantic `<th scope>` header association, remove-column behavior, and the <2-ids prompt
  - _Depends on: 3.13, 3.14_
  - _Verify:_ `npm run test:run -- src/components/schemes/__tests__/compare.test.tsx` passes
  - _Requirements: 14.5, 17.1, 17.4 (P14); 17.2, 17.8, 27.5 (examples)_

- [x] 3.19 Checkpoint — Phase C schemes hub
  - Ensure all tests pass, ask the user if questions arise.

### Phase D: Policy Calculator

- [x] 4.1 Implement QuickProfileForm
  - Create: `src/components/calculator/QuickProfileForm.tsx` (`"use client"`) — captures only the engine fields (DPIIT, GST, current stage, founder age, women stakes, SC/ST, location, funding stage); on save calls `updateProfile`, entering Profile_Set_State with `isRegistered` left false
  - _Depends on: 1.7, 1.1_
  - _Verify:_ `npx tsc --noEmit` passes; saving writes a partial profile without setting `isRegistered`
  - _Requirements: 20.3, 20.4_

- [x] 4.2 Implement CalculatorBreakdownRow
  - Create: `src/components/calculator/CalculatorBreakdownRow.tsx` (`"use client"`) — one scheme row with name + `ConfidenceDot` + estimated benefit + a reasons expander
  - _Depends on: 1.9, 1.1_
  - _Verify:_ `npx tsc --noEmit` passes; a row renders the dot, benefit, and expandable reasons
  - _Requirements: 21.5_

- [x] 4.3 Implement CalculatorResults
  - Create: `src/components/calculator/CalculatorResults.tsx` (`"use client"`) — profile summary row with Edit; total benefits as a large bold Plus Jakarta Sans number in crore/lakh units with "Across X schemes you qualify for"; exports a pure `confidenceLabel(value)` (High >0.8 / Medium >0.5..0.8 / Low ≤0.5) feeding a thin confidence meter from `weightedAverageConfidence`; status-grouped breakdown (Definitely/Likely expanded, Check Requirements/Not Eligible collapsed) of `CalculatorBreakdownRow`s; "Update Profile" and "Apply to Eligible Schemes"→`/schemes` controls; total + confidence label inside an `aria-live="polite"` region; no PDF, no multi-year projections; `useMemo(() => evaluateAllSchemes(profile), [profile])`
  - _Depends on: 1.3, 1.7, 4.2_
  - _Verify:_ `npx tsc --noEmit` passes; totals/label update inside the live region
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.6, 21.7, 27.6_

- [x] 4.4 Implement CalculatorEntry
  - Create: `src/components/calculator/CalculatorEntry.tsx` (`"use client"`) — centered entry card with "Use My Registration"→`/register` and "Use Quick Profile" revealing `QuickProfileForm`
  - _Depends on: 1.7_
  - _Verify:_ `npx tsc --noEmit` passes; the quick-profile form reveals inline
  - _Requirements: 20.2_

- [x] 4.5 Wire the /calculator route
  - Modify: `src/app/calculator/page.tsx` — replace the stub with a compact-hero page that renders `CalculatorEntry` while no profile exists and `CalculatorResults` while in Profile_Set_State or Registered_State
  - _Depends on: 4.3, 4.4, 4.1_
  - _Verify:_ `npm run build` succeeds; entry shows with no profile, results show after a quick profile is saved
  - _Requirements: 20.1, 20.5_

- [x]* 4.6 Calculator tests — entry/results, confidence label, aria-live, integration
  - Create: `src/components/calculator/__tests__/calculator.test.tsx`
  - **Property 15: Confidence label thresholds** — `// Feature: kite-registration-schemes-calculator, Property 15`, `numRuns: 100`; for any value in [0,1], `confidenceLabel` is High >0.8, Medium >0.5..0.8, Low ≤0.5
  - Plus example assertions: entry vs results states, `aria-live` total region, and quick-profile→results integration
  - _Depends on: 4.5_
  - _Verify:_ `npm run test:run -- src/components/calculator/__tests__/calculator.test.tsx` passes
  - _Requirements: 21.3 (P15); 20.2, 20.4, 20.5, 21.2, 27.6 (examples)_

- [x] 4.7 Checkpoint — Phase D calculator
  - Ensure all tests pass, ask the user if questions arise.

### Phase E: Integration, home personalization & polish

- [x] 5.1 Add the home personalization banner
  - Create: `src/components/home/SchemesPersonalizationBanner.tsx` (`"use client"` island) and modify `src/app/page.tsx` — render the banner above the existing schemes preview section while registered, showing "You qualify for X of 22 schemes" (X from `qualifyingCount`) with a control targeting `/schemes`; unregistered rendering is unchanged from the foundation slice. Additive only
  - _Depends on: 1.3, 1.7_
  - _Verify:_ `npm run build` succeeds; banner appears only in Registered_State and the rest of the home page is unchanged
  - _Requirements: 24.1, 24.2, 24.4, 24.5_

- [x] 5.2 Add the Quick Actions completed-state card-in-place
  - Modify: `src/components/home/QuickActionsSection.tsx` — when registered, render the "Register Your Startup" action in a completed state with a checkmark badge, keeping the card in place so the eight-action grid cardinality is preserved, and surface a secondary "See Your Schemes"→`/schemes` affordance within that same card. Do NOT change the 8-action grid count
  - _Depends on: 1.7_
  - _Verify:_ `npm run build` succeeds; the grid still has exactly 8 cards; the Register card shows the completed state only when registered
  - _Requirements: 24.3, 24.4, 24.5_

- [x]* 5.3 End-to-end integration test
  - Create: `src/app/__tests__/registration-flow.e2e.test.tsx` — register → schemes personalization (banner + qualifying count + dots) → calculator totals
  - _Depends on: 5.1, 5.2, 2.10, 3.7, 4.5_
  - _Verify:_ `npm run test:run -- src/app/__tests__/registration-flow.e2e.test.tsx` passes
  - _Requirements: 12.4, 21.2, 24.1, 24.2, 24.3_

- [x]* 5.4 Accessibility audit across the slice's routes
  - Create: `src/app/__tests__/slice-a11y.test.tsx` — `axe-core` audit of `/register`, `/schemes`, `/schemes/[id]`, `/schemes/compare`, `/calculator`; assert `role="progressbar"` values, the `aria-live` error/total regions, `aria-disabled` Continue, and the semantic compare-table header associations
  - _Depends on: 2.10, 3.7, 3.11, 3.14, 4.5_
  - _Verify:_ `npm run test:run -- src/app/__tests__/slice-a11y.test.tsx` passes
  - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8_

- [x]* 5.5 Responsive checks
  - Create: `src/app/__tests__/slice-responsive.test.tsx` — Viewport_Mobile vs Viewport_Desktop assertions for the wizard, hub grid, detail two-column/sticky bottom bar, and calculator
  - _Depends on: 2.10, 3.7, 3.11, 4.5_
  - _Verify:_ `npm run test:run -- src/app/__tests__/slice-responsive.test.tsx` passes
  - _Requirements: 16.1, 26.3, 26.4_

- [x] 5.6 Final smoke checks
  - Create: `src/app/__tests__/slice-no-storage.smoke.test.ts` — static source scan asserting no `fetch`/`XMLHttpRequest`/`localStorage`/`sessionStorage`/`cookie`/`indexedDB` usage anywhere in this slice's source (`src/context`, `src/lib`, `src/components/{registration,schemes,calculator}`, the new pages); then run the build/bundle and type gates
  - _Depends on: 5.1, 5.2, 5.3, 5.4, 5.5, 2.13, 3.15, 3.16, 3.17, 3.18, 4.6_
  - _Verify:_ `npm run type-check` zero errors; `npm run lint` clean; `npm run build` succeeds and reports First Load JS ≤150KB for `/register`, `/schemes`, `/schemes/[id]`, `/calculator`, and (independently) `/schemes/compare`; `npm run test:run -- src/app/__tests__/slice-no-storage.smoke.test.ts` passes
  - _Requirements: 2.8, 25.1, 25.2, 25.3, 25.4, 25.5, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6_

- [x] 5.7 End-of-phase housekeeping
  - Modify: `.kiro/specs/kite-registration-schemes-calculator/tasks.md` — scrub the task file, reconcile checkbox states against what was actually implemented, and confirm every requirement clause maps to a completed task
  - _Depends on: 5.6_
  - _Verify:_ `get_diagnostics` on `tasks.md` reports no Kiro Spec Format issues; every leaf task is checked or explicitly deferred with a note
  - _Requirements: (workflow housekeeping)_

- [x] 5.8 Final checkpoint — full slice
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP, but are required for full conformance.
- Each task references specific requirement sub-clauses for traceability; checkpoints ensure incremental validation.
- The 15 correctness properties are each implemented by exactly one property-based test, tagged `// Feature: kite-registration-schemes-calculator, Property {n}` and run at `numRuns: 100`. Properties live in the phase where their code is built: Phase A (1, 2, 3, 4, 5, 6, 7, 8, 9, 11), Phase B (13), Phase C (10, 12, 14), Phase D (15).
- No scheme/sector/contact values are fabricated — all displayed content is sourced from `src/data/schemes.ts`, `src/data/sectors.ts`, and `src/data/footer.ts`; benefit maxima are the documented constants in the eligibility engine.
- This workflow produces planning artifacts only; implementation happens when you run the tasks.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "1.5", "1.6", "1.9"] },
    { "id": 2, "tasks": ["1.7", "1.10", "1.11", "1.12", "1.13", "1.14", "1.15", "1.18", "2.2", "3.1", "3.2", "3.4", "3.8", "3.12", "4.2"] },
    { "id": 3, "tasks": ["1.8", "1.16", "1.17", "2.1", "2.9", "3.3", "3.5", "3.9", "3.10", "4.1", "4.4"] },
    { "id": 4, "tasks": ["2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.11", "3.6", "3.13", "4.3"] },
    { "id": 5, "tasks": ["2.10", "2.12", "3.7", "3.11", "3.14", "3.15", "3.16", "4.5"] },
    { "id": 6, "tasks": ["2.13", "3.17", "3.18", "4.6", "5.1", "5.2"] },
    { "id": 7, "tasks": ["5.3", "5.4", "5.5"] },
    { "id": 8, "tasks": ["5.6"] },
    { "id": 9, "tasks": ["5.7"] }
  ]
}
```
