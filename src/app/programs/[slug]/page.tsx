// src/app/programs/[slug]/page.tsx
//
// `/programs/[slug]` — program detail. Resolves flagship programs whose href
// sits under /programs/ (e.g. LEAP) from `flagship-programs.ts`. The static
// segments /programs/k-combinator and /programs/kan take precedence over this
// dynamic route. Unknown slugs render a graceful program page (never a stub).

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gauge, Target } from "lucide-react";

import { PageHero } from "@/components/shared/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { flagshipPrograms } from "@/data/flagship-programs";
import { cn } from "@/lib/utils";

/** Turn a raw url segment into a readable title. */
function humanize(segment: string): string {
  return decodeURIComponent(segment)
    .split(/[-_]/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Flagship programs whose canonical href lives under /programs/. */
const PROGRAMS_UNDER_ROUTE = flagshipPrograms.filter((p) =>
  p.href.startsWith("/programs/"),
);

export function generateStaticParams() {
  // Exclude slugs that have dedicated static route segments.
  const STATIC_SEGMENTS = new Set(["k-combinator", "kan"]);
  return PROGRAMS_UNDER_ROUTE.map((p) => ({
    slug: p.href.replace("/programs/", ""),
  })).filter((p) => !STATIC_SEGMENTS.has(p.slug));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const program = flagshipPrograms.find((p) => p.href.endsWith(`/${params.slug}`));
  return {
    title: program ? `${program.name} — KITE` : `${humanize(params.slug)} — KITE`,
    description: program?.tagline,
  };
}

export default function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const program = flagshipPrograms.find((p) => p.href.endsWith(`/${params.slug}`));

  const title = program?.name ?? humanize(params.slug);
  const tagline = program?.tagline ?? "A Karnataka innovation program.";
  const description =
    program?.description ??
    "This Karnataka program supports founders and the wider innovation ecosystem. Explore schemes, clusters, and the registration wizard to engage.";

  return (
    <>
      <PageHero
        eyebrow={program ? `Flagship Program · ${program.status === "active" ? "Active" : "Upcoming"}` : "Program"}
        title={title}
        subtitle={tagline}
        actions={[
          { label: program?.ctaLabel ?? "Register Your Startup", href: "/register" },
          { label: "Browse Schemes", href: "/schemes", variant: "outline" },
        ]}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm md:col-span-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="font-heading text-h3 text-dark">About the program</h2>
              </div>
              <p className="text-body text-muted">{description}</p>
            </div>
            {program ? (
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
                <Gauge className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="font-heading text-h3 text-dark">Key metric</h2>
                <p className="font-heading text-h1 text-primary">{program.keyMetric}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/programs/kan" className={cn(buttonVariants({ variant: "outline" }))}>
              KAN
            </Link>
            <Link href="/programs/k-combinator" className={cn(buttonVariants({ variant: "outline" }))}>
              K-Combinator
            </Link>
            <Link href="/clusters" className={cn(buttonVariants({ variant: "outline" }))}>
              Beyond Bengaluru
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
