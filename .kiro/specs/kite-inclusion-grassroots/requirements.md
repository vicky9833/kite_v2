# Requirements Document

## Introduction

The KITE Inclusion & Grassroots Layer (Prompt 6) extends the existing Next.js 14 /
App Router / TypeScript-strict KITE portal with three public surfaces that broaden
participation in the Karnataka startup ecosystem beyond the marketplace, dashboard,
and enablement layers built in Prompts 1–5. The layer replaces three current
`StubPage` placeholders with full institutional surfaces and adds the session-only
state, pure data modules, and additive types required to support them.

The three routes are:

1. **Women Founders Hub** at `/women` — a public discovery and program surface that
   presents the verified women-founder provisions of the Karnataka Startup Policy,
   women-relevant schemes, the Women-Led Accelerator program, illustrative featured
   founders and mentors, and get-involved pathways. It reads as institutional, not
   promotional.
2. **CSR & NGO Hub** at `/csr` — a public discovery surface for CSR teams, NGO
   partners, and government coordinators. It reads as a KDEM partnership memo: the CSR
   landscape, CSR-aligned programs, illustrative partnerships and NGO partners,
   illustrative impact metrics, a partnership pathway, and a downloadable partnership
   brief.
3. **Idea Bank** at `/ideas` — a grassroots idea submission and discovery surface.
   Citizens, students, farmers, researchers, and rural innovators submit ideas through
   a session-only form; each submission is assigned an idea identifier, matched to real
   Karnataka schemes by a deterministic matching engine, and surfaced on a public ideas
   board alongside deterministic synthetic seed ideas.

This layer follows the operating discipline established in Prompts 1–5: it is
frontend-only and session-only. There is NO backend, NO database, NO API, NO network
or `fetch`, and NO persistence (no `localStorage`, `sessionStorage`, cookies, or
`indexedDB`). The new `IdeaBankContext` holds submissions in in-memory React state that
resets on refresh. Client-side `Blob` downloads are the only permitted output.

Verified Karnataka data is canonical and is never fabricated. The verified women-founder
constants (25% women-led among ELEVATE winners, the 51% founder-stake threshold, the 51%
women-employee threshold, the ₹5 crore Women-Led Accelerator grant over 5 years, and
ELEVATE Unnati for SC/ST founders) are reproduced exactly. There are EXACTLY 22 schemes
in `src/data/schemes.ts`, and all scheme references (including every match the matching
engine produces) use only real existing scheme ids. There is NO `rural-innovation-center`
scheme; references to a "Rural Innovation Center" map to the real `grassroot-innovation`
scheme. All CSR aggregate figures and all Idea Bank seed examples are synthetic,
deterministic (hash-seeded via the existing `synthetic-prng`, never using `Math.random`
or any time/date source), and visibly labeled illustrative via the existing
`IllustrativeBadge` component.

Type extensions are additive only. Each route targets WCAG 2.1 AA and a 150KB First
Load JS budget. Acceptance criteria follow the EARS format.

## Glossary

### Systems and Components

- **Inclusion_Layer**: The complete set of three routes, their data modules, the
  `IdeaBankContext`, the idea-id generator, the matching engine, the synthetic
  generators, and the additive types defined by this document.
- **Women_Hub**: The public discovery and program route at `/women`.
- **CSR_Hub**: The public discovery route at `/csr`.
- **Idea_Bank**: The grassroots submission and discovery route at `/ideas`.
- **Idea_Bank_Context**: The session-only React provider at
  `src/context/IdeaBankContext.tsx` holding submitted ideas in memory.
- **Idea_Submission_Form**: The single-column submission form on Idea_Bank.
- **Idea_Success_State**: The post-submission confirmation view on Idea_Bank.
- **Public_Ideas_Board**: The discovery board on Idea_Bank listing session and seeded
  ideas.
- **Idea_Id_Generator**: The pure module generating idea identifiers of the form
  `IDEA-YYYY-XXXXXX`.
- **Matching_Engine**: The pure module at `src/lib/idea-scheme-matching.ts` mapping an
  idea to real scheme ids.
- **Synthetic_Women_Founders_Module**: The pure module at
  `src/lib/synthetic-women-founders.ts` generating 6 illustrative founder cards.
- **Synthetic_CSR_Partnerships_Module**: The pure module at
  `src/lib/synthetic-csr-partnerships.ts` generating 6 illustrative partnership cards.
- **Synthetic_NGO_Partners_Module**: The pure module at
  `src/lib/synthetic-ngo-partners.ts` generating 3 or more illustrative NGO cards.
- **Synthetic_Ideas_Module**: The pure module at `src/lib/synthetic-ideas.ts`
  generating 12–18 illustrative seed ideas for Public_Ideas_Board.
- **Synthetic_PRNG**: The existing pure hash-seeded generator at
  `src/lib/synthetic-prng.ts` (`seededRng`, `seededInt`, `seededPick`,
  `seededShuffle`).
- **Synthetic_Mentor_Module**: The existing pure mentor directory generator at
  `src/lib/synthetic-mentors.ts`.
- **Illustrative_Badge**: The existing visible marker component at
  `src/components/investors/IllustrativeBadge.tsx`.
- **Scheme_Row**: The existing presentational scheme-row component at
  `src/components/shared/SchemeRow.tsx`.
- **Chart_Barrel**: The existing dynamic chart barrel at
  `src/components/charts/index.ts` (`next/dynamic`, `ssr: false`).
- **Navigation_Data**: The navigation source of truth at `src/data/navigation.ts`.
- **Scheme_Data**: The verified schemes data file at `src/data/schemes.ts`.
- **Types_Module**: The shared type module at `src/types/index.ts`.
- **Root_Layout**: The application layout at `src/app/layout.tsx`.
- **Apply_CTA**: A call-to-action linking to an official Karnataka portal via an
  external `https` link.

