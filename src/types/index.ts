// src/types/index.ts

export type SchemeType = 'fiscal' | 'grant';
export type SchemeStatus = 'open' | 'upcoming';
export interface Scheme {
  id: string;
  name: string;
  type: SchemeType;
  shortDescription: string;
  amount: string;
  maxBenefit: string;
  duration: string;
  eligibility: string[];
  documents: string[];
  status: SchemeStatus;
  note?: string;
}

export interface Stat {
  id: string;
  label: string;
  value: number;
  displayValue: string;
  source: string;
  asOf: string;
}

export interface Cluster {
  id: string;
  name: string;
  tagline: string;
  focusAreas: string[];
  infrastructure: string[];
  seedFund: string;
  anchorInstitutions: string[];
  ctaLabel: string;
  href: string;
  note?: string;
}

export type EventCategory = 'summit' | 'demo-day' | 'hackathon' | 'convening' | 'masterclass';
export interface EcosystemEvent {
  id: string;
  name: string;
  startDate: string; // ISO 8601
  endDate: string;   // ISO 8601
  location: string;
  category: EventCategory;
  description: string;
  href: string;
}

export type GIARegion = 'Europe' | 'Middle East' | 'Asia-Pacific' | 'Americas' | 'Africa';
export interface GIACountry {
  id: string;
  name: string;
  countryCode: string; // ISO 3166-1 alpha-2 (e.g. "GB","DE","JP")
  focusAreas: string[];
  region: GIARegion;
}

export type PolicyVertical =
  | 'startup' | 'it' | 'biotech' | 'gcc' | 'esdm'
  | 'avgc' | 'spacetech' | 'cybersecurity' | 'skill' | 'industrial';
export interface Policy {
  id: string;
  name: string;
  vertical: PolicyVertical;
  period: string;
  summary: string;
  href: string;
}

export type ProgramStatus = 'active' | 'upcoming';
export interface FlagshipProgram {
  id: string;
  name: string;
  tagline: string;
  description: string;
  keyMetric: string;
  status: ProgramStatus;
  ctaLabel: string;
  href: string;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  href: string;
}

export type IncubatorType = 'Incubator' | 'Accelerator' | 'Research Park';
export interface Incubator {
  id: string;
  name: string;
  cluster: string;
  focus: string[];
  type: IncubatorType;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  icon?: string; // Lucide icon name
}

export interface NavItem {
  label: string;
  href?: string;              // leaf items have href
  children?: NavItem[];       // parent items have children
  description?: string;       // optional supporting copy for mega-menu items
}

export interface TrustBadge { id: string; label: string; }
export interface PartnerLogo { id: string; label: string; }     // SocialProof
export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;         // true for tel:/mailto: links
}
export interface FooterColumn { title: string; links: FooterLink[]; }

// Footer bottom area (legal lines + bottom-right links + tagline)
export interface FooterBottom {
  legalLines: string[];       // copyright, department, operators (in order)
  links: FooterLink[];        // bottom-right links (Privacy, Terms, ...)
  tagline: string;            // centered tagline
}

// ---------------------------------------------------------------------------
// Registration, Schemes & Benefits, Policy Calculator (second slice) — ADDITIVE
// Appended below the existing foundation types. No existing export is removed
// or altered (Req 2.7). Compiles with zero errors under strict mode (Req 2.8).
// ---------------------------------------------------------------------------

// --- Enumerations (Req 2.2–2.5) ---
export type Zone = 'Zone 1' | 'Zone 2' | 'Zone 3';

export type FundingStage =
  | 'Bootstrapped' | 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B Plus';

export type CurrentStage =
  | 'Idea' | 'PoC' | 'Early Revenue' | 'Growth' | 'Scale';

export type LocationKarnataka =
  | 'Bengaluru Urban'
  | 'Bengaluru Rural'
  | 'Mysuru'
  | 'Mangaluru'
  | 'Hubballi-Dharwad-Belagavi'
  | 'Kalaburagi'
  | 'Shivamogga'
  | 'Tumakuru'
  | 'Other Karnataka';

