// src/lib/eligibility-engine.ts
//
// PURE eligibility engine for the KITE Registration / Schemes / Calculator slice.
//
// Constraints (Req 18.1): plain TypeScript — NO React, NO async, NO side effects,
// NO external dependencies. The same (profile, scheme) input ALWAYS yields the
// same output. This module is imported by the Schemes Hub, the Scheme Detail
// island, the Compare view, the Policy Calculator, and the Home banner.
//
// Scheme *content* (names, amounts, eligibility text) is owned by
// `src/data/schemes.ts` and is never fabricated here. The only numbers this
// module introduces are the documented rupee maxima in SCHEME_MAX_BENEFIT_RUPEES
// (Req 19.2, 19.3) — these are hardcoded, documented constants, NOT parsed from
// the free-text `scheme.maxBenefit` / `scheme.amount` strings at runtime.

import type {
  Scheme,
  RegistrationProfile,
  EligibilityResult,
  EligibilityStatus,
  CurrentStage,
  FundingStage,
  LocationKarnataka,
  Zone,
  SchemeEvaluator,
} from '@/types';
import { schemes } from '@/data/schemes';

// ---------------------------------------------------------------------------
// 1. Benefit constants (Req 19.2, 19.3)
// ---------------------------------------------------------------------------

/**
 * Equity-instrument schemes (VC funds, cluster seed funds, bridge instruments)
 * have NO fixed rupee benefit — the upside is an equity position, not a grant.
 * Per Req 19.3 we substitute a single DOCUMENTED placeholder valuation instead
 * of trying to parse a rupee figure out of free text.
 *
 * Assumption: a representative equity benefit is valued at 10% of ₹1 crore,
 * i.e. ₹10,00,000. This is a deliberately conservative, illustrative stand-in;
 * it is NOT a promise of a specific investment size.
 */
export const EQUITY_BENEFIT_PLACEHOLDER_RUPEES = 0.1 * 1_00_00_000; // ₹10,00,000

/**
 * Maximum benefit per scheme, expressed in RUPEES, keyed by the canonical
 * scheme ids in `src/data/schemes.ts` (all 22 ids are covered).
 *
 * Each value is a founder-judgment numeric extraction of that scheme's
 * `maxBenefit` / `amount` text, documented inline. Equity-style schemes use the
 * EQUITY_BENEFIT_PLACEHOLDER_RUPEES; purely non-monetary schemes are 0.
 *
 * NOTE: `estimatedBenefit` in an EligibilityResult is derived from THIS map via
 * `benefitForStatus` — it is never produced by runtime string parsing.
 */
export const SCHEME_MAX_BENEFIT_RUPEES: Record<string, number> = {
  // --- Fiscal incentives (1–8) ---
  'sgst-reimbursement': 1_00_00_000, // "100% of FCI" — uncapped in policy; representative ₹1 crore cap
  'patent-subsidy': 15_00_000, // "₹15 lakh/year"
  'global-karnataka': 5_00_000, // "₹5 lakh/year"
  'quality-certification': 6_00_000, // "₹6 lakh total"
  'pf-esi-reimbursement': 12_00_000, // "₹12 lakh per company"
  'cloud-storage': 1_00_000, // "₹1 lakh/year"
  'rd-project-grant': 1_00_00_000, // "₹1 crore"
  'internship-support': 5_000 * 3 * 6, // ₹5k/intern/mo × 3 interns × 6 months = ₹90,000 (per cycle)

  // --- Grant programs (9–22) ---
  'elevate': 50_00_000, // "Up to ₹50 lakh"
  'elevate-unnati': 50_00_000, // "Up to ₹50 lakh"
  'rgep': 3_00_000, // "₹25,000/mo × 12" = ₹3 lakh total
  'grand-challenge-karnataka': 50_00_000, // "₹50 lakh" (Phase 2B winner — best case)
  'kitven-fund-5': EQUITY_BENEFIT_PLACEHOLDER_RUPEES, // equity (2–10% of corpus, max 30% stake)
  'beyond-bengaluru-cluster-fund': EQUITY_BENEFIT_PLACEHOLDER_RUPEES, // equity / equity-linked seed
  'alternate-investment-bridge': EQUITY_BENEFIT_PLACEHOLDER_RUPEES, // bridge instrument, equity-linked
  'new-incubation-centers': 50_00_000, // "50% of project cost or ₹50 lakh"
  'incubation-expansion': 25_00_000, // "50% of expansion cost or ₹25 lakh"
  'nain-2': 5_00_000, // "₹5 lakh per project"
  'preferential-market-access': 50_00_000, // "₹50 lakh limited tender" (best case)
  'kan': 0, // non-monetary acceleration support
  'tto': 25_00_000, // "₹25 lakh per institute"
  'grassroot-innovation': 4_00_000, // "₹4 lakh per innovator"
};

