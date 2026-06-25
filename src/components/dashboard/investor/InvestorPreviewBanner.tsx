/**
 * InvestorPreviewBanner — the single-line, accent-bordered preview notice
 * rendered directly beneath the investor dashboard header strip (Req 17.4,
 * 26.2, 40.3).
 *
 * The copy is FIXED and verbatim: it states that this is a preview, that real
 * authentication and investor verification opens in Phase 2, and that the
 * dashboard shows illustrative portfolio and deal-flow data for demonstration.
 *
 * Mirrors the admin `AdminNoticeBanner`: a rounded card with a left accent rule
 * and a very-low-opacity accent wash. KITE tokens only — no gradients/blobs/glow.
 * The Lucide `Info` glyph is decorative (`aria-hidden`).
 *
 * Server Component: no `"use client"`, no interactivity.
 */
import { Info } from "lucide-react";

/** Fixed banner copy, verbatim per Req 17.4. */
const NOTICE_TEXT =
  "Investor Dashboard Preview. Real authentication and investor verification opens in Phase 2. This dashboard shows illustrative portfolio and deal flow data for demonstration.";

export function InvestorPreviewBanner() {
  return (
    <div
      role="note"
      className="flex items-center gap-3 rounded-xl border border-border border-l-4 border-l-accent bg-accent/5 px-4 py-3"
    >
      <Info className="h-4 w-4 shrink-0 text-accent" aria-hidden />
      <p className="text-caption text-dark">{NOTICE_TEXT}</p>
    </div>
  );
}

export default InvestorPreviewBanner;