export type EligibilityStatus =
  | 'definitely-eligible'
  | 'likely-eligible'
  | 'check-requirements'
  | 'not-eligible';

// --- Registration profile (Req 2.1) ---
export interface RegistrationProfile {
  // Founder (Step 1)
  founderName: string;
  founderEmail: string;
  founderPhone: string;
  founderAge: number;
  // Company (Step 2)
  companyName: string;
  dpiitRecognized: boolean;
  gstRegistered: boolean;
  incorporationDate: string;        // ISO 8601
  currentStage: CurrentStage;
  // Team (Step 3)
  teamSize: number;
  womenFounderStake: number;        // 0..100
  womenEmployeePercentage: number;  // 0..100
  scStFounder: boolean;
  // Sector (Step 4)
  primarySector: string;            // Sector id
  secondarySectors: string[];       // Sector ids, max 3, excludes primary
  // Location & funding (Step 5)
  location: LocationKarnataka;
  fundingStage: FundingStage;
  fundingRaised: number;            // in lakhs, >= 0
  // Status (set by completeRegistration)
  isRegistered: boolean;
  kiteId: string;
  registeredAt: string;             // ISO 8601
}

// --- Eligibility result (Req 2.6, 19.1) ---
export interface EligibilityResult {
  schemeId: string;
  status: EligibilityStatus;
  reasons: string[];
  estimatedBenefit: number;         // rupees, >= 0
  confidence: number;               // 0..1 inclusive
}

// --- Context contract (Req 1.3) ---
export interface RegistrationContextValue {
  registrationProfile: RegistrationProfile | null;
  isRegistered: boolean;
  zone: Zone | null;                              // derived from location (Req 1.7)
  qualifyingCount: number;                        // schemes definitely/likely eligible (Req 12.4)
  updateProfile: (partial: Partial<RegistrationProfile>) => void;  // merge (Req 1.4)
  completeRegistration: () => void;               // set isRegistered, kiteId, registeredAt (Req 1.5)
  resetRegistration: () => void;                  // back to null/false (Req 1.6)
  evaluate: (scheme: Scheme) => EligibilityResult | null; // null when no profile
}

// --- Wizard reducer types (see Wizard Reducer Spec) ---
export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export type WizardFieldErrors = Record<string, string>;

export interface WizardState {
  currentStep: WizardStep;
  profile: Partial<RegistrationProfile>;          // cross-step draft
  errors: Record<WizardStep, WizardFieldErrors>;  // per-step validation output
  touched: Record<string, boolean>;               // fieldName -> blurred?
  submitted: boolean;                             // true after completeRegistration
  // ADDITIVE: Step 6 accuracy confirmation flag that gates "Submit Registration"
  // (Req 9.4). Toggled by the TOGGLE_ACCURACY action; lives here so the reducer
  // remains the single source of truth for wizard state.
  accuracyConfirmed: boolean;
}

export type WizardAction =
  | { type: 'SET_FIELD'; field: keyof RegistrationProfile; value: unknown }
  | { type: 'BLUR_FIELD'; field: string }
  | { type: 'VALIDATE_STEP'; step: WizardStep }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'GO_TO_STEP'; step: WizardStep }      // Edit from Review
  | { type: 'TOGGLE_ACCURACY'; value: boolean }
  | { type: 'SUBMIT' };

// Helper types
export type StepValidator = (profile: Partial<RegistrationProfile>) => WizardFieldErrors;
export type SchemeEvaluator = (profile: RegistrationProfile, scheme: Scheme) => EligibilityResult;

// ===========================================================================
// KITE Dashboards (Prompt 3) — additive types
// ---------------------------------------------------------------------------
// All declarations below are appended additively; no existing export above is
// altered or removed (Req 30.5). Chart-data shapes, the startup per-sector
// bundle, admin aggregates, recommendations, and table-sort types live here so
// dashboard modules and chart wrappers share a single source of truth.
// ===========================================================================

