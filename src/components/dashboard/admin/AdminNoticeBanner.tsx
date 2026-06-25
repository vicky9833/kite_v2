/**
 * AdminNoticeBanner — the single-line, accent-bordered preview notice rendered
 * directly beneath the admin header strip (Req 11.5).
 *
 * The copy is FIXED and verbatim from the requirement: it states that this is a
 * preview, that real authentication and role-based access opens in Phase 2, and
 * that the dashboard shows illustrative aggregate data for demonstration.
 *
 * Visual direction is restrained and editorial: a rounded card with a left
 * accent rule and a very-low-opacity accent wash. KITE tokens only — no
 * gradients/blobs/glow. The Lucide `Info` glyph is decorative (`aria-hidden`).
 *
 * Server Component: no `"use client"`, no interactivity.
 */
import { Info } from "lucide-react";

/** Fixed banner copy, verbatim per Req 11.5. */
const NOTICE_TEXT =
  "Government Admin Preview. Real authentication and role-based access opens in Phase 2. This dashboard shows illustrative aggregate data for demonstration.";

export function AdminNoticeBanner() {
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

export default AdminNoticeBanner;
