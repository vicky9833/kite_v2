import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
// Type-only import: `AppRouterInstance` is not re-exported as a public name from
// `next/navigation`, but `useRouter`'s return type IS that instance. Deriving the
// type this way keeps `safeNavigate` strongly typed against the App Router without
// importing a client hook as runtime code or reaching into Next's `dist/` internals.
import type { useRouter } from "next/navigation";

import type {
  Cluster,
  EcosystemEvent,
  GIACountry,
  NavItem,
  Scheme,
  SchemeType,
} from "@/types";

/** The Next.js App Router instance (return type of `useRouter`). */
export type AppRouterInstance = ReturnType<typeof useRouter>;

/* -------------------------------------------------------------------------- */
/* Class names                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 *
 * Required by the shadcn/ui primitives in `src/components/ui/` (task 1.5) — do
 * not remove. The rest of this file (task 1.8) extends the utility surface with
 * display formatters, route validation, safe navigation, type guards, the pure
 * filter/sort helpers, and the data-integrity assertion used by the data PBTs.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------------- */
/* Display formatters                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Format a numeric value for display using the Indian numbering system
 * (lakh/crore grouping). Non-finite values render as "0". Pure & deterministic.
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return Math.round(value).toLocaleString("en-IN");
}

/**
 * Format a stat for display by wrapping the formatted number in its optional
 * prefix (e.g. "$", "₹") and suffix (e.g. "+", "B", "Cr"). Used by StatCard to
 * render both the count-up value and the final target. Pure & deterministic.
 */
export function formatStatValue(
  value: number,
  options: { prefix?: string; suffix?: string } = {},
): string {
  const { prefix = "", suffix = "" } = options;
  return `${prefix}${formatNumber(value)}${suffix}`;
}

/* -------------------------------------------------------------------------- */
/* Route validation & safe navigation                                         */
/* -------------------------------------------------------------------------- */

/**
 * Predicate: is `href` a valid internal (in-app) path?
 *
 * Returns `true` iff `href` is a non-empty string that, after rejecting
 * whitespace-only values, begins with a single "/" — i.e. an absolute internal
 * path. Returns `false` for:
 *  - missing / non-string values
 *  - the empty string or whitespace-only strings
 *  - external URLs ("http://…", "https://…", any "scheme://…")
 *  - protocol-relative URLs ("//host/…")
 *  - relative paths that do not start with "/" ("schemes", "./x")
 */
export function isValidRoute(href: string): boolean {
  if (typeof href !== "string") {
    return false;
  }
  if (href.trim().length === 0) {
    return false;
  }
  // Must be an absolute internal path…
  if (!href.startsWith("/")) {
    return false;
  }
  // …but not a protocol-relative ("//evil.com") external reference.
  if (href.startsWith("//")) {
    return false;
  }
  return true;
}

/**
 * Navigate to `href` iff it is a valid internal route. On success the router
 * pushes the route and the function returns `true`. On an invalid/missing href
 * it does NOT navigate, surfaces a non-blocking toast, keeps the visitor on the
 * current page, and returns `false`.
 *
 * This is the single side-effecting helper in this module; the boolean return
 * makes the navigate/skip decision observable for tests (Property 1).
 */
export function safeNavigate(
  router: Pick<AppRouterInstance, "push">,
  href: string | undefined | null,
): boolean {
  if (typeof href === "string" && isValidRoute(href)) {
    router.push(href);
    return true;
  }
  toast("This destination isn't available yet");
  return false;
}

/* -------------------------------------------------------------------------- */
/* Type guards                                                                */
/* -------------------------------------------------------------------------- */

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** True iff `value` is a non-empty array whose every element is a non-empty string. */
function isNonEmptyStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => isNonEmptyString(item))
  );
}

/**
 * Type guard: a Cluster is valid iff every required string field is non-empty,
 * its string-array fields are non-empty arrays of non-empty strings, and its
 * `href` is a valid internal route (Property 7). Pure & deterministic.
 */