// --- Chart data shapes ---
export interface FundingPoint {
  month: string;
  rupeesCrore: number;
}
export interface FundingTimelinePoint {
  quarter: string;
  rupeesCrore: number;
}
export interface ClusterCountDatum {
  cluster: string;
  count: number;
}
export interface SchemeDisbursementDatum {
  schemeId: string;
  schemeName: string;
  rupees: number;
}
export interface StackedDisbursementDatum {
  cluster: string;
  fiscal: number;
  grant: number;
}
export interface SectorTreemapDatum {
  sectorId: string;
  name: string;
  startupCount: number;
  fundingIntensity: number;
}
export interface SectorGrowthDatum {
  sectorId: string;
  name: string;
  growthPct: number;
}
/** A single demographic slice; `value` is a percent or a count. */
export interface DemographicSlice {
  label: string;
  value: number;
}
export interface DemographicsData {
  womenLed: DemographicSlice[];
  stage: DemographicSlice[];
  age: DemographicSlice[];
}

// --- Startup per-sector bundle ---
export interface SectorDashboardData {
  sectorId: string;
  monthlyFunding: FundingPoint[]; // 12
  clusterStartups: ClusterCountDatum[]; // 7
  topSchemes: SchemeDisbursementDatum[]; // 5
}

// --- Admin aggregates ---
export interface KpiCard {
  id: string;
  label: string;
  value: string;
  caption?: string;
  trend?: string;
}
export interface SchemePerformanceRow {
  schemeId: string;
  name: string;
  type: SchemeType;
  applications: number;
  approved: number;
  disbursed: number;
  status: SchemeStatus;
}
export type ActivityType =
  | 'registration'
  | 'approval'
  | 'disbursement'
  | 'event'
  | 'milestone';
export interface ActivityEntry {
  id: string;
  timestampLabel: string;
  type: ActivityType;
  description: string;
  entityLabel: string;
  href: string;
}
export interface RegionPartnership {
  region: GIARegion;
  countryCount: number;
  jointPrograms: number;
}
export interface ProgramPerformance {
  programId: string;
  name: string;
  disbursed: number;
  enrolled: number;
  completionPct: number; // [0,100]
  status: ProgramStatus;
}

// --- Recommendations ---
export interface Recommendation {
  id: string;
  iconName: string;
  heading: string;
  description: string;
  ctaLabel: string;
  href: string;
}

// --- Table sort ---
export type SchemeSortKey =
  | 'name'
  | 'type'
  | 'applications'
  | 'approved'
  | 'disbursed'
  | 'status';
export type SortDirection = 'asc' | 'desc';

// ===========================================================================
// KITE Investor Suite (Prompt 4) — additive types only.
// Appended additively; no existing export above is modified or removed.
// All shapes compile under `strict` + `noUncheckedIndexedAccess`.
// ===========================================================================

// --- Investor enumerations ---
export type InvestorRole =
  | 'GP' | 'Partner' | 'Principal' | 'Associate'
  | 'Angel' | 'Family Office' | 'Corporate VC' | 'Government Fund';

export type FirmType =
  | 'VC' | 'Angel Network' | 'Family Office'
  | 'Corporate VC' | 'Government Fund' | 'Accelerator Fund';

export type InvestmentStage =
  | 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B Plus' | 'Growth';

export type DealStage =
  | 'Sourced' | 'Screening' | 'Diligence' | 'Term-Sheet' | 'Closed' | 'Passed';

export type PortfolioStatus = 'Active' | 'Exited' | 'Written-Off' | 'Folded';

/** Canonical six-stage order; index used by stage-range filtering and analytics. */
export const DEAL_STAGE_ORDER: readonly DealStage[] =
  ['Sourced', 'Screening', 'Diligence', 'Term-Sheet', 'Closed', 'Passed'];

