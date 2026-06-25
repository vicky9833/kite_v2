# Requirements Document

## Introduction

This document specifies the requirements for the second major slice of **KITE — Karnataka Innovation & Technology Ecosystem**: the **Registration, Schemes & Benefits, and Policy Calculator** experience. This slice builds directly on the delivered foundation/home slice (`.kiro/specs/kite-foundation-home/`) and reuses its Next.js 14 (App Router) project, TypeScript strict mode, Tailwind CSS, shadcn/ui component set, fonts (Inter for body, Plus Jakarta Sans for headings), KITE Design System tokens, and global layout (Header, Footer, MobileNav, Command palette, AI Assistant).

This slice delivers four user-facing capability groups plus their supporting pure logic and shared state:

1. **Startup Registration** — a six-step guided wizard at `/register` that captures a startup profile and issues a session-scoped KITE ID.
2. **Schemes & Benefits Hub** — a filterable, comparable catalogue at `/schemes`, scheme detail pages at `/schemes/[id]`, and a side-by-side compare view at `/schemes/compare`, all personalized when a profile exists.
3. **Policy Calculator** — a benefit-estimation experience at `/calculator` driven by a pure eligibility engine.
4. **Home page personalization** — surgical additions to the existing home page that reflect a registered profile.

This slice is **frontend-only**. There is **no backend, no database, no API, no network call, and no persistence**. All registration and profile state lives in **React Context** for the duration of the browser session and **resets on page refresh**. The KITE_App SHALL NOT read from or write to `localStorage`, `sessionStorage`, cookies, or IndexedDB for any content covered by this slice.

The canonical data sources are the verified TypeScript modules already authored in the foundation slice: the 22 Schemes in `src/data/schemes.ts`, the 20 Sectors in `src/data/sectors.ts`, and the helpline/email contact values in `src/data/footer.ts`. The model SHALL NOT invent or alter scheme names, amounts, eligibility, or other canonical values; displayed scheme content SHALL be sourced from `src/data/schemes.ts`. Additive extensions to `src/types/index.ts` are permitted.

The visual standard continues the foundation discipline: gov.uk clarity, Stripe polish, Y Combinator data density, the Karnataka palette used sparingly, no gradients, no decorative blobs, no emoji, no glassmorphism, no glow (except the existing AI Assistant button), Lucide icons only, `rounded-xl` + `shadow-sm` + `border` cards, section padding of `py-16`/`md:py-24`, and a `max-w-7xl` content container. The slice SHALL conform to WCAG 2.1 Level AA. Each route SHALL keep its First Load JS at or below 150KB.

## Glossary

- **KITE**: Karnataka Innovation & Technology Ecosystem — the website/platform produced by this project.
- **KITE_App**: The Next.js 14 application as a whole, including its build configuration and runtime.
- **Registration_Context**: The React Context provider implemented in `src/context/RegistrationContext.tsx` that holds the session registration state and exposes its read/update/reset operations.
- **Registration_Profile**: The structured record describing a startup, held in Registration_Context. May be null when no profile exists.
- **Profile_Set_State**: A condition in which a Registration_Profile exists (is non-null) but `isRegistered` is false, used by the Policy_Calculator quick-profile flow.
- **Registered_State**: A condition in which a Registration_Profile exists and `isRegistered` is true.
- **Unregistered_State**: A condition in which no Registration_Profile exists or `isRegistered` is false.
- **KITE_ID**: A session-generated identifier for a registered profile in the format `KITE-YYYY-XXXXXX`, where `YYYY` is a four-digit year and `XXXXXX` is a six-character uppercase alphanumeric suffix.
- **Zone**: A derived geographic tier (`Zone 1`, `Zone 2`, or `Zone 3`) computed from the Registration_Profile location.
- **Location_Karnataka**: The set of selectable location values: Bengaluru Urban, Bengaluru Rural, Mysuru, Mangaluru, Hubballi-Dharwad-Belagavi, Kalaburagi, Shivamogga, Tumakuru, and Other Karnataka.
- **Current_Stage**: The startup maturity value, one of Idea, PoC, Early Revenue, Growth, or Scale.
- **Funding_Stage**: The funding maturity value, one of Bootstrapped, Pre-Seed, Seed, Series A, or Series B Plus.
- **Registration_Wizard**: The multi-step form experience at `/register`.
- **Step_Validator**: A pure validation function in `src/lib/registration-validators.ts` that validates one wizard step's fields.
- **Schemes_Hub**: The schemes catalogue page at `/schemes`.
- **Scheme_Detail**: The single-scheme page at `/schemes/[id]`.
- **Compare_View**: The side-by-side comparison page at `/schemes/compare`.
- **Compare_Selection**: The set of one to three Scheme ids selected by the visitor for comparison.
- **Eligibility_Engine**: The pure TypeScript module in `src/lib/eligibility-engine.ts` that evaluates a Registration_Profile against a Scheme.
- **Eligibility_Result**: The structured output of the Eligibility_Engine for a single Scheme.
- **Eligibility_Status**: One of `definitely-eligible`, `likely-eligible`, `check-requirements`, or `not-eligible`.
- **Policy_Calculator**: The benefit-estimation page at `/calculator`.
- **Scheme**: A government scheme record from `src/data/schemes.ts`.
- **Sector**: An industry sector record from `src/data/sectors.ts`.
- **Confidence_Dot**: A 10-pixel circular status indicator whose color encodes an Eligibility_Status.
- **Home_Page**: The KITE home page route (`/`) delivered in the foundation slice.
- **WCAG_AA**: Web Content Accessibility Guidelines 2.1 Level AA conformance criteria.
- **Viewport_Mobile**: Viewport widths below 768 pixels.
- **Viewport_Desktop**: Viewport widths of 1024 pixels and above.

## Requirements

### Requirement 1: Registration Context Provider

