// Startup recommendations + profile completeness (pure).
//
// This module holds the pure, JSX-free logic behind the startup dashboard's
// "Profile Completeness" metric (Req 3.8) and the "Recommended Next Steps"
// section (Req 7). Everything here is a pure function of its inputs: no
// `Date`, no `Math.random`, no I/O. Absent profile fields are treated as
// unfilled / false via nullish coalescing, so partially-filled session
// profiles never throw.

import type { RegistrationProfile, Recommendation } from "@/types";

/* -------------------------------------------------------------------------- */
/* Profile completeness (Req 3.8)                                             */
/* -------------------------------------------------------------------------- */

/** True when a string field carries a non-empty (trimmed) value. */
function nonEmpty(value: string | null | undefined): boolean {
  return (value ?? "").trim().length > 0;
}

/**
 * The 10 enrichment predicates that define `Profile_Completeness`.
 *
 * Booleans count as "filled" only when `true`, since the enrichment value is
 * the affirmative state (DPIIT recognised, GST registered). Numeric fields
 * count when strictly positive; absent fields coalesce to a non-filled value.
 */
const COMPLETENESS_CHECKS: ReadonlyArray<(p: RegistrationProfile) => boolean> = [
  (p) => nonEmpty(p.founderPhone),
  (p) => nonEmpty(p.incorporationDate),
  (p) => (p.secondarySectors?.length ?? 0) >= 1,
  (p) => p.dpiitRecognized === true,
  (p) => p.gstRegistered === true,
  (p) => (p.teamSize ?? 0) > 0,
  (p) => (p.fundingRaised ?? 0) > 0,
  (p) => (p.womenFounderStake ?? 0) > 0 || (p.womenEmployeePercentage ?? 0) > 0,
  (p) => (p.founderAge ?? 0) > 0,
  (p) => nonEmpty(p.companyName),
];

/**
 * Percentage (integer in `[0, 100]`) of enrichment fields that are filled.
 *
 * Because the count is a non-negative integer never exceeding the fixed
 * denominator, the rounded result is always within `[0, 100]`.
 */
export function computeProfileCompleteness(p: RegistrationProfile): number {
  const filled = COMPLETENESS_CHECKS.filter((check) => check(p)).length;
  return Math.round((filled / COMPLETENESS_CHECKS.length) * 100);
}

/* -------------------------------------------------------------------------- */
/* Recommendation rules (Req 7)                                               */
/* -------------------------------------------------------------------------- */

export interface RecommendationContext {
  profile: RegistrationProfile;
  /** From `computeProfileCompleteness`. */
  completeness: number;
  /** Session-only signal; default false (untracked => "not visited"). */
  visitedCalculator?: boolean;
  /** Session-only signal; default false (untracked => "not browsed"). */
  browsedSchemes?: boolean;
}

/** Threshold below which the "complete your profile" rule fires (Req 7.8). */
const COMPLETENESS_RULE_THRESHOLD = 80;

/** Government GST registration portal. */
const GST_PORTAL_URL = "https://www.gst.gov.in";
/** DPIIT recognition portal. */
const DPIIT_PORTAL_URL = "https://dpiit.gov.in";

/**
 * Evergreen recommendations appended after any triggered rules, so the display
 * pool always has enough entries to satisfy the 3-item minimum (Req 7.2).
 */
const EVERGREEN_RECOMMENDATIONS: ReadonlyArray<Recommendation> = [
  {
    id: "explore-clusters",
    iconName: "MapPin",
    heading: "Explore Beyond Bengaluru clusters",
    description:
      "Discover the six regional innovation clusters powering Karnataka's startup ecosystem.",
    ctaLabel: "View clusters",
    href: "/clusters",
  },
  {
    id: "upcoming-events",
    iconName: "Calendar",
    heading: "Find upcoming events",
    description:
      "Connect with mentors, investors, and peers at upcoming ecosystem events.",
    ctaLabel: "Browse events",
    href: "/events",
  },
  {
    id: "find-mentor",
    iconName: "Users",
    heading: "Connect with a mentor",
    description:
      "Match with experienced founders and domain experts to accelerate your journey.",
    ctaLabel: "Find a mentor",
    href: "/mentors",
  },
];

/**
 * Full ordered recommendation list: triggered rule recs in priority order,
 * then evergreen padding, de-duplicated by `id` (rule recs win ties because
 * they are emitted first).
 *
 * Each triggered rule's recommendation is always present in the returned list
 * when its condition holds (Req 7.6-7.10); the display bound is applied later
 * by `selectDisplayRecommendations`.
 */
export function buildRecommendations(ctx: RecommendationContext): Recommendation[] {
  const { profile, completeness } = ctx;
  const visitedCalculator = ctx.visitedCalculator ?? false;
  const browsedSchemes = ctx.browsedSchemes ?? false;

  const rules: Recommendation[] = [];

  // P1 — incomplete profile (Req 7.8)
  if (completeness < COMPLETENESS_RULE_THRESHOLD) {
    rules.push({
      id: "complete-profile",
      iconName: "UserCheck",
      heading: "Complete your profile",
      description:
        "Fill in the remaining details to unlock more accurate scheme matches.",
      ctaLabel: "Complete profile",
      href: "/dashboard/startup#profile",
    });
  }

  // P2 — not DPIIT recognised (Req 7.6)
  if (!(profile.dpiitRecognized ?? false)) {
    rules.push({
      id: "register-dpiit",
      iconName: "BadgeCheck",
      heading: "Get DPIIT recognition",
      description:
        "DPIIT recognition unlocks tax benefits and eligibility for several schemes.",
      ctaLabel: "Register on DPIIT",
      href: DPIIT_PORTAL_URL,
    });
  }

  // P3 — not GST registered (Req 7.7)
  if (!(profile.gstRegistered ?? false)) {
    rules.push({
      id: "register-gst",
      iconName: "ReceiptText",
      heading: "Register for GST",
      description:
        "GST registration is required for invoicing and many government incentives.",
      ctaLabel: "Register for GST",
      href: GST_PORTAL_URL,
    });
  }

  // P4 — has not tried the calculator (Req 7.9)
  if (!visitedCalculator) {
    rules.push({
      id: "try-calculator",
      iconName: "Calculator",
      heading: "Estimate your benefits",
      description:
        "Use the incentive calculator to see your potential savings across schemes.",
      ctaLabel: "Open calculator",
      href: "/calculator",
    });
  }

  // P5 — has not browsed schemes (Req 7.10)
  if (!browsedSchemes) {
    rules.push({
      id: "browse-schemes",
      iconName: "Search",
      heading: "Browse all schemes",
      description:
        "Explore every Karnataka scheme and filter by what fits your startup.",
      ctaLabel: "Browse schemes",
      href: "/schemes",
    });
  }

  // De-duplicate by id, preserving first occurrence (rule recs before evergreen).
  const seen = new Set<string>();
  const result: Recommendation[] = [];
  for (const rec of [...rules, ...EVERGREEN_RECOMMENDATIONS]) {
    if (seen.has(rec.id)) continue;
    seen.add(rec.id);
    result.push(rec);
  }
  return result;
}

/**
 * Display selector: clamp the recommendation list to between 3 and 4 items
 * (Req 7.2). The evergreen pool guarantees the 3-item minimum is reachable for
 * any context; this never invents recommendations beyond the input list.
 */
export function selectDisplayRecommendations(
  recs: Recommendation[],
): Recommendation[] {
  return recs.slice(0, 4);
}
