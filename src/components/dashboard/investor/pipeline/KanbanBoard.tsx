"use client";

// src/components/dashboard/investor/pipeline/KanbanBoard.tsx
//
// Deal Pipeline — the kanban board (Req 28.1, 28.6).
//
// Renders the six canonical stage columns (DEAL_STAGE_ORDER) in a single
// horizontally-scrollable row. Each column receives the (already filtered)
// deals and selects/orders its own via `dealsForStage`. No drag-and-drop —
// stage moves and within-stage reordering happen on the cards themselves.

import { DEAL_STAGE_ORDER, type TrackedDeal } from "@/types";
import { KanbanColumn } from "./KanbanColumn";

export interface KanbanBoardProps {
  /** The filtered deals to render across the board's six columns. */
  deals: TrackedDeal[];
}

export function KanbanBoard({ deals }: KanbanBoardProps) {
  return (
    <div
      aria-label="Deal pipeline board"
      className="flex gap-4 overflow-x-auto pb-4"
    >
      {DEAL_STAGE_ORDER.map((stage) => (
        <KanbanColumn key={stage} stage={stage} deals={deals} />
      ))}
    </div>
  );
}

export default KanbanBoard;