**User Story:** As a founder, I want my entered details to be available across the registration, schemes, and calculator pages during my visit, so that the platform can personalize what it shows me without requiring an account.

#### Acceptance Criteria

1. THE Registration_Context SHALL be implemented as a client component in `src/context/RegistrationContext.tsx` and SHALL wrap the application inside the root layout above the site chrome, alongside the existing language provider.
2. THE Registration_Context SHALL initialize with a null Registration_Profile and with `isRegistered` equal to false.
3. THE Registration_Context SHALL expose a `registrationProfile` value, an `updateProfile` operation accepting a partial Registration_Profile, a `completeRegistration` operation, a `resetRegistration` operation, and derived eligibility helper values.
4. WHEN `updateProfile` is invoked with a partial Registration_Profile, THE Registration_Context SHALL merge the provided fields into the current Registration_Profile and SHALL preserve all fields not included in the partial.
5. WHEN `completeRegistration` is invoked, THE Registration_Context SHALL set `isRegistered` to true, SHALL generate a KITE_ID in the format `KITE-YYYY-XXXXXX`, SHALL set `registeredAt` to the current timestamp as an ISO 8601 string, and SHALL store both values in the Registration_Profile.
6. WHEN `resetRegistration` is invoked, THE Registration_Context SHALL return the Registration_Profile to null and SHALL set `isRegistered` to false.
7. THE Registration_Context SHALL derive a Zone from the Registration_Profile location such that Bengaluru Urban maps to Zone 3; Bengaluru Rural, Mysuru, Mangaluru, and Hubballi-Dharwad-Belagavi map to Zone 2; and Kalaburagi, Shivamogga, Tumakuru, and Other Karnataka map to Zone 1.
8. THE Registration_Context SHALL NOT read from or write to localStorage, sessionStorage, cookies, or IndexedDB.
9. WHEN the browser page is refreshed, THE Registration_Context SHALL reinitialize with a null Registration_Profile and `isRegistered` equal to false.
10. IF a consumer reads Registration_Context values outside of the Registration_Context provider, THEN THE Registration_Context SHALL signal a usage error rather than returning undefined values silently.

### Requirement 2: Registration Profile and Eligibility Types

**User Story:** As a developer, I want strongly typed registration and eligibility shapes, so that all consuming components and the eligibility engine share one consistent contract.

#### Acceptance Criteria

1. THE KITE_App SHALL define a `RegistrationProfile` interface in `src/types/index.ts` that includes founder fields (`founderName` string, `founderEmail` string, `founderPhone` string, `founderAge` number), company fields (`companyName` string, `dpiitRecognized` boolean, `gstRegistered` boolean, `incorporationDate` ISO 8601 string, `currentStage` of type Current_Stage), team fields (`teamSize` number, `womenFounderStake` number, `womenEmployeePercentage` number, `scStFounder` boolean), sector fields (`primarySector` Sector id string, `secondarySectors` array of Sector id strings), a `location` of type Location_Karnataka, funding fields (`fundingStage` of type Funding_Stage, `fundingRaised` number in lakhs), and status fields (`isRegistered` boolean, `kiteId` string, `registeredAt` ISO 8601 string).
2. THE KITE_App SHALL export a `Zone` union type with the members `Zone 1`, `Zone 2`, and `Zone 3`.
3. THE KITE_App SHALL export a `FundingStage` union type with the members Bootstrapped, Pre-Seed, Seed, Series A, and Series B Plus.
4. THE KITE_App SHALL export a `CurrentStage` union type with the members Idea, PoC, Early Revenue, Growth, and Scale.
5. THE KITE_App SHALL export a `LocationKarnataka` union type with exactly the nine Location_Karnataka members.
6. THE KITE_App SHALL define an `EligibilityResult` interface with the fields `schemeId` string, `status` of type Eligibility_Status, `reasons` array of strings, `estimatedBenefit` number representing rupees, and `confidence` number constrained to the inclusive range 0 to 1.
7. THE KITE_App SHALL add these types additively without removing or breaking any existing exported type in `src/types/index.ts`.
8. WHEN the project is type-checked using the configured TypeScript compiler, THE KITE_App SHALL report zero type errors for the added types.

### Requirement 3: Registration Wizard Structure and Navigation

**User Story:** As a founder, I want a clear step-by-step registration flow, so that I can complete my profile without feeling overwhelmed.

#### Acceptance Criteria

1. THE Registration_Wizard SHALL render at the route `/register` as a centered container constrained to a maximum width of `max-w-3xl`.
2. THE Registration_Wizard SHALL present exactly six ordered steps: Step 1 Founder details, Step 2 Company basics, Step 3 Team composition, Step 4 Sector selection, Step 5 Location and funding, and Step 6 Review and submit.
3. THE Registration_Wizard SHALL display a header showing the current step number and step title and a six-segment progress bar in which segments for the active and completed steps render in the accent color and segments for future steps render in a muted color.
4. THE Registration_Wizard SHALL display a Back control and a Continue control beneath the step content, WHERE the Back control renders as a ghost-styled button and the Continue control renders as an accent-styled button.
5. WHILE the active step is Step 1, THE Registration_Wizard SHALL render the Back control in a disabled state.
6. WHILE the active step is Step 6, THE Registration_Wizard SHALL render the Continue control with the label "Submit Registration".
7. WHILE the active step is any of Steps 1 through 5, THE Registration_Wizard SHALL render the Continue control with the label "Continue".
8. WHEN a visitor activates the Continue control on a step whose fields are valid, THE Registration_Wizard SHALL persist the step's field values into the Registration_Profile via `updateProfile` and SHALL advance to the next step.
9. WHEN a visitor activates the Back control on any step from Step 2 through Step 6, THE Registration_Wizard SHALL return to the preceding step and SHALL retain all previously entered field values.
10. WHILE the active step has one or more invalid fields, THE Registration_Wizard SHALL render the Continue control in a disabled state and SHALL set its `aria-disabled` attribute to true.
11. WHEN a visitor advances to a step, THE Registration_Wizard SHALL move keyboard focus to the first input control of that step.

