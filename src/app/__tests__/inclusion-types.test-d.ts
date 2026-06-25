// Feature: kite-inclusion-grassroots — Type-compile guard (Task 1.2)
//
// This is a COMPILE-TIME type-level assertion file. It carries no runtime test
// framework dependency and is intentionally named `*.test-d.ts` (the type-test
// convention). It is validated by `npx tsc --noEmit` — tsconfig's
// `include` globs pick it up, so any shape regression in the inclusion-layer
// types (or any change to the reused MentorProfile / LocationKarnataka / Scheme
// exports) becomes a hard compile error.
//
// What it proves:
//  1. The new inclusion-layer types from `@/types` exist and are importable.
//  2. A valid sample literal of every new interface/type compiles (shapes intact).
//  3. `IdeaSubmissionDraft` is assignable into a completed `IdeaSubmission` by
//     spreading the draft and adding id / ideaId / submittedAt / status /
//     matchedSchemeIds (the fields the context/engine fill in).
//  4. `MentorProfile.illustrativeGender` is OPTIONAL — a MentorProfile literal
//     that omits it still compiles.
//  5. The prior exports (`MentorProfile`, `LocationKarnataka`, `Scheme`) are
//     UNCHANGED and still usable, asserted both by construction and by a
//     structural type-equality check.
//
// Validates: Requirements 1.1, 1.8, 6.1

import {
  // New idea enumerations
  type InnovatorType,
  INNOVATOR_TYPES,
  type IdeaCategory,
  IDEA_CATEGORIES,
  type IdeaStatus,
  // New idea submission shapes
  type IdeaSubmission,
  type IdeaSubmissionDraft,
  type IdeaBankContextValue,
  // New illustrative-gender extension
  type IllustrativeGender,
  // New synthetic card shapes
  type WomenFounderCard,
  type CsrPartnerType,
  CSR_PARTNER_TYPES,
  type CsrPartnership,
  type NgoPartner,
  type CsrImpactMetric,
  // New board filter state
  type IdeaBoardFilters,
  // Existing exports that MUST remain unchanged and reused (never redefined)
  type MentorProfile,
  type LocationKarnataka,
  type Scheme,
} from '@/types';

// ---------------------------------------------------------------------------
// Type-level assertion helpers (no runtime cost).
// `Expect<Equal<A, B>>` resolves to `true` only when A and B are identical;
// otherwise it is a compile error.
// ---------------------------------------------------------------------------
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

// ===========================================================================
// 1. New idea enumerations (Req 1.4, 1.5, 1.6)
// ===========================================================================

// InnovatorType union is exactly the five canonical values.
type _InnovatorTypeShape = Expect<
  Equal<InnovatorType, 'Citizen' | 'Student' | 'Farmer' | 'Researcher' | 'Rural Innovator'>
>;

// IdeaCategory union is exactly the eight canonical values.
type _IdeaCategoryShape = Expect<
  Equal<
    IdeaCategory,
    | 'AgriTech' | 'HealthTech' | 'ClimateTech' | 'EdTech' | 'FinTech'
    | 'Rural Development' | 'Manufacturing' | 'Other Social Impact'
  >
>;

// IdeaStatus union is exactly the three lifecycle values.
type _IdeaStatusShape = Expect<Equal<IdeaStatus, 'submitted' | 'matched' | 'archived'>>;

export const sampleInnovatorType: InnovatorType = 'Rural Innovator';
export const sampleInnovatorTypes: readonly InnovatorType[] = INNOVATOR_TYPES;

export const sampleIdeaCategory: IdeaCategory = 'AgriTech';
export const sampleIdeaCategories: readonly IdeaCategory[] = IDEA_CATEGORIES;

export const sampleIdeaStatus: IdeaStatus = 'submitted';

// ===========================================================================
// 2. Idea submission + draft, and draft → submission assignability (Req 1.1)
// ===========================================================================

export const sampleIdeaSubmissionDraft: IdeaSubmissionDraft = {
  innovatorName: 'Asha Rao',
  innovatorEmail: 'asha@example.org',
  innovatorAge: 29,
  innovatorType: 'Farmer',
  ideaTitle: 'Low-cost soil moisture sensor',
  ideaCategory: 'AgriTech',
  ideaSummary: 'An illustrative one-line summary of the proposed idea.',
  problemStatement: 'A declarative description of the problem being addressed.',
  proposedSolution: 'A declarative description of the proposed solution.',
  location: 'Mysuru',
};

// `IdeaSubmissionDraft` is assignable into a completed `IdeaSubmission` by
// spreading the draft and supplying the five engine/context-filled fields.
export const sampleIdeaSubmission: IdeaSubmission = {
  ...sampleIdeaSubmissionDraft,
  id: 'IDEA-2025-ABCDEF',
  ideaId: 'IDEA-2025-ABCDEF',
  submittedAt: '2025-01-15T09:30:00.000Z',
  status: 'submitted',
  matchedSchemeIds: ['grassroot-innovation', 'rd-project-grant'],
};

// The Omit relationship between draft and submission is exactly the documented
// five fields (structural equality check).
type _DraftShape = Expect<
  Equal<
    IdeaSubmissionDraft,
    Omit<IdeaSubmission, 'id' | 'ideaId' | 'submittedAt' | 'status' | 'matchedSchemeIds'>
  >