### Domain Terms

- **Verified_Data**: Canonical, real Karnataka data that is never fabricated (see
  Verified Data Constants).
- **Synthetic_Data**: Generated, non-real data that is deterministic and visibly
  labeled illustrative.
- **Illustrative_Label**: A visible marker (the Illustrative_Badge) identifying a card,
  section, or field as synthetic preview content.
- **Idea_Submission**: A single grassroots idea record (see Requirement 7 fields).
- **Innovator_Type**: One of `Citizen`, `Student`, `Farmer`, `Researcher`,
  `Rural Innovator`.
- **Idea_Category**: One of `AgriTech`, `HealthTech`, `ClimateTech`, `EdTech`,
  `FinTech`, `Rural Development`, `Manufacturing`, `Other Social Impact`.
- **Idea_Status**: The lifecycle status of an Idea_Submission (e.g. `submitted`).
- **Idea_Id**: A session-scoped identifier of the form `IDEA-YYYY-XXXXXX`.
- **Matched_Scheme**: A real Scheme whose id the Matching_Engine returns for an
  Idea_Submission.
- **Women_Preference_Scheme**: A scheme with an explicit women-founder preference,
  surfaced with a "Women Preference" badge on Women_Hub.
- **CSR_Aligned_Scheme**: A scheme surfaced on CSR_Hub with a "CSR-Aligned" badge.
- **Grassroots_Friendly_Scheme**: A scheme surfaced on Idea_Bank with a "Grassroots
  Friendly" badge.
- **Illustrative_Gender**: An optional, clearly illustrative mentor field used only to
  filter the Women_Hub mentor section; it is NOT a definitive demographic
  classification.
- **Location_Karnataka**: A value of the existing `LocationKarnataka` union.

### Verified Data Constants (canonical, never fabricated)

- **Women_Led_ELEVATE_Share**: 25% of ELEVATE winners are women-led.
- **Founder_Stake_Threshold**: A 51%+ founder stake by a woman unlocks women-founder
  preferences.
- **Women_Employee_Threshold**: A 51%+ women-employee share unlocks Women-Led benefits.
- **Women_Led_Accelerator_Grant**: Up to ₹5 crore grant for Women-Led Accelerators over
  5 years.
- **ELEVATE_Unnati**: The dedicated ELEVATE track, applicable to SC/ST founders
  (including SC/ST women founders).
- **Scheme_Count**: EXACTLY 22 schemes in Scheme_Data.
- **Grassroots_Scheme_Ids**: `grassroot-innovation`, `rd-project-grant`, `nain-2`,
  `rgep`.
- **Women_Relevant_Scheme_Ids (real)**: includes `elevate`, `elevate-unnati`,
  `kitven-fund-5`, `beyond-bengaluru-cluster-fund` among the 22 real schemes.
- **No_Rural_Innovation_Center**: There is NO `rural-innovation-center` scheme id; the
  real id for grassroot/rural support is `grassroot-innovation`.

### States

- **No_Filter_State**: A discovery surface (Women_Hub scheme list, CSR_Hub scheme list,
  or Public_Ideas_Board) with no active filters; all eligible records are displayed.
- **Filtered_State**: A discovery surface with one or more active filters; only matching
  records are displayed.
- **No_Results_State**: A Filtered_State whose active filters match zero records.
- **Form_Invalid_State**: An Idea_Submission_Form with one or more unsatisfied required
  or constraint fields; submission is disabled.
- **Form_Valid_State**: An Idea_Submission_Form whose every required and constraint
  field is satisfied; submission is enabled.
- **Idea_Success_State**: The view shown after a successful submission, displaying the
  Idea_Id and matched schemes.

---

## Requirements

### Foundation and Data

### Requirement 1: Additive Type Definitions

**User Story:** As a developer, I want the Inclusion_Layer types defined additively in
the shared Types_Module, so that the three routes and the Idea_Bank_Context share one
type-safe contract without altering existing types.

#### Acceptance Criteria

1. THE Types_Module SHALL define an `IdeaSubmission` interface containing the fields
   `id`, `innovatorName`, `innovatorEmail`, `innovatorAge`, `innovatorType`,
   `ideaTitle`, `ideaCategory`, `ideaSummary`, `problemStatement`, `proposedSolution`,
   `location`, `submittedAt`, `status`, `matchedSchemeIds`, and `ideaId`.
2. THE Types_Module SHALL type `IdeaSubmission.innovatorType` as the `InnovatorType`
   union, `IdeaSubmission.ideaCategory` as the `IdeaCategory` union,
   `IdeaSubmission.status` as the `IdeaStatus` union, and `IdeaSubmission.location` as
   the existing `LocationKarnataka` union.
3. THE Types_Module SHALL type `IdeaSubmission.submittedAt` as an ISO 8601 string and
   `IdeaSubmission.matchedSchemeIds` as an array of scheme id strings.
4. THE Types_Module SHALL define the `InnovatorType` union as exactly `Citizen`,
   `Student`, `Farmer`, `Researcher`, and `Rural Innovator`.
5. THE Types_Module SHALL define the `IdeaCategory` union as exactly `AgriTech`,
   `HealthTech`, `ClimateTech`, `EdTech`, `FinTech`, `Rural Development`,
   `Manufacturing`, and `Other Social Impact`.
6. THE Types_Module SHALL define an `IdeaStatus` union that includes a `submitted`
   member.
7. THE Types_Module SHALL define an `IdeaBankContextValue` interface declaring the
   context state and mutators consumed by the Idea_Bank route.
8. THE Types_Module SHALL add every Inclusion_Layer type as a new declaration WITHOUT
   modifying or removing any existing exported type.

### Requirement 2: Idea Identifier Generator

