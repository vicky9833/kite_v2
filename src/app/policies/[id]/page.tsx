// src/app/policies/[id]/page.tsx
//
// `/policies/[id]` — verified policy detail. Resolves all 10 canonical policies
// from `policies.ts`; unknown ids fall back to a graceful content page.

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileText, ScrollText } from "lucide-react";

import { PageHero } from "@/components/shared/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { policies } from "@/data/policies";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return policies.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const policy = policies.find((p) => p.id === params.id);
  return {
    title: policy ? `${policy.name} — KITE` : "Policy — KITE",
    description: policy?.summary,
  };
}

export default function PolicyDetailPage({ params }: { params: { id: string } }) {
  const policy = policies.find((p) => p.id === params.id);

  if (!policy) {
    return (
      <PageHero
        eyebrow="Policy"
        title="Policy"
        subtitle="Explore Karnataka's sector policies."
        actions={[{ label: "All policies", href: "/policies" }]}
      />
    );
  }

  const related = policies.filter((p) => p.id !== policy.id).slice(0, 3);

  return (
    <>
      <nav aria-label="Breadcrumb" className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-caption text-muted sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link href="/policies" className="hover:text-primary">Policies</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-foreground">{policy.name}</span>
        </div>
      </nav>

      <PageHero
        eyebrow={`Policy · ${policy.period}`}
        title={policy.name}
        subtitle={policy.summary}
        actions={[
          { label: "Policy Calculator", href: "/calculator" },
          { label: "Browse Schemes", href: "/schemes", variant: "outline" },
        ]}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-heading text-h2 text-dark">About this policy</h2>
          </div>
          <p className="mt-6 text-body text-muted">{policy.summary}</p>
          <p className="mt-4 text-body text-muted">
            This policy is part of Karnataka&rsquo;s integrated framework for the
            innovation ecosystem, operative over {policy.period}. It works
            alongside the Karnataka Startup Policy 2025-30 and the state&rsquo;s
            scheme architecture to support founders, investors, and partners. For
            scheme-level eligibility and benefits, use the Policy Calculator and
            the schemes hub.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://eitbt.karnataka.gov.in/startup"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "accent" }))}
            >
              Official portal
            </a>
            <Link href="/schemes" className={cn(buttonVariants({ variant: "outline" }))}>
              Related schemes
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-h2 text-dark">Other policies</h2>
          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.href}
                  className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="font-heading text-h3 text-dark">{p.name}</span>
                  <span className="text-caption text-muted">{p.period}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
