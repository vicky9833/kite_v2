"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { GIA_REGION_ORDER } from "@/lib/gia-region-summary";
import { cn } from "@/lib/utils";
import type { GIACountry, GIARegion } from "@/types";

/**
 * AllCountriesGrid — client island rendering all 32 verified partner countries
 * (Req 7.1). Each tile shows the SVG flag (flag-icons), country name, focus-area
 * chips, region label, and is a clickable card routing to `/gia/{countryCode}`
 * (Req 7.3). Filter by region; sort by country name (default) or region. The
 * flag span is decorative; the visible name is the text alternative.
 */
export interface AllCountriesGridProps {
  countries: GIACountry[];
}

type SortKey = "name" | "region";

export function AllCountriesGrid({ countries }: AllCountriesGridProps) {
  const [region, setRegion] = useState<GIARegion | "all">("all");
  const [sort, setSort] = useState<SortKey>("name");

  const filtered = useMemo(() => {
    const base = region === "all" ? countries : countries.filter((c) => c.region === region);
    const sorted = [...base].sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : a.region.localeCompare(b.region) || a.name.localeCompare(b.name),
    );
    return sorted;
  }, [countries, region, sort]);

  const regionFilters: (GIARegion | "all")[] = ["all", ...GIA_REGION_ORDER];

  return (
    <section id="all-countries" aria-labelledby="all-countries-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="all-countries-heading" className="font-heading text-h2 text-dark">
          All {countries.length} Partner Countries
        </h2>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter countries by region">
            {regionFilters.map((r) => {
              const active = region === r;
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRegion(r)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-surface",
                  )}
                >
                  {r === "all" ? "All regions" : r}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="gia-sort" className="text-caption text-muted">
              Sort by
            </label>
            <select
              id="gia-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-caption text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="name">Country name</option>
              <option value="region">Region</option>
            </select>
          </div>
        </div>

        <p className="mt-3 text-caption text-muted" aria-live="polite">
          Showing {filtered.length} {filtered.length === 1 ? "country" : "countries"}
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((country) => (
            <li key={country.id}>
              <Link
                href={`/gia/${country.countryCode.toLowerCase()}`}
                className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className={cn("fi", `fi-${country.countryCode.toLowerCase()}`, "text-2xl leading-none")} aria-hidden />
                <span className="font-heading text-h3 leading-tight text-dark">{country.name}</span>
                <span className="text-caption text-muted">{country.region}</span>
                <span className="mt-1 flex flex-wrap gap-1.5">
                  {country.focusAreas.map((focus) => (
                    <span
                      key={focus}
                      className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[0.6875rem] font-medium text-muted"
                    >
                      {focus}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default AllCountriesGrid;