**User Story:** As a developer, I want a pure idea-id generator, so that each
Idea_Submission receives a readable, unambiguous, session-scoped identifier.

#### Acceptance Criteria

1. WHEN the Idea_Id_Generator is invoked, THE Idea_Id_Generator SHALL return a string
   of the form `IDEA-YYYY-XXXXXX`, where `YYYY` is a four-digit year and `XXXXXX` is a
   six-character suffix.
2. THE Idea_Id_Generator SHALL draw every suffix character from an alphabet that
   excludes the ambiguous characters `O`, `0`, `I`, and `1`.
3. WHEN the Idea_Id_Generator is invoked with a given random source and year, THE
   Idea_Id_Generator SHALL produce the same identifier for the same inputs.
4. THE Idea_Id_Generator SHALL be a pure module that performs no React calls, no I/O,
   and no network access.
5. WHERE a random source returns a value outside the half-open interval `[0, 1)`, THE
   Idea_Id_Generator SHALL clamp the derived index to a valid alphabet position.

### Requirement 3: Idea Bank Context Lifecycle

**User Story:** As a grassroots innovator, I want my submitted ideas held for the
duration of my session, so that I can view them and their matches without any account
or server.

#### Acceptance Criteria

1. THE Idea_Bank_Context SHALL hold its state in in-memory React state ONLY, performing
   no `localStorage`, `sessionStorage`, cookie, `indexedDB`, `fetch`, or other I/O.
2. WHEN the Idea_Bank_Context provider mounts, THE Idea_Bank_Context SHALL initialize
   the `ideas` array to empty.
3. WHEN the page is refreshed, THE Idea_Bank_Context SHALL reset the `ideas` array to
   empty.
4. WHEN `submitIdea` is called with a draft Idea_Submission, THE Idea_Bank_Context
   SHALL generate an Idea_Id, run the Matching_Engine to populate `matchedSchemeIds`,
   stamp `submittedAt`, set `status` to `submitted`, and append the completed
   Idea_Submission to the `ideas` array.
5. WHEN `updateIdeaStatus` is called with an existing idea id and a new Idea_Status,
   THE Idea_Bank_Context SHALL change only the matching idea's `status` and preserve
   every other idea unchanged.
6. WHEN `removeIdea` is called with an existing idea id, THE Idea_Bank_Context SHALL
   remove only the matching idea from the `ideas` array.
7. WHEN `getMatchedIdeas` is read, THE Idea_Bank_Context SHALL return the derived set
   of session ideas that have one or more matched scheme ids.
8. WHERE a consumer calls `useOptionalIdeaBank` outside an Idea_Bank_Context provider,
   THE Idea_Bank_Context SHALL return a default value with an empty `ideas` array and
   no-op mutators rather than throwing.
9. THE Root_Layout SHALL wrap the application tree with the Idea_Bank_Context provider
   additively, preserving the existing provider composition order.

### Requirement 4: Idea-to-Scheme Matching Engine

**User Story:** As a grassroots innovator, I want my idea matched to relevant Karnataka
schemes, so that I receive concrete, real funding pathways for my idea.

#### Acceptance Criteria

1. WHEN `matchIdeaToSchemes` is called with an Idea_Submission, THE Matching_Engine
   SHALL return an ordered array of at most 5 scheme ids.
2. THE Matching_Engine SHALL return only scheme ids that exist in Scheme_Data.
3. THE Matching_Engine SHALL return an array containing no duplicate scheme ids.
4. WHEN the Idea_Category is `AgriTech`, THE Matching_Engine SHALL include
   `grassroot-innovation` and `rd-project-grant` in the returned ids.
5. WHEN the Idea_Category is `Rural Development` AND the location is not in Bengaluru,
   THE Matching_Engine SHALL include `beyond-bengaluru-cluster-fund` in the returned
   ids.
6. WHEN the Idea_Category is `Rural Development` AND the Innovator_Type is `Student`,
   THE Matching_Engine SHALL include `nain-2` in the returned ids.
7. WHEN the Idea_Category is `Rural Development` AND neither the not-in-Bengaluru nor
   the Student condition applies, THE Matching_Engine SHALL include
   `grassroot-innovation` in the returned ids.
8. WHEN the Innovator_Type is `Student`, THE Matching_Engine SHALL include `nain-2`,
   and SHALL order `nain-2` ahead of weaker matches.
9. WHEN the Innovator_Type is `Student` AND the `innovatorAge` is at most 30, THE
   Matching_Engine SHALL include `rgep` in the returned ids.
10. WHEN the Innovator_Type is `Rural Innovator`, THE Matching_Engine SHALL include
    `grassroot-innovation`, and SHALL order `grassroot-innovation` ahead of weaker
    matches.
11. WHEN `matchIdeaToSchemes` is called twice with equal Idea_Submission inputs, THE
    Matching_Engine SHALL return identical ordered arrays.
12. THE Matching_Engine SHALL be a pure module that performs no React calls, no I/O, no
    network access, and no use of `Math.random` or any time or date source.
13. IF an Idea_Submission matches no pattern rule, THEN THE Matching_Engine SHALL return
    an array, which MAY be empty, containing only valid scheme ids.

### Requirement 5: Synthetic Data Generators

**User Story:** As a developer, I want deterministic synthetic generators for founders,
partnerships, NGO partners, and seed ideas, so that the surfaces are populated without
real data and remain byte-stable across reloads.

#### Acceptance Criteria

1. THE Synthetic_Women_Founders_Module SHALL generate exactly 6 founder records, each
   with a name, company, sector, stage, one-line pitch, and initials avatar.
2. THE Synthetic_CSR_Partnerships_Module SHALL generate exactly 6 partnership records,
   each with a partner name, a partner type drawn from `Corporate Foundation`,
   `Family Office`, `Public Sector Undertaking`, and `NGO Partner`, a focus area, a
   partnership scale in crore, and a partnership type.