// ---------------------------------------------------------------------------
// 2. Status → derived numbers (Req 19.2, 19.4) — single source of the mapping
// ---------------------------------------------------------------------------

/**
 * Estimated benefit in rupees derived purely from status + the scheme maximum:
 *   definitely-eligible → full maximum
 *   likely-eligible     → half of the maximum
 *   check-requirements  → 0
 *   not-eligible        → 0
 * Always clamped to ≥ 0 (Req 19.6).
 */
export function benefitForStatus(status: EligibilityStatus, maxRupees: number): number {
  const safeMax = Number.isFinite(maxRupees) && maxRupees > 0 ? maxRupees : 0;
  switch (status) {
    case 'definitely-eligible':
      return safeMax;
    case 'likely-eligible':
      return safeMax / 2;
    case 'check-requirements':
    case 'not-eligible':
      return 0;
  }
}

/**
 * Confidence derived purely from status (Req 19.4):
 *   definitely-eligible → 1
 *   likely-eligible     → 0.7
 *   check-requirements  → 0.3
 *   not-eligible        → 0
 * Always within [0, 1].
 */
export function confidenceForStatus(status: EligibilityStatus): number {
  switch (status) {
    case 'definitely-eligible':
      return 1;
    case 'likely-eligible':
      return 0.7;
    case 'check-requirements':
      return 0.3;
    case 'not-eligible':
      return 0;
  }
}

// ---------------------------------------------------------------------------
// 3. Ordinal helpers (used by the rules)
// ---------------------------------------------------------------------------

/** Idea < PoC < Early Revenue < Growth < Scale */
export const STAGE_ORDER: Record<CurrentStage, number> = {
  Idea: 0,
  PoC: 1,
  'Early Revenue': 2,
  Growth: 3,
  Scale: 4,
};

/** Bootstrapped < Pre-Seed < Seed < Series A < Series B Plus */
export const FUNDING_ORDER: Record<FundingStage, number> = {
  Bootstrapped: 0,
  'Pre-Seed': 1,
  Seed: 2,
  'Series A': 3,
  'Series B Plus': 4,
};

/** True when `stage` is at or beyond `min` in STAGE_ORDER. */
function stageAtLeast(stage: CurrentStage, min: CurrentStage): boolean {
  return STAGE_ORDER[stage] >= STAGE_ORDER[min];
}

/** True when `funding` is at or below `max` in FUNDING_ORDER. */
function fundingAtMost(funding: FundingStage, max: FundingStage): boolean {
  return FUNDING_ORDER[funding] <= FUNDING_ORDER[max];
}

/**
 * Pure, total zone derivation (Req 1.7). Every LocationKarnataka maps to exactly
 * one Zone:
 *   Bengaluru Urban                                              → Zone 3
 *   Bengaluru Rural, Mysuru, Mangaluru, Hubballi-Dharwad-Belagavi → Zone 2
 *   Kalaburagi, Shivamogga, Tumakuru, Other Karnataka            → Zone 1
 */
