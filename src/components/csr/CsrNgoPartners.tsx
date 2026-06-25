import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { generateNgoPartners } from "@/lib/synthetic-ngo-partners";

/**
 * CsrNgoPartners — the NGO & implementation partners list on /csr. It renders
 * all cards from the Synthetic NGO Partners module (`generateNgoPartners()`) in
 * a 3-column desktop grid (Req 20). Each card carries the partner name, focus,
 * geographic reach, and partnership type.
 *
 * The partners are synthetic preview content, so the section carries EXACTLY ONE
 * IllustrativeBadge marking it illustrative.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export function CsrNgoPartners() {
  const partners = generateNgoPartners();

  return (
    <section
      aria-labelledby="csr-ngo-partners-heading"
      className="py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
              On-ground partners
            </span>
            <IllustrativeBadge variant="inline" />
          </div>
          <h2
            id="csr-ngo-partners-heading"
            className="font-heading text-h2 text-dark"
          >
            NGO &amp; Implementation Partners
          </h2>
          <p className="text-body text-muted">
            These illustrative partners show the kinds of grassroots NGOs and
            implementation organisations that carry CSR-backed programmes into
            communities across Karnataka. They are synthetic examples, not real
            organisations.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <li
              key={partner.id}
              className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="font-heading text-h3 text-dark">
                {partner.name}
              </span>

              <p className="text-body text-muted">{partner.focus}</p>

              <div className="mt-auto flex flex-col gap-2">
                <span className="text-caption text-muted">
                  {partner.geographicReach}
                </span>
                <span className="inline-flex w-fit rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted">
                  {partner.partnershipType}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default CsrNgoPartners;
