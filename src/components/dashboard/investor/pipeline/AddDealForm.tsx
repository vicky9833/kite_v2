"use client";

// src/components/dashboard/investor/pipeline/AddDealForm.tsx
//
// Deal Pipeline — inline "Add Deal" form (Req 26.3, 26.4).
//
// A lightweight, fully-labelled inline form (no form library) that collects the
// minimal fields for a tracked deal and builds a synthetic `TrackedDeal` which
// is committed through `addDeal` from `InvestorContext`. The context assigns the
// real within-stage order on append, so the form seeds `orderInStage: 0`.
//
// Every control carries an explicit, programmatically-associated <label>.

import { useState } from "react";

import { useInvestor } from "@/context/InvestorContext";
import { sectors } from "@/data/sectors";
import { cn } from "@/lib/utils";
import {
  DEAL_STAGE_ORDER,
  type DealStage,
  type InvestmentStage,
  type TrackedDeal,
} from "@/types";

const INVESTMENT_STAGES: readonly InvestmentStage[] = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B Plus",
  "Growth",
];

const FIELD_CLASS =
  "rounded-lg border border-border bg-card px-3 py-2 text-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export interface AddDealFormProps {
  /** Called after a deal is successfully added (e.g. to collapse the form). */
  onAdded?: () => void;
}

export function AddDealForm({ onAdded }: AddDealFormProps) {
  const { addDeal } = useInvestor();

  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState<string>(sectors[0]?.id ?? "deep-tech");
  const [stage, setStage] = useState<InvestmentStage>("Seed");
  const [askLakhs, setAskLakhs] = useState("100");
  const [currentStage, setCurrentStage] = useState<DealStage>("Sourced");

  const trimmedName = companyName.trim();
  const ask = Number(askLakhs);
  const canSubmit =
    trimmedName.length >= 2 && Number.isFinite(ask) && ask >= 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    const deal: TrackedDeal = {
      id: `deal-user-${Date.now()}`,
      companyName: trimmedName,
      sector,
      stage,
      askLakhs: Math.round(ask),
      currentStage,
      orderInStage: 0,
    };
    addDeal(deal);
    setCompanyName("");
    setAskLakhs("100");
    setCurrentStage("Sourced");
    onAdded?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Add a new deal to the pipeline"
      className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-dark">Company name</span>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          minLength={2}
          placeholder="e.g. Kaveri Labs"
          className={FIELD_CLASS}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-dark">Sector</span>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className={FIELD_CLASS}
        >
          {sectors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-dark">Funding stage</span>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value as InvestmentStage)}
          className={FIELD_CLASS}
        >
          {INVESTMENT_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-dark">Ask (₹ lakhs)</span>
        <input
          type="number"
          min={0}
          value={askLakhs}
          onChange={(e) => setAskLakhs(e.target.value)}
          className={FIELD_CLASS}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-dark">Pipeline stage</span>
        <select
          value={currentStage}
          onChange={(e) => setCurrentStage(e.target.value as DealStage)}
          className={FIELD_CLASS}
        >
          {DEAL_STAGE_ORDER.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end sm:col-span-2 lg:col-span-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors",
            "bg-primary text-white hover:bg-primary/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          Add Deal
        </button>
      </div>
    </form>
  );
}

export default AddDealForm;
