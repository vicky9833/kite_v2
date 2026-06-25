"use client";

import { useSearchParams } from "next/navigation";

import { RegistrationWizard } from "./RegistrationWizard";

/**
 * RegisterPageClient — client island for `/register` (Req 1.5–1.7).
 *
 * Reads the optional `redirectFrom` search param and resolves it to an internal
 * `redirectTo` path through a fixed mapping table. Using a mapping table (rather
 * than concatenating the raw param into a path) guards against open-redirects:
 * only known keys resolve to a known internal path; any unknown or absent value
 * yields `undefined`, which makes the wizard fall back to its default
 * post-registration success screen (Req 1.7).
 *
 * Must be rendered inside a `Suspense` boundary because `useSearchParams` opts
 * the subtree into client-side rendering.
 */

/** Known redirect sources → guarded internal destinations (no open-redirects). */
const REDIRECT_MAP: Record<string, string> = {
  "dashboard/startup": "/dashboard/startup",
};

export function RegisterPageClient() {
  const params = useSearchParams();
  const redirectFrom = params.get("redirectFrom") ?? undefined; // Req 1.5
  const redirectTo = redirectFrom ? REDIRECT_MAP[redirectFrom] : undefined;
  // `undefined` (absent or unknown key) preserves today's success-screen
  // behavior (Req 1.7); a known key drives the post-submit push (Req 1.6).
  return <RegistrationWizard redirectTo={redirectTo} />;
}

export default RegisterPageClient;
