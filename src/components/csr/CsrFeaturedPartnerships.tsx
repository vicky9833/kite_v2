import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { generateCsrPartnerships } from "@/lib/synthetic-csr-partnerships";

/**
 * CsrFeaturedPartnerships — the active CSR partnerships showcase on /csr. It
 * renders EXACTLY 6 cards from the Synthetic CSR Partnerships module
 * (`generateCsrPartnerships()`) in a 3-column desktop grid (Req 19). Each card
 * carries the partner name, partner type (one of the four CSR_PARTNER_TYPES),
 * focus area, illustrative partnership scale in ₹ crore, and partnership type.
 *
 * The partnerships are synthetic preview content, so the section carries EXACTLY
 * ONE IllustrativeBadge marking it illustrative.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export function CsrFeaturedPartnerships() {
  const partnerships = generateCsrPartnerships();

  return (
    <section
      aria-labelledby="csr-featured-partnerships-heading"
      className="py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
              CSR partnerships
            </span>
            <IllustrativeBadge variant="inline" />
          </div>
          <h2
            id="csr-featured-partnerships-heading"
            className="font-heading text-h2 text-dark"
          >
            Active CSR Partnerships
          </h2>
          <p className="text-body text-muted">
            These illustrative partnerships show the texture of CSR engagement
            across Karnataka — the kinds of corporate foundations, family offices,
            and public sector funders backing grassroots innovation. They are
            synthetic examples, and every CSR figure shown is illustrative.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partnerships.map((partnership) => (
            <li
              key={partnership.id}
              className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <span className="font-heading text-h3 text-dark">
                  {partnership.partnerName}
                </span>
                <span className="text-caption text-muted">
                  {partnership.partnerType}
                </span>
              </div>

              <p className="text-body text-muted">{partnership.focusArea}</p>

              <div className="mt-auto flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted">
                  ₹{partnership.scaleCrore} crore
                </span>
                <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted">
                  {partnership.partnershipType}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default CsrFeaturedPartnerships;
