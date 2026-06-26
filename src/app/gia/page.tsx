// src/app/gia/page.tsx
//
// `/gia` — Global Innovation Alliance index (Req 7). Server shell composing the
// hero, Why GIA, Region Overview (counts derived from verified data), the All
// Countries grid (client island), recent engagements (synthetic), featured
// programs, contact, and resources.

import type { Metadata } from "next";

import { GiaHeroStrip } from "@/components/gia/GiaHeroStrip";
import { WhyGia } from "@/components/gia/WhyGia";
import { RegionOverview } from "@/components/gia/RegionOverview";
import { AllCountriesGrid } from "@/components/gia/AllCountriesGrid";
import { RecentEngagements } from "@/components/gia/RecentEngagements";
import { FeaturedPrograms } from "@/components/gia/FeaturedPrograms";
import { GiaContact } from "@/components/gia/GiaContact";
import { GiaResources } from "@/components/gia/GiaResources";
import { giaCountries } from "@/data/gia-countries";

export const metadata: Metadata = {
  title: "Global Innovation Alliance — KITE",
  description:
    "Karnataka's Global Innovation Alliance: 32 partner countries across five regions for knowledge exchange, co-investment, and market access.",
};

export default function GiaPage() {
  return (
    <>
      <GiaHeroStrip countryCount={giaCountries.length} />
      <WhyGia />
      <RegionOverview />
      <AllCountriesGrid countries={giaCountries} />
      <RecentEngagements />
      <FeaturedPrograms />
      <GiaContact />
      <GiaResources />
    </>
  );
}
