import { notFound } from "next/navigation";

import { schemes } from "@/data/schemes";
import { SchemeDetailContent } from "@/components/schemes/SchemeDetailContent";
import { SchemeDetailSidebar } from "@/components/schemes/SchemeDetailSidebar";
import { PersonalizedEligibilityCard } from "@/components/schemes/PersonalizedEligibilityCard";
import { ApplyButton } from "@/components/schemes/ApplyButton";
import type { Scheme } from "@/types";

/**
 * Backward-compatibility shim. The foundation slice shipped nav/footer links to
 * `/schemes/kitven` and `/schemes/gck` — short, human-friendly ids that predate
 * the canonical `schemes.ts` records. Rather than break those foundation-era
 * links (or rewrite foundation data), we resolve the legacy id to its canonical
 * scheme id here. This map is the single, documented place that legacy aliases
 * live; new content should always link to the canonical id directly.
 */
const SCHEME_ID_ALIASES: Record<string, string> = {
  kitven: "kitven-fund-5",
  gck: "grand-challenge-karnataka",
};

/**
 * Resolve a raw `[id]` route segment to a canonical {@link Scheme} in a fixed
 * order (Req 16.10):
 *   1. Direct match — `schemes.find(s => s.id === id)`.
 *   2. Alias map — `SCHEME_ID_ALIASES[id]` (legacy foundation links).
 *   3. Neither — return `null` so the caller can `notFound()`.
 */
function resolveScheme(id: string): Scheme | null {
  const direct = schemes.find((s) => s.id === id);
  if (direct) return direct;

  const aliasedId = SCHEME_ID_ALIASES[id];
  if (aliasedId) {
    const aliased = schemes.find((s) => s.id === aliasedId);
    if (aliased) return aliased;
  }

  return null;
}

/**
 * Prerender every real scheme detail page (plus the two documented aliases) so
 * the 22 detail routes are static at build time. Unknown ids are not listed
 * here; because the page still calls `notFound()` for any unresolved id and
 * `dynamicParams` defaults to `true`, requests for unknown ids are handled at
 * request time and correctly 404.
 */
export function generateStaticParams(): { id: string }[] {
  return [
    ...schemes.map((scheme) => ({ id: scheme.id })),
    ...Object.keys(SCHEME_ID_ALIASES).map((alias) => ({ id: alias })),
  ];
}

/**
 * Scheme Detail page (`/schemes/[id]`) — a SERVER component (Req 16). Static
 * editorial content (`SchemeDetailContent`, `SchemeDetailSidebar`) renders on
 * the server; only the personalized `PersonalizedEligibilityCard` and the
 * `ApplyButton` ship JS as client islands.
 *
 * Layout (Req 16.1): two columns on desktop (main editorial column + a sticky
 * sidebar) and a single column on mobile, where the sidebar stacks beneath the
 * content and a sticky bottom action bar keeps the Apply control reachable.
 */
export default function SchemeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const scheme = resolveScheme(params.id);

  if (!scheme) {
    notFound();
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          {/* Main editorial column */}
          <div className="min-w-0 space-y-12">
            <SchemeDetailContent scheme={scheme} />
            {/* Personalized eligibility client island — placed beneath the
                heading/badges/editorial framing emitted by SchemeDetailContent. */}
            <PersonalizedEligibilityCard scheme={scheme} />
          </div>

          {/* Supporting sidebar — sticky on desktop, stacks below on mobile. */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <SchemeDetailSidebar scheme={scheme} />
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom action bar — keeps Apply reachable when the
          sidebar's ApplyButton has scrolled out of view (Req 16.1). Hidden on
          desktop where the sticky sidebar already carries the control. */}
      <div className="sticky bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-1px_0_0_var(--border)] backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <ApplyButton schemeId={scheme.id} className="mx-auto max-w-7xl" />
      </div>
    </>
  );
}
