// src/app/investors/submit/page.tsx
import type { Metadata } from "next";
import { FileSignature, Handshake, Send, UserPlus } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Submit a Deal — KITE",
  description: "Share an investment opportunity or express interest in the Karnataka ecosystem.",
};

const ITEMS = [
  { id: "onboard", icon: UserPlus, title: "Onboard your firm", description: "Create your investor profile so opportunities can be matched to your thesis.", href: "/investors/onboard", hrefLabel: "Onboard now" },
  { id: "track", icon: FileSignature, title: "Track a deal", description: "Add deals to your pipeline and move them through the six-stage kanban.", href: "/dashboard/investor/pipeline", hrefLabel: "Deal pipeline" },
  { id: "co-invest", icon: Handshake, title: "Express co-investment interest", description: "Signal interest to co-invest alongside Karnataka funds and partners.", href: "/investors/co-invest", hrefLabel: "Co-invest" },
  { id: "contact", icon: Send, title: "Reach the investor cell", description: "Contact the investor cell for term sheets and partnership discussions.", href: "/support", hrefLabel: "Contact" },
];

export default function InvestorSubmitPage() {
  return (
    <>
      <PageHero
        eyebrow="For Investors"
        title="Submit a deal"
        subtitle="Share an investment opportunity or express interest in the Karnataka ecosystem. Start by onboarding your firm, then track deals through your pipeline."
        actions={[
          { label: "Onboard Your Firm", href: "/investors/onboard" },
          { label: "Investor Connect", href: "/investors", variant: "outline" },
        ]}
      />
      <ContentSection id="submit" heading="Get started">
        <InfoGrid items={ITEMS} columns={2} />
      </ContentSection>
    </>
  );
}
