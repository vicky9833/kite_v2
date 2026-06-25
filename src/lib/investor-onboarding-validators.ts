// src/lib/investor-onboarding-validators.ts
//
// PURE per-step validation for the Investor Onboarding Wizard (Steps 1-3).
//
// Each exported function is StepValidator-shaped: it takes a
// Partial<InvestorProfile> draft and returns a WizardFieldErrors record mapping
// each INVALID field name to a human-readable message, or `{}` when every field
// for that step is valid (Req 16.3). Step 4 (Review) has no field validation —
// an accuracy confirmation gates submit instead.
//
// These functions are pure and deterministic: same input -> same output, no
// mutation of arguments, no I/O, no browser storage or network. They mirror
// `registration-validators.ts` exactly in shape and style.
//
// NOTE: `new Date().getFullYear()` is read inside validateInvestorStep2 only to
// bound `foundedYear` at "this year" (Req 16.3). This reads the clock but
// performs no I/O and does not mutate inputs; the comparison is the documented,
// required behavior (mirrors the incorporation-date check in step 2 of the
// registration validators).

import type {
  InvestorProfile,
  WizardFieldErrors,
  InvestorRole,
  FirmType,
  InvestmentStage,
} from '@/types';
import { sectors } from '@/data/sectors';

/** StepValidator shape specialised to the investor draft. */
export type InvestorStepValidator = (
  profile: Partial<InvestorProfile>,
) => WizardFieldErrors;

// --- Allowed enumeration value sets (mirror the union types in src/types) ---

const INVESTOR_ROLES: readonly InvestorRole[] = [
  'GP',
  'Partner',
  'Principal',
  'Associate',
  'Angel',
  'Family Office',
  'Corporate VC',
  'Government Fund',
];

const FIRM_TYPES: readonly FirmType[] = [
  'VC',
  'Angel Network',
  'Family Office',
  'Corporate VC',
  'Government Fund',
  'Accelerator Fund',
];

const INVESTMENT_STAGES: readonly InvestmentStage[] = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B Plus',
  'Growth',
];

// Valid Sector ids, sourced from the canonical sectors data (kept pure: a
// static import of typed data, no fetch/IO). Used to validate focusSectors.
const SECTOR_IDS: ReadonlySet<string> = new Set(sectors.map((s) => s.id));

// Standard email pattern: local@domain.tld (Req 16.3). Pragmatic, not
// RFC-exhaustive — identical to the registration validator's pattern.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Earliest plausible firm founding year.
const MIN_FOUNDED_YEAR = 1900;

// --- Small pure helpers ---

function isNonEmptyTrimmed(value: unknown, minLength: number): boolean {
  return typeof value === 'string' && value.trim().length >= minLength;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Normalize a phone string for validation: strip a single optional leading
 * `+91` country prefix and all separator characters (spaces, dashes,
 * parentheses, dots). Returns the remaining characters so the caller can check
 * for exactly 10 digits. Pure — does not mutate its argument.
 */
function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const withoutPrefix = trimmed.replace(/^\+91/, '');
  return withoutPrefix.replace(/[\s\-().]/g, '');
}

/** True when `value` is a non-empty array of valid Sector ids. */
function isNonEmptySectorIdList(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((id) => typeof id === 'string' && SECTOR_IDS.has(id))
  );
}

/** True when `value` is a non-empty array of valid InvestmentStage values. */
function isNonEmptyStageList(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (stage) =>
        typeof stage === 'string' &&
        INVESTMENT_STAGES.includes(stage as InvestmentStage),
    )
  );
}

