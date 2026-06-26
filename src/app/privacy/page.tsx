// src/app/privacy/page.tsx
import type { Metadata } from "next";

import { PageHero, ProseSection } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy — KITE",
  description: "How the KITE platform collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How the KITE platform handles your information."
      />
      <ProseSection
        heading="Our commitment"
        paragraphs={[
          "KITE is operated by the Government of Karnataka. This preview build is frontend-only: it does not run a backend, database, or external API, and it does not transmit the information you enter to any server. Data you provide during registration, eligibility checks, or the idea/ticket forms is held only in your browser session and is cleared when you refresh or close the page.",
          "Because there is no server-side storage in this preview, no personal data is persisted, shared, or sold. When authenticated accounts and live submissions open in a later phase, this policy will be updated to describe collection, lawful basis, retention, and your rights in detail.",
        ]}
      />
      <ProseSection
        heading="What we do not do"
        surface
        paragraphs={[
          "We do not place advertising or tracking cookies, build advertising profiles, or use third-party analytics that identify you in this preview.",
          "For questions about privacy, contact the Karnataka Startup Cell at startupcell@karnataka.gov.in.",
        ]}
      />
    </>
  );
}
