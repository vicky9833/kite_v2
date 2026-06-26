import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  ChevronRight,
  Download,
  Globe2,
  Mail,
  Target,
} from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { buttonVariants } from "@/components/ui/button";
import { REGION_OPPORTUNITY_COPY } from "@/data/gia-region-editorial";
import {
  generateBilateralPrograms,
  generateCountryStartupEngagements,
  generateCountrySuccessStories,
} from "@/lib/synthetic-gia-data";
import { cn } from "@/lib/utils";
import type { GIACountry } from "@/types";

// --- Breadcrumb -------------------------------------------------------------

export function CountryBreadcrumb({ country }: { country: GIACountry }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-caption text-muted sm:px-6 lg:px-8">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link href="/gia" className="hover:text-primary">
          GIA
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-foreground">{country.name}</span>
      </div>
    </nav>
  );
}

// --- Hero -------------------------------------------------------------------

export function CountryHero({ country }: { country: GIACountry }) {
  return (
    <section className="bg-dark py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-6">
          <span className={`fi fi-${country.countryCode.toLowerCase()} text-6xl leading-none`} aria-hidden />
          <div className="flex flex-col gap-3">
            <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
              {country.region} · GIA Partner
            </span>
            <h1 className="font-heading text-h1 text-white">{country.name}</h1>
            <p className="max-w-2xl text-body text-slate-300">
              Karnataka&rsquo;s partnership with {country.name} spans{" "}
              {country.focusAreas.join(", ")} — opening knowledge exchange,
              co-investment, and market access between the two ecosystems.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <a
            href={`mailto:gia@kdem.in?subject=Partnership%20Inquiry%20-%20${encodeURIComponent(country.name)}`}
            className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
          >
            Submit Partnership Inquiry
          </a>
          <a
            href="#country-programs"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
            )}
          >
            View Related Programs
          </a>
        </div>
      </div>
    </section>
  );
}

// --- At a glance ------------------------------------------------------------

