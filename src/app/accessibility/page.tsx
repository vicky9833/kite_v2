// src/app/accessibility/page.tsx
import type { Metadata } from "next";

import { PageHero, ProseSection } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Accessibility — KITE",
  description: "KITE's commitment to an accessible, inclusive platform.",
};

export default function AccessibilityPage() {
  return (
    <>
      <PageHero
        eyebrow="Accessibility"
        title="Accessibility statement"
        subtitle="KITE is built to be usable by everyone, targeting WCAG 2.1 AA."
      />
      <ProseSection
        heading="Our approach"
        paragraphs={[
          "KITE targets conformance with the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. The platform uses semantic landmarks, keyboard-operable controls, visible focus indicators, sufficient colour contrast, text alternatives for meaningful non-text content, and respects the operating-system reduced-motion preference.",
          "Interactive surfaces — navigation, dropdowns, the AI assistant, carousels, accordions, and forms — are built with accessible component primitives and are tested with automated accessibility checks across the build.",
        ]}
      />
      <ProseSection
        heading="Ongoing work and feedback"
        surface
        paragraphs={[
          "Full conformance also requires manual testing with assistive technologies and expert review; we treat accessibility as an ongoing commitment rather than a one-time checkbox.",
          "If you encounter an accessibility barrier, please contact the Karnataka Startup Cell at startupcell@karnataka.gov.in so we can address it.",
        ]}
      />
    </>
  );
}
