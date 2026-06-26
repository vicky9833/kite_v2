import { buildRegionSummaries } from "@/lib/gia-region-summary";
import { giaCountries } from "@/data/gia-countries";

/**
 * RegionOverview — "Partner Countries by Region" (Req 7.1). Five region cards
 * whose counts are DERIVED from the verified `giaCountries` data via the pure
 * `buildRegionSummaries` helper (Req 7.2) — never hardcoded. Each card names
 * the region, country count, lead focus areas, and links to the grid filtered
 * to that region (via a hash that the grid reads on mount).
 *
 * Server Component.
 */
export function RegionOverview() {
  const summaries = buildRegionSummaries(giaCountries);

  return (
    <section aria-labelledby="region-overview-heading" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="region-overview-heading" className="font-heading text-h2 text-dark">
          Partner Countries by Region
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((s) => (
            <div
              key={s.region}
              className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-heading text-h3 text-dark">{s.region}</h3>
                <span className="font-heading text-h2 text-primary">{s.countryCount}</span>
              </div>
              <p className="text-caption text-muted">
                {s.countryCount} partner {s.countryCount === 1 ? "country" : "countries"}
              </p>
              <div className="flex flex-wrap gap-2">
                {s.focusAreas.map((focus) => (
                  <span
                    key={focus}
                    className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted"
                  >
                    {focus}
                  </span>
                ))}
              </div>
              <a
                href={`#all-countries`}
                className="mt-auto inline-flex items-center text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                See all countries in {s.region}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RegionOverview;
