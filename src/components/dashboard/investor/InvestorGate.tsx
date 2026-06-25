"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useInvestor } from "@/context/InvestorContext";

/**
 * InvestorGate — shared onboarding gate for the gated investor routes
 * `/dashboard/investor` and `/dashboard/investor/pipeline` (Req 17.1–17.4,
 * 26.2, 40.3).
 *
 * A single component serves both routes (the dashboard and the deal pipeline)
 * because they share identical Not_Onboarded → redirect semantics; the
 * destination key is taken as the `redirectFrom` prop so each route preserves
 * its own return path. Mirrors `StartupGate` exactly, but reads `isOnboarded`
 * from the session `InvestorContext`:
 *
 *  - **Not_Onboarded_State** — in a `useEffect`, `router.push` to
 *    `/investors/onboard?redirectFrom={redirectFrom}` (Req 17.1, 17.2), and
 *    render a `Redirecting_State` block that announces the redirect through an
 *    `aria-live="polite"` region (Req 17.3). No personalized content flashes
 *    before the redirect.
 *  - **Onboarded_State** — render `children` (Req 17.4).
 *
 * Because `InvestorContext` is in-memory only, a refresh resets to the
 * not-onboarded state, so a hard-loaded gated route always redirects (Req 40.3).
 */
export interface InvestorGateProps {
  /** Which gated route to return to after onboarding. */
  redirectFrom: "dashboard/investor" | "dashboard/investor/pipeline";
  children: ReactNode;
}

export function InvestorGate({ redirectFrom, children }: InvestorGateProps) {
  const { isOnboarded } = useInvestor();
  const router = useRouter();

  useEffect(() => {
    if (!isOnboarded) {
      router.push(`/investors/onboard?redirectFrom=${redirectFrom}`); // Req 17.1, 17.2
    }
  }, [isOnboarded, redirectFrom, router]);

  if (!isOnboarded) {
    // Redirecting_State — no personalized flash (Req 17.3).
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <p aria-live="polite" className="text-body text-muted">
          Redirecting you to investor onboarding…
        </p>
      </div>
    );
  }

  return <>{children}</>; // Onboarded_State (Req 17.4).
}

export default InvestorGate;
