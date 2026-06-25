"use client";

// src/components/dashboard/investor/pipeline/PipelineHeaderStrip.tsx
//
// Deal Pipeline — header strip + inline Add-Deal toggle (Req 26.1, 26.3, 26.4).
//
// A `py-8` header showing the title "Your Deal Pipeline" and a subhead that
// counts the investor's ACTIVE deals (currentStage not Closed and not Passed).
// The right side carries a primary "Add Deal" button that toggles an inline
// `AddDealForm`; submitting the form commits a synthetic `TrackedDeal` via
// `addDeal` and collapses the form.

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { useInvestor } from "@/context/InvestorContext";
import { cn } from "@/lib/utils";
import { AddDealForm } from "./AddDealForm";

/** A deal is "active" when its kanban stage is neither Closed nor Passed. */
function isActiveStage(stage: string): boolean {
  return stage !== "Closed" && stage !== "Passed";
}

export function PipelineHeaderStrip() {
  const { investorProfile } = useInvestor();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const activeCount = useMemo(() => {
    const deals = investorProfile?.dealsTracked ?? [];
    return deals.filter((d) => isActiveStage(d.currentStage)).length;
  }, [investorProfile]);

  return (
    <header className="py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-h2 text-dark">Your Deal Pipeline</h1>
          <p className="text-caption text-muted">
            Managing {activeCount} active {activeCount === 1 ? "deal" : "deals"}{" "}
            across six stages
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen((open) => !open)}
          aria-expanded={isFormOpen}
          aria-controls="add-deal-form"
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors",
            "bg-primary text-white hover:bg-primary/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          {isFormOpen ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          {isFormOpen ? "Close" : "Add Deal"}
        </button>
      </div>

      {isFormOpen ? (
        <div id="add-deal-form">
          <AddDealForm onAdded={() => setIsFormOpen(false)} />
        </div>
      ) : null}
    </header>
  );
}

export default PipelineHeaderStrip;