/** True when `value` is a non-empty array of non-empty strings. */
function isNonEmptyStringList(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === 'string' && item.trim().length > 0)
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Identity (Req 16.3)
// ---------------------------------------------------------------------------
export const validateInvestorStep1: InvestorStepValidator = (profile): WizardFieldErrors => {
  const errors: WizardFieldErrors = {};

  // investorName >= 2 characters after trimming.
  if (!isNonEmptyTrimmed(profile.investorName, 2)) {
    errors.investorName = 'Enter your full name (at least 2 characters).';
  }

  // investorEmail matches local@domain.tld.
  if (
    typeof profile.investorEmail !== 'string' ||
    !EMAIL_PATTERN.test(profile.investorEmail.trim())
  ) {
    errors.investorEmail = 'Enter a valid email address, for example name@example.com.';
  }

  // investorPhone = exactly 10 digits after stripping +91 and separators.
  if (typeof profile.investorPhone !== 'string') {
    errors.investorPhone = 'Enter a 10-digit mobile number.';
  } else if (!/^\d{10}$/.test(normalizePhone(profile.investorPhone))) {
    errors.investorPhone =
      'Enter a valid 10-digit mobile number (an optional +91 prefix is allowed).';
  }

  // role in InvestorRole.
  if (
    typeof profile.role !== 'string' ||
    !INVESTOR_ROLES.includes(profile.role as InvestorRole)
  ) {
    errors.role = 'Select your role.';
  }

  return errors;
};

// ---------------------------------------------------------------------------
// Step 2 — Firm (Req 16.3)
// ---------------------------------------------------------------------------
export const validateInvestorStep2: InvestorStepValidator = (profile): WizardFieldErrors => {
  const errors: WizardFieldErrors = {};

  // firmType in FirmType.
  if (
    typeof profile.firmType !== 'string' ||
    !FIRM_TYPES.includes(profile.firmType as FirmType)
  ) {
    errors.firmType = 'Select your firm type.';
  }

  // assetsUnderManagement finite and >= 0.
  if (!isFiniteNumber(profile.assetsUnderManagement) || profile.assetsUnderManagement < 0) {
    errors.assetsUnderManagement = 'Assets under management cannot be negative.';
  }

  // foundedYear in 1900..currentYear.
  const currentYear = new Date().getFullYear();
  if (
    !isFiniteNumber(profile.foundedYear) ||
    profile.foundedYear < MIN_FOUNDED_YEAR ||
    profile.foundedYear > currentYear
  ) {
    errors.foundedYear = `Founded year must be between ${MIN_FOUNDED_YEAR} and ${currentYear}.`;
  }

  return errors;
};

// ---------------------------------------------------------------------------
// Step 3 — Thesis (Req 16.3)
// ---------------------------------------------------------------------------
export const validateInvestorStep3: InvestorStepValidator = (profile): WizardFieldErrors => {
  const errors: WizardFieldErrors = {};

  // focusSectors non-empty and every id valid.
  if (!isNonEmptySectorIdList(profile.focusSectors)) {
    errors.focusSectors = 'Select at least one focus sector.';
  }

  // focusStages non-empty and every value in InvestmentStage.
  if (!isNonEmptyStageList(profile.focusStages)) {
    errors.focusStages = 'Select at least one focus stage.';
  }

  // ticketSizeMinLakhs >= 0.
  const minOk = isFiniteNumber(profile.ticketSizeMinLakhs) && profile.ticketSizeMinLakhs >= 0;
  if (!minOk) {
    errors.ticketSizeMinLakhs = 'Minimum ticket size cannot be negative.';
  }

  // ticketSizeMaxLakhs >= ticketSizeMinLakhs (and a finite number).
  if (!isFiniteNumber(profile.ticketSizeMaxLakhs)) {
    errors.ticketSizeMaxLakhs = 'Enter a maximum ticket size.';
  } else if (minOk && profile.ticketSizeMaxLakhs < (profile.ticketSizeMinLakhs as number)) {
    errors.ticketSizeMaxLakhs =
      'Maximum ticket size must be greater than or equal to the minimum.';
  }

  // geographicFocus non-empty.
  if (!isNonEmptyStringList(profile.geographicFocus)) {
    errors.geographicFocus = 'Select at least one geographic focus.';
  }

  return errors;
};
