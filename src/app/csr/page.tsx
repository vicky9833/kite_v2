// src/app/csr/page.tsx
//
// CSR & NGO Hub (`/csr`) — the public partnership-discovery surface for CSR
// teams, NGO partners, and government coordinators (Req 36). Replaces the
// foundation route stub.
//
// Server component shell composing the eight CSR_Hub sections in order. The
// hero carries the page's single `h1`; every following section owns a single
// `h2`, giving a flat, sequential heading outline. Each section is full-bleed
// and self-contained (its own background, `py-16 md:py-24` rhythm, and inner
// `max-w-7xl px-4 sm:px-6 lg:px-8` container), so the page renders them in
// order without an extra wrapper.
//
// CsrAlignedPrograms (the CSR-aligned schemes filter, anchor
// `#csr-aligned-programs`) and CsrHowToPartner (the Blob brief-download
// partnership pathway, anchor `#csr-partner`) are the only client islands; the
// remaining sections are Server Components, keeping the route's First Load JS
// lean (Req 36).

import type { Metadata } from "next";

import { CsrHeroStrip } from "@/components/csr/CsrHeroStrip";
import { CsrLandscape } from "@/components/csr/CsrLandscape";
import { CsrAlignedPrograms } from "@/components/csr/CsrAlignedPrograms";
import { CsrFeaturedPartnerships } from "@/components/csr/CsrFeaturedPartnerships";
import { CsrNgoPartners } from "@/components/csr/CsrNgoPartners";
import { CsrImpactMetrics } from "@/components/csr/CsrImpactMetrics";
import { CsrHowToPartner } from "@/components/csr/CsrHowToPartner";
import { CsrResources } from "@/components/csr/CsrResources";

export const metadata: Metadata = {
  title: "CSR & NGO Partnerships | KITE",
  description:
    "Partner with KITE to channel CSR capital into Karnataka's innovation ecosystem — CSR-aligned programs, illustrative partnerships, NGO partners, and a downloadable partnership brief.",
};

export default function CsrPage() {
  return (
    <>
      <CsrHeroStrip />
      <CsrLandscape />
      <CsrAlignedPrograms />
      <CsrFeaturedPartnerships />
      <CsrNgoPartners />
      <CsrImpactMetrics />
      <CsrHowToPartner />
      <CsrResources />
    </>
  );
}