### Requirement 4: Step 1 — Founder Details Validation

**User Story:** As a founder, I want my contact details validated as I enter them, so that I can correct mistakes before continuing.

#### Acceptance Criteria

1. THE Registration_Wizard Step 1 SHALL capture `founderName`, `founderEmail`, `founderPhone`, and `founderAge`.
2. IF `founderName` contains fewer than 2 characters after trimming surrounding whitespace, THEN THE Registration_Wizard SHALL treat `founderName` as invalid and SHALL display an inline error in the danger color adjacent to the name field.
3. IF `founderEmail` does not match a standard email address pattern containing a local part, an `@` symbol, and a domain with a dot, THEN THE Registration_Wizard SHALL treat `founderEmail` as invalid and SHALL display an inline error in the danger color adjacent to the email field.
4. IF `founderPhone`, after removing an optional leading `+91` prefix and separator characters, does not contain exactly 10 digits, THEN THE Registration_Wizard SHALL treat `founderPhone` as invalid and SHALL display an inline error in the danger color adjacent to the phone field.
5. IF `founderAge` is less than 18 or greater than 80, THEN THE Registration_Wizard SHALL treat `founderAge` as invalid and SHALL display an inline error in the danger color adjacent to the age field.
6. WHILE any Step 1 field is invalid, THE Registration_Wizard SHALL keep the Continue control disabled.

### Requirement 5: Step 2 — Company Basics Validation

**User Story:** As a founder, I want to record my company basics, so that the platform can match me to schemes that depend on recognition and stage.

#### Acceptance Criteria

1. THE Registration_Wizard Step 2 SHALL capture `companyName`, `dpiitRecognized`, `gstRegistered`, `incorporationDate`, and `currentStage`.
2. IF `companyName` contains fewer than 2 characters after trimming surrounding whitespace, THEN THE Registration_Wizard SHALL treat `companyName` as invalid and SHALL display an inline error in the danger color adjacent to the company name field.
3. WHERE `dpiitRecognized` and `gstRegistered` are presented as Yes/No controls, THE Registration_Wizard SHALL require an explicit Yes or No selection for each and SHALL treat an absent selection as invalid.
4. IF `incorporationDate` is empty, THEN THE Registration_Wizard SHALL treat `incorporationDate` as invalid and SHALL display an inline error in the danger color adjacent to the incorporation date field.
5. IF `incorporationDate` is a date later than the current date, THEN THE Registration_Wizard SHALL treat `incorporationDate` as invalid and SHALL display an inline error in the danger color stating that the incorporation date cannot be in the future.
6. IF `currentStage` is not one of the five Current_Stage values, THEN THE Registration_Wizard SHALL treat `currentStage` as invalid.
7. WHILE any Step 2 field is invalid, THE Registration_Wizard SHALL keep the Continue control disabled.

### Requirement 6: Step 3 — Team Composition Validation

**User Story:** As a founder, I want to describe my team composition, so that the platform can surface women-led and reserved-category schemes I may qualify for.

#### Acceptance Criteria

1. THE Registration_Wizard Step 3 SHALL capture `teamSize`, `womenFounderStake`, `womenEmployeePercentage`, and `scStFounder`.
2. IF `teamSize` is less than 1 or greater than 5000, THEN THE Registration_Wizard SHALL treat `teamSize` as invalid and SHALL display an inline error in the danger color adjacent to the team size field.
3. THE Registration_Wizard SHALL present `womenFounderStake` and `womenEmployeePercentage` as slider controls constrained to the inclusive integer range 0 to 100.
4. WHILE `womenFounderStake` is at least 51 or `womenEmployeePercentage` is at least 51, THE Registration_Wizard SHALL display a note indicating that women-led scheme benefits are unlocked.
5. WHERE `scStFounder` is selected, THE Registration_Wizard SHALL display a note indicating that the ELEVATE Unnati track is unlocked.
6. WHILE any Step 3 field is invalid, THE Registration_Wizard SHALL keep the Continue control disabled.

### Requirement 7: Step 4 — Sector Selection Validation

**User Story:** As a founder, I want to choose my primary and secondary sectors, so that the platform understands my domain.

#### Acceptance Criteria

1. THE Registration_Wizard Step 4 SHALL present a single-select control for `primarySector` populated from the 20 Sectors defined in `src/data/sectors.ts`, in the order defined in that source.
2. IF `primarySector` is not set to a valid Sector id, THEN THE Registration_Wizard SHALL treat `primarySector` as invalid and SHALL keep the Continue control disabled.
3. THE Registration_Wizard SHALL present a multi-select control for `secondarySectors` populated from the Sectors defined in `src/data/sectors.ts`, excluding the Sector chosen as `primarySector`.
4. THE Registration_Wizard SHALL limit `secondarySectors` to at most 3 selected Sectors.
5. IF a visitor attempts to select a fourth secondary Sector, THEN THE Registration_Wizard SHALL prevent the selection and SHALL keep the count of selected secondary Sectors at 3.
6. WHEN the visitor changes `primarySector` to a Sector currently present in `secondarySectors`, THE Registration_Wizard SHALL remove that Sector from `secondarySectors`.

### Requirement 8: Step 5 — Location and Funding Validation

**User Story:** As a founder, I want to record my location and funding position, so that the platform can apply zone-based and funding-stage scheme rules.

#### Acceptance Criteria