export function CountryAtAGlance({ country }: { country: GIACountry }) {
  const programs = generateBilateralPrograms(country.countryCode);
  return (
    <section aria-labelledby="at-a-glance-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="at-a-glance-heading" className="font-heading text-h2 text-dark">
          {country.name} at a Glance
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
            <Target className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-heading text-h3 text-dark">Bilateral Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {country.focusAreas.map((focus) => (
                <span
                  key={focus}
                  className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted"
                >
                  {focus}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
            <Globe2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-heading text-h3 text-dark">Region &amp; Engagement</h3>
            <p className="text-body text-muted">
              {country.name} sits within Karnataka&rsquo;s {country.region}{" "}
              engagement, where partnership emphasises the priorities outlined
              below.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
            <CalendarCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-h3 text-dark">Active Initiatives</h3>
              <IllustrativeBadge variant="inline" />
            </div>
            <p className="font-heading text-h1 text-primary">{programs.length}</p>
            <p className="text-caption text-muted">
              Illustrative count of active bilateral programs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Bilateral programs -----------------------------------------------------

export function CountryBilateralPrograms({ country }: { country: GIACountry }) {
  const programs = generateBilateralPrograms(country.countryCode);
  return (
    <section id="country-programs" aria-labelledby="country-programs-heading" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <h2 id="country-programs-heading" className="font-heading text-h2 text-dark">
            Karnataka&ndash;{country.name} Programs
          </h2>
          <IllustrativeBadge variant="inline" />
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <div key={p.id} className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted">
                  {p.focusArea}
                </span>
                <span className="text-caption uppercase tracking-wide text-muted">
                  Since {p.sinceYear}
                </span>
              </div>
              <h3 className="font-heading text-h3 text-dark">{p.name}</h3>
              <p className="flex-1 text-body text-muted">{p.description}</p>
              <span
                className={cn(
                  "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-caption font-medium",
                  p.status === "active"
                    ? "bg-primary/10 text-primary"
                    : "border border-border bg-surface text-muted",
                )}
              >
                {p.status === "active" ? "Active" : "Upcoming"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Opportunities (per-region editorial template) --------------------------

export function CountryOpportunities({ country }: { country: GIACountry }) {
  const copy = REGION_OPPORTUNITY_COPY[country.region];
  return (
    <section aria-labelledby="opportunities-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 id="opportunities-heading" className="font-heading text-h2 text-dark">
          Investment and Partnership Opportunities
        </h2>
        <p className="mt-6 text-body text-muted">{copy}</p>
      </div>
    </section>
  );
}

// --- Featured Karnataka startups --------------------------------------------

export function CountryStartups({ country }: { country: GIACountry }) {
  const engagements = generateCountryStartupEngagements(country.countryCode);
  return (
    <section aria-labelledby="country-startups-heading" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <h2 id="country-startups-heading" className="font-heading text-h2 text-dark">
            Karnataka Startups Engaging with {country.name}
          </h2>
          <IllustrativeBadge variant="inline" />
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {engagements.map((s) => (
            <li key={s.id} className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="font-heading text-h3 text-dark">{s.startupName}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted">
                  {s.sector}
                </span>
                <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted">
                  {s.engagementType}
                </span>
              </div>
              <p className="text-body text-muted">{s.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// --- Success stories --------------------------------------------------------

export function CountrySuccessStories({ country }: { country: GIACountry }) {
  const stories = generateCountrySuccessStories(country.countryCode);
  return (
    <section aria-labelledby="success-stories-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <h2 id="success-stories-heading" className="font-heading text-h2 text-dark">
            Success Stories
          </h2>
          <IllustrativeBadge variant="inline" />
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {stories.map((story) => (
            <div key={story.id} className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
              <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted">
                {story.sector}
              </span>
              <h3 className="font-heading text-h3 text-dark">{story.startupName}</h3>
              <p className="text-body text-muted">
                {story.startupName} {story.outcome}.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Country resources ------------------------------------------------------

export function CountryResources({ country }: { country: GIACountry }) {
  return (
    <section aria-labelledby="country-resources-heading" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="country-resources-heading" className="font-heading text-h2 text-dark">
          Resources
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
            <Download className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-heading text-h3 text-dark">Country Partnership Brief</h3>
            <p className="flex-1 text-body text-muted">
              An illustrative brief on the Karnataka&ndash;{country.name}
              partnership.
            </p>
            <a
              href="#country-programs"
              className="inline-flex items-center text-body text-primary hover:text-accent"
            >
              View brief
            </a>
          </div>
          <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
            <Globe2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-heading text-h3 text-dark">Visa &amp; Business Setup</h3>
            <p className="flex-1 text-body text-muted">
              Guidance on business setup is available via the relevant government
              resources.
            </p>
            <a
              href="https://eitbt.karnataka.gov.in/startup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-body text-primary hover:text-accent"
            >
              Government resource
            </a>
          </div>
          <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
            <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-heading text-h3 text-dark">Contact Country Desk</h3>
            <p className="flex-1 text-body text-muted">
              Reach the GIA international cell for {country.name}-specific
              inquiries.
            </p>
            <a href="mailto:gia@kdem.in" className="inline-flex items-center text-body text-primary hover:text-accent">
              gia@kdem.in
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Related countries ------------------------------------------------------

export function RelatedCountries({
  country,
  related,
}: {
  country: GIACountry;
  related: GIACountry[];
}) {
  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related-countries-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="related-countries-heading" className="font-heading text-h2 text-dark">
          Related Countries in {country.region}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {related.map((c) => (
            <Link
              key={c.id}
              href={`/gia/${c.countryCode.toLowerCase()}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="flex items-center gap-3">
                <span className={`fi fi-${c.countryCode.toLowerCase()} text-2xl leading-none`} aria-hidden />
                <span className="font-heading text-h3 text-dark">{c.name}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