// --- Investor core records ---
export interface PortfolioCompany {
  id: string;
  companyName: string;
  sector: string;                 // Sector id
  stage: InvestmentStage;         // stage at investment
  investedAmountLakhs: number;
  investedDate: string;           // ISO 8601
  currentStatus: PortfolioStatus;
  location?: LocationKarnataka;   // used by Karnataka-allocation KPI
}

export interface TrackedDeal {
  id: string;
  companyName: string;
  sector: string;                 // Sector id
  stage: InvestmentStage;         // the startup's funding stage
  askLakhs: number;
  currentStage: DealStage;        // kanban column
  orderInStage: number;           // manual order within currentStage
  notes?: string;                 // Add-Note storage
}

export interface InvestorProfile {
  // Identity (Step 1)
  investorName: string;
  firmName: string;
  investorEmail: string;
  investorPhone: string;
  role: InvestorRole;
  // Firm (Step 2)
  firmType: FirmType;
  assetsUnderManagement: number;  // lakhs
  foundedYear: number;
  // Thesis (Step 3)
  focusSectors: string[];         // Sector ids
  focusStages: InvestmentStage[];
  ticketSizeMinLakhs: number;
  ticketSizeMaxLakhs: number;
  geographicFocus: string[];      // e.g. 'Karnataka', 'Karnataka Beyond Bengaluru', 'India'
  // Holdings / pipeline
  portfolioCompanies: PortfolioCompany[];
  dealsTracked: TrackedDeal[];
  // Status (set by completeOnboarding)
  isOnboarded: boolean;
  investorId: string;             // INV-YYYY-XXXXXX
  onboardedAt: string;            // ISO 8601
}

// --- Investor context contract ---
export interface InvestorContextValue {
  investorProfile: InvestorProfile | null;
  isOnboarded: boolean;
  updateInvestorProfile: (partial: Partial<InvestorProfile>) => void;
  completeOnboarding: () => void;
  addDeal: (deal: TrackedDeal) => void;
  updateDealStage: (dealId: string, stage: DealStage) => void;
  removeDeal: (dealId: string) => void;
  addPortfolioCompany: (company: PortfolioCompany) => void;
  resetInvestor: () => void;
}

// --- Matching results ---
export type MatchSignal = 'strong' | 'possible' | 'out-of-thesis';

export interface MatchResult {
  startupId: string;              // derived from startup.kiteId
  score: number;                  // integer in [0,100]
  signal: MatchSignal;            // strong ≥80 / possible 50–79 / out-of-thesis <50
  reasons: string[];              // non-empty
}

export interface RelevanceResult {
  schemeId: string;
  isRelevant: boolean;
  reason: string;                 // non-empty
}

// --- Synthetic shapes (additive return types) ---
export interface StartupCandidate {
  kiteId: string;                 // startupId source
  companyName: string;
  sector: string;                 // Sector id
  stage: InvestmentStage;
  askLakhs: number;
  location: LocationKarnataka;
  pitch: string;                  // one-sentence framing
}

export interface OpportunityCardData {
  id: string;
  companyName: string;
  sector: string;
  stage: InvestmentStage;
  askLakhs: number;
  pitch: string;
  location: LocationKarnataka;
}

export interface DealFlowEvent {
  id: string;
  timestampLabel: string;         // fixed relative label, NOT clock-derived
  sector: string;
  stage: InvestmentStage;
  dealType: string;               // e.g. "Seed round", "Bridge"
  amountLakhs: number;
}

export interface SectorFundingDatum {            // feeds ChartBarHorizontalFunding
  sectorId: string;
  name: string;
  fundingCrore: number;
}

export interface SectorCountSeries {             // feeds ChartLineFunding (24 mo × top 5)
  months: string[];                              // 24 fixed labels
  series: { sectorId: string; name: string; counts: number[] }[]; // length 5, counts length 24
}

export interface ClusterFraming {
  clusterId: string;
  soonicornCount: number;
  coInvestCapacityCrore: number;
}

