// src/app/gia/[country]/page.tsx
//
// `/gia/[country]` — GIA country detail (Req 8). A single dynamic route that
// resolves for all 32 verified country codes (lowercase ISO 3166-1 alpha-2) and
// returns notFound() for any unknown code. `generateStaticParams` pre-renders
// every verified code.

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CountryAtAGlance,
  CountryBilateralPrograms,
  CountryBreadcrumb,
  CountryHero,
  CountryOpportunities,
  CountryResources,
  CountryStartups,
  CountrySuccessStories,
  RelatedCountries,
} from "@/components/gia/CountryDetailSections";
import { giaCountries } from "@/data/gia-countries";

interface CountryPageProps {
  params: { country: string };
}

function findCountry(code: string) {
  const lower = code.toLowerCase();
  return giaCountries.find((c) => c.countryCode.toLowerCase() === lower) ?? null;
}

export function generateStaticParams() {
  return giaCountries.map((c) => ({ country: c.countryCode.toLowerCase() }));
}

export function generateMetadata({ params }: CountryPageProps): Metadata {
  const country = findCountry(params.country);
  if (!country) {
    return { title: "Partner Country — KITE" };
  }
  return {
    title: `${country.name} — Global Innovation Alliance — KITE`,
    description: `Karnataka's GIA partnership with ${country.name}: bilateral programs, opportunities, and engaging startups.`,
  };
}

export default function CountryDetailPage({ params }: CountryPageProps) {
  const country = findCountry(params.country);
  if (!country) {
    notFound();
  }

  const related = giaCountries
    .filter((c) => c.region === country.region && c.id !== country.id)
    .slice(0, 3);

  return (
    <>
      <CountryBreadcrumb country={country} />
      <CountryHero country={country} />
      <CountryAtAGlance country={country} />
      <CountryBilateralPrograms country={country} />
      <CountryOpportunities country={country} />
      <CountryStartups country={country} />
      <CountrySuccessStories country={country} />
      <CountryResources country={country} />
      <RelatedCountries country={country} related={related} />
    </>
  );
}