export function deriveZone(location: LocationKarnataka): Zone {
  switch (location) {
    case 'Bengaluru Urban':
      return 'Zone 3';
    case 'Bengaluru Rural':
    case 'Mysuru':
    case 'Mangaluru':
    case 'Hubballi-Dharwad-Belagavi':
      return 'Zone 2';
    case 'Kalaburagi':
    case 'Shivamogga':
    case 'Tumakuru':
    case 'Other Karnataka':
      return 'Zone 1';
  }
}

/**
 * Shared women-led predicate (Req 18.6). NOTE (reconciliation): none of the 22
 * canonical schemes in `schemes.ts` is a dedicated women-exclusive scheme, so
 * there is no scheme id to bind a women-led evaluator to. This helper is kept
 * as the single, reusable encoding of the women-led criterion so consuming
 * surfaces / future women-specific schemes can apply it consistently.
 */
export function isWomenLed(profile: RegistrationProfile): boolean {
  return profile.womenFounderStake >= 51 || profile.womenEmployeePercentage >= 51;
}

// ---------------------------------------------------------------------------
// 4. Shared result normalizer
// ---------------------------------------------------------------------------

/**
 * Builds a well-formed EligibilityResult and GUARANTEES the structural
 * invariants (Req 19.1, 19.5, 19.6, 30.2–30.6) regardless of what an individual
 * evaluator passes:
 *   - schemeId === scheme.id
 *   - status ∈ the four EligibilityStatus values
 *   - reasons non-empty whenever status ≠ 'definitely-eligible'
 *   - estimatedBenefit ≥ 0 (derived from the benefit map + status)
 *   - confidence ∈ [0, 1] (derived from status)
 */
function makeResult(
  scheme: Scheme,
  status: EligibilityStatus,
  reasons: string[],
): EligibilityResult {
  const maxRupees = SCHEME_MAX_BENEFIT_RUPEES[scheme.id] ?? 0;

  // Guarantee a non-empty reasons array for any non-definitely-eligible status.
  const cleaned = reasons.filter((r) => r.trim().length > 0);
  const finalReasons =
    status === 'definitely-eligible'
      ? cleaned
      : cleaned.length > 0
        ? cleaned
        : ['Additional information is required to confirm eligibility for this scheme.'];

  return {
    schemeId: scheme.id,
    status,
    reasons: finalReasons,
    estimatedBenefit: benefitForStatus(status, maxRupees),
    confidence: confidenceForStatus(status),
  };
}

// ---------------------------------------------------------------------------
// 5. Per-scheme evaluators (Req 18.2–18.12 + founder judgment for the rest)
// ---------------------------------------------------------------------------
//
// Each evaluator is a pure function (profile, scheme) → EligibilityResult and
// returns through makeResult so the well-formedness invariants hold structurally.
//
// Rule of thumb for the founder-judgment evaluators:
//   - hard requirement clearly unmet                 → not-eligible
//   - all encodable conditions met                   → definitely-eligible
//   - core signal present, an unverifiable gate left → likely-eligible
//   - not enough signal in the profile to decide     → check-requirements

const evaluateSgst: SchemeEvaluator = (profile, scheme) => {
  // Req 18.2: dpiit && gst && stage ≥ Early Revenue → definitely-eligible.
  if (!profile.dpiitRecognized || !profile.gstRegistered) {
    const missing: string[] = [];
    if (!profile.dpiitRecognized) missing.push('DPIIT recognition');
    if (!profile.gstRegistered) missing.push('GST registration');
    return makeResult(scheme, 'not-eligible', [
      `State GST Reimbursement requires ${missing.join(' and ')}, which your profile does not have.`,
    ]);
  }
  if (stageAtLeast(profile.currentStage, 'Early Revenue')) {
    return makeResult(scheme, 'definitely-eligible', [
      'DPIIT-recognized, GST-registered, and at/beyond Early Revenue — meets the SGST reimbursement criteria.',
    ]);
  }
  return makeResult(scheme, 'likely-eligible', [
    'DPIIT recognition and GST registration are in place; SGST reimbursement applies once you reach Early Revenue (commercial operations).',
  ]);
};

