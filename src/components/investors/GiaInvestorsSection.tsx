import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { giaCountries } from "@/data/gia-countries";
import { cn } from "@/lib/utils";
import type { GIACountry } from "@/types";

/**
 * GiaInvestorsSection — section 8 of Investor Connect (Req 14). Six highlight
 * cards drawn from the canonical `giaCountries` data, each with a decorative
 * flag-icons SVG (`fi fi-${countryCode}`, `aria-hidden`; the visible country
 * name is the text alternative), the country name, and a one-sentence Karnataka
 * investment-thesis framing. A single "Learn More" CTA links to `/gia`.
 *
 * The thesis lines are qualitative editorial framing (founder judgment), not
 * synthetic metrics, so no illustrative label is shown.
 *
 * Server Component (no interactivity / no `"use client"`).
 */

/** Six featured GIA corridors with a Karnataka investment-thesis framing. */
const FEATURED: ReadonlyArray<{ id: string; thesis: string }> = [
  {
    id: "usa",
    thesis:
      "US funds anchor Karnataka's AI, SaaS, and deep-tech rounds, with Bengaluru as their primary India beachhead.",
  },
  {
    id: "uk",
    thesis:
      "UK capital finds strong FinTech and AI dealflow through Karnataka's established London innovation corridor.",
  },
  {
    id: "singapore",
    thesis:
      "Singapore investors use Karnataka as the launchpad for FinTech and smart-city scale-ups across South Asia.",
  },
  {
    id: "japan",
    thesis:
      "Japanese strategics co-invest in robotics, mobility, and manufacturing ventures built on Karnataka's engineering base.",
  },
  {
    id: "germany",
    thesis:
      "German Industry 4.0 and MedTech funds tap Karnataka's manufacturing and ESDM talent for co-innovation.",
  },
  {
    id: "israel",
    thesis:
      "Israeli deep-tech and cybersecurity investors pair frontier IP with Karnataka's scale and chip-design depth.",
  },
];

interface FeaturedCountry {
  country: GIACountry;
  thesis: string;
}

/** Resolve the featured ids → canonical country records, dropping any unknown. */
const featuredCountries: FeaturedCountry[] = FEATURED.map((entry) => {
  const country = giaCountries.find((c) => c.id === entry.id);
  return country ? { country, thesis: entry.thesis } : null;
}).filter((value): value is FeaturedCountry => value !== null);

export function GiaInvestorsSection() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Global Innovation Alliance"
          title="International Investors Welcome"
          description="Karnataka's GIA corridors give cross-border investors a structured path into the ecosystem."
        />

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCountries.map(({ country, thesis }) => (
            <li
              key={country.id}
              className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span
                className={cn("fi", `fi-${country.countryCode}`, "text-2xl leading-none")}
                aria-hidden
              />
              <h3 className="font-heading text-lg text-dark">{country.name}</h3>
              <p className="text-body text-muted">{thesis}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link
            href="/gia"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Learn More
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default GiaInvestorsSection;
