import { IndianRupee, Rocket, Users } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { generateCsrImpactMetrics } from "@/lib/synthetic-csr-impact";

/**
 * CsrImpactMetrics — the cumulative CSR impact headline on /csr. It renders
 * EXACTLY 3 large stat cards from the Synthetic CSR Impact module
 * (`generateCsrImpactMetrics()`): total CSR capital (₹ crore), startups
 * supported, and beneficiaries reached (Req 21). These are plain stat cards —
 * there is NO chart.
 *
 * The figures are synthetic preview content, so the section carries EXACTLY ONE
 * IllustrativeBadge marking it illustrative.
 *
 * Server Component (no interactivity / no `"use client"`).
 */

/** Deterministic, locale-independent thousands grouping (e.g. 45000 -> 45,000). */
function groupThousands(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Format a metric value for display based on its unit. */
function formatMetric(value: number, unit: "crore" | "startups" | "beneficiaries"): string {
  if (unit === "crore") {
    return `₹${groupThousands(value)} crore`;
  }
  return groupThousands(value);
}

const METRIC_ICONS = {
  "total-csr-capital": IndianRupee,
  "startups-supported": Rocket,
  "beneficiaries-reached": Users,
} as const;

export function CsrImpactMetrics() {
  const metrics = generateCsrImpactMetrics();

  return (
    <section
      aria-labelledby="csr-impact-metrics-heading"
      className="py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
              Cumulative impact
            </span>
            <IllustrativeBadge variant="inline" />
          </div>
          <h2
            id="csr-impact-metrics-heading"
            className="font-heading text-h2 text-dark"
          >
            Cumulative CSR Impact
          </h2>
          <p className="text-body text-muted">
            These illustrative headline figures show the scale of CSR-backed
            grassroots innovation across Karnataka. They are synthetic examples,
            not audited totals.
          </p>
        </div>

        <dl className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = METRIC_ICONS[metric.id as keyof typeof METRIC_ICONS] ?? IndianRupee;
            return (
              <div
                key={metric.id}
                className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-8 shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary"
                >
                  <Icon className="h-6 w-6" />
                </span>
                <dt className="text-caption uppercase tracking-wide text-muted">
                  {metric.label}
                </dt>
                <dd className="font-heading text-display text-dark">
                  {formatMetric(metric.value, metric.unit)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

export default CsrImpactMetrics;