1. THE Registration_Wizard Step 5 SHALL capture `location`, `fundingStage`, and `fundingRaised`.
2. THE Registration_Wizard SHALL present `location` as a single-select control populated with the nine Location_Karnataka values.
3. IF `location` is not one of the nine Location_Karnataka values, THEN THE Registration_Wizard SHALL treat `location` as invalid and SHALL keep the Continue control disabled.
4. THE Registration_Wizard SHALL present `fundingStage` as a single-select control populated with the five Funding_Stage values.
5. IF `fundingStage` is not one of the five Funding_Stage values, THEN THE Registration_Wizard SHALL treat `fundingStage` as invalid and SHALL keep the Continue control disabled.
6. THE Registration_Wizard SHALL present `fundingRaised` in lakhs with a default value of 0.
7. IF `fundingRaised` is less than 0, THEN THE Registration_Wizard SHALL treat `fundingRaised` as invalid and SHALL display an inline error in the danger color adjacent to the funding raised field.

### Requirement 9: Step 6 — Review and Submit

**User Story:** As a founder, I want to review and confirm my details before submitting, so that I can correct anything inaccurate.

#### Acceptance Criteria

1. THE Registration_Wizard Step 6 SHALL display one review card per preceding section (Founder details, Company basics, Team composition, Sector selection, and Location and funding), each summarizing the values entered for that section.
2. THE Registration_Wizard SHALL display an Edit control on each review card that, WHEN activated, returns the visitor to the corresponding step with previously entered values intact.
3. THE Registration_Wizard SHALL display a required accuracy confirmation checkbox that the visitor must select to acknowledge the entered details are accurate.
4. WHILE the accuracy confirmation checkbox is not selected, THE Registration_Wizard SHALL keep the "Submit Registration" control disabled.
5. WHEN a visitor activates the "Submit Registration" control while the accuracy confirmation checkbox is selected, THE Registration_Wizard SHALL invoke `completeRegistration` and SHALL transition to the registration success state.

### Requirement 10: Registration Success State

**User Story:** As a founder who just registered, I want a clear confirmation and obvious next steps, so that I know my KITE ID and where to go next.

#### Acceptance Criteria

1. WHEN registration completes, THE Registration_Wizard SHALL render a centered success state containing a success-token check icon and the headline "Registration Complete".
2. THE registration success state SHALL display the generated KITE_ID in a callout accompanied by a Copy control.
3. WHEN a visitor activates the Copy control, THE Registration_Wizard SHALL copy the KITE_ID text to the clipboard and SHALL display a confirmation that the value was copied.
4. THE registration success state SHALL display exactly three call-to-action cards: "See Schemes You Qualify For" targeting `/schemes`, "Calculate Your Benefits" targeting `/calculator`, and "Explore the Ecosystem" targeting `/`.
5. WHEN a visitor activates a success-state call-to-action card, THE Registration_Wizard SHALL navigate to that card's target route.
6. THE registration success state SHALL display a disclaimer line indicating that registration is a session-only frontend preview and is not submitted to any government system.

### Requirement 11: Step Validators Module

**User Story:** As a developer, I want pure per-step validation functions, so that wizard validation is testable in isolation and behaves consistently.

#### Acceptance Criteria

1. THE KITE_App SHALL implement `src/lib/registration-validators.ts` exposing one pure validation function per wizard step.
2. WHEN a Step_Validator is invoked with a set of field values, THE Step_Validator SHALL return a record mapping each invalid field name to a human-readable error message.
3. WHEN a Step_Validator is invoked with field values that all satisfy that step's rules, THE Step_Validator SHALL return an empty record.
4. THE Step_Validator functions SHALL be pure, producing the same output for the same input and performing no input/output, no mutation of their arguments, and no access to browser storage or network.
5. THE Step_Validator functions SHALL enforce exactly the field rules defined in Requirements 4 through 8.

### Requirement 12: Schemes Hub Personalization and Banner

**User Story:** As a visitor, I want the schemes page to reflect whether I have registered, so that I see personalized eligibility when available.

#### Acceptance Criteria

1. THE Schemes_Hub SHALL render at `/register`'s sibling route `/schemes`, replacing the foundation-slice stub, with a compact dark hero using vertical padding of `py-12`.
2. WHILE the application is in Registered_State, THE Schemes_Hub SHALL display an accent-bordered personalization banner showing the text "Personalized for {kiteId}" with the visitor's KITE_ID, a count statement of the form "You qualify for X of 22 schemes", a Reset control, and three quick-filter chips labeled "Show Only Eligible", "Show All", and "Compare Selected".
3. WHILE the application is in Registered_State, WHEN a visitor activates the Reset control in the personalization banner, THE Schemes_Hub SHALL invoke `resetRegistration` and SHALL update the page to the Unregistered_State presentation.
4. WHILE the application is in Registered_State, THE Schemes_Hub SHALL compute the qualifying count "X" as the number of Schemes whose Eligibility_Status is `definitely-eligible` or `likely-eligible` for the current Registration_Profile.
5. WHILE the application is in Unregistered_State, THE Schemes_Hub SHALL display a muted banner containing a "Register Now" control targeting `/register`.
6. WHILE the application is in Registered_State, WHEN a visitor activates the "Show Only Eligible" quick-filter chip, THE Schemes_Hub SHALL display only Schemes whose Eligibility_Status is `definitely-eligible` or `likely-eligible`.

### Requirement 13: Schemes Hub Filtering and Search

**User Story:** As a visitor, I want to filter and search the scheme catalogue, so that I can narrow 22 schemes down to the ones relevant to me.

#### Acceptance Criteria