const evaluatePatent: SchemeEvaluator = (profile, scheme) => {
  // Req 18.3: dpiit (any stage) → definitely-eligible.
  if (profile.dpiitRecognized) {
    return makeResult(scheme, 'definitely-eligible', [
      'DPIIT-recognized startups can claim the patent filing subsidy at any stage.',
    ]);
  }
  return makeResult(scheme, 'not-eligible', [
    'The patent filing subsidy requires DPIIT recognition, which your profile does not have.',
  ]);
};

const evaluateElevateCore = (
  profile: RegistrationProfile,
  scheme: Scheme,
  familyLabel: string,
): EligibilityResult => {
  // Req 18.4: stage ∈ {Idea, PoC} && fundingStage ≤ Pre-Seed → definitely-eligible.
  const earlyStage = profile.currentStage === 'Idea' || profile.currentStage === 'PoC';
  const earlyFunding = fundingAtMost(profile.fundingStage, 'Pre-Seed');

  if (earlyStage && earlyFunding) {
    return makeResult(scheme, 'definitely-eligible', [
      `${familyLabel} targets Idea/PoC-stage startups at or below Pre-Seed funding — your profile fits.`,
    ]);
  }
  if (earlyStage && !earlyFunding) {
    return makeResult(scheme, 'likely-eligible', [
      `Your stage suits ${familyLabel}, but your funding stage is beyond Pre-Seed — confirm you still fall within the early-stage window.`,
    ]);
  }
  if (!earlyStage && earlyFunding) {
    return makeResult(scheme, 'check-requirements', [
      `${familyLabel} is aimed at Idea/PoC-stage startups; your current stage is beyond PoC.`,
    ]);
  }
  return makeResult(scheme, 'not-eligible', [
    `${familyLabel} is for early-stage (Idea/PoC) startups at or below Pre-Seed funding; your profile is past that window.`,
  ]);
};

const evaluateElevate: SchemeEvaluator = (profile, scheme) =>
  evaluateElevateCore(profile, scheme, 'ELEVATE (Idea2PoC)');

const evaluateElevateUnnati: SchemeEvaluator = (profile, scheme) => {
  // Req 18.5: ELEVATE conditions AND scStFounder === true → definitely-eligible.
  if (!profile.scStFounder) {
    return makeResult(scheme, 'not-eligible', [
      'ELEVATE Unnati is a dedicated track for SC/ST founders; your profile is not marked as having an SC/ST founder.',
    ]);
  }
  // SC/ST gate satisfied — defer to the shared ELEVATE stage/funding logic.
  return evaluateElevateCore(profile, scheme, 'ELEVATE Unnati');
};

const evaluateRgep: SchemeEvaluator = (profile, scheme) => {
  // Req 18.7: founderAge ≤ 30 → qualifying.
  if (profile.founderAge <= 30) {
    return makeResult(scheme, 'definitely-eligible', [
      'RGEP supports individual young innovators aged 30 or under — your founder age qualifies.',
    ]);
  }
  return makeResult(scheme, 'not-eligible', [
    'RGEP is limited to innovators aged 30 or under; your founder age is above the limit.',
  ]);
};

const evaluateNewIncubationCenters: SchemeEvaluator = (profile, scheme) => {
  // Req 18.8: qualifying only when derived Zone ∈ {Zone 1, Zone 2} (excludes Bengaluru Urban / Zone 3).
  const zone = deriveZone(profile.location);
  if (zone === 'Zone 1' || zone === 'Zone 2') {
    return makeResult(scheme, 'definitely-eligible', [
      `Your location falls in ${zone}, where new incubation-center grants apply (Bengaluru Urban / Zone 3 is excluded).`,
    ]);
  }
  return makeResult(scheme, 'not-eligible', [
    'New incubation-center grants are restricted to Zone 1 and Zone 2 districts and exclude Bengaluru Urban (Zone 3).',
  ]);
};