3. THE Synthetic_NGO_Partners_Module SHALL generate at least 3 NGO partner records,
   each with a name, focus, geographic reach, and partnership type.
4. THE Synthetic_Ideas_Module SHALL generate between 12 and 18 seed Idea_Submission
   records inclusive, each populated with all fields the Public_Ideas_Board renders.
5. THE Synthetic_Women_Founders_Module, Synthetic_CSR_Partnerships_Module,
   Synthetic_NGO_Partners_Module, and Synthetic_Ideas_Module SHALL derive every value
   solely through the Synthetic_PRNG seeded by stable string keys.
6. THE Synthetic_Women_Founders_Module, Synthetic_CSR_Partnerships_Module,
   Synthetic_NGO_Partners_Module, and Synthetic_Ideas_Module SHALL use no `Math.random`,
   no `Date`, no `Date.now`, no `performance.now`, and no other ambient or
   time-dependent input.
7. WHEN any synthetic generator is invoked more than once, THE generator SHALL return
   deep-equal output on every call.
8. WHERE a synthetic generator references a scheme, THE generator SHALL reference only
   real scheme ids that exist in Scheme_Data.

### Requirement 6: Illustrative Mentor Gender Extension

**User Story:** As a Women_Hub visitor, I want to see illustrative women mentors, so
that I can find relevant mentorship, while understanding the labeling is illustrative
and not a definitive demographic classification.

#### Acceptance Criteria

1. THE Types_Module SHALL add an optional `illustrativeGender` field to the
   `MentorProfile` interface WITHOUT making any existing `MentorProfile` field required
   or removed.
2. WHEN the Synthetic_Mentor_Module generates the mentor directory, THE
   Synthetic_Mentor_Module SHALL assign `illustrativeGender` from a deterministic
   distribution producing between 35% and 40% women mentors.
3. THE Synthetic_Mentor_Module SHALL derive `illustrativeGender` solely through the
   Synthetic_PRNG, using no `Math.random` and no time or date source.
4. WHEN the Women_Hub mentor section renders, THE Women_Hub SHALL filter the mentor
   directory to mentors whose `illustrativeGender` marks them as illustrative-women
   mentors.
5. THE Women_Hub mentor section SHALL frame the `illustrativeGender` filter with copy
   stating the labeling is illustrative and not a definitive demographic
   classification.

---

### Route 1: Women Founders Hub (`/women`)

### Requirement 7: Women Hub Hero Strip

**User Story:** As a prospective woman founder, I want an institutional hero that names
the verified women-founder statistic and the accelerator program, so that I immediately
understand Karnataka's commitment and where to go next.

#### Acceptance Criteria

1. THE Women_Hub SHALL render a hero strip with `py-12` vertical rhythm and a `bg-dark`
   background as the first section.
2. THE Women_Hub hero strip SHALL display an institutional headline and a subhead that
   names the verified Women_Led_ELEVATE_Share statistic of 25% women-led ELEVATE
   winners and the Women-Led Accelerator program.
3. THE Women_Hub hero strip SHALL render a "Browse Women-Specific Schemes" call-to-action
   linking to `/schemes`.
4. THE Women_Hub hero strip SHALL render an "Explore Women-Led Accelerators"
   call-to-action linking to the on-page Women-Led Accelerator anchor.

### Requirement 8: Women Hub Verified Statistics Row

**User Story:** As a prospective woman founder, I want the verified policy provisions
presented as a statistics row, so that I can trust the numbers are from the Karnataka
Startup Policy.

#### Acceptance Criteria

1. THE Women_Hub SHALL render a verified statistics row presenting the
   Women_Led_ELEVATE_Share of 25% women-led ELEVATE winners.
2. THE Women_Hub statistics row SHALL present the Founder_Stake_Threshold stating that a
   51%+ founder stake unlocks women-founder preferences.
3. THE Women_Hub statistics row SHALL present the Women_Employee_Threshold stating that
   a 51%+ women-employee share unlocks Women-Led benefits.
4. THE Women_Hub statistics row SHALL present the Women_Led_Accelerator_Grant of up to
   ₹5 crore over 5 years.
5. THE Women_Hub statistics row SHALL present ELEVATE_Unnati as the dedicated track for
   SC/ST women founders.
6. THE Women_Hub statistics row SHALL present every statistic as Verified_Data without
   an Illustrative_Label.
7. THE Women_Hub SHALL give the 25% Women_Led_ELEVATE_Share statistic additional
   typographic weight relative to surrounding body text.

### Requirement 9: Women Hub Why-Karnataka Editorial

**User Story:** As a prospective woman founder, I want a concise editorial explaining
why Karnataka supports women founders, so that I understand the structural advantages.

#### Acceptance Criteria

1. THE Women_Hub SHALL render a "Why Karnataka for women founders" editorial section as
   a three-column layout.
2. THE Women_Hub why-Karnataka section SHALL present a column on the Founder_Stake_
   Threshold of 51%+.
3. THE Women_Hub why-Karnataka section SHALL present a column on the Women_Employee_
   Threshold of 51%+.
4. THE Women_Hub why-Karnataka section SHALL present a column on dedicated accelerator
   capital naming the ₹5 crore over 5 years grant and referencing KITVEN, Beyond
   Bengaluru, and ELEVATE Unnati.

### Requirement 10: Women Hub Women-Relevant Schemes

**User Story:** As a prospective woman founder, I want a filterable list of
women-relevant schemes, so that I can find the schemes that apply to me.

#### Acceptance Criteria

1. THE Women_Hub SHALL render a women-relevant schemes list using the Scheme_Row
   pattern.
