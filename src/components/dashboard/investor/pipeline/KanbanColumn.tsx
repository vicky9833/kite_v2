"use client";

// src/components/dashboard/investor/pipeline/KanbanColumn.tsx
//
// Deal Pipeline — one kanban column (Req 28.1, 28.2, 28.4, 28.5, 32.2).
//
// A single stage column: a `role="region"` with an aria-label of
// "{stage} ({count} deals)" and a header showing the stage name + count. Cards
// are ordered with the PURE `dealsForStage` helper (by orderInStage). An empty
// column renders a "Drop deals here / Add deal" placeholder. No drag-and-drop.

import { dealsForStage } from "@/lib/deal-pipeline";
import type { DealStage, TrackedDeal } from "@/types";
import { DealCard } from "./DealCard";

export interface KanbanColumnProps {
  stage: DealStage;
  /** The (already filtered) deals for the whole board; the column selects its own. */
  deals: TrackedDeal[];
}

export function KanbanColumn({ stage, deals }: KanbanColumnProps) {
  const columnDeals = dealsForStage(deals, stage);
  const count = columnDeals.length;

  return (
    <section
      role="region"
      aria-label={`${stage} (${count} ${count === 1 ? "deal" : "deals"})`}
      className="flex min-w-[16rem] flex-1 flex-col rounded-xl border border-border bg-surface"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <h2 className="text-sm font-semibold text-dark">{stage}</h2>
        <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full border border-border bg-card px-2 py-0.5 text-xs font-semibold text-muted">
          {count}
        </span>
      </header>

      <div className="flex max-h-[32rem] flex-col gap-3 overflow-y-auto p-3">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-card/50 px-3 py-8 text-center">
            <p className="text-xs font-medium text-muted">Drop deals here</p>
            <p className="text-xs text-muted">Add deal</p>
          </div>
        ) : (
          columnDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
        )}
      </div>
    </section>
  );
}

export default KanbanColumn;