const evaluateBeyondBengaluruCluster: SchemeEvaluator = (profile, scheme) => {
  // Req 18.9: location !== 'Bengaluru Urban' → qualifying (equity-linked seed).
  if (profile.location !== 'Bengaluru Urban') {
    return makeResult(scheme, 'definitely-eligible', [
      'The Beyond Bengaluru Cluster Seed Fund supports startups outside Bengaluru Urban — your location qualifies.',
    ]);
  }
  return makeResult(scheme, 'not-eligible', [
    'The Beyond Bengaluru Cluster Seed Fund excludes Bengaluru Urban; it targets the Beyond Bengaluru clusters.',
  ]);
};

const evaluateKitven: SchemeEvaluator = (profile, scheme) => {
  // Req 18.10: currentStage ≥ Early Revenue → qualifying (equity).
  if (stageAtLeast(profile.currentStage, 'Early Revenue')) {
    return makeResult(scheme, 'definitely-eligible', [
      'KITVEN Fund-5 invests in growth-stage startups (Early Revenue or beyond) with traction — your stage qualifies.',
    ]);
  }
  return makeResult(scheme, 'not-eligible', [
    'KITVEN Fund-5 requires revenue traction (Early Revenue stage or beyond); your profile is earlier than that.',
  ]);
};

const evaluateInternshipSupport: SchemeEvaluator = (profile, scheme) => {
  // Req 18.11: qualification based on dpiitRecognized === true.
  if (profile.dpiitRecognized) {
    return makeResult(scheme, 'definitely-eligible', [
      'Internship support is available to DPIIT-recognized startups engaging student interns.',
    ]);
  }
  return makeResult(scheme, 'not-eligible', [
    'Internship support requires DPIIT recognition, which your profile does not have.',
  ]);
};

const evaluateNain: SchemeEvaluator = (_profile, scheme) => {
  // Req 18.12: student-team status is unknown (not captured by RegistrationProfile),
  // so we always assign check-requirements. If a student-team signal existed and
  // were unmet, the rule would assign not-eligible instead.
  return makeResult(scheme, 'check-requirements', [
    'NAIN 2.0 is for student teams affiliated to a NAIN-center institution — a detail your profile does not capture. Confirm your student-team status.',
  ]);
};

// --- Founder-judgment evaluators for the remaining canonical schemes ---

/** DPIIT-gated fiscal reimbursement whose final claim depends on an unverifiable action. */
const dpiitGatedLikely =
  (action: string): SchemeEvaluator =>
  (profile, scheme) => {
    if (profile.dpiitRecognized) {
      return makeResult(scheme, 'likely-eligible', [
        `DPIIT recognition is in place; the final benefit depends on ${action}.`,
      ]);
    }
    return makeResult(scheme, 'not-eligible', [
      'This scheme requires DPIIT recognition, which your profile does not have.',
    ]);
  };

const evaluateGlobalKarnataka = dpiitGatedLikely(
  'participating in an event on the approved international list',
);
const evaluateQualityCertification = dpiitGatedLikely(
  'obtaining a qualifying certification (ISO/CE/FDA, etc.) from an approved body',
);
const evaluatePfEsi = dpiitGatedLikely(
  'adding Karnataka-domiciled employees and filing PF/ESI contributions',
);
const evaluateCloudStorage = dpiitGatedLikely('an active, eligible cloud-service subscription');
const evaluatePreferentialMarketAccess = dpiitGatedLikely(
  'registering on the Karnataka procurement portal',
);

const evaluateRdProjectGrant: SchemeEvaluator = (profile, scheme) => {
  if (profile.dpiitRecognized) {
    return makeResult(scheme, 'check-requirements', [
      'DPIIT recognition is in place, but the R&D Project Grant also needs an academic/research partnership and an industry sponsor — confirm those are arranged.',
    ]);
  }
  return makeResult(scheme, 'not-eligible', [
    'The R&D Project Grant requires DPIIT recognition (plus an academic partnership and industry sponsor).',
  ]);
};

