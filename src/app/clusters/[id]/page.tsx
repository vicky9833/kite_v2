// src/app/clusters/[id]/page.tsx
//
// `/clusters/[id]` — verified Beyond Bengaluru cluster detail. Resolves all six
// canonical clusters from `clusters.ts`; unknown ids fall back to a graceful
// content page (never a bare stub).

import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Coins, Landmark, MapPin, Target } from "lucide-react";

import { PageHero } from "@/components/shared/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { clusters } from "@/data/clusters";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return clusters.map((c) => ({ id: c.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const cluster = clusters.find((c) => c.id === params.id);
  return {
    title: cluster ? `${cluster.name} Cluster — KITE` : "Beyond Bengaluru Cluster — KITE",
    description: cluster?.tagline,
  };
}

export default function ClusterDetailPage({ params }: { params: { id: string } }) {
  const cluster = clusters.find((c) => c.id === params.id);

  if (!cluster) {
    return (
      <>
        <PageHero
          eyebrow="Beyond Bengaluru"
          title="Cluster"
          subtitle="Explore Karnataka's six regional innovation clusters."
          actions={[{ label: "View all clusters", href: "/clusters" }]}
        />
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Beyond Bengaluru Cluster"
        title={cluster.name}
        subtitle={cluster.tagline}
        actions={[
          { label: "Register Your Startup", href: "/register" },
          { label: "All Clusters", href: "/clusters", variant: "outline" },
        ]}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
              <Target className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-heading text-h3 text-dark">Focus Areas</h2>
              <div className="flex flex-wrap gap-2">
                {cluster.focusAreas.map((focus) => (
                  <span
                    key={focus}
                    className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted"
                  >
                    {focus}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
              <Coins className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-heading text-h3 text-dark">Seed Fund</h2>
              <p className="text-body text-muted">{cluster.seedFund}</p>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-heading text-h3 text-dark">Region</h2>
              <p className="text-body text-muted">
                Part of Karnataka&rsquo;s Beyond Bengaluru strategy growing startup
                activity across the state.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="font-heading text-h2 text-dark">Infrastructure</h2>
              </div>
              <ul className="mt-6 flex flex-col gap-3">
                {cluster.infrastructure.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-border bg-card p-4 text-body text-muted shadow-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="font-heading text-h2 text-dark">Anchor Institutions</h2>
              </div>
              <ul className="mt-6 flex flex-wrap gap-2">
                {cluster.anchorInstitutions.map((inst) => (
                  <li
                    key={inst}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-caption font-medium text-foreground shadow-sm"
                  >
                    {inst}
                  </li>
                ))}
              </ul>
              {cluster.note ? (
                <p className="mt-6 rounded-lg border border-border bg-card p-4 text-body text-muted shadow-sm">
                  {cluster.note}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-8 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-h2 text-dark">{cluster.ctaLabel}</h2>
              <p className="mt-2 text-body text-muted">
                Connect with incubators, schemes, and mentors active in this cluster.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/incubators" className={cn(buttonVariants({ variant: "accent" }))}>
                Find Incubators
              </Link>
              <Link href="/schemes" className={cn(buttonVariants({ variant: "outline" }))}>
                Browse Schemes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
