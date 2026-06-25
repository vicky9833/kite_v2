// src/components/investors/LiveDealFlowSection.tsx
//
// Investor Connect — "Live Deal Flow" (#deals, Req 10).
//
// Renders the 20 deterministic deal-flow events from `getDealFlowTicker()`.
//   - DESKTOP (md+): a plain-CSS horizontal marquee. The track holds the 20
//     events duplicated ONCE and is translated by -50% on a linear keyframe
//     loop, giving a seamless infinite scroll. The animation pauses on `:hover`
//     and `:focus-within`, and is paused under `prefers-reduced-motion`. No
//     framer-motion / react-spring — the keyframes live in a scoped <style>
//     block keyed by a unique class (Req 10.4, 37.4, 38.3).
//   - MOBILE: a plain vertical list (no animation).
// A single `aria-live="polite"` region announces a static summary on mount;
// the decorative scroll itself is never announced (Req 10.7, 38.3).
//
// Full-bleed self-contained section (own background + `py-16 md:py-24` + inner
// `max-w-7xl` container), matching the sibling Investor Connect sections.

import { Clock } from "lucide-react";

import type { DealFlowEvent } from "@/types";
import { getDealFlowTicker } from "@/lib/synthetic-investor-data";
import { sectors } from "@/data/sectors";
import { formatNumber } from "@/lib/utils";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";

/** Unique scope class so the marquee keyframes never leak into other sections. */
const MARQUEE_CLASS = "kite-deal-marquee";

/** Sector id → display label, derived once from the canonical taxonomy. */
const SECTOR_LABELS: Record<string, string> = Object.fromEntries(
  sectors.map((s) => [s.id, s.name]),
);

function sectorLabel(id: string): string {
  return SECTOR_LABELS[id] ?? id;
}

/** Format a lakhs figure as ₹ crore (≥ 1 Cr) or ₹ lakh. Pure & deterministic. */
function formatAmountLakhs(lakhs: number): string {
  if (lakhs >= 100) {
    const crore = lakhs / 100;
    const text = Number.isInteger(crore) ? crore.toFixed(0) : crore.toFixed(2);
    return `₹${text} Cr`;
  }
  return `₹${formatNumber(lakhs)} L`;
}

/** Scoped marquee keyframes + reduced-motion / pause-on-interaction rules. */
const MARQUEE_CSS = `
.${MARQUEE_CLASS}__track {
  display: flex;
  width: max-content;
  animation: ${MARQUEE_CLASS}-scroll 45s linear infinite;
}
@keyframes ${MARQUEE_CLASS}-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.${MARQUEE_CLASS}:hover .${MARQUEE_CLASS}__track,
.${MARQUEE_CLASS}:focus-within .${MARQUEE_CLASS}__track {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .${MARQUEE_CLASS}__track { animation-play-state: paused; }
}
`;

/** A single deal entry, shared by the desktop marquee and mobile list. */
function DealEntry({ event }: { event: DealFlowEvent }) {
  return (
    <div className="flex h-full min-w-[16rem] flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-caption text-muted">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{event.timestampLabel}</span>
      </div>
      <p className="text-sm font-semibold text-dark">{sectorLabel(event.sector)}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-muted">
        <span>{event.stage}</span>
        <span aria-hidden="true">·</span>
        <span>{event.dealType}</span>
      </div>
      <p className="mt-auto font-heading text-base font-bold text-primary">
        {formatAmountLakhs(event.amountLakhs)}
      </p>
    </div>
  );
}

export function LiveDealFlowSection() {
  const events = getDealFlowTicker();
  // Duplicate the list once so a -50% translate produces a seamless loop.
  const marqueeEvents = [...events, ...events];

  return (
    <section
      id="deals"
      aria-labelledby="deals-heading"
      className="scroll-mt-24 bg-background py-16 md:py-24"
    >
      {/* Scoped keyframes — keeps the animation library out of the bundle. */}
      <style>{MARQUEE_CSS}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <SectionHeading
            id="deals-heading"
            eyebrow="Deal flow"
            title="Live Deal Flow"
            description="Recent raises across Karnataka's priority sectors, refreshed continuously."
          />
          <IllustrativeBadge variant="inline" />
        </div>

        {/* Static, single-shot live announcement — the scroll is NOT announced. */}
        <p aria-live="polite" className="sr-only">
          {`Showing ${events.length} recent illustrative deals across Karnataka sectors.`}
        </p>

        {/* DESKTOP: horizontal auto-scrolling marquee. */}
        <div
          className={`${MARQUEE_CLASS} mt-12 hidden overflow-hidden md:block`}
          aria-hidden="true"
        >
          <div className={`${MARQUEE_CLASS}__track gap-4`}>
            {marqueeEvents.map((event, i) => (
              <DealEntry key={`${event.id}-${i}`} event={event} />
            ))}
          </div>
        </div>

        {/* MOBILE: plain vertical list. */}
        <ul
          className="mt-10 flex flex-col gap-3 md:hidden"
          aria-label="Recent illustrative deals"
        >
          {events.map((event) => (
            <li key={event.id}>
              <DealEntry event={event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default LiveDealFlowSection;
