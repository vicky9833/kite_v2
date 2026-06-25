"use client";

// src/components/dashboard/investor/pipeline/DealCard.tsx
//
// Deal Pipeline — a single kanban deal card (Req 29.x, 30.3, 30.4, 32.3, 32.4).
//
// Tight, glance-readable card. Focusable (tabIndex=0) with an accessible name of
// "{company} — {stage}". Always shows company, sector badge, ask (₹ lakh/crore),
// and a SYNTHETIC days-in-stage figure (`getDaysInStage`). On hover / focus
// (group + focus-within) it reveals its controls — kept in the DOM (opacity, not
// display) so they remain keyboard-reachable:
//
//  - Move: native <select> of the six target stages -> updateDealStage
//  - Remove: button -> removeDeal
//  - Reorder: up/down buttons that swap orderInStage with the in-stage neighbour
//    via updateInvestorProfile (no DnD)
//  - Add Note: inline input -> addDealNote (stored on the deal's record)

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

import { useInvestor } from "@/context/InvestorContext";
import { getDaysInStage } from "@/lib/investor-dashboard-data";
import { sectors } from "@/data/sectors";
import { cn } from "@/lib/utils";
import { DEAL_STAGE_ORDER, type DealStage, type TrackedDeal } from "@/types";

/** Map a sector id to its display name (falls back to the raw id). */
function sectorName(sectorId: string): string {
  return sectors.find((s) => s.id === sectorId)?.name ?? sectorId;
}

/** Format a lakhs figure as a compact ₹ lakh / crore label. */
function formatAsk(lakhs: number): string {
  if (lakhs >= 100) {
    const crore = lakhs / 100;
    return `₹${Number.isInteger(crore) ? crore : crore.toFixed(2)} Cr`;
  }
  return `₹${lakhs} L`;
}

export interface DealCardProps {
  deal: TrackedDeal;
}

export function DealCard({ deal }: DealCardProps) {
  const {
    investorProfile,
    updateInvestorProfile,
    updateDealStage,
    removeDeal,
    addDealNote,
  } = useInvestor();

  const [noteDraft, setNoteDraft] = useState("");

  const days = getDaysInStage(deal.id);

  // Same-stage neighbours, ordered, to drive the up/down reorder controls.
  const allDeals = investorProfile?.dealsTracked ?? [];
  const sameStage = allDeals
    .filter((d) => d.currentStage === deal.currentStage)
    .sort((a, b) => a.orderInStage - b.orderInStage);
  const position = sameStage.findIndex((d) => d.id === deal.id);
  const canMoveUp = position > 0;
  const canMoveDown = position >= 0 && position < sameStage.length - 1;

  function reorder(direction: "up" | "down") {
    const neighbour = sameStage[direction === "up" ? position - 1 : position + 1];
    if (!neighbour) return;
    // Swap the two deals' orderInStage; every other deal is preserved.
    const next = allDeals.map((d) => {
      if (d.id === deal.id) return { ...d, orderInStage: neighbour.orderInStage };
      if (d.id === neighbour.id) return { ...d, orderInStage: deal.orderInStage };
      return d;
    });
    updateInvestorProfile({ dealsTracked: next });
  }

  function handleNoteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = noteDraft.trim();
    if (trimmed === "") return;
    addDealNote(deal.id, trimmed);
    setNoteDraft("");
  }

  return (
    <article
      tabIndex={0}
      aria-label={`${deal.companyName} — ${deal.currentStage}`}
      className={cn(
        "group rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow",
        "hover:shadow-md focus-within:shadow-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      )}
    >
      {/* Glance row */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-dark">{deal.companyName}</p>
        <span className="shrink-0 text-xs font-semibold text-dark">
          {formatAsk(deal.askLakhs)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 text-xs font-medium text-slate-700">
          {sectorName(deal.sector)}
        </span>
        <span className="text-xs text-muted">
          {days} {days === 1 ? "day" : "days"} in stage
        </span>
      </div>

      {deal.notes ? (
        <p className="mt-2 line-clamp-2 text-xs italic text-muted">
          “{deal.notes}”
        </p>
      ) : null}

      {/* Revealed controls — kept in DOM (opacity) so they stay keyboard-reachable */}
      <div
        className={cn(
          "mt-3 flex flex-col gap-2 opacity-0 transition-opacity",
          "group-hover:opacity-100 group-focus-within:opacity-100",
        )}
      >
        <div className="flex items-center gap-2">
          <label className="flex flex-1 flex-col gap-1 text-xs">
            <span className="sr-only">Move {deal.companyName} to stage</span>
            <select
              value={deal.currentStage}
              onChange={(e) =>
                updateDealStage(deal.id, e.target.value as DealStage)
              }
              aria-label={`Move ${deal.companyName} to a different stage`}
              className="rounded-md border border-border bg-card px-2 py-1 text-xs text-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {DEAL_STAGE_ORDER.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => reorder("up")}
              disabled={!canMoveUp}
              aria-label={`Move ${deal.companyName} up within ${deal.currentStage}`}
              className="rounded-md border border-border bg-card p-1 text-muted shadow-sm transition-colors hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => reorder("down")}
              disabled={!canMoveDown}
              aria-label={`Move ${deal.companyName} down within ${deal.currentStage}`}
              className="rounded-md border border-border bg-card p-1 text-muted shadow-sm transition-colors hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => removeDeal(deal.id)}
              aria-label={`Remove ${deal.companyName} from the pipeline`}
              className="rounded-md border border-border bg-card p-1 text-muted shadow-sm transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <form onSubmit={handleNoteSubmit} className="flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">Add a note to {deal.companyName}</span>
            <input
              type="text"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add a note…"
              className="w-full rounded-md border border-border bg-card px-2 py-1 text-xs text-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <button
            type="submit"
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-semibold text-primary shadow-sm transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Save
          </button>
        </form>
      </div>
    </article>
  );
}

export default DealCard;
