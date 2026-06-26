// src/app/contact/page.tsx
import type { Metadata } from "next";
import { ExternalLink, LifeBuoy, Mail, MapPin, Phone } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Contact Us — KITE",
  description: "Reach the Karnataka Startup Cell for support, partnerships, and queries.",
};

const CHANNELS = [
  { id: "helpline", icon: Phone, title: "Helpline", description: "080-22231007 — Monday to Friday, 10:00–17:30 IST.", href: "tel:+918022231007", hrefLabel: "Call the helpline", external: true },
  { id: "email", icon: Mail, title: "Email", description: "startupcell@karnataka.gov.in for support and queries.", href: "mailto:startupcell@karnataka.gov.in", hrefLabel: "Send an email", external: true },
  { id: "support", icon: LifeBuoy, title: "Support Center", description: "FAQs, department contacts, and a support ticket form.", href: "/support", hrefLabel: "Open Support Center" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contact KITS"
        subtitle="Reach the Karnataka Startup Cell for support, partnerships, and queries. For instant guidance, ask KITE AI from any page."
        actions={[
          { label: "Open Support Center", href: "/support" },
          { label: "Submit a Ticket", href: "/support", variant: "outline" },
        ]}
      />

      <ContentSection id="channels" heading="How to reach us">
        <InfoGrid items={CHANNELS} />
      </ContentSection>

      <ContentSection id="office" heading="Office" surface>
        <div className="flex max-w-2xl flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
          <p className="text-body text-muted">
            Department of Electronics, IT, Bt and S&amp;T, Government of Karnataka,
            Bengaluru, Karnataka.
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Vikasa+Soudha+Bengaluru"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-body text-primary hover:text-accent"
          >
            Open in Maps
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </ContentSection>
    </>
  );
}
