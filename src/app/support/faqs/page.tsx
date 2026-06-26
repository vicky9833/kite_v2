// src/app/support/faqs/page.tsx
//
// `/support/faqs` — the FAQ surface (Req 10.2). A focused page rendering the
// FAQ accordion with a compact header and links back to the full Support Center.

import type { Metadata } from "next";
import Link from "next/link";

import { SupportFaqAccordion } from "@/components/support/SupportFaqAccordion";

export const metadata: Metadata = {
  title: "FAQs — Support — KITE",
  description: "Frequently asked questions about Karnataka's startup ecosystem.",
};

export default function SupportFaqsPage() {
  return (
    <>
      <section className="bg-dark py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
              Support · FAQs
            </span>
            <h1 className="font-heading text-h1 text-white">
              Frequently Asked Questions
            </h1>
            <p className="text-body text-slate-300">
              Answers across registration, eligibility, schemes, programs, and
              escalation. For more help, visit the{" "}
              <Link href="/support" className="text-accent underline-offset-4 hover:underline">
                Support Center
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <SupportFaqAccordion />
    </>
  );
}
