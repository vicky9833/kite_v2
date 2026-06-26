"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * SupportHero — compact hero for the Support Center (Req 10.1). Two CTAs: "Ask
 * KITE AI" opens the global AI assistant panel by activating its floating
 * trigger; "Contact KITS Direct" anchors to the contact section.
 *
 * Client Component so the "Ask KITE AI" CTA can focus/click the global
 * assistant trigger button (Req 12.3).
 */
export function SupportHero() {
  function openAssistant() {
    if (typeof document === "undefined") return;
    const trigger = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Ask KITE AI"]',
    );
    trigger?.click();
  }

  return (
    <section className="bg-dark py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            Support Center
          </span>
          <h1 className="font-heading text-h1 text-white">
            Help when you need it
          </h1>
          <p className="text-body text-slate-300">
            Find answers in the FAQs, reach the KITS helpline, or ask KITE AI.
            The Karnataka startup ecosystem support team is here to help you
            navigate registration, schemes, and programs.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openAssistant}
              className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
            >
              Ask KITE AI
            </button>
            <a
              href="#contact-kits"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Contact KITS Direct
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SupportHero;