2. WHERE a scheme is a Women_Preference_Scheme, THE Women_Hub SHALL render a "Women
   Preference" badge on that scheme's row.
3. WHEN a filter is applied to the women-relevant schemes list, THE Women_Hub SHALL
   display only the schemes matching the active filter.
4. IF an active filter matches zero schemes, THEN THE Women_Hub SHALL display a
   no-results message.
5. THE Women_Hub women-relevant schemes section SHALL render a "See All 22 Schemes"
   link to `/schemes`.
6. THE Women_Hub women-relevant schemes list SHALL reference only real scheme ids that
   exist in Scheme_Data.

### Requirement 11: Women Hub Women-Led Accelerator Program

**User Story:** As an incubator operator, I want an editorial overview of the Women-Led
Accelerator program, so that I understand eligibility and how to apply to host a
women-led track.

#### Acceptance Criteria

1. THE Women_Hub SHALL render a Women-Led Accelerator program editorial section
   reachable by the hero anchor.
2. THE Women_Hub accelerator section SHALL present a program overview, eligibility for
   incubators hosting women-led tracks, and expected outcomes.
3. THE Women_Hub accelerator section SHALL render an Apply_CTA linking to an official
   Karnataka portal via an external `https` link.
4. THE Women_Hub accelerator section SHALL present the Women_Led_Accelerator_Grant of
   up to ₹5 crore over 5 years as Verified_Data.

### Requirement 12: Women Hub Featured Founders

**User Story:** As a Women_Hub visitor, I want to see featured women founders, so that I
can see representative examples, understanding they are illustrative.

#### Acceptance Criteria

1. THE Women_Hub SHALL render exactly 6 featured women founder cards from the
   Synthetic_Women_Founders_Module.
2. THE Women_Hub SHALL render each founder card with a name, company, sector, stage,
   one-line pitch, and an initials avatar.
3. THE Women_Hub featured founders section SHALL carry an Illustrative_Label marking
   the founder cards as synthetic preview content.

### Requirement 13: Women Hub Mentors

**User Story:** As a prospective woman founder, I want to see illustrative women
mentors, so that I can find mentorship, with a clear path to the full mentor directory.

#### Acceptance Criteria

1. THE Women_Hub SHALL render exactly 3 mentor cards drawn from the Synthetic_Mentor_
   Module filtered to illustrative-women mentors.
2. THE Women_Hub mentor section SHALL render a "See All Mentors" link to `/mentors`.
3. THE Women_Hub mentor section SHALL carry copy framing the mentor selection as
   illustrative and not a definitive demographic classification.

### Requirement 14: Women Hub Resources

**User Story:** As a Women_Hub visitor, I want curated resources, so that I can reach
the policy framework, the helpdesk, and international programs.

#### Acceptance Criteria

1. THE Women_Hub SHALL render exactly 3 resource cards.
2. THE Women_Hub resources section SHALL render a "Policy Women Framework" card linking
   to `/policies/startup-2025-30`.
3. THE Women_Hub resources section SHALL render a "KITS Women Founders Helpdesk" card
   presenting a helpline and an email address.
4. THE Women_Hub resources section SHALL render an "International Women Founder Programs"
   card linking to `/gia`.

### Requirement 15: Women Hub Get Involved

**User Story:** As a Women_Hub visitor, I want clear get-involved pathways, so that I
can either act as a woman founder or support women founders.

#### Acceptance Criteria

1. THE Women_Hub SHALL render exactly 2 get-involved cards.
2. THE Women_Hub get-involved section SHALL render an "I am a Woman Founder" card with
   links to `/register` and `/schemes`.
3. THE Women_Hub get-involved section SHALL render an "I want to Support Women Founders"
   card with links to `/mentors` and `/investors`.

---

### Route 2: CSR & NGO Hub (`/csr`)

### Requirement 16: CSR Hub Hero Strip

**User Story:** As a CSR team lead, I want an institutional hero that frames a
partnership invitation, so that I understand KITE as a partnership channel rather than a
brochure.

#### Acceptance Criteria

1. THE CSR_Hub SHALL render a hero strip with `py-12` vertical rhythm and a `bg-dark`
   background as the first section.
2. THE CSR_Hub hero strip SHALL display an institutional headline framed as a
   partnership invitation.
3. THE CSR_Hub hero strip SHALL render a "Partner with KITE" call-to-action linking to
   the on-page partnership anchor.
4. THE CSR_Hub hero strip SHALL render a "Browse CSR-Aligned Programs" call-to-action
   linking to the filtered CSR-aligned schemes.

### Requirement 17: CSR Hub CSR Landscape

**User Story:** As a CSR team lead, I want an editorial CSR landscape, so that I
understand the mandate context, Karnataka focus areas, and partnership pathways.

#### Acceptance Criteria

1. THE CSR_Hub SHALL render a CSR landscape editorial section as a three-column layout.
2. THE CSR_Hub CSR landscape section SHALL present a CSR Mandate Context column, and
   SHALL label any Karnataka CSR share figure as an illustrative range.
3. THE CSR_Hub CSR landscape section SHALL present a Karnataka Focus Areas column naming
   rural development, women empowerment, education, healthcare, and climate.
4. THE CSR_Hub CSR landscape section SHALL present a Partnership Pathways column naming
   direct grant, matched programs, and ecosystem partnerships.

### Requirement 18: CSR Hub CSR-Aligned Programs

**User Story:** As a CSR team lead, I want a filterable list of CSR-aligned programs, so
that I can identify programs to fund.

#### Acceptance Criteria

1. THE CSR_Hub SHALL render a CSR-aligned programs list using the Scheme_Row pattern.
2. THE CSR_Hub SHALL render a "CSR-Aligned" badge on each scheme in the CSR-aligned
   programs list.
