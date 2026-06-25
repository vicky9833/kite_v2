// idea-form-validation.ts — Pure validator for the Idea Submission Form.
//
// Given candidate Idea_Submission_Form values, this module reports per-field
// error messages plus a single `isValid` boolean (true iff there are no field
// errors). The form is valid iff EVERY constraint below holds (Req 26.6–26.12):
//
//   - innovatorName     present (non-empty after trimming)
//   - innovatorEmail    present (non-empty) and of basic email shape
//   - innovatorAge       present and numeric (a real, finite number)
//   - ideaTitle         at least 5 characters
//   - ideaSummary       50–500 characters inclusive
//   - problemStatement  50–1000 characters inclusive
//   - proposedSolution  50–1000 characters inclusive
//   - innovatorType     set (one of INNOVATOR_TYPES)
//   - ideaCategory      set (one of IDEA_CATEGORIES)
//   - location          set (a LocationKarnataka)
//
// Pure: no React, no I/O, no network, no clock, and no mutation of inputs.

import {
  INNOVATOR_TYPES,
  IDEA_CATEGORIES,
  type InnovatorType,
  type IdeaCategory,
  type LocationKarnataka,
} from '@/types';

// ---------------------------------------------------------------------------
// Input type — a partial draft of the form fields. Each field may be absent
// (null) while the user is still filling the form; text fields are strings,
// `innovatorAge` is numeric, and the three choice fields are their unions.
// ---------------------------------------------------------------------------
export interface IdeaFormValues {
  innovatorName: string | null;
  innovatorEmail: string | null;
  innovatorAge: number | null;
  innovatorType: InnovatorType | null;
  ideaTitle: string | null;
  ideaCategory: IdeaCategory | null;
  ideaSummary: string | null;
  problemStatement: string | null;
  proposedSolution: string | null;
  location: LocationKarnataka | null;
}

// Per-field error map: present keys are invalid fields, value is the message.
export interface IdeaFormValidationResult {
  fieldErrors: Record<string, string>;
  isValid: boolean;
}

// --- Constraint constants (single source of truth) ---
export const IDEA_TITLE_MIN_LENGTH = 5;
export const IDEA_SUMMARY_MIN_LENGTH = 50;
export const IDEA_SUMMARY_MAX_LENGTH = 500;
export const IDEA_PROBLEM_MIN_LENGTH = 50;
export const IDEA_PROBLEM_MAX_LENGTH = 1000;
export const IDEA_SOLUTION_MIN_LENGTH = 50;
export const IDEA_SOLUTION_MAX_LENGTH = 1000;

// Basic email shape: a local part, an @, and a domain containing a dot
// (local@domain.tld). Deliberately pragmatic, not RFC-exhaustive.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INNOVATOR_TYPE_SET: ReadonlySet<string> = new Set(INNOVATOR_TYPES);
const IDEA_CATEGORY_SET: ReadonlySet<string> = new Set(IDEA_CATEGORIES);
const LOCATION_SET: ReadonlySet<string> = new Set<LocationKarnataka>([
  'Bengaluru Urban',
  'Bengaluru Rural',
  'Mysuru',
  'Mangaluru',
  'Hubballi-Dharwad-Belagavi',
  'Kalaburagi',
  'Shivamogga',
  'Tumakuru',
  'Other Karnataka',
]);

// --- Small pure helpers ---
function trimmedLength(value: string | null): number {
  return typeof value === 'string' ? value.trim().length : 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Validate the Idea Submission Form values. Returns a per-field message map
 * containing only the invalid fields, plus `isValid` (true iff the map is
 * empty). Pure and deterministic.
 */
export function validateIdeaForm(values: IdeaFormValues): IdeaFormValidationResult {
  const fieldErrors: Record<string, string> = {};

  // innovatorName — present (non-empty after trimming) (Req 26.6)
  if (trimmedLength(values.innovatorName) === 0) {
    fieldErrors.innovatorName = 'Enter your name.';
  }

  // innovatorEmail — present and of basic email shape (Req 26.6)
  if (
    typeof values.innovatorEmail !== 'string' ||
    !EMAIL_PATTERN.test(values.innovatorEmail.trim())
  ) {
    fieldErrors.innovatorEmail =
      'Enter a valid email address, for example name@example.com.';
  }

  // innovatorAge — present and numeric (a real, finite number) (Req 26.6)
  if (!isFiniteNumber(values.innovatorAge)) {
    fieldErrors.innovatorAge = 'Enter your age as a number.';
  }

  // ideaTitle — at least 5 characters (Req 26.7)
  if (trimmedLength(values.ideaTitle) < IDEA_TITLE_MIN_LENGTH) {
    fieldErrors.ideaTitle = `Title must be at least ${IDEA_TITLE_MIN_LENGTH} characters.`;
  }

  // ideaSummary — 50–500 characters inclusive (Req 26.8)
  {
    const len = trimmedLength(values.ideaSummary);
    if (len < IDEA_SUMMARY_MIN_LENGTH || len > IDEA_SUMMARY_MAX_LENGTH) {
      fieldErrors.ideaSummary =
        `Summary must be between ${IDEA_SUMMARY_MIN_LENGTH} and ${IDEA_SUMMARY_MAX_LENGTH} characters.`;
    }
  }

  // problemStatement — 50–1000 characters inclusive (Req 26.9)
  {
    const len = trimmedLength(values.problemStatement);
    if (len < IDEA_PROBLEM_MIN_LENGTH || len > IDEA_PROBLEM_MAX_LENGTH) {
      fieldErrors.problemStatement =
        `Problem statement must be between ${IDEA_PROBLEM_MIN_LENGTH} and ${IDEA_PROBLEM_MAX_LENGTH} characters.`;
    }
  }

  // proposedSolution — 50–1000 characters inclusive (Req 26.10)
  {
    const len = trimmedLength(values.proposedSolution);
    if (len < IDEA_SOLUTION_MIN_LENGTH || len > IDEA_SOLUTION_MAX_LENGTH) {
      fieldErrors.proposedSolution =
        `Proposed solution must be between ${IDEA_SOLUTION_MIN_LENGTH} and ${IDEA_SOLUTION_MAX_LENGTH} characters.`;
    }
  }

  // innovatorType — set (one of INNOVATOR_TYPES) (Req 26.11/26.12)
  if (values.innovatorType === null || !INNOVATOR_TYPE_SET.has(values.innovatorType)) {
    fieldErrors.innovatorType = 'Select an innovator type.';
  }

  // ideaCategory — set (one of IDEA_CATEGORIES) (Req 26.11/26.12)
  if (values.ideaCategory === null || !IDEA_CATEGORY_SET.has(values.ideaCategory)) {
    fieldErrors.ideaCategory = 'Select an idea category.';
  }

  // location — set (a LocationKarnataka) (Req 26.11/26.12)
  if (values.location === null || !LOCATION_SET.has(values.location)) {
    fieldErrors.location = 'Select a location.';
  }

  return { fieldErrors, isValid: Object.keys(fieldErrors).length === 0 };
}
