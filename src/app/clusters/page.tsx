// src/app/clusters/page.tsx
//
// `/clusters` — Beyond Bengaluru clusters index. Real, data-backed grid of the
// six canonical clusters from `clusters.ts`, each linking to its detail page.

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Coins } from "lucide-react";

import { PageHero } from "@/components/shared/PageShell";
import { clusters } from "@/data/clusters";

export const metadata: Metadata = {
  title: "Beyond Bengaluru Clusters — KITE",
  description:
    "Six regional innovation clusters spanning Mysuru, Mangaluru, Hubballi-Dharwad-Belagavi, Kalaburagi, Shivamogga, and Tumakuru.",
};

export default function ClustersPage() {
  return (
    <>
      <PageHero
        eyebrow="Beyond Bengaluru"
        title="Six regional innovation clusters"
        subtitle="Karnataka's Beyond Bengaluru strategy grows startup activity across the state, backed by a ₹75 Cr cluster seed fund and dedicated incubation infrastructure."
        actions={[
          { label: "Register Your Startup", href: "/register" },
          { label: "Browse Schemes", href: "/schemes", variant: "outline" },
        ]}
      />

      <section aria-labelledby="clusters-heading" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="clusters-heading" className="font-heading text-h2 text-dark">
            All 6 Clusters
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clusters.map((cluster) => (
              <li key={cluster.id}>
                <Link
                  href={cluster.href}
                  className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <h3 className="font-heading text-h3 text-dark">{cluster.name}</h3>
                  <p className="text-caption text-muted">{cluster.tagline}</p>
                  <div className="flex flex-wrap gap-2">
                    {cluster.focusAreas.slice(0, 4).map((focus) => (
                      <span
                        key={focus}
                        className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-caption text-muted">
                    <Coins className="h-4 w-4" aria-hidden="true" />
                    {cluster.seedFund}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-body text-primary">
                    {cluster.ctaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