3. THE CSR_Hub CSR-aligned programs list SHALL include `grassroot-innovation`,
   `elevate-unnati`, `nain-2`, and `rd-project-grant`.
4. THE CSR_Hub CSR-aligned programs list SHALL reference only real scheme ids that exist
   in Scheme_Data.
5. WHEN a filter is applied to the CSR-aligned programs list, THE CSR_Hub SHALL display
   only the schemes matching the active filter.
6. IF an active filter matches zero schemes, THEN THE CSR_Hub SHALL display a
   no-results message.

### Requirement 19: CSR Hub Featured Partnerships

**User Story:** As a CSR team lead, I want featured partnership examples, so that I can
see representative partnership models, understanding they are illustrative.

#### Acceptance Criteria

1. THE CSR_Hub SHALL render exactly 6 featured partnership cards from the
   Synthetic_CSR_Partnerships_Module.
2. THE CSR_Hub SHALL render each partnership card with a partner name, a partner type, a
   focus area, a partnership scale in crore, and a partnership type.
3. THE CSR_Hub featured partnerships section SHALL render each partner type as one of
   `Corporate Foundation`, `Family Office`, `Public Sector Undertaking`, or
   `NGO Partner`.
4. THE CSR_Hub featured partnerships section SHALL carry an Illustrative_Label marking
   the partnership cards as synthetic preview content.

### Requirement 20: CSR Hub NGO Ecosystem Partners

**User Story:** As an NGO partner, I want to see NGO ecosystem partners, so that I can
see the kinds of organizations involved, understanding they are illustrative.

#### Acceptance Criteria

1. THE CSR_Hub SHALL render at least 3 NGO partner cards from the
   Synthetic_NGO_Partners_Module in a three-column layout.
2. THE CSR_Hub SHALL render each NGO partner card with a name, focus, geographic reach,
   and partnership type.
3. THE CSR_Hub NGO ecosystem partners section SHALL carry an Illustrative_Label marking
   the NGO cards as synthetic preview content.

### Requirement 21: CSR Hub Impact Metrics

**User Story:** As a CSR team lead, I want headline impact metrics, so that I can gauge
ecosystem scale, understanding the figures are illustrative.

#### Acceptance Criteria

1. THE CSR_Hub SHALL render exactly 3 large impact stat cards presenting total CSR
   capital in crore, startups supported, and beneficiaries reached.
2. THE CSR_Hub impact metrics section SHALL derive every figure from the
   Synthetic_PRNG, using no `Math.random` and no time or date source.
3. THE CSR_Hub impact metrics section SHALL carry an Illustrative_Label marking the
   metrics as synthetic preview content.

### Requirement 22: CSR Hub How To Partner

**User Story:** As a CSR team lead, I want a clear partnership pathway with contact and
a downloadable brief, so that I can begin a partnership.

#### Acceptance Criteria

1. THE CSR_Hub SHALL render a "How to partner" editorial section as a three-step layout
   presenting "Connect with KDEM Partnership Team", "Identify Aligned Programs", and
   "Formalize Partnership Agreement".
2. THE CSR_Hub how-to-partner section SHALL render a "Contact KDEM Partnership Team"
   call-to-action as a `mailto` link.
3. WHEN a visitor activates the "Download CSR Partnership Brief" control, THE CSR_Hub
   SHALL generate the brief client-side as a `Blob` download without any network
   request.

### Requirement 23: CSR Hub Resources

**User Story:** As a CSR team lead, I want curated resources, so that I can reach the
CSR framework, MoU templates, and the CSR team.

#### Acceptance Criteria

1. THE CSR_Hub SHALL render exactly 3 resource cards.
2. THE CSR_Hub resources section SHALL render a "Karnataka CSR Framework" card.
3. THE CSR_Hub resources section SHALL render a "Sample MoU Templates" card.
4. THE CSR_Hub resources section SHALL render a "Contact CSR Team" card.

---

### Route 3: Idea Bank (`/ideas`)

### Requirement 24: Idea Bank Hero Strip

**User Story:** As a grassroots innovator, I want a hero that frames idea submission, so
that I know I can submit an idea and browse existing ideas.

#### Acceptance Criteria

1. THE Idea_Bank SHALL render a hero strip with `py-12` vertical rhythm and a `bg-dark`
   background as the first section.
2. THE Idea_Bank hero strip SHALL display a grassroots-framed headline.
3. THE Idea_Bank hero strip SHALL render a "Submit Your Idea" call-to-action linking to
   the on-page form anchor.
4. THE Idea_Bank hero strip SHALL render a "Browse Recent Ideas" call-to-action linking
   to the on-page board anchor.

### Requirement 25: Idea Bank How It Works

**User Story:** As a grassroots innovator, I want a short how-it-works explainer, so
that I understand the submit, match, and apply steps.

#### Acceptance Criteria

1. THE Idea_Bank SHALL render a "How it works" editorial section as a three-column
   layout presenting "Submit Your Idea", "Get Matched to Programs", and "Apply for
   Support".

### Requirement 26: Idea Submission Form Fields and Validation

**User Story:** As a grassroots innovator, I want a guided, validated submission form,
so that I can submit a complete idea with confidence.

#### Acceptance Criteria

1. THE Idea_Submission_Form SHALL render as a single column with a `max-w-3xl`
   constraint.
2. THE Idea_Submission_Form SHALL render the fields `innovatorName`, `innovatorEmail`,
   `innovatorAge`, `innovatorType`, `ideaTitle`, `ideaCategory`, `ideaSummary`,
   `problemStatement`, `proposedSolution`, and `location`.
3. THE Idea_Submission_Form SHALL render `innovatorType` as a required radio group with
   the options `Citizen`, `Student`, `Farmer`, `Researcher`, and `Rural Innovator`.