export interface KitvenCoInvestment {
  id: string;
  companyName: string;
  sector: string;
  stage: InvestmentStage;
  amountLakhs: number;
}

export interface EcosystemSignalsData {
  focusSectorsFunding: FundingPoint[];           // 12 points (reuses FundingPoint)
  stageDistribution: { stage: InvestmentStage; count: number }[];
}

export interface StageAnalytics {
  perStage: { stage: DealStage; count: number; avgDaysInStage: number }[];
  conversion: { fromStage: DealStage; toStage: DealStage; rate: number }[]; // rate ∈ [0,1]
  velocityThisWeek: number;                      // ≥ 0
}

// ===========================================================================
// KITE Ecosystem Enablement (Prompt 5) — additive types only.
// Reuses existing Incubator / IncubatorType above. No existing export changed.
// All shapes compile under `strict` + `noUncheckedIndexedAccess`.
// ===========================================================================

// --- Mentor enumerations ---
export type MentorType =
  | 'Domain Expert' | 'Founder Mentor' | 'Investor Mentor' | 'Government Liaison';

export const MENTOR_TYPES: readonly MentorType[] =
  ['Domain Expert', 'Founder Mentor', 'Investor Mentor', 'Government Liaison'];

export type MentorAvailability = 'Open to mentees' | 'Limited availability' | 'Waitlist';

export const MENTOR_AVAILABILITY: readonly MentorAvailability[] =
  ['Open to mentees', 'Limited availability', 'Waitlist'];

/** Experience banding id used by the Experience_Level filter. */
export type ExperienceLevel = 'emerging' | 'established' | 'veteran';

// --- Mentor profile (synthetic; Req 8) ---
export interface MentorProfile {
  id: string;                 // stable key, e.g. "mentor-0"
  name: string;               // Req 8.1
  initialsAvatar: string;     // 1–2 uppercase letters, no photo (Req 8.2)
  title: string;              // Req 8.3
  firm: string;               // Req 8.3
  sectors: string[];          // 1–3 ids drawn from the 20 canonical sectors (Req 8.4)
  yearsExperience: number;    // positive integer (Req 8.5)
  mentorType: MentorType;     // Req 8.6
  availability: MentorAvailability; // Req 8.7
  bio: string;                // one-paragraph illustrative (Req 8.8)
  illustrativeGender?: IllustrativeGender; // optional, illustrative only (Req 6.1)
}

// --- Incubator illustrative detail (synthetic; Req 3) ---
export interface IncubatorDetail {
  incubatorId: string;        // matches Incubator.id
  aboutParagraph: string;     // illustrative
  cohortsPerYear: number;     // illustrative
  startupsSupported: number;  // illustrative
  illustrativeOfferings: string[];
  illustrativeContactLabel: string;
}

// --- Directory filter state ---
export interface IncubatorFilters {
  cluster: string | null;
  focus: string | null;
  type: IncubatorType | null;
}

export interface MentorFilters {
  sector: string | null;
  mentorType: MentorType | null;
  experienceLevel: ExperienceLevel | null;
}

/** Experience band definition (min/max inclusive years). */
export interface ExperienceBand {
  id: ExperienceLevel;
  label: string;
  min: number;
  max: number;
}

// --- Editorial program page-data (verified; Req 4, 5) ---
export interface ProgramApplyCta {
  label: string;
  href: string;               // external https Karnataka portal (Req 4.7, 5.13)
}

export interface ProgramCohortStructure {
  cadenceLabel: string;       // e.g. "6-month acceleration cohorts"
  detailLines: string[];      // verified cohort facts
}

