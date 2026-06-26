// src/app/policies/page.tsx
//
// `/policies` — index of Karnataka's 10 verified sector policies from
// `policies.ts`, each linking to its detail page.

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHero } from "@/components/shared/PageShell";
import { policies } from "@/data/policies";

export const metadata: Metadata = {
  title: "Policies — KITE",
  description:
    "Karnataka's startup, IT, biotech, GCC, ESDM, and sector policies governing the innovation ecosystem.",
};

export default function PoliciesPage() {
  return (
    <>
      <PageHero
        eyebrow="Policy Framework"
        title="Karnataka's innovation policies"
        subtitle={`The ${policies.length} sector policies below govern Karnataka's startup, IT, biotech, GCC, ESDM, and deep-tech ecosystem, anchored by the Karnataka Startup Policy 2025-30.`}
        actions={[
          { label: "Karnataka Startup Policy 2025-30", href: "/policies/startup-2025-30" },
          { label: "Policy Calculator", href: "/calculator", variant: "outline" },
        ]}
      />

      <section aria-labelledby="policies-heading" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="policies-heading" className="font-heading text-h2 text-dark">
            All {policies.length} Vertical Policies
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy) => (
              <li key={policy.id}>
                <Link
                  href={policy.href}
                  className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="inline-flex w-fit rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium uppercase tracking-wide text-muted">
                    {policy.period}
                  </span>
                  <h3 className="font-heading text-h3 text-dark">{policy.name}</h3>
                  <p className="flex-1 text-body text-muted">{policy.summary}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-body text-primary">
                    Read policy
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
