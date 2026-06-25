import Link from "next/link";

import { GIACountryTile } from "@/components/shared/GIACountryTile";
import { giaCountries } from "@/data/gia-countries";
import { cn, isValidGIACountry } from "@/lib/utils";
import type { GIACountry, GIARegion } from "@/types";

/**
 * GIACountriesSection — Home section 9 (Req 16). A DENSITY moment, not an
 * editorial one: every valid partner country renders in a tight, compact grid
 * on a flat `dark` background. Government-grade, restrained — no gradients,
 * blobs, emoji, glow, or glassmorphism. Country flags are SVG (`flag-icons`).
 *
 * Behaviour:
 *  - Filters `giaCountries` with `isValidGIACountry`, omitting invalid entries
 *    while continuing to render the remainder (Req 16.3).
 *  - Groups valid countries by `region` in a fixed display order and renders a
 *    subtle region subheader above each group.
 *  - Displays ALL valid countries, so the "and N more" indicator is suppressed
 *    (Req 16.6). The count is computed cleanly so that, were a display cap ever
 *    applied, N = validTotal − displayed would surface (Req 16.5).
 *  - On zero valid entries, renders only the title + CTA, with no empty grid
 *    (Req 16.4).
 *
 * Server Component (no interactivity / no `"use client"`).
 */

/** Fixed render order for region groups. */
const REGION_ORDER: readonly GIARegion[] = [
  "Europe",
  "Middle East",
  "Asia-Pacific",
  "Americas",
  "Africa",
];

const GIA_ROUTE = "/gia";

export function GIACountriesSection() {
  // Skip invalid entries (Req 16.3); the remainder is what we may display.
  const validCountries = giaCountries.filter(isValidGIACountry);
  const validTotal = validCountries.length;

  // Display ALL valid countries (density moment). If a cap were ever applied,
  // `displayed` would shrink and `remaining` (N) would drive the indicator.
  const displayedCountries = validCountries;
  const displayedCount = displayedCountries.length;
  const remaining = validTotal - displayedCount; // Req 16.5: N (currently 0).

  // Group the displayed countries by region, preserving REGION_ORDER and
  // dropping any region with no displayed entries.
  const groupedByRegion = REGION_ORDER.map((region) => ({
    region,
    countries: displayedCountries.filter((country) => country.region === region),
  })).filter((group) => group.countries.length > 0);

  return (
    <section className="bg-dark py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading area — rendered manually in light text for AA contrast on dark. */}
        <div className="flex flex-col gap-3">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            Global Innovation Alliance
          </span>
          <h2 className="font-heading text-h2 text-white">32 Partner Countries</h2>
          <p className="max-w-2xl text-body text-slate-300">
            Karnataka&rsquo;s Global Innovation Alliance connects local founders to
            partner ecosystems across five regions for soft-landing, market access,
            and co-innovation.
          </p>
        </div>

        {/* Density grid, grouped by region. Suppressed entirely when no valid
            entries remain (Req 16.4). */}
        {displayedCount > 0 ? (
          <div className="mt-10 flex flex-col gap-8">
            {groupedByRegion.map(({ region, countries }) => (
              <div key={region} className="flex flex-col gap-3">
                <h3 className="text-caption font-semibold uppercase tracking-wider text-slate-400">
                  {region}
                </h3>
                <ul
                  className={cn(
                    "grid list-none grid-cols-2 gap-3",
                    "sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
                  )}
                >
                  {countries.map((country: GIACountry) => (
                    <li key={country.id}>
                      <GIACountryTile country={country} className="h-full" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* "and N more" — only WHERE displayed < validTotal (Req 16.5/16.6). */}
            {remaining > 0 ? (
              <p className="text-caption text-slate-400">{`and ${remaining} more`}</p>
            ) : null}
          </div>
        ) : null}

        {/* Single CTA → GIA route (Req 16.7). Light/outline style on dark. */}
        <div className="mt-10">
          <Link
            href={GIA_ROUTE}
            className={cn(
              "inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-2.5",
              "text-caption font-semibold text-white transition-colors",
              "hover:border-white/60 hover:bg-white/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark",
            )}
          >
            Explore GIA Partnerships
          </Link>
        </div>
      </div>
    </section>
  );
}

export default GIACountriesSection;