export interface ProgramEditorialData {
  slug: 'kan' | 'k-combinator';
  name: string;
  overview: string;
  provides: string[];
  cohortStructure: ProgramCohortStructure;
  verifiedFigures: string[];        // canonical figures rendered verbatim (Req 11.1)
  sectors?: string[];               // K-Combinator's exact nine sectors (Req 5.8)
  applicationSteps: string[];
  partnerIncubatorIds: string[];    // ids into incubators.ts
  applyCta: ProgramApplyCta;
  successStoriesSeed: string;       // seed key for synthetic stories (Req 4.5, 5.11)
}

/** A single synthetic success story (illustrative). */
export interface ProgramSuccessStory {
  id: string;
  startupName: string;
  sector: string;
  outcomeLine: string;        // illustrative, declarative
}

// ===========================================================================
// KITE Inclusion & Grassroots (Prompt 6) — additive types only.
// Reuses existing LocationKarnataka and Scheme. No existing export changed.
// All shapes compile under `strict` + `noUncheckedIndexedAccess`.
// ===========================================================================

// --- Idea enumerations (Req 1.4, 1.5, 1.6) ---
export type InnovatorType =
  | 'Citizen' | 'Student' | 'Farmer' | 'Researcher' | 'Rural Innovator';

export const INNOVATOR_TYPES: readonly InnovatorType[] =
  ['Citizen', 'Student', 'Farmer', 'Researcher', 'Rural Innovator'];

export type IdeaCategory =
  | 'AgriTech' | 'HealthTech' | 'ClimateTech' | 'EdTech' | 'FinTech'
  | 'Rural Development' | 'Manufacturing' | 'Other Social Impact';

export const IDEA_CATEGORIES: readonly IdeaCategory[] = [
  'AgriTech', 'HealthTech', 'ClimateTech', 'EdTech', 'FinTech',
  'Rural Development', 'Manufacturing', 'Other Social Impact',
];

/** Lifecycle status; includes 'submitted' (Req 1.6). */
export type IdeaStatus = 'submitted' | 'matched' | 'archived';

// --- Idea submission (Req 1.1–1.3) — all 15 fields ---
export interface IdeaSubmission {
  id: string;                  // session record key (equals ideaId)
  innovatorName: string;
  innovatorEmail: string;
  innovatorAge: number;        // numeric (Req 26.6)
  innovatorType: InnovatorType;
  ideaTitle: string;
  ideaCategory: IdeaCategory;
  ideaSummary: string;
  problemStatement: string;
  proposedSolution: string;
  location: LocationKarnataka; // existing union (Req 1.2)
  submittedAt: string;         // ISO 8601 (Req 1.3)
  status: IdeaStatus;
  matchedSchemeIds: string[];  // real scheme ids (Req 1.3)
  ideaId: string;              // IDEA-YYYY-XXXXXX
}

/** The draft a consumer passes to submitIdea — the engine/context fills the
 *  rest (id, ideaId, submittedAt, status, matchedSchemeIds). */
export type IdeaSubmissionDraft = Omit<
  IdeaSubmission, 'id' | 'ideaId' | 'submittedAt' | 'status' | 'matchedSchemeIds'
>;

// --- Idea Bank context contract (Req 1.7, 3) ---
export interface IdeaBankContextValue {
  ideas: IdeaSubmission[];
  submitIdea: (draft: IdeaSubmissionDraft) => IdeaSubmission;
  updateIdeaStatus: (ideaId: string, status: IdeaStatus) => void;
  removeIdea: (ideaId: string) => void;
  getMatchedIdeas: () => IdeaSubmission[];
}

// --- Illustrative mentor gender extension (Req 6) ---
/** Clearly-illustrative mentor label; NOT a definitive demographic
 *  classification. `undefined` for mentors generated before the extension. */
export type IllustrativeGender = 'woman' | 'man' | undefined;

// --- Synthetic card shapes (Req 5) ---
export interface WomenFounderCard {
  id: string;
  name: string;
  company: string;
  sector: string;
  stage: string;
  pitch: string;            // one-line
  initialsAvatar: string;   // 1–2 uppercase letters, never a photo
}

