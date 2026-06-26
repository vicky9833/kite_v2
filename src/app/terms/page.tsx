// src/app/terms/page.tsx
import type { Metadata } from "next";

import { PageHero, ProseSection } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Terms of Use — KITE",
  description: "The terms governing your use of the KITE platform and its services.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Use"
        subtitle="The terms governing your use of the KITE platform."
      />
      <ProseSection
        heading="Use of the platform"
        paragraphs={[
          "KITE is an information and discovery platform operated by the Government of Karnataka. It helps founders, investors, and partners discover schemes, programs, and ecosystem resources. Formal applications are submitted through the official portal at eitbt.karnataka.gov.in/startup.",
          "Verified figures and records on KITE are sourced from official documentation. Content explicitly marked Illustrative is synthetic preview material provided to demonstrate the platform and must not be relied upon as an official record.",
        ]}
      />
      <ProseSection
        heading="No warranty; official sources prevail"
        surface
        paragraphs={[
          "The preview build is provided on an as-is basis without warranties. Eligibility, benefits, and timelines are governed by the relevant scheme guidelines and official notifications, which prevail in case of any discrepancy.",
          "By using KITE you agree to use it lawfully and not to misuse the platform. For questions, contact startupcell@karnataka.gov.in.",
        ]}
      />
    </>
  );
}
