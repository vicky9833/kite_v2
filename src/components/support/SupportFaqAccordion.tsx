"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supportFaqs } from "@/data/support-faqs";
import { cn } from "@/lib/utils";
import type { FaqCategory } from "@/types";

/**
 * SupportFaqAccordion — "Frequently Asked Questions" (Req 10.1, 10.2). A
 * category-filterable accordion of curated FAQs, each with related links. Uses
 * the Radix-based accordion primitive (proper ARIA) (Req 10.4).
 */
const CATEGORY_ORDER: FaqCategory[] = [
  "Registration",
  "Eligibility",
  "Schemes",
  "Application",
  "Disbursement",
  "Women Founders",
  "Beyond Bengaluru",
  "Programs",
  "International",
  "Escalation",
];

export function SupportFaqAccordion() {
  const [category, setCategory] = useState<FaqCategory | "all">("all");

  const categories = useMemo(() => {
    const present = new Set(supportFaqs.map((f) => f.category));
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, []);

  const filtered = useMemo(
    () => (category === "all" ? supportFaqs : supportFaqs.filter((f) => f.category === category)),
    [category],
  );

  return (
    <section id="faqs" aria-labelledby="faqs-heading" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 id="faqs-heading" className="font-heading text-h2 text-dark">
          Frequently Asked Questions
        </h2>

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter FAQs by category">
          {(["all", ...categories] as (FaqCategory | "all")[]).map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-surface",
                )}
              >
                {c === "all" ? "All" : c}
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card px-6 shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            {filtered.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="font-heading text-h3 text-dark">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-body text-muted">{faq.answer}</p>
                  {faq.relatedLinks.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {faq.relatedLinks.map((link) => (
                        <Link
                          key={link.href + link.label}
                          href={link.href}
                          className="rounded-full border border-border bg-surface px-3 py-1 text-caption text-primary transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export default SupportFaqAccordion;