export type CsrPartnerType =
  | 'Corporate Foundation' | 'Family Office' | 'Public Sector Undertaking' | 'NGO Partner';

export const CSR_PARTNER_TYPES: readonly CsrPartnerType[] =
  ['Corporate Foundation', 'Family Office', 'Public Sector Undertaking', 'NGO Partner'];

export interface CsrPartnership {
  id: string;
  partnerName: string;
  partnerType: CsrPartnerType;
  focusArea: string;
  scaleCrore: number;        // partnership scale in ₹ crore
  partnershipType: string;
}

export interface NgoPartner {
  id: string;
  name: string;
  focus: string;
  geographicReach: string;
  partnershipType: string;
}

export interface CsrImpactMetric {
  id: string;
  label: string;             // e.g. "Total CSR Capital", "Startups Supported"
  value: number;
  unit: 'crore' | 'startups' | 'beneficiaries';
}

// --- Board filter state (Req 29.4) ---
export interface IdeaBoardFilters {
  category: IdeaCategory | null;
  innovatorType: InnovatorType | null;
  location: LocationKarnataka | null;
}

// ===========================================================================
// KITE Events, GIA, AI Assistant & Support (Prompt 8, Closing) — additive types.
// Reuses existing GIARegion, GIACountry, EcosystemEvent, EventCategory.
// No existing export above is altered or removed. All shapes compile under
// `strict` + `noUncheckedIndexedAccess`.
// ===========================================================================

// --- Events & media ---
export type PressType =
  | 'major-press' | 'business-press' | 'tech-press' | 'international-press';

export interface PressMention {
  id: string;
  publication: string;
  publicationType: PressType;
  headline: string;
  dateLabel: string;        // relative label, never clock-derived
  excerpt: string;
  href: string;             // illustrative placeholder URL
}

export interface GovAnnouncement {
  id: string;
  title: string;
  department: string;
  dateLabel: string;        // relative label
  summary: string;
  sourceHref: string;       // EITBT portal
}

// --- GIA synthetic ---
export interface RecentEngagement {
  id: string;
  countryCode: string;      // ISO 3166-1 alpha-2 (lowercase)
  title: string;
  dateLabel: string;
  summary: string;
}

export interface BilateralProgram {
  id: string;
  name: string;
  focusArea: string;
  sinceYear: number;
  description: string;
  status: 'active' | 'upcoming';
}

export interface CountrySuccessStory {
  id: string;
  startupName: string;
  sector: string;
  outcome: string;
}

export interface CountryStartupEngagement {
  id: string;
  startupName: string;
  sector: string;
  engagementType: string;
  description: string;
}

export interface GiaRegionSummary {
  region: GIARegion;
  countryCount: number;
  focusAreas: string[];     // representative focus areas across the region
}

// --- Support ---
export type FaqCategory =
  | 'Registration' | 'Eligibility' | 'Schemes' | 'Application'
  | 'Disbursement' | 'Women Founders' | 'Beyond Bengaluru'
  | 'Programs' | 'International' | 'Escalation';

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  relatedLinks: { label: string; href: string }[];
}

export interface DepartmentContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  illustrative: boolean;    // true when the contact detail is illustrative
}

export interface SupportTicketDraft {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// --- AI chat ---
export type ChatRole = 'user' | 'assistant';

export interface ChatSuggestion {
  label: string;
  href: string;             // internal KITE route
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  suggestions?: ChatSuggestion[];  // assistant follow-up route chips
}

export interface AssistantResponse {
  text: string;
  suggestions: ChatSuggestion[];
}

export interface ChatState {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  error: string | null;
  exchanges: number;        // count of user→assistant round trips (cap at 20)
}

export type ChatAction =
  | { type: 'SET_INPUT'; value: string }
  | { type: 'SEND'; message: ChatMessage }
  | { type: 'START_LOADING' }
  | { type: 'RECEIVE'; message: ChatMessage }
  | { type: 'ERROR'; error: string }
  | { type: 'CLEAR' };