1. THE Schemes_Hub SHALL display a filter row containing three type tabs labeled All, Fiscal Incentives, and Grant-in-Aid, a secondary-sector multi-select, a stage multi-select, a status filter offering All, Open, and Upcoming, and a search input.
2. WHEN the Schemes_Hub loads, THE Schemes_Hub SHALL preselect the All type tab and the All status filter and SHALL display all 22 Schemes from `src/data/schemes.ts`.
3. WHEN a visitor selects the Fiscal Incentives type tab, THE Schemes_Hub SHALL display only Schemes whose `type` equals `fiscal`.
4. WHEN a visitor selects the Grant-in-Aid type tab, THE Schemes_Hub SHALL display only Schemes whose `type` equals `grant`.
5. WHEN a visitor selects the Open or Upcoming status filter, THE Schemes_Hub SHALL display only Schemes whose `status` equals the selected value.
6. WHEN a visitor enters text in the search input, THE Schemes_Hub SHALL display only Schemes whose name contains the entered text using a case-insensitive substring match.
7. WHEN a visitor sets multiple filter controls simultaneously, THE Schemes_Hub SHALL display only Schemes that satisfy all active filter conditions together.
8. THE Schemes_Hub SHALL perform all filtering and searching on the client without issuing any network or API call.
9. IF the active filter combination matches zero Schemes, THEN THE Schemes_Hub SHALL display a message indicating that no schemes match the current filters while keeping the filter controls visible.

### Requirement 14: Schemes Hub Compare Bar

**User Story:** As a visitor, I want to gather up to three schemes for comparison, so that I can weigh them side by side.

#### Acceptance Criteria

1. THE Schemes_Hub SHALL allow a visitor to add a Scheme to the Compare_Selection, up to a maximum of 3 Schemes.
2. WHILE the Compare_Selection contains between 1 and 3 Schemes, THE Schemes_Hub SHALL display a compare bar fixed to the bottom of the viewport showing the selected count, a Compare control, and a Clear control.
3. IF a visitor attempts to add a fourth Scheme to the Compare_Selection, THEN THE Schemes_Hub SHALL reject the addition, SHALL keep the Compare_Selection at 3 Schemes, and SHALL display a notification toast indicating the three-scheme limit.
4. WHEN a visitor activates the Clear control, THE Schemes_Hub SHALL empty the Compare_Selection and SHALL hide the compare bar.
5. WHEN a visitor activates the Compare control, THE Schemes_Hub SHALL navigate to `/schemes/compare` with the selected Scheme ids encoded in the URL search parameters.
6. WHILE the Compare_Selection is empty, THE Schemes_Hub SHALL NOT display the compare bar.
7. THE compare bar SHALL be reachable and operable using the keyboard.

### Requirement 15: Scheme Card Presentation

**User Story:** As a visitor, I want informative scheme cards, so that I can scan key facts and act without opening every detail page.

#### Acceptance Criteria

1. THE Schemes_Hub SHALL render each displayed Scheme as a card showing the Scheme name, a type badge, a status badge, a benefit line combining the Scheme `amount` and `maxBenefit`, and a duration caption, all sourced from `src/data/schemes.ts`.
2. THE Scheme card SHALL display the Scheme eligibility truncated to two lines with a control to expand the full eligibility list.
3. THE Scheme card SHALL display a documents expander that, WHEN activated, reveals the Scheme's documents list.
4. THE Scheme card SHALL display a "View Details" action that navigates to `/schemes/[id]` for that Scheme, an "Apply Now" action that opens the Scheme's external application URL in a new browser tab with `rel="noopener noreferrer"`, and a Compare checkbox bound to the Compare_Selection.
5. WHILE the application is in Registered_State, THE Scheme card SHALL display a corner Confidence_Dot colored green for `definitely-eligible`, yellow for `likely-eligible`, gray for `check-requirements`, and red for `not-eligible`, with a tooltip exposing the eligibility reasons.
6. WHILE the application is in Unregistered_State, THE Scheme card SHALL NOT display a Confidence_Dot.

### Requirement 16: Scheme Detail Page

**User Story:** As a visitor, I want an in-depth, editorial scheme page, so that I can fully understand a scheme before applying.

#### Acceptance Criteria

1. THE Scheme_Detail page SHALL render at `/schemes/[id]`, replacing the foundation-slice stub, using a two-column layout with a main content column and a sticky sidebar on Viewport_Desktop, and SHALL collapse to a single column with a sticky bottom action bar on Viewport_Mobile.
2. THE Scheme_Detail page SHALL display a breadcrumb, the Scheme name as a heading, the type and status badges, and an editorial introduction.
3. THE Scheme_Detail page SHALL display a "Benefit at a Glance" block of exactly three stat tiles derived from the Scheme's `amount`, `maxBenefit`, and `duration`.
4. THE Scheme_Detail page SHALL display the Scheme eligibility as a bulleted list and the Scheme required documents as a numbered list, both sourced from `src/data/schemes.ts`.
5. THE Scheme_Detail page SHALL display a process timeline of four to five steps, WHERE the timeline structure differs between Schemes of type `fiscal` and Schemes of type `grant`, and WHERE the timeline content is presented as illustrative founder-judgment guidance rather than canonical scheme data.
6. THE Scheme_Detail page SHALL display a frequently-asked-questions accordion containing between five and seven plausible question-and-answer entries.
7. THE Scheme_Detail page sidebar SHALL display an "Apply Now" control, a "Key Facts" panel listing the Scheme id, type, status, the owner value "Karnataka EITBT Department", and the Scheme note when present, a "Related Schemes" block of exactly three linkable cards of the same `type`, a "Talk to KITS" card exposing a `tel:` link and a `mailto:` link sourced from `src/data/footer.ts`, and a "Last Updated" indication.
8. WHILE the application is in Registered_State, THE Scheme_Detail page SHALL display a personalization card beneath the heading with a border colored by the Eligibility_Status, a "Your Eligibility" title, a reasons paragraph, and an estimated benefit line in rupees.
9. WHILE the application is in Unregistered_State, THE Scheme_Detail page SHALL display a small banner inviting the visitor to register.
10. IF the `[id]` route parameter does not match any Scheme in `src/data/schemes.ts`, THEN THE Scheme_Detail page SHALL render a not-found state while keeping the Header and Footer available.

### Requirement 17: Compare View

**User Story:** As a visitor, I want a shareable side-by-side comparison, so that I can evaluate schemes together and send the comparison to others.

#### Acceptance Criteria

