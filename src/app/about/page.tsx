// src/app/about/page.tsx
import type { Metadata } from "next";
import { Building2, Compass, Handshake, Target } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "About KITE",
  description:
    "Karnataka Innovation & Technology Ecosystem — the state's single front door connecting startups, investors, and ecosystem partners.",
};

const PILLARS = [
  { id: "discover", icon: Compass, title: "Discover", description: "Find the right schemes, programs, incubators, and mentors across Karnataka's ecosystem.", href: "/schemes", hrefLabel: "Browse schemes" },
  { id: "apply", icon: Target, title: "Apply", description: "Check eligibility with the Policy Calculator and register your startup in minutes.", href: "/calculator", hrefLabel: "Check eligibility" },
  { id: "connect", icon: Handshake, title: "Connect", description: "Reach investors, incubators, mentors, and international partners through the alliance.", href: "/investors", hrefLabel: "Investor Connect" },
];

const OPERATORS = [
  { id: "kits", icon: Building2, title: "KITS", description: "Karnataka Innovation and Technology Society — implementation of the startup policy and schemes." },
  { id: "kdem", icon: Building2, title: "KDEM", description: "Karnataka Digital Economy Mission — ecosystem partnerships, Beyond Bengaluru, and Global Innovation Alliance." },
  { id: "eitbt", icon: Building2, title: "EITBT Department", description: "Department of Electronics, IT, Bt and S&T — the policy and governance home of the ecosystem." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="One Portal. One Login. One Ecosystem."
        subtitle="KITE — the Karnataka Innovation & Technology Ecosystem — is the state's single front door connecting startups, investors, incubators, mentors, and ecosystem partners with Karnataka's schemes, programs, and policies."
        actions={[
          { label: "Register Your Startup", href: "/register" },
          { label: "Explore Schemes", href: "/schemes", variant: "outline" },
        ]}
      />

      <ContentSection id="mission" heading="What KITE does" lead="KITE brings Karnataka's startup ecosystem together in one place — making discovery, eligibility, and connection simple for every participant.">
        <InfoGrid items={PILLARS} />
      </ContentSection>

      <ContentSection id="operators" heading="Who runs KITE" surface lead="KITE is operated under the Government of Karnataka by the institutions that deliver the startup policy.">
        <InfoGrid items={OPERATORS} />
      </ContentSection>

      <ContentSection id="numbers" heading="The ecosystem at a glance">
        <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[
            ["21,000+", "DPIIT startups"],
            ["$79B", "VC raised since 2010"],
            ["183", "Soonicorns"],
            ["32", "GIA partner countries"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <dt className="font-heading text-h1 text-dark">{value}</dt>
              <dd className="mt-1 text-caption text-muted">{label}</dd>
            </div>
          ))}
        </dl>
      </ContentSection>
    </>
  );
}
