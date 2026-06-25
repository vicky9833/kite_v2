"use client";

import { useSearchParams } from "next/navigation";

import { InvestorOnboardingWizard } from "./InvestorOnboardingWizard";

/**
 * OnboardPageClient — client island for `/investors/onboard` (Req 16.1, 16.6).
 *
 * Reads the optional `redirectFrom` search param and resolves it to an internal
 * `redirectTo` path through a fixed mapping table. Using a mapping table (rather
 * than concatenating the raw param into a path) guards against open-redirects:
 * only known keys resolve to a known internal path; any unknown or absent value
 * yields `undefined`, which makes the wizard fall back to its default
 * post-onboarding success screen.
 *
 * Must be rendered inside a `Suspense` boundary because `useSearchParams` opts
 * the subtree into client-side rendering.
 */

/** Known redirect sources → guarded internal destinations (no open-redirects). */
const REDIRECT_MAP: Record<string, string> = {
  "dashboard/investor": "/dashboard/investor",
  "dashboard/investor/pipeline": "/dashboard/investor/pipeline",
};

export function OnboardPageClient() {
  const params = useSearchParams();
  const redirectFrom = params.get("redirectFrom") ?? undefined;
  const redirectTo = redirectFrom ? REDIRECT_MAP[redirectFrom] : undefined;
  // `undefined` (absent or unknown key) renders the success screen; a known key
  // drives the post-submit push.
  return <InvestorOnboardingWizard redirectTo={redirectTo} />;
}

export default OnboardPageClient;
