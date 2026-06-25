import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * IdeaHeroStrip — section 1 of the Idea Bank (Req 24). A restrained,
 * government-grade dark hero (`py-12`, `bg-dark`) carrying the page's single
 * `h1`, a grassroots-framed subhead, and two CTAs.
 *
 *  - The headline is grassroots-framed (founder judgment: institutional and
 *    approachable, not marketing) (Req 24.2).
 *  - The subhead invites citizens, students, farmers, researchers, and rural
 *    innovators to submit ideas that route to government innovation programs.
 *  - "Submit Your Idea" → the on-page form anchor `#submit-idea` (Req 24.3).
 *  - "Browse Recent Ideas" → the on-page board anchor `#ideas-board`
 *    (Req 24.4).
 *
 * Institutional visual discipline (Req 36): no gradients/blobs/emoji/glow,
 * Lucide icons only, `max-w-7xl`, Plus Jakarta Sans headings via `font-heading`.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export function IdeaHeroStrip() {
  return (
    <section className="bg-dark py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            Idea Bank
          </span>
          <h1 className="font-heading text-h1 text-white">
            Your idea, Karnataka&rsquo;s future
          </h1>
          <p className="text-body text-slate-300">
            Citizens, students, farmers, researchers, and rural innovators can
            share an idea in plain language. We route it to the government
            innovation programs best suited to take it forward — no jargon, no
            gatekeeping. Every contribution helps build the state&rsquo;s
            innovation ecosystem.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#submit-idea"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
            >
              Submit Your Idea
            </a>
            <a
              href="#ideas-board"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Browse Recent Ideas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IdeaHeroStrip;
