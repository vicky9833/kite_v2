import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * WomenHeroStrip — section 1 of the Women Founders Hub (Req 7). A restrained,
 * government-grade dark hero (`py-12`, `bg-dark`) carrying the page's single
 * `h1`, an institutional subhead, and two CTAs.
 *
 *  - The subhead names the VERIFIED Women_Led_ELEVATE_Share (25% women-led
 *    ELEVATE winners) and the Women-Led Accelerator program (Req 7.2). These
 *    are canonical / verified figures, so they carry no illustrative label
 *    (Req 38.1, 38.5).
 *  - "Browse Women-Specific Schemes" → `/schemes` (Req 7.3).
 *  - "Explore Women-Led Accelerators" → the on-page `#women-accelerator`
 *    anchor (Req 7.4).
 *
 * Institutional visual discipline (Req 36): no gradients/blobs/emoji/glow,
 * Lucide icons only, `max-w-7xl`, Plus Jakarta Sans headings via `font-heading`.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export function WomenHeroStrip() {
  return (
    <section className="bg-dark py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            Women Founders Hub
          </span>
          <h1 className="font-heading text-h1 text-white">
            Building Karnataka with women founders
          </h1>
          <p className="text-body text-slate-300">
            Women lead 25% of ELEVATE winners in Karnataka, and the state&rsquo;s
            Women-Led Accelerator backs that momentum with dedicated capital,
            mentorship, and preferential access. Find the schemes, thresholds,
            and programs built for women-led ventures.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/schemes"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
            >
              Browse Women-Specific Schemes
            </Link>
            <a
              href="#women-accelerator"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Explore Women-Led Accelerators
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WomenHeroStrip;
