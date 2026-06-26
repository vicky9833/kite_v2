import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { FEATURED_INTERNATIONAL_PROGRAMS } from "@/data/gia-region-editorial";

/**
 * FeaturedPrograms — "Featured International Programs" (Req 7.1). Cards for key
 * bilateral programs, each linking to the relevant country detail page. The
 * program framing is illustrative.
 *
 * Server Component.
 */
export function FeaturedPrograms() {
  return (
    <section aria-labelledby="featured-programs-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <h2 id="featured-programs-heading" className="font-heading text-h2 text-dark">
            Featured International Programs
          </h2>
          <IllustrativeBadge variant="inline" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_INTERNATIONAL_PROGRAMS.map((p) => (
            <div
              key={p.id}
              className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span className={`fi fi-${p.countryCode} text-xl leading-none`} aria-hidden />
              <h3 className="font-heading text-h3 text-dark">{p.name}</h3>
              <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted">
                {p.focusArea}
              </span>
              <p className="flex-1 text-body text-muted">{p.description}</p>
              <Link
                href={`/gia/${p.countryCode}`}
                className="inline-flex items-center gap-1.5 text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Learn More
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedPrograms;