const evaluateGrandChallenge: SchemeEvaluator = (_profile, scheme) =>
  makeResult(scheme, 'check-requirements', [
    'Grand Challenge Karnataka is cohort-based: eligibility depends on an open, sector-specific challenge statement that matches your solution.',
  ]);

const evaluateAlternateInvestmentBridge: SchemeEvaluator = (_profile, scheme) =>
  makeResult(scheme, 'check-requirements', [
    'The Alternate Investment Bridge is a call-based instrument (currently upcoming); eligibility is defined per call notification.',
  ]);

const evaluateIncubationExpansion: SchemeEvaluator = (profile, scheme) => {
  // For existing incubators located outside Bengaluru Urban — entity type can't be verified from a startup profile.
  if (profile.location !== 'Bengaluru Urban') {
    return makeResult(scheme, 'likely-eligible', [
      'Your location is outside Bengaluru Urban; this grant is for existing incubators expanding there — confirm you operate an incubator.',
    ]);
  }
  return makeResult(scheme, 'not-eligible', [
    'The incubation-center expansion grant is restricted to incubators located outside Bengaluru Urban.',
  ]);
};

const evaluateKan: SchemeEvaluator = (profile, scheme) => {
  // KAN: DPIIT-recognized, Karnataka-registered, past PoC stage (non-monetary support).
  if (!profile.dpiitRecognized) {
    return makeResult(scheme, 'not-eligible', [
      'The Karnataka Acceleration Network requires DPIIT recognition, which your profile does not have.',
    ]);
  }
  if (stageAtLeast(profile.currentStage, 'Early Revenue')) {
    return makeResult(scheme, 'likely-eligible', [
      'You are DPIIT-recognized and past the PoC stage — a good fit for KAN acceleration (non-monetary support, selection is cohort-based).',
    ]);
  }
  return makeResult(scheme, 'check-requirements', [
    'KAN targets DPIIT-recognized startups past the PoC stage; confirm you have moved beyond PoC.',
  ]);
};

const evaluateTto: SchemeEvaluator = (_profile, scheme) =>
  makeResult(scheme, 'check-requirements', [
    'TTO support is for approved anchor academic/research institutes setting up technology-transfer offices, not for individual startups — confirm your institute eligibility.',
  ]);

const evaluateGrassrootInnovation: SchemeEvaluator = (_profile, scheme) =>
  makeResult(scheme, 'check-requirements', [
    'Grassroot Innovation Support is for individual grassroot/rural innovators; confirm your innovation has a grassroot/rural focus.',
  ]);

/**
 * Per-scheme evaluator map, keyed by the canonical `schemes.ts` ids. Every one
 * of the 22 ids has an explicit evaluator. `evaluateScheme` falls back to
 * `defaultEvaluator` for any id not present here (Req 19.5).
 */
export const SCHEME_EVALUATORS: Record<string, SchemeEvaluator> = {
  // Fiscal incentives
  'sgst-reimbursement': evaluateSgst,
  'patent-subsidy': evaluatePatent,
  'global-karnataka': evaluateGlobalKarnataka,
  'quality-certification': evaluateQualityCertification,
  'pf-esi-reimbursement': evaluatePfEsi,
  'cloud-storage': evaluateCloudStorage,
  'rd-project-grant': evaluateRdProjectGrant,
  'internship-support': evaluateInternshipSupport,
  // Grant programs
  'elevate': evaluateElevate,
  'elevate-unnati': evaluateElevateUnnati,
  'rgep': evaluateRgep,
  'grand-challenge-karnataka': evaluateGrandChallenge,
  'kitven-fund-5': evaluateKitven,
  'beyond-bengaluru-cluster-fund': evaluateBeyondBengaluruCluster,
  'alternate-investment-bridge': evaluateAlternateInvestmentBridge,
  'new-incubation-centers': evaluateNewIncubationCenters,
  'incubation-expansion': evaluateIncubationExpansion,
  'nain-2': evaluateNain,
  'preferential-market-access': evaluatePreferentialMarketAccess,
  'kan': evaluateKan,
  'tto': evaluateTto,
  'grassroot-innovation': evaluateGrassrootInnovation,
};

