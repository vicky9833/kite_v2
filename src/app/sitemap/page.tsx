// src/app/sitemap/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Sitemap — KITE",
  description: "A complete map of pages and destinations across the KITE platform.",
};

const GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Ecosystem",
    links: [
      { label: "About KITE", href: "/about" },
      { label: "Beyond Bengaluru Clusters", href: "/clusters" },
      { label: "Centres of Excellence", href: "/coe" },
      { label: "Policies", href: "/policies" },
      { label: "Ecosystem Intelligence", href: "/intelligence" },
      { label: "Intelligence Reports", href: "/intelligence/reports" },
      { label: "Reports & Publications", href: "/reports" },
    ],
  },
  {
    title: "Schemes & Programs",
    links: [
      { label: "All Schemes", href: "/schemes" },
      { label: "Policy Calculator", href: "/calculator" },
      { label: "ELEVATE", href: "/schemes/elevate" },
      { label: "KITVEN Fund-5", href: "/schemes/kitven" },
      { label: "K-Combinator", href: "/programs/k-combinator" },
      { label: "KAN", href: "/programs/kan" },
      { label: "LEAP", href: "/programs/leap" },
    ],
  },
  {
    title: "Stakeholders",
    links: [
      { label: "For Startups", href: "/startups" },
      { label: "For Students", href: "/students" },
      { label: "For Universities", href: "/universities" },
      { label: "For Corporates", href: "/corporates" },
      { label: "Women Founders", href: "/women" },
      { label: "NGOs & CSR", href: "/csr" },
      { label: "Government Procurement", href: "/procurement" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Investors", href: "/investors" },
      { label: "Co-investment", href: "/investors/co-invest" },
      { label: "Deal Pipeline", href: "/investors/pipeline" },
      { label: "Incubators", href: "/incubators" },
      { label: "Mentors", href: "/mentors" },
      { label: "Global Innovation Alliance", href: "/gia" },
      { label: "Events & Media", href: "/events" },
      { label: "Idea Bank", href: "/ideas" },
      { label: "Startup Jobs", href: "/jobs" },
    ],
  },
  {
    title: "Dashboards",
    links: [
      { label: "Startup Dashboard", href: "/dashboard/startup" },
      { label: "Admin Dashboard", href: "/dashboard/admin" },
      { label: "Investor Dashboard", href: "/dashboard/investor" },
      { label: "Pipeline Dashboard", href: "/dashboard/investor/pipeline" },
    ],
  },
  {
    title: "Support & Legal",
    links: [
      { label: "Support Center", href: "/support" },
      { label: "FAQs", href: "/support/faqs" },
      { label: "Contact", href: "/contact" },
      { label: "Tenders", href: "/tenders" },
      { label: "Developers", href: "/developers" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "RTI", href: "/rti" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <PageHero
        eyebrow="Sitemap"
        title="Everything on KITE"
        subtitle="A complete map of pages and destinations across the platform."
      />
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {GROUPS.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="font-heading text-h3 text-dark">{group.title}</h2>
                <ul className="mt-4 flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-body text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
