/**
 * AdminKpiGrid — the eager headline KPI grid at the top of the government admin
 * dashboard (Req 12).
 *
 * Renders the six FIXED KPI cards from `ADMIN_KPIS` (the canonical Req-12
 * figures — these are fixed, not random) in a responsive grid:
 *
 *  - Desktop (`lg`): three-by-two layout (Req 12.1).
 *  - Tablet (`md`): two-by-three layout (Req 12.2).
 *  - Mobile: single column (Req 12.3).
 *
 * Each card surfaces the label, the headline value (Plus Jakarta Sans bold via
 * `font-heading`), an optional caption, and an optional trend indicator (a
 * green Lucide up-arrow for positive deltas like "+4.2% QoQ" / "+6")
 * (Req 12.4–12.9). The whole grid carries an Illustrative_Label so viewers
 * understand the figures are illustrative for preview (Req 12.10).
 *
 * Server Component: no `"use client"`, no interactivity. KITE tokens only — no
 * gradients/blobs/glow.
 */
import { TrendingUp } from "lucide-react";

import { ADMIN_KPIS } from "@/lib/synthetic-admin-data";
import { cn } from "@/lib/utils";
import type { KpiCard } from "@/types";

export function AdminKpiGrid() {
  return (
    <section aria-label="Ecosystem key performance indicators">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ADMIN_KPIS.map((kpi) => (
          <AdminKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Illustrative_Label for the whole grid (Req 12.10). */}
      <p className="mt-4 text-caption text-muted/70">
        Illustrative preview data
      </p>
    </section>
  );
}

/** A single KPI stat card (label, headline value, optional caption + trend). */
function AdminKpiCard({ kpi }: { kpi: KpiCard }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm",
        "transition-colors hover:border-primary/30",
      )}
    >
      <p className="font-heading text-h1 font-bold text-dark">{kpi.value}</p>
      <p className="mt-2 text-body text-muted">{kpi.label}</p>

      {kpi.trend ? (
        <p className="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-success">
          <TrendingUp className="h-4 w-4" aria-hidden />
          {kpi.trend}
        </p>
      ) : null}

      {kpi.caption ? (
        <p className="mt-3 text-caption text-muted/70">{kpi.caption}</p>
      ) : null}
    </div>
  );
}

export default AdminKpiGrid;
