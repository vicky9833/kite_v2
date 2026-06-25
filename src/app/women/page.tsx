// src/app/women/page.tsx
//
// Women Founders Hub (`/women`) — the public surface for women-led
// entrepreneurship in Karnataka (Req 36). Replaces the foundation route stub.
//
// Server component shell composing the nine Women_Hub sections in order. The
// hero carries the page's single `h1`; every following section owns a single
// `h2`, giving a flat, sequential heading outline. Each section is full-bleed
// and self-contained (its own background, `py-16 md:py-24` rhythm, and inner
// `max-w-7xl px-4 sm:px-6 lg:px-8` container), so the page renders them in
// order without an extra wrapper.
//
// WomenSchemesList is the only client island (it carries the women-only
// filter); the remaining sections are Server Components, keeping the route's
// First Load JS lean (Req 36).

import type { Metadata } from "next";

import { WomenHeroStrip } from "@/components/women/WomenHeroStrip";
import { WomenVerifiedStatsRow } from "@/components/women/WomenVerifiedStatsRow";
import { WomenWhyKarnataka } from "@/components/women/WomenWhyKarnataka";
import { WomenSchemesList } from "@/components/women/WomenSchemesList";
import { WomenAcceleratorProgram } from "@/components/women/WomenAcceleratorProgram";
import { WomenFeaturedFounders } from "@/components/women/WomenFeaturedFounders";
import { WomenMentors } from "@/components/women/WomenMentors";
import { WomenResources } from "@/components/women/WomenResources";
import { WomenGetInvolved } from "@/components/women/WomenGetInvolved";

export const metadata: Metadata = {
  title: "Women Entrepreneurs | KITE",
  description:
    "Dedicated schemes, the ₹5 crore Women-Led Accelerator, mentors, and resources for women founders building in Karnataka.",
};

export default function WomenPage() {
  return (
    <>
      <WomenHeroStrip />
      <WomenVerifiedStatsRow />
      <WomenWhyKarnataka />
      <WomenSchemesList />
      <WomenAcceleratorProgram />
      <WomenFeaturedFounders />
      <WomenMentors />
      <WomenResources />
      <WomenGetInvolved />
    </>
  );
}