1. THE Compare_View SHALL render at `/schemes/compare` and SHALL read the Scheme ids to compare from the URL search parameters.
2. WHEN the Compare_View loads with two or three valid Scheme ids in the search parameters, THE Compare_View SHALL display those Schemes in a side-by-side semantic table with one column per Scheme.
3. THE Compare_View SHALL display a column header for each Scheme containing the Scheme name and a Remove control.
4. WHEN a visitor activates a column Remove control, THE Compare_View SHALL remove that Scheme's column and SHALL update the URL search parameters to reflect the remaining Schemes.
5. THE Compare_View SHALL display comparison rows for Type, Status, Amount, Max Benefit, Duration, Eligibility rendered as a bulleted list, and Documents rendered as a numbered list, each populated from `src/data/schemes.ts`.
6. WHILE the application is in Registered_State, THE Compare_View SHALL display an additional "Your Eligibility" row showing, per Scheme column, a colored Confidence_Dot and the eligibility reasons.
7. THE Compare_View SHALL display a "Back to Schemes" link targeting `/schemes` and an "Apply Now" control per column that opens the Scheme's external application URL in a new browser tab with `rel="noopener noreferrer"`.
8. IF the search parameters contain fewer than two valid Scheme ids, THEN THE Compare_View SHALL display a message prompting the visitor to select schemes to compare and SHALL provide a link back to `/schemes`.

### Requirement 18: Eligibility Engine Rules

**User Story:** As a founder, I want my profile evaluated against each scheme's real eligibility rules, so that the platform tells me where I likely qualify.

#### Acceptance Criteria

1. THE Eligibility_Engine SHALL be implemented in `src/lib/eligibility-engine.ts` as pure TypeScript with no external dependencies, accepting a Registration_Profile and a Scheme and returning an Eligibility_Result.
2. WHEN evaluating the State GST Reimbursement scheme, THE Eligibility_Engine SHALL assign `definitely-eligible` only where the Registration_Profile has `dpiitRecognized` true, `gstRegistered` true, and a `currentStage` at or beyond Early Revenue.
3. WHEN evaluating the Patent Filing Subsidy scheme, THE Eligibility_Engine SHALL assign `definitely-eligible` where the Registration_Profile has `dpiitRecognized` true, for any `currentStage`.
4. WHEN evaluating the ELEVATE scheme, THE Eligibility_Engine SHALL assign `definitely-eligible` only where the Registration_Profile `currentStage` is Idea or PoC and `fundingStage` is at or below Pre-Seed.
5. WHEN evaluating the ELEVATE Unnati scheme, THE Eligibility_Engine SHALL apply the ELEVATE conditions and SHALL additionally require `scStFounder` to be true for a `definitely-eligible` result.
6. WHEN evaluating any women-led scheme, THE Eligibility_Engine SHALL treat the Registration_Profile as qualifying where `womenFounderStake` is at least 51 or `womenEmployeePercentage` is at least 51.
7. WHEN evaluating the Rajiv Gandhi Entrepreneurship Programme scheme, THE Eligibility_Engine SHALL treat the Registration_Profile as qualifying where `founderAge` is at most 30.
8. WHEN evaluating the New Incubation Centers Grant scheme, THE Eligibility_Engine SHALL treat the Registration_Profile as qualifying only where the derived Zone is Zone 1 or Zone 2, excluding Bengaluru Urban.
9. WHEN evaluating the Beyond Bengaluru Cluster Seed Fund scheme, THE Eligibility_Engine SHALL require the Registration_Profile `location` to be a value other than Bengaluru Urban for a qualifying result.
10. WHEN evaluating the KITVEN Fund-5 scheme, THE Eligibility_Engine SHALL require the Registration_Profile `currentStage` to be at or beyond Early Revenue for a qualifying result.
11. WHEN evaluating the Internship Support scheme, THE Eligibility_Engine SHALL base qualification on `dpiitRecognized` being true.
12. WHEN evaluating the NAIN 2.0 scheme for a profile whose student-team status is unknown, THE Eligibility_Engine SHALL assign `check-requirements`, and otherwise SHALL assign `not-eligible` where the profile does not meet the student-team criterion.

### Requirement 19: Eligibility Engine Outputs

**User Story:** As a developer, I want the eligibility engine to produce a consistent, well-formed result, so that every consuming view can rely on its shape and values.

#### Acceptance Criteria

1. THE Eligibility_Engine SHALL return an Eligibility_Result whose `status` is exactly one of `definitely-eligible`, `likely-eligible`, `check-requirements`, or `not-eligible`.
2. THE Eligibility_Engine SHALL set `estimatedBenefit` to the Scheme maximum benefit value in rupees where `status` is `definitely-eligible`, to half of that maximum benefit value where `status` is `likely-eligible`, and to 0 where `status` is `check-requirements` or `not-eligible`.
3. WHERE a Scheme provides its benefit as an equity instrument rather than a fixed rupee amount, THE Eligibility_Engine SHALL compute `estimatedBenefit` from a documented placeholder valuation (for example, 10 percent of one crore rupees) rather than from free-text parsing.
4. THE Eligibility_Engine SHALL set `confidence` to 1 where `status` is `definitely-eligible`, to 0.7 where `status` is `likely-eligible`, to 0.3 where `status` is `check-requirements`, and to 0 where `status` is `not-eligible`.
5. THE Eligibility_Engine SHALL return a non-empty `reasons` array for every Eligibility_Result whose `status` is not `definitely-eligible`.
6. THE Eligibility_Engine SHALL return an `estimatedBenefit` that is greater than or equal to 0 for every Eligibility_Result.
7. WHEN the Eligibility_Engine is invoked to total benefits across multiple Schemes, THE Eligibility_Engine SHALL compute the total as the sum of the `estimatedBenefit` values of the qualifying Schemes.

### Requirement 20: Policy Calculator Entry States

