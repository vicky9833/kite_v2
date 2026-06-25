// src/components/dashboard/admin/InternationalPartnershipsSection.tsx
//
// "International Partnerships" (Req 19). A density grid of the Global Innovation
// Alliance regions, derived from `getInternationalPartnerships()` which groups
// the 32 canonical GIA countries by region (the country counts always sum to
// 32). Each region card shows its partner-country count, a synthetic
// joint-program-engagement count (illustrative), and a "Learn More" link to the
// GIA route. The page composition (task 15.1) wraps this section in
// `LazySection`.

import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { getInternationalPartnerships } from "@/lib/synthetic-admin-data";
import { cn } from "@/lib/utils";

/** Shared inline-CTA classes for the per-region "Learn More" link. */
const CTA_CLASS = cn(
  "inline-flex items-center gap-1 text-sm font-semibold text-primary",
  "transition-colors hover:text-accent",
  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
);

const GIA_ROUTE = "/gia";

/**
 * InternationalPartnershipsSection — one card per GIA region (ordered by partner
 * count). Each card surfaces the real partner-country count, an illustrative
 * joint-program engagement count, and a "Learn More" link to `/gia`.
 */
export function InternationalPartnershipsSection() {
  const partnerships = getInternationalPartnerships();

  return (
    <section
      aria-labelledby="international-partnerships-heading"
      className="flex flex-col gap-8"
    >
      <SectionHeading
        id="international-partnerships-heading"
        title="International Partnerships"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {partnerships.map((region) => (
          <article
            key={region.region}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading text-lg font-semibold text-dark">
                {region.region}
              </h3>
              <Globe className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-heading text-h3 font-bold text-dark">
                  {region.countryCount}
                </p>
                <p className="text-caption text-muted">Partner countries</p>
              </div>
              <div>
                <p className="font-heading text-h3 font-bold text-dark">
                  {region.jointPrograms}
                </p>
                <p className="text-caption text-muted">
                  Joint programs
                  <span className="ml-1 uppercase tracking-wide text-muted/70">
                    (illustrative)
                  </span>
                </p>
              </div>
            </div>

            <Link
              href={GIA_ROUTE}
              aria-label={`Learn more about ${region.region} GIA partnerships`}
              className={cn("mt-auto pt-2", CTA_CLASS)}
            >
              Learn More
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>

      <p className="text-caption text-muted">
        Partner-country counts are canonical; joint-program figures are
        illustrative for preview purposes only.
      </p>
    </section>
  );
}

export default InternationalPartnershipsSection;