export function isValidCluster(cluster: unknown): cluster is Cluster {
  if (cluster === null || typeof cluster !== "object") {
    return false;
  }
  const c = cluster as Partial<Cluster>;
  return (
    isNonEmptyString(c.id) &&
    isNonEmptyString(c.name) &&
    isNonEmptyString(c.tagline) &&
    isNonEmptyString(c.seedFund) &&
    isNonEmptyString(c.ctaLabel) &&
    isNonEmptyStringArray(c.focusAreas) &&
    isNonEmptyStringArray(c.infrastructure) &&
    isNonEmptyStringArray(c.anchorInstitutions) &&
    isNonEmptyString(c.href) &&
    isValidRoute(c.href)
  );
}

/** Matches exactly two ASCII letters (ISO 3166-1 alpha-2 shape). */
const ISO_ALPHA2_PATTERN = /^[A-Za-z]{2}$/;

/**
 * Type guard: a GIACountry is valid iff its `name` is non-empty and its
 * `countryCode` is a non-empty two-letter ASCII ISO 3166-1 alpha-2 code
 * (Property 12). Pure & deterministic.
 */
export function isValidGIACountry(country: unknown): country is GIACountry {
  if (country === null || typeof country !== "object") {
    return false;
  }
  const c = country as Partial<GIACountry>;
  return (
    isNonEmptyString(c.name) &&
    typeof c.countryCode === "string" &&
    ISO_ALPHA2_PATTERN.test(c.countryCode)
  );
}

/* -------------------------------------------------------------------------- */
/* Pure filter / sort helpers                                                 */
/* -------------------------------------------------------------------------- */

/** The scheme filter tabs: "All" plus every concrete `SchemeType`. */
export type SchemeFilterTab = SchemeType | "All";

/**
 * Filter schemes by the selected tab (Property 8). When `tab` is "All" the full
 * list is returned; otherwise only schemes whose `type` equals the tab. Returns
 * a new array (does not mutate the input). Pure & deterministic.
 */
export function filterSchemes(
  schemes: Scheme[],
  tab: SchemeFilterTab,
): Scheme[] {
  if (tab === "All") {
    return schemes.slice();
  }
  return schemes.filter((scheme) => scheme.type === tab);
}

/**
 * Filter a destination list by a case-insensitive substring match on `label`
 * (Property 2). An empty or whitespace-only query returns the full list. Returns
 * a new array (does not mutate the input). Pure & deterministic.
 */
export function filterDestinations(list: NavItem[], query: string): NavItem[] {
  const normalized = typeof query === "string" ? query.trim().toLowerCase() : "";
  if (normalized.length === 0) {
    return list.slice();
  }
  return list.filter((item) => item.label.toLowerCase().includes(normalized));
}

/** Preview bounds for the events section (Property 11). */
const PREVIEW_MIN = 4;
const PREVIEW_MAX = 6;

/**
 * Select the events preview (Property 11): sort ascending by `startDate` and
 * return at most {@link PREVIEW_MAX} (6) events. The events module guarantees
 * at least {@link PREVIEW_MIN} (4) items; if fewer exist this returns whatever
 * is available. Returns a new array (does not mutate the input). Pure &
 * deterministic (stable sort on ISO-8601 strings).
 */
export function selectPreview(events: EcosystemEvent[]): EcosystemEvent[] {
  return events
    .slice()
    .sort((a, b) => {
      if (a.startDate < b.startDate) return -1;
      if (a.startDate > b.startDate) return 1;
      return 0;
    })
    .slice(0, PREVIEW_MAX);
}

/* -------------------------------------------------------------------------- */
/* Data integrity assertion (Properties 14, 15, 16)                           */
/* -------------------------------------------------------------------------- */

/**
 * Placeholder / filler patterns rejected by {@link assertDataIntegrity}
 * (Property 16). Matching is case-insensitive and ignores surrounding
 * whitespace.
 */