**User Story:** As a visitor, I want a quick way to start the calculator with or without registering, so that I can estimate benefits with as little friction as I choose.

#### Acceptance Criteria

1. THE Policy_Calculator SHALL render at `/calculator`, replacing the foundation-slice stub, with a compact hero.
2. WHILE no Registration_Profile exists, THE Policy_Calculator SHALL display a centered card offering a "Use My Registration" control targeting `/register` and a "Use Quick Profile" control that reveals an inline compressed form.
3. THE quick-profile form SHALL capture only the fields used by the Eligibility_Engine.
4. WHEN a visitor saves the quick-profile form, THE Policy_Calculator SHALL store the captured fields as a partial Registration_Profile via `updateProfile`, SHALL mark the application as Profile_Set_State, and SHALL keep `isRegistered` false.
5. WHILE the application is in Profile_Set_State or Registered_State, THE Policy_Calculator SHALL display the calculator results view rather than the entry card.

### Requirement 21: Policy Calculator Results View

**User Story:** As a founder, I want a clear estimate of my total benefits and a per-scheme breakdown, so that I understand the value the ecosystem offers me.

#### Acceptance Criteria

1. THE Policy_Calculator results view SHALL display a profile summary row with an Edit control that returns the visitor to the relevant profile entry.
2. THE Policy_Calculator results view SHALL display a total benefits summary rendering the summed estimated benefit as a large bold number in the Plus Jakarta Sans font, formatted in rupees using crore and lakh units, accompanied by the statement "Across X schemes you qualify for".
3. THE Policy_Calculator results view SHALL display a thin confidence meter bar with a label of High, Medium, or Low, WHERE the label is High when the weighted-average confidence exceeds 0.8, Medium when it exceeds 0.5 and is at most 0.8, and Low when it is at most 0.5.
4. THE Policy_Calculator results view SHALL display a status-grouped breakdown with the Definitely Eligible and Likely Eligible groups expanded by default and the Check Requirements and Not Eligible groups collapsed by default.
5. THE Policy_Calculator results view SHALL render each breakdown row with the Scheme name, a Confidence_Dot, the estimated benefit, and a control to expand that Scheme's eligibility reasons.
6. THE Policy_Calculator results view SHALL display an "Update Profile" control and an "Apply to Eligible Schemes" control, WHERE the "Apply to Eligible Schemes" control navigates to `/schemes` filtered to eligible Schemes.
7. THE Policy_Calculator SHALL NOT generate a PDF and SHALL NOT display multi-year financial projections.

### Requirement 22: Confidence Indicators

**User Story:** As a visitor, I want consistent visual cues for eligibility confidence, so that I can interpret status the same way across every page.

#### Acceptance Criteria

1. THE KITE_App SHALL render every Confidence_Dot as a circular indicator of 10 pixels in diameter.
2. THE KITE_App SHALL color each Confidence_Dot green for `definitely-eligible`, yellow for `likely-eligible`, gray for `check-requirements`, and red for `not-eligible`.
3. THE KITE_App SHALL convey the meaning of each Confidence_Dot through accompanying text in a tooltip or label and SHALL NOT rely on color alone to communicate Eligibility_Status.
4. THE KITE_App SHALL render Confidence_Dots consistently across the Schemes_Hub, the Scheme_Detail page, the Compare_View, and the Policy_Calculator.

### Requirement 23: Apply Now External Routing

**User Story:** As a founder, I want to be taken to the correct official application portal, so that I can apply for a scheme through the right channel.

#### Acceptance Criteria

1. WHEN a visitor activates an "Apply Now" control, THE KITE_App SHALL open the Scheme's external application URL in a new browser tab with the attribute `rel="noopener noreferrer"`.
2. WHERE the Scheme is KITVEN Fund-5, THE KITE_App SHALL target the external URL `kitven.in`.
3. WHERE the Scheme is the Karnataka Acceleration Network, THE KITE_App SHALL target the external URL `karnatakadigital.in/acceleration-network`.
4. WHERE the Scheme is an ELEVATE scheme, THE KITE_App SHALL target the external URL `eitbt.karnataka.gov.in/elevate`.
5. WHERE the Scheme does not match a specific external mapping, THE KITE_App SHALL target the default external URL `eitbt.karnataka.gov.in/startup`.
6. THE KITE_App SHALL display an inline disclaimer note near the "Apply Now" control indicating that the control redirects to an official portal and that the current site is a frontend preview.

### Requirement 24: Home Page Personalization Integration

**User Story:** As a registered founder returning to the home page, I want it to reflect that I have registered, so that my next steps are obvious.

#### Acceptance Criteria

1. WHILE the application is in Registered_State, THE Home_Page SHALL display a personalization banner above the existing schemes preview section showing a statement of the form "You qualify for X of 22 schemes" with a control targeting `/schemes`.
2. WHILE the application is in Registered_State, THE Home_Page SHALL compute the value "X" as the number of Schemes whose Eligibility_Status is `definitely-eligible` or `likely-eligible` for the current Registration_Profile.
3. WHILE the application is in Registered_State, THE Home_Page Quick Actions section SHALL render the "Register Your Startup" action in a completed state with a checkmark badge, SHALL keep that action card in place within the existing eight-action grid so the grid cardinality is preserved, and SHALL surface a secondary "See Your Schemes" affordance targeting `/schemes` within that same card.
4. WHILE the application is in Unregistered_State, THE Home_Page SHALL present the schemes preview section and the Quick Actions section exactly as delivered in the foundation slice, without the personalization banner and without the completed-state treatment.
5. THE Home_Page personalization additions SHALL be additive and SHALL NOT remove or alter any other foundation-slice home section behavior.

### Requirement 25: Frontend-Only, Session-Only Constraints

**User Story:** As a stakeholder, I want this slice to remain a self-contained frontend preview, so that no real submissions, storage, or backend dependencies are introduced.

#### Acceptance Criteria

