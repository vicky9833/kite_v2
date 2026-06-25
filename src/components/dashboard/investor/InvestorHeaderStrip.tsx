"use client";

import { useInvestor } from "@/context/InvestorContext";
import { getLastLoginLabel } from "@/lib/investor-dashboard-data";

/**
 * InvestorHeaderStrip — the compact identity/status header at the top of the
 * investor dashboard (Req 18). Reads the session profile from
 * `InvestorContext` and renders, in a `py-8` strip:
 *
 *  - "Welcome back, {investorName}" with the `firmName` in caption style
 *    (Req 18.1).
 *  - A right-aligned detail cluster: the Investor ID, a synthetic relative
 *    "last login" label (`getLastLoginLabel`, deterministic — Req 18.2), and a
 *    Status badge labelled "Active".
 *
 * Rendered inside `InvestorGate`, so a profile is guaranteed in practice; the
 * null-guard keeps the component safe in isolation and under strict types.
 */
export function InvestorHeaderStrip() {
  const { investorProfile } = useInvestor();

  if (!investorProfile) {
    return null;
  }

  const { investorName, firmName, investorId } = investorProfile;

  // Synthetic, deterministic relative "last login" label (Req 18.2).
  const lastLogin = getLastLoginLabel(investorId);

  return (
    <header className="py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* Identity */}
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-h2 text-dark">
            Welcome back, {investorName}
          </h1>
          <p className="text-caption text-muted">{firmName}</p>
        </div>

        {/* Status cluster */}
        <div className="flex flex-col items-start gap-2 md:items-end">
          <p className="text-caption text-muted">
            Investor ID{" "}
            <span className="font-medium text-dark">{investorId}</span>
          </p>
          <p className="text-caption text-muted">{lastLogin}</p>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
            Active
          </span>
        </div>
      </div>
    </header>
  );
}

export default InvestorHeaderStrip;
