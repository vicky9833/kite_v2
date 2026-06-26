// src/app/investors/co-invest/page.tsx
import type { Metadata } from "next";
import { Coins, Globe2, Handshake, MapPin } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Co-investment Opportunities — KITE",
  description: "Co-invest alongside Karnataka's funds and the Global Innovation Alliance.",
};

const ITEMS = [
  { id: "kitven", icon: Coins, title: "KITVEN Fund-5", description: "Co-invest alongside Karnataka's ₹100 Cr venture fund (2–10% of corpus, max 30% stake).", href: "/schemes/kitven", hrefLabel: "KITVEN Fund-5" },
  { id: "clusters", icon: MapPin, title: "Beyond Bengaluru", description: "Access deal flow from the six regional clusters backed by the ₹75 Cr cluster fund.", href: "/clusters", hrefLabel: "Explore clusters" },
  { id: "gia", icon: Globe2, title: "International co-investment", description: "Partner with investors across the 32-country Global Innovation Alliance.", href: "/gia", hrefLabel: "Global Innovation Alliance" },
  { id: "connect", icon: Handshake, title: "Investor Connect", description: "Onboard your firm and access matched startups and the deal pipeline.", href: "/investors", hrefLabel: "Investor Connect" },
];

export default function CoInvestPage() {
  return (
    <>
      <PageHero
        eyebrow="For Investors"
        title="Co-investment opportunities"
        subtitle="Deploy capital alongside Karnataka's funds, clusters, and international partners across the innovation ecosystem."
        actions={[
          { label: "Investor Connect", href: "/investors" },
          { label: "Onboard Your Firm", href: "/investors/onboard", variant: "outline" },
        ]}
      />
      <ContentSection id="co-invest" heading="Ways to co-invest">
        <InfoGrid items={ITEMS} columns={2} />
      </ContentSection>
    </>
  );
}
