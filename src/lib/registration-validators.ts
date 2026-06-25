// src/lib/registration-validators.ts
//
// PURE per-step validation for the Registration Wizard (Steps 1–5).
//
// Each exported function is a StepValidator: it takes a Partial<RegistrationProfile>
// draft and returns a WizardFieldErrors record mapping each INVALID field name to a
// human-readable error message, or `{}` when every field for that step is valid
// (Req 11.1–11.3).
//
// These functions are pure and deterministic (Req 11.4): same input → same output,
// no mutation of arguments, no I/O, no access to browser storage or network. They
// encode EXACTLY the field rules defined in Requirements 4–8 (Req 11.5). The wizard's
// Continue gating reuses them so the UI and tests share one rule set.
//
// NOTE: `new Date()` is read inside validateStep2 only to compare the incorporation
// date against "today" (Req 5.5). This reads the clock but performs no I/O and does
// not mutate inputs; the comparison is the documented, required behavior.

import type {
  StepValidator,
  WizardFieldErrors,
  CurrentStage,
  LocationKarnataka,
  FundingStage,
} from '@/types';
import { sectors } from '@/data/sectors';

// --- Allowed enumeration value sets (mirror the union types in src/types) ---

const CURRENT_STAGES: readonly CurrentStage[] = [
  'Idea',
  'PoC',
  'Early Revenue',
  'Growth',
  'Scale',
];

const LOCATIONS: readonly LocationKarnataka[] = [
  'Bengaluru Urban',
  'Bengaluru Rural',
  'Mysuru',
  'Mangaluru',
  'Hubballi-Dharwad-Belagavi',
  'Kalaburagi',
  'Shivamogga',
  'Tumakuru',
  'Other Karnataka',
];

const FUNDING_STAGES: readonly FundingStage[] = [
  'Bootstrapped',
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B Plus',
];

// Valid Sector ids, sourced from the canonical sectors data (kept pure: this is a
// static import of typed data, no fetch/IO). Used to validate primarySector.
const SECTOR_IDS: ReadonlySet<string> = new Set(sectors.map((s) => s.id));

// Standard email pattern: a local part, an @, and a domain containing a dot
// (local@domain.tld) — Req 4.3. Deliberately pragmatic, not RFC-exhaustive.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- Small pure helpers ---

function isNonEmptyTrimmed(value: unknown, minLength: number): boolean {
  return typeof value === 'string' && value.trim().length >= minLength;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Normalize a phone string for validation (Req 4.4): strip a single optional
 * leading `+91` country prefix and all separator characters (spaces, dashes,
 * parentheses, dots). Returns the remaining characters so the caller can check
 * for exactly 10 digits. Pure — does not mutate its argument.
 */
function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const withoutPrefix = trimmed.replace(/^\+91/, '');
  return withoutPrefix.replace(/[\s\-().]/g, '');
}

// ---------------------------------------------------------------------------
// Step 1 — Founder details (Req 4)
// ---------------------------------------------------------------------------
export const validateStep1: StepValidator = (profile): WizardFieldErrors => {
  const errors: WizardFieldErrors = {};

  // founderName ≥ 2 characters after trimming (Req 4.2)
  if (!isNonEmptyTrimmed(profile.founderName, 2)) {
    errors.founderName = 'Enter your full name (at least 2 characters).';
  }

  // founderEmail matches local@domain.tld (Req 4.3)
  if (
    typeof profile.founderEmail !== 'string' ||
    !EMAIL_PATTERN.test(profile.founderEmail.trim())
  ) {
    errors.founderEmail = 'Enter a valid email address, for example name@example.com.';
  }

  // founderPhone = exactly 10 digits after stripping +91 and separators (Req 4.4)
  if (typeof profile.founderPhone !== 'string') {
    errors.founderPhone = 'Enter a 10-digit mobile number.';
  } else {
    const normalized = normalizePhone(profile.founderPhone);
    if (!/^\d{10}$/.test(normalized)) {
      errors.founderPhone =
        'Enter a valid 10-digit mobile number (an optional +91 prefix is allowed).';
    }
  }

  // founderAge between 18 and 80 inclusive (Req 4.5)
  if (!isFiniteNumber(profile.founderAge) || profile.founderAge < 18 || profile.founderAge > 80) {
    errors.founderAge = 'Age must be between 18 and 80.';
  }

  return errors;
};

