import { Building2 } from "lucide-react";

/**
 * IncubatorsHeaderStrip — the header strip for the Incubators & Accelerators
 * Index (`/incubators`). A restrained, government-grade strip (`py-8` /
 * `md:py-12`) that states the VERIFIED canonical figure — Karnataka hosts 164+
 * incubators and accelerators (Req 1.4) — and carries a visible label marking
 * the listed entries as a representative verified subset (Req 1.5).
 *
 * Both statements are verified/canonical, so the strip renders no
 * `IllustrativeBadge`. Copy is declarative and third-person; no superlatives,
 * urgency, or SaaS styling (Req 15).
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface IncubatorsHeaderStripProps {
  /** Number of verified entries listed below (the representative subset). */
  listedCount: number;
}

export function IncubatorsHeaderStrip({ listedCount }: IncubatorsHeaderStripProps) {
  return (
    <section
      aria-label="Incubators and accelerators overview"
      className="border-b border-border bg-surface py-8 md:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="flex items-center gap-2 text-caption font-heading font-semibold uppercase tracking-wide text-primary">
            <Building2 aria-hidden className="h-4 w-4" />
            Incubators &amp; Accelerators
          </span>

          <h1 className="font-heading text-h1 text-dark">
            Karnataka hosts 164+ incubators and accelerators
          </h1>

          <p className="text-body text-muted">
            Incubators, accelerators, and research parks across Karnataka support
            founders from idea to scale and give investors a pipeline of
            pre-screened ventures.
          </p>

          <p className="text-caption text-muted">
            The {listedCount} entries listed below are a representative verified
            subset of that network.
          </p>
        </div>
      </div>
    </section>
  );
}

export default IncubatorsHeaderStrip;