const PLACEHOLDER_PATTERNS: readonly RegExp[] = [
  /^tbd$/i,
  /^todo$/i,
  /^n\/a$/i,
  /^na$/i,
  /^none$/i,
  /^placeholder$/i,
  /lorem ipsum/i,
  /^(.)\1{4,}$/, // a single character repeated 5+ times (e.g. "xxxxx", "-----")
];

/**
 * Returns true if a string value is empty/whitespace-only or matches a known
 * placeholder / filler pattern (Property 16). Pure & deterministic.
 */
export function isPlaceholder(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return true;
  }
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** Options controlling {@link assertDataIntegrity}. */
export interface DataIntegrityOptions<T> {
  /** Human-readable module name used in assertion messages (e.g. "schemes"). */
  name: string;
  /** Exact required collection length — cardinality check (Property 14). */
  expectedCount?: number;
  /** Fields that must be non-null and non-undefined on every record (Property 15). */
  requiredFields: ReadonlyArray<keyof T>;
  /**
   * Subset of fields whose values must additionally be non-empty strings — or
   * arrays of non-empty strings — and must not match any placeholder pattern
   * (Properties 15 & 16). Defaults to the inferred string fields when omitted.
   */
  requiredStringFields?: ReadonlyArray<keyof T>;
}

/**
 * Reusable data-integrity assertion for the data-layer property tests. Enforces:
 *  - cardinality (Property 14) when `expectedCount` is provided,
 *  - completeness (Property 15): required fields are non-null/non-undefined and
 *    required string fields are non-empty,
 *  - no-placeholder (Property 16): required string fields contain no placeholder
 *    or filler content.
 *
 * Throws an `Error` describing the first violation; returns normally when the
 * collection is fully valid. Exported so the data PBTs (tasks 3.14–3.16) can
 * share one implementation.
 */
export function assertDataIntegrity<T extends Record<string, unknown>>(
  collection: ReadonlyArray<T>,
  options: DataIntegrityOptions<T>,
): void {
  const { name, expectedCount, requiredFields, requiredStringFields } = options;

  if (!Array.isArray(collection)) {
    throw new Error(`[${name}] expected an array collection`);
  }

  // Cardinality (Property 14)
  if (typeof expectedCount === "number" && collection.length !== expectedCount) {
    throw new Error(
      `[${name}] cardinality mismatch: expected ${expectedCount}, got ${collection.length}`,
    );
  }

  const stringFields = requiredStringFields ?? requiredFields;

  collection.forEach((record, index) => {
    if (record === null || typeof record !== "object") {
      throw new Error(`[${name}] record ${index} is not an object`);
    }

    // Completeness — non-null/non-undefined (Property 15)
    for (const field of requiredFields) {
      const value = record[field];
      if (value === null || value === undefined) {
        throw new Error(
          `[${name}] record ${index} field "${String(field)}" is null/undefined`,
        );
      }
    }

    // Non-empty strings + no placeholder (Properties 15 & 16)
    for (const field of stringFields) {
      const value = record[field];
      assertStringFieldClean(value, name, index, String(field));
    }
  });
}

/**
 * Validate that a single field value is a clean (non-empty, non-placeholder)
 * string, or an array of clean strings. Throws on the first violation.
 */
function assertStringFieldClean(
  value: unknown,
  name: string,
  index: number,
  field: string,
): void {
  if (Array.isArray(value)) {
    value.forEach((item, itemIndex) => {
      if (typeof item !== "string") {
        throw new Error(
          `[${name}] record ${index} field "${field}[${itemIndex}]" is not a string`,
        );
      }
      if (isPlaceholder(item)) {
        throw new Error(
          `[${name}] record ${index} field "${field}[${itemIndex}]" is empty or placeholder content ("${item}")`,
        );
      }
    });
    return;
  }

  if (typeof value !== "string") {
    throw new Error(
      `[${name}] record ${index} field "${field}" is not a string`,
    );
  }
  if (isPlaceholder(value)) {
    throw new Error(
      `[${name}] record ${index} field "${field}" is empty or placeholder content ("${value}")`,
    );
  }
}
