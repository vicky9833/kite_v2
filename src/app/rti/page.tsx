// src/app/rti/page.tsx
import type { Metadata } from "next";

import { PageHero, ProseSection } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Right to Information — KITE",
  description: "RTI disclosures and information access under the Right to Information Act.",
};

export default function RtiPage() {
  return (
    <>
      <PageHero
        eyebrow="Transparency"
        title="Right to Information"
        subtitle="Information access under the Right to Information Act, 2005."
      />
      <ProseSection
        heading="Filing an RTI request"
        paragraphs={[
          "Citizens may seek information held by the Department of Electronics, IT, Bt and S&T and its agencies (KITS, KDEM) under the Right to Information Act, 2005. Requests are filed with the designated Public Information Officer (PIO) through the official Government of Karnataka RTI channels.",
          "Proactive disclosures mandated under Section 4 of the Act — including organisational structure, functions, and budgets — are published through official government portals.",
        ]}
      />
      <ProseSection
        heading="How to reach the PIO"
        surface
        paragraphs={[
          "For RTI assistance related to the startup ecosystem, contact the Karnataka Startup Cell at startupcell@karnataka.gov.in or the helpline 080-22231007, which will direct your request to the appropriate Public Information Officer.",
        ]}
      />
    </>
  );
}