// ---------------------------------------------------------------------------
// 6. Default evaluator (Req 19.5)
// ---------------------------------------------------------------------------

/**
 * Fallback for any scheme id without an explicit evaluator. Returns
 * 'check-requirements' with a non-empty generic reason.
 */
export const defaultEvaluator: SchemeEvaluator = (_profile, scheme) =>
  makeResult(scheme, 'check-requirements', [
    'Automated eligibility rules are not defined for this scheme yet — review the scheme requirements directly to confirm your eligibility.',
  ]);

// ---------------------------------------------------------------------------
// 7. Primary entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate a single scheme for a profile. Looks up the scheme's evaluator (or
 * the default) and returns a well-formed EligibilityResult via makeResult.
 */
export function evaluateScheme(profile: RegistrationProfile, scheme: Scheme): EligibilityResult {
  const evaluator = SCHEME_EVALUATORS[scheme.id] ?? defaultEvaluator;
  return evaluator(profile, scheme);
}

// ---------------------------------------------------------------------------
// 8. Batch + totals (Req 19.7)
// ---------------------------------------------------------------------------

/**
 * Evaluate every canonical scheme for a profile. Returns a record keyed by
 * scheme id (all 22 schemes from `src/data/schemes.ts`).
 */
export function evaluateAllSchemes(
  profile: RegistrationProfile,
): Record<string, EligibilityResult> {
  const results: Record<string, EligibilityResult> = {};
  for (const scheme of schemes) {
    results[scheme.id] = evaluateScheme(profile, scheme);
  }
  return results;
}

/** A scheme qualifies (counts toward totals) when its status is definitely- or likely-eligible. */
function isQualifying(status: EligibilityStatus): boolean {
  return status === 'definitely-eligible' || status === 'likely-eligible';
}

/**
 * Sum of `estimatedBenefit` across QUALIFYING schemes (status definitely- or
 * likely-eligible) (Req 19.7). check-requirements / not-eligible contribute 0.
 */
export function totalEstimatedBenefit(results: Record<string, EligibilityResult>): number {
  let total = 0;
  for (const result of Object.values(results)) {
    if (isQualifying(result.status)) {
      total += result.estimatedBenefit;
    }
  }
  return total;
}

/**
 * Weighted-average confidence across QUALIFYING schemes (definitely- or
 * likely-eligible).
 *
 * Definition (documented): each qualifying scheme's confidence is weighted by
 * its estimatedBenefit, so larger expected benefits influence the headline
 * confidence more — i.e. Σ(confidence × benefit) / Σ(benefit). When the total
 * benefit weight is 0 (e.g. only non-monetary qualifying schemes), we fall back
 * to a simple mean of those schemes' confidences. With no qualifying schemes the
 * result is 0. The output is always within [0, 1] because every confidence is in
 * [0, 1] and all weights are ≥ 0.
 */
export function weightedAverageConfidence(results: Record<string, EligibilityResult>): number {
  const qualifying = Object.values(results).filter((r) => isQualifying(r.status));
  if (qualifying.length === 0) return 0;

  const weightSum = qualifying.reduce((sum, r) => sum + r.estimatedBenefit, 0);
  if (weightSum > 0) {
    const weighted = qualifying.reduce((sum, r) => sum + r.confidence * r.estimatedBenefit, 0);
    return weighted / weightSum;
  }

  // Fallback: simple mean of confidences when all weights are 0.
  const confidenceSum = qualifying.reduce((sum, r) => sum + r.confidence, 0);
  return confidenceSum / qualifying.length;
}
