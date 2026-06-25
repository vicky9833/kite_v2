/**
 * AdminHeaderStrip — the compact identity/attribution header at the top of the
 * government admin dashboard preview (Req 11.1–11.4).
 *
 * This is a public preview surface: there is NO registration or authentication
 * gate (Req 11.1). The strip renders, in a `py-8` band:
 *
 *  - The title "Government Admin Dashboard" with a muted "Preview" badge
 *    (Req 11.2).
 *  - An attribution row reading "Karnataka EITBT Department, KITS, KDEM"
 *    (Req 11.3).
 *  - A right-aligned, synthetic "Last updated 14 hours ago" indicator. The
 *    string is a FIXED synthetic label — never derived from the real clock
 *    (Req 11.4).
 *
 * Server Component: no `"use client"`, no interactivity. KITE tokens only, no
 * gradients/blobs/glow; the only icon is a restrained Lucide glyph.
 */
import { Clock } from "lucide-react";

/** Fixed synthetic freshness label (never derived from the real clock). */
const LAST_UPDATED_LABEL = "Last updated 14 hours ago";

export function AdminHeaderStrip() {
  return (
    <header className="py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Title + attribution */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-h2 text-dark">
              Government Admin Dashboard
            </h1>
            <span className="inline-flex items-center rounded-md border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Preview
            </span>
          </div>
          <p className="text-caption text-muted">
            Karnataka EITBT Department, KITS, KDEM
          </p>
        </div>

        {/* Synthetic freshness indicator */}
        <div className="md:pt-1">
          <span className="inline-flex items-center gap-1.5 text-caption text-muted">
            <Clock className="h-4 w-4" aria-hidden />
            {LAST_UPDATED_LABEL}
          </span>
        </div>
      </div>
    </header>
  );
}

export default AdminHeaderStrip;