4. THE Idea_Submission_Form SHALL render `ideaCategory` as a required dropdown with the
   options `AgriTech`, `HealthTech`, `ClimateTech`, `EdTech`, `FinTech`,
   `Rural Development`, `Manufacturing`, and `Other Social Impact`.
5. THE Idea_Submission_Form SHALL render `location` as a required dropdown of
   `LocationKarnataka` values.
6. THE Idea_Submission_Form SHALL require `innovatorName`, `innovatorEmail`, and
   `innovatorAge`, and SHALL accept `innovatorAge` as a numeric value.
7. THE Idea_Submission_Form SHALL require `ideaTitle` to have at least 5 characters.
8. THE Idea_Submission_Form SHALL require `ideaSummary` to have between 50 and 500
   characters inclusive.
9. THE Idea_Submission_Form SHALL require `problemStatement` to have between 50 and 1000
   characters inclusive.
10. THE Idea_Submission_Form SHALL require `proposedSolution` to have between 50 and
    1000 characters inclusive.
11. WHILE the Idea_Submission_Form is in Form_Invalid_State, THE Idea_Submission_Form
    SHALL disable the submit control.
12. WHEN every required and constraint field is satisfied, THE Idea_Submission_Form
    SHALL enable the submit control.

### Requirement 27: Idea Submission Action

**User Story:** As a grassroots innovator, I want submitting my idea to assign an
identifier, match schemes, and confirm, so that I receive an immediate, actionable
result.

#### Acceptance Criteria

1. WHEN the submit control is activated in Form_Valid_State, THE Idea_Bank SHALL call
   `submitIdea` with the form values.
2. WHEN `submitIdea` completes, THE Idea_Bank SHALL assign an Idea_Id of the form
   `IDEA-YYYY-XXXXXX`.
3. WHEN `submitIdea` completes, THE Idea_Bank SHALL populate `matchedSchemeIds` from the
   Matching_Engine.
4. WHEN `submitIdea` completes, THE Idea_Bank SHALL transition to Idea_Success_State.

### Requirement 28: Idea Success State

**User Story:** As a grassroots innovator, I want a confirmation showing my idea
identifier and matched schemes, so that I can record my identifier and act on my
matches.

#### Acceptance Criteria

1. WHILE in Idea_Success_State, THE Idea_Bank SHALL display a green check, the headline
   "Idea Submitted", and the assigned Idea_Id prominently.
2. THE Idea_Success_State SHALL render a "Copy ID" control that copies the Idea_Id.
3. THE Idea_Success_State SHALL render a matched scheme card for each matched scheme,
   each showing the scheme name, a why-it-matched reason, the maximum benefit, and a
   "View Scheme" link.
4. THE Idea_Success_State SHALL render an "Apply to Recommended Schemes" call-to-action
   and a "Submit Another Idea" call-to-action.
5. IF the Idea_Submission has zero matched schemes, THEN THE Idea_Success_State SHALL
   render the Idea_Id, the "Apply to Recommended Schemes" call-to-action, and the
   "Submit Another Idea" call-to-action, and SHALL display a no-matches message in place
   of the matched scheme cards.
6. WHEN "Submit Another Idea" is activated, THE Idea_Bank SHALL return to the
   Idea_Submission_Form.

### Requirement 29: Public Ideas Board

**User Story:** As a visitor, I want to browse submitted and seeded ideas with filters
and sorting, so that I can explore grassroots ideas, with my own submissions surfaced
first.

#### Acceptance Criteria

1. THE Public_Ideas_Board SHALL display the union of session-submitted ideas and the
   12–18 seed ideas from the Synthetic_Ideas_Module.
2. THE Public_Ideas_Board SHALL render each idea card with the idea title, an
   Idea_Category badge, an Innovator_Type badge, the location, a relative timestamp, the
   summary truncated to 150 characters, and a "Read More" control.
3. THE Public_Ideas_Board SHALL carry an Illustrative_Label marking the seeded ideas as
   synthetic preview content.
4. THE Public_Ideas_Board SHALL provide filters by category, innovator type, and
   location.
5. THE Public_Ideas_Board SHALL sort by most-recent by default.
6. WHEN one or more filters are applied, THE Public_Ideas_Board SHALL display only the
   ideas matching the active filters.
7. IF the active filters match zero ideas, THEN THE Public_Ideas_Board SHALL display a
   no-results message while retaining the most-recent default sort order.
8. WHILE the session has one or more submitted ideas, THE Public_Ideas_Board SHALL pin
   the visitor's own session submissions to the top and mark each with a "Yours" badge.

### Requirement 30: Idea Categories Spotlight

**User Story:** As a grassroots innovator, I want a category spotlight, so that I can
explore categories and start a submission pre-filled to my chosen category.

#### Acceptance Criteria

1. THE Idea_Bank SHALL render an idea categories spotlight as exactly 8 cards in a
   four-by-two grid, one card per Idea_Category.
2. THE Idea_Bank SHALL render each category card with a Lucide icon, the category name,
   and a count of typically-matched schemes.
3. WHEN a category card's "Submit in This Category" control is activated, THE Idea_Bank
   SHALL scroll to the Idea_Submission_Form and pre-fill the `ideaCategory` field with
   that category.

### Requirement 31: Idea Bank Featured Matched Schemes

**User Story:** As a grassroots innovator, I want featured grassroots-friendly schemes,
so that I can see relevant real schemes directly.

#### Acceptance Criteria

1. THE Idea_Bank SHALL render featured matched schemes using the Scheme_Row pattern for
   `grassroot-innovation`, `nain-2`, `rgep`, and `rd-project-grant`.
2. THE Idea_Bank SHALL render a "Grassroots Friendly" badge on each featured matched
   scheme.
3. THE Idea_Bank featured matched schemes section SHALL reference only real scheme ids
   that exist in Scheme_Data.

