"use client";

import { BookOpen, MessageSquare, PhoneCall } from "lucide-react";

/**
 * SupportHelpGrid — "How can we help" 3-column grid (Req 10.1). Browse FAQs
 * (anchor), Ask KITE AI (opens assistant), Direct Contact (anchor).
 *
 * Client Component for the Ask KITE AI action.
 */
export function SupportHelpGrid() {
  function openAssistant() {
    if (typeof document === "undefined") return;
    document
      .querySelector<HTMLButtonElement>('button[aria-label="Ask KITE AI"]')
      ?.click();
  }

  return (
    <section aria-labelledby="how-can-we-help-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="how-can-we-help-heading" className="font-heading text-h2 text-dark">
          How can we help?
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <a
            href="#faqs"
            className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-h3 text-dark">Browse FAQs</h3>
            <p className="text-body text-muted">
              Answers on registration, eligibility, schemes, and escalation.
            </p>
          </a>

          <button
            type="button"
            onClick={openAssistant}
            className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 text-left shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-h3 text-dark">Ask KITE AI</h3>
            <p className="text-body text-muted">
              Get instant, route-aware guidance from the KITE assistant.
            </p>
          </button>

          <a
            href="#contact-kits"
            className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
              <PhoneCall className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-h3 text-dark">Direct Contact</h3>
            <p className="text-body text-muted">
              Reach the KITS helpline and email, or department cells.
            </p>
          </a>
        </div>
      </div>
    </section>
  );
}

export default SupportHelpGrid;