// ---------------------------------------------------------------------------
// Step 2 — Company basics (Req 5)
// ---------------------------------------------------------------------------
export const validateStep2: StepValidator = (profile): WizardFieldErrors => {
  const errors: WizardFieldErrors = {};

  // companyName ≥ 2 characters after trimming (Req 5.2)
  if (!isNonEmptyTrimmed(profile.companyName, 2)) {
    errors.companyName = 'Enter your company name (at least 2 characters).';
  }

  // dpiitRecognized must be an explicit boolean; undefined → selection required (Req 5.3)
  if (typeof profile.dpiitRecognized !== 'boolean') {
    errors.dpiitRecognized = 'Select Yes or No for DPIIT recognition.';
  }

  // gstRegistered must be an explicit boolean; undefined → selection required (Req 5.3)
  if (typeof profile.gstRegistered !== 'boolean') {
    errors.gstRegistered = 'Select Yes or No for GST registration.';
  }

  // incorporationDate present (non-empty) and not in the future (Req 5.4, 5.5)
  if (!isNonEmptyTrimmed(profile.incorporationDate, 1)) {
    errors.incorporationDate = 'Enter your incorporation date.';
  } else {
    const incorporation = new Date(profile.incorporationDate as string);
    if (Number.isNaN(incorporation.getTime())) {
      errors.incorporationDate = 'Enter a valid incorporation date.';
    } else {
      // Compare against the end of today so a same-day date is allowed.
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (incorporation.getTime() > today.getTime()) {
        errors.incorporationDate = 'Incorporation date cannot be in the future.';
      }
    }
  }

  // currentStage ∈ the five CurrentStage values (Req 5.6)
  if (
    typeof profile.currentStage !== 'string' ||
    !CURRENT_STAGES.includes(profile.currentStage as CurrentStage)
  ) {
    errors.currentStage = 'Select your current stage.';
  }

  return errors;
};

// ---------------------------------------------------------------------------
// Step 3 — Team composition (Req 6)
// ---------------------------------------------------------------------------
export const validateStep3: StepValidator = (profile): WizardFieldErrors => {
  const errors: WizardFieldErrors = {};

  // teamSize between 1 and 5000 inclusive (Req 6.2)
  if (!isFiniteNumber(profile.teamSize) || profile.teamSize < 1 || profile.teamSize > 5000) {
    errors.teamSize = 'Team size must be between 1 and 5000.';
  }

  // womenFounderStake within 0–100 (Req 6.3)
  if (
    !isFiniteNumber(profile.womenFounderStake) ||
    profile.womenFounderStake < 0 ||
    profile.womenFounderStake > 100
  ) {
    errors.womenFounderStake = 'Women founder stake must be between 0 and 100.';
  }

  // womenEmployeePercentage within 0–100 (Req 6.3)
  if (
    !isFiniteNumber(profile.womenEmployeePercentage) ||
    profile.womenEmployeePercentage < 0 ||
    profile.womenEmployeePercentage > 100
  ) {
    errors.womenEmployeePercentage = 'Women employee percentage must be between 0 and 100.';
  }

  // scStFounder is a free boolean — no error (Req 6.1, 6.5)

  return errors;
};

// ---------------------------------------------------------------------------
// Step 4 — Sector selection (Req 7)
// ---------------------------------------------------------------------------
export const validateStep4: StepValidator = (profile): WizardFieldErrors => {
  const errors: WizardFieldErrors = {};

  // primarySector must be a non-empty, valid Sector id (Req 7.2)
  if (
    typeof profile.primarySector !== 'string' ||
    profile.primarySector.length === 0 ||
    !SECTOR_IDS.has(profile.primarySector)
  ) {
    errors.primarySector = 'Select your primary sector.';
  }

  // secondarySectors: at most 3, and must not contain the primary sector (Req 7.4, 7.6)
  const secondary = profile.secondarySectors;
  if (secondary !== undefined) {
    if (!Array.isArray(secondary)) {
      errors.secondarySectors = 'Select up to 3 secondary sectors.';
    } else if (secondary.length > 3) {
      errors.secondarySectors = 'You can select at most 3 secondary sectors.';
    } else if (
      typeof profile.primarySector === 'string' &&
      secondary.includes(profile.primarySector)
    ) {
      errors.secondarySectors =
        'Secondary sectors cannot include your primary sector.';
    }
  }

  return errors;
};

// ---------------------------------------------------------------------------
// Step 5 — Location and funding (Req 8)
// ---------------------------------------------------------------------------
export const validateStep5: StepValidator = (profile): WizardFieldErrors => {
  const errors: WizardFieldErrors = {};

  // location ∈ the nine LocationKarnataka values (Req 8.3)
  if (
    typeof profile.location !== 'string' ||
    !LOCATIONS.includes(profile.location as LocationKarnataka)
  ) {
    errors.location = 'Select your location in Karnataka.';
  }

  // fundingStage ∈ the five FundingStage values (Req 8.5)
  if (
    typeof profile.fundingStage !== 'string' ||
    !FUNDING_STAGES.includes(profile.fundingStage as FundingStage)
  ) {
    errors.fundingStage = 'Select your funding stage.';
  }

  // fundingRaised ≥ 0 (Req 8.7)
  if (!isFiniteNumber(profile.fundingRaised) || profile.fundingRaised < 0) {
    errors.fundingRaised = 'Funding raised cannot be negative.';
  }

  return errors;
};