1. THE KITE_App SHALL hold all registration, profile, and calculator state in React Context for the duration of the browser session only.
2. THE KITE_App SHALL NOT issue any network or API call to create, read, update, or delete registration, profile, scheme, or calculator data covered by this slice.
3. THE KITE_App SHALL NOT read from or write to localStorage, sessionStorage, cookies, or IndexedDB for any content covered by this slice.
4. WHEN the browser page is refreshed, THE KITE_App SHALL discard all registration and profile state and return to the Unregistered_State.
5. THE KITE_App SHALL source all displayed scheme, sector, and contact content from the canonical data modules `src/data/schemes.ts`, `src/data/sectors.ts`, and `src/data/footer.ts` and SHALL NOT fabricate scheme names, amounts, eligibility, or contact values.

### Requirement 26: Visual Discipline

**User Story:** As a stakeholder, I want this slice to match the established government-grade visual language, so that the platform feels consistent and credible.

#### Acceptance Criteria

1. THE pages and components in this slice SHALL use the KITE Design System color tokens and SHALL apply the Karnataka palette sparingly.
2. THE pages and components in this slice SHALL render card containers with `rounded-xl` corners, a `shadow-sm` shadow, and a visible border.
3. THE content sections in this slice SHALL apply vertical padding of `py-16` at base and `md:py-24` on larger viewports, except the compact hero sections specified at `py-12`.
4. THE pages in this slice SHALL constrain primary content width to a `max-w-7xl` container, except where a narrower container is specified, such as the `max-w-3xl` Registration_Wizard.
5. THE pages and components in this slice SHALL NOT apply gradient backgrounds, SHALL NOT render decorative blob shapes, SHALL NOT use emoji characters in user interface elements, SHALL NOT apply glassmorphism effects, and SHALL NOT apply glow effects other than the existing AI Assistant button.
6. THE pages and components in this slice SHALL use only Lucide icons for iconography.

### Requirement 27: Accessibility

**User Story:** As a visitor using assistive technology, I want the registration, schemes, and calculator experiences to be fully accessible, so that I can use them regardless of ability.

#### Acceptance Criteria

1. THE Registration_Wizard SHALL be fully operable using the keyboard, and WHEN a step becomes active, THE Registration_Wizard SHALL move keyboard focus to that step's first input control.
2. WHILE the Continue control is disabled due to invalid fields, THE Registration_Wizard SHALL expose its disabled condition through the `aria-disabled` attribute.
3. THE Registration_Wizard SHALL render inline field errors within an `aria-live` region using the polite politeness setting so that assistive technologies announce errors as they appear.
4. THE Schemes_Hub compare bar SHALL be reachable and operable using the keyboard.
5. THE Compare_View SHALL present its comparison as a semantic table with programmatically associated row and column headers.
6. THE Policy_Calculator SHALL announce updates to the total benefits value and the confidence label through an `aria-live` region.
7. THE pages and components in this slice SHALL maintain a text contrast ratio of at least 4.5:1 for normal-size text and at least 3:1 for large-size text against their background.
8. THE pages and components in this slice SHALL provide a programmatically determinable, non-empty accessible name for every interactive control that lacks a visible text label.

### Requirement 28: Performance

**User Story:** As a visitor, I want each new page to load quickly, so that I can register, browse, and calculate without delay.

#### Acceptance Criteria

1. WHEN the production build is analyzed, THE `/register` route SHALL report a First Load JS at or below 150KB.
2. WHEN the production build is analyzed, THE `/schemes` route SHALL report a First Load JS at or below 150KB.
3. WHEN the production build is analyzed, THE `/schemes/[id]` route SHALL report a First Load JS at or below 150KB.
4. WHEN the production build is analyzed, THE `/calculator` route SHALL report a First Load JS at or below 150KB.
5. WHEN the production build is analyzed, THE `/schemes/compare` route SHALL report a First Load JS at or below 150KB, counted independently of the other routes in this slice.
6. THE KITE_App SHALL perform all eligibility evaluation and filtering for these routes on the client without issuing any network or API call.

### Requirement 29: KITE ID Format Property

**User Story:** As a developer, I want the KITE ID generator verified by property-based testing, so that every generated identifier is well-formed.

#### Acceptance Criteria

1. THE KITE_App SHALL generate every KITE_ID matching the pattern `KITE-YYYY-XXXXXX`, where `YYYY` is exactly four digits and `XXXXXX` is exactly six uppercase alphanumeric characters.
2. THE KITE_App SHALL verify the KITE_ID format with a property-based test using fast-check configured with at least 100 runs, asserting that every generated KITE_ID matches the required pattern.
3. WHEN `completeRegistration` is invoked, THE KITE_App SHALL set the `YYYY` portion of the generated KITE_ID to the four-digit current year.

### Requirement 30: Eligibility Engine Properties

**User Story:** As a developer, I want the eligibility engine verified by property-based testing, so that its output is always well-formed regardless of profile and scheme inputs.

#### Acceptance Criteria

1. THE KITE_App SHALL verify the Eligibility_Engine with property-based tests using fast-check configured with at least 100 runs over generated Registration_Profile and Scheme inputs.
2. FOR ALL generated Registration_Profile and Scheme inputs, THE Eligibility_Engine SHALL return an Eligibility_Result whose `status` is one of the four Eligibility_Status values.
3. FOR ALL generated inputs, WHERE the resulting `status` is not `definitely-eligible`, THE Eligibility_Engine SHALL return a non-empty `reasons` array.
4. FOR ALL generated inputs, THE Eligibility_Engine SHALL return an `estimatedBenefit` greater than or equal to 0.
5. FOR ALL generated inputs, THE Eligibility_Engine SHALL return a `confidence` value within the inclusive range 0 to 1.
6. FOR ALL generated inputs, THE Eligibility_Engine SHALL return a `schemeId` equal to the `id` of the Scheme passed to it.