>;

// ===========================================================================
// 3. Idea Bank context contract (Req 1.7)
// ===========================================================================

export const sampleIdeaBankContextValue: IdeaBankContextValue = {
  ideas: [sampleIdeaSubmission],
  submitIdea: (draft: IdeaSubmissionDraft): IdeaSubmission => ({
    ...draft,
    id: 'IDEA-2025-ZZZZZZ',
    ideaId: 'IDEA-2025-ZZZZZZ',
    submittedAt: '2025-02-01T00:00:00.000Z',
    status: 'submitted',
    matchedSchemeIds: [],
  }),
  updateIdeaStatus: (_ideaId: string, _status: IdeaStatus): void => undefined,
  removeIdea: (_ideaId: string): void => undefined,
  getMatchedIdeas: (): IdeaSubmission[] => [sampleIdeaSubmission],
};

// ===========================================================================
// 4. Illustrative-gender extension is OPTIONAL on MentorProfile (Req 6.1)
// ===========================================================================

// IllustrativeGender is the three-state union (incl. `undefined`).
type _IllustrativeGenderShape = Expect<Equal<IllustrativeGender, 'woman' | 'man' | undefined>>;

export const sampleIllustrativeGender: IllustrativeGender = 'woman';

// A MentorProfile literal WITHOUT `illustrativeGender` must still compile,
// proving the field is optional and the extension is additive.
export const sampleMentorProfileNoGender: MentorProfile = {
  id: 'mentor-0',
  name: 'Asha Nair',
  initialsAvatar: 'AN',
  title: 'Principal Advisor',
  firm: 'Coastal Ventures',
  sectors: ['fintech', 'agritech'],
  yearsExperience: 12,
  mentorType: 'Founder Mentor',
  availability: 'Limited availability',
  bio: 'An illustrative one-paragraph bio describing the mentor in third-person prose.',
};

// A MentorProfile literal WITH `illustrativeGender` also compiles.
export const sampleMentorProfileWithGender: MentorProfile = {
  ...sampleMentorProfileNoGender,
  id: 'mentor-1',
  illustrativeGender: 'woman',
};

// `illustrativeGender` is optional — `undefined` is assignable to its type.
type _MentorGenderOptional = Expect<Equal<MentorProfile['illustrativeGender'], IllustrativeGender>>;

// ===========================================================================
// 5. New synthetic card shapes (Req 5)
// ===========================================================================

export const sampleWomenFounderCard: WomenFounderCard = {
  id: 'founder-0',
  name: 'Meera Iyer',
  company: 'GreenGrid Labs',
  sector: 'climatetech',
  stage: 'Seed',
  pitch: 'An illustrative one-line pitch for the founder.',
  initialsAvatar: 'MI',
};

export const sampleCsrPartnerType: CsrPartnerType = 'Corporate Foundation';
export const sampleCsrPartnerTypes: readonly CsrPartnerType[] = CSR_PARTNER_TYPES;

export const sampleCsrPartnership: CsrPartnership = {
  id: 'csr-0',
  partnerName: 'Illustrative Foundation',
  partnerType: 'Corporate Foundation',
  focusArea: 'Rural development',
  scaleCrore: 12,
  partnershipType: 'Direct grant',
};

export const sampleNgoPartner: NgoPartner = {
  id: 'ngo-0',
  name: 'Grassroots Collective',
  focus: 'Women empowerment',
  geographicReach: 'North Karnataka',
  partnershipType: 'Ecosystem partnership',
};

export const sampleCsrImpactMetric: CsrImpactMetric = {
  id: 'impact-0',
  label: 'Total CSR Capital',
  value: 250,
  unit: 'crore',
};

// ===========================================================================
// 6. Board filter state (Req 29.4) — null = inactive
// ===========================================================================

export const sampleIdeaBoardFilters: IdeaBoardFilters = {
  category: 'AgriTech',
  innovatorType: null,
  location: null,
};

// ===========================================================================
// 7. Existing exports are UNCHANGED and still usable (Req 1.8)
// ===========================================================================

// LocationKarnataka union is unchanged (exactly the nine canonical values).
type _LocationKarnatakaUnchanged = Expect<
  Equal<
    LocationKarnataka,
    | 'Bengaluru Urban'
    | 'Bengaluru Rural'
    | 'Mysuru'
    | 'Mangaluru'
    | 'Hubballi-Dharwad-Belagavi'
    | 'Kalaburagi'
    | 'Shivamogga'
    | 'Tumakuru'
    | 'Other Karnataka'
  >
>;

export const sampleLocation: LocationKarnataka = 'Bengaluru Rural';

// Scheme structural shape is unchanged and still usable by construction.
export const sampleScheme: Scheme = {
  id: 'grassroot-innovation',
  name: 'Grassroots Innovation',
  type: 'grant',
  shortDescription: 'An illustrative short description.',
  amount: '₹X lakh',
  maxBenefit: '₹Y lakh',
  duration: '12 months',
  eligibility: ['Karnataka-based innovator'],
  documents: ['ID proof'],
  status: 'open',
};
