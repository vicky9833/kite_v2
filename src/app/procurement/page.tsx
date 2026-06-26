// src/app/procurement/page.tsx
import type { Metadata } from "next";
import { ClipboardList, FileCheck, Scale, ShoppingCart } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Government Procurement — KITE",
  description: "Preferential market access and procurement opportunities for Karnataka startups.",
};

const ITEMS = [
  { id: "preference", icon: Scale, title: "Startup preference", description: "Eligible startups receive preferential treatment in government procurement, including relaxations on prior experience and turnover.", href: "/schemes", hrefLabel: "Related schemes" },
  { id: "tenders", icon: ClipboardList, title: "Active tenders", description: "Browse current tenders and procurement notifications across the ecosystem.", href: "/tenders", hrefLabel: "View tenders" },
  { id: "register", icon: FileCheck, title: "Get registration-ready", description: "Register and obtain DPIIT recognition to qualify for procurement benefits.", href: "/register", hrefLabel: "Register" },
  { id: "market", icon: ShoppingCart, title: "Market access", description: "Pilot with government departments and access public-sector demand.", href: "/contact", hrefLabel: "Contact KITS" },
];

export default function ProcurementPage() {
  return (
    <>
      <PageHero
        eyebrow="Market Access"
        title="Government procurement for startups"
        subtitle="Karnataka offers preferential market access so startups can sell to government — with relaxed eligibility and a clear path to public-sector demand."
        actions={[
          { label: "View Tenders", href: "/tenders" },
          { label: "Browse Schemes", href: "/schemes", variant: "outline" },
        ]}
      />
      <ContentSection id="procurement" heading="How procurement access works">
        <InfoGrid items={ITEMS} columns={2} />
      </ContentSection>
    </>
  );
}