### Requirement 32: Idea Bank Resources

**User Story:** As a grassroots innovator, I want curated resources, so that I can reach
the grassroot program guide, the student program, and the innovation cell.

#### Acceptance Criteria

1. THE Idea_Bank SHALL render exactly 3 resource cards.
2. THE Idea_Bank resources section SHALL render a "Grassroot Innovation Program Guide"
   card.
3. THE Idea_Bank resources section SHALL render a "NAIN 2.0 for Students" card.
4. THE Idea_Bank resources section SHALL render a "Contact KITS Innovation Cell" card
   presenting a helpline and an email address.

---

### Cross-Cutting Non-Functional Requirements

### Requirement 33: Frontend-Only and Session-Only Operation

**User Story:** As a portal operator, I want the Inclusion_Layer to remain
frontend-only and session-only, so that it carries no backend, persistence, or network
dependency.

#### Acceptance Criteria

1. THE Inclusion_Layer SHALL perform no backend call, no database access, no API call,
   and no `fetch` or other network request.
2. THE Inclusion_Layer SHALL perform no persistence via `localStorage`,
   `sessionStorage`, cookies, or `indexedDB`.
3. THE Idea_Bank_Context SHALL hold all submitted ideas in in-memory React state only.
4. WHERE a download is offered, THE Inclusion_Layer SHALL produce it as a client-side
   `Blob` download.

### Requirement 34: Performance Budget

**User Story:** As a visitor, I want each Inclusion_Layer route to load efficiently, so
that pages remain fast on modest connections.

#### Acceptance Criteria

1. THE Women_Hub, CSR_Hub, and Idea_Bank SHALL each have a First Load JS at most 150KB.
2. WHERE a route renders a chart, THE route SHALL load the chart only via the
   Chart_Barrel.

### Requirement 35: Accessibility (WCAG 2.1 AA)

**User Story:** As a visitor using assistive technology, I want the Inclusion_Layer to
meet WCAG 2.1 AA, so that I can perceive and operate every surface.

#### Acceptance Criteria

1. THE Idea_Submission_Form SHALL associate every field with a programmatic label and a
   programmatic description.
2. WHEN a validation error is present, THE Idea_Submission_Form SHALL announce the error
   through an `aria-live` polite region.
3. WHILE the Idea_Submission_Form is in Form_Invalid_State, THE Idea_Submission_Form
   SHALL mark the submit control with `aria-disabled`.
4. WHEN the Idea_Bank transitions to Idea_Success_State, THE Idea_Bank SHALL announce
   the Idea_Id and the matched-scheme count through an `aria-live` region.
5. THE Public_Ideas_Board SHALL render its ideas as a semantic list.
6. THE Public_Ideas_Board filters and the scheme-list filters SHALL be operable by
   keyboard.
7. THE Women_Hub mentor section SHALL frame the `illustrativeGender` filter as
   illustrative and not as a definitive demographic classification.

### Requirement 36: Visual Discipline

**User Story:** As a visitor, I want the Inclusion_Layer to look institutional and
consistent with the existing portal, so that the surfaces read as credible government
pages.

#### Acceptance Criteria

1. THE Inclusion_Layer SHALL use an institutional visual style with no gradients, no
   decorative blobs, no emoji, no glassmorphism, and no glow effects.
2. THE Inclusion_Layer SHALL use only Lucide icons.
3. THE Inclusion_Layer SHALL render cards with `rounded-xl`, `shadow-sm`, and a border.
4. THE Inclusion_Layer SHALL use `py-16` with `md:py-24` for content sections and
   `py-8` or `py-12` for header strips.
5. THE Inclusion_Layer SHALL constrain content width with `max-w-7xl`.
6. THE Inclusion_Layer SHALL set headings in Plus Jakarta Sans and body text in Inter,
   and SHALL not use the `text-h4` class.
7. THE Women_Hub SHALL give the verified 25% Women_Led_ELEVATE_Share statistic
   additional typographic weight.

### Requirement 37: Navigation and Footer Integration

**User Story:** As a visitor, I want the three routes reachable from navigation and the
footer, so that I can discover the Inclusion_Layer from anywhere on the portal.

#### Acceptance Criteria

1. THE Navigation_Data SHALL expose "Women Founders" and "NGOs & CSR" entries under the
   "For Stakeholders" group linking to `/women` and `/csr`.
2. THE Navigation_Data SHALL expose an "Idea Bank" entry under the "Connect" group
   linking to `/ideas`.
3. THE Inclusion_Layer SHALL add footer entries for the Women_Hub, CSR_Hub, and
   Idea_Bank routes.
4. THE Inclusion_Layer SHALL integrate navigation and footer entries additively without
   removing or altering existing entries.

### Requirement 38: Verified-Data Integrity

**User Story:** As a portal operator, I want all verified figures reproduced exactly and
all non-verified figures labeled illustrative, so that the portal never misrepresents
data.

#### Acceptance Criteria

1. THE Inclusion_Layer SHALL reproduce the verified women-founder constants exactly: 25%
   women-led ELEVATE winners, the 51% founder-stake threshold, the 51% women-employee
   threshold, and the ₹5 crore Women-Led Accelerator grant over 5 years.
2. THE Inclusion_Layer SHALL reference only the 22 real scheme ids that exist in
   Scheme_Data and SHALL NOT reference a `rural-innovation-center` scheme id.
3. WHERE a reference names a "Rural Innovation Center", THE Inclusion_Layer SHALL map
   that reference to the `grassroot-innovation` scheme.
4. THE Inclusion_Layer SHALL mark every CSR aggregate figure and every Idea_Bank seed
   idea with an Illustrative_Label.
5. THE Inclusion_Layer SHALL present every verified figure without an Illustrative_Label.
