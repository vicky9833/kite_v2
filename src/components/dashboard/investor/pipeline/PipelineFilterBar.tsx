"use client";

// src/components/dashboard/investor/pipeline/PipelineFilterBar.tsx
//
// Deal Pipeline — filter bar (Req 27.1, 27.2, 27.3).
//
// A lightweight, fully-labelled bar of native controls (no form library) that
// lifts a `DealFilters` value up to the board via `onChange`. The board feeds
// that value to the PURE `filterDeals` helper, so this component holds only the
// raw UI state and never filters itself.
//
// Controls (each with a programmatically-associated <label>):
//  - sector            -> filters.sector
//  - stage range       -> filters.stageRange { fromIndex, toIndex } over DEAL_STAGE_ORDER
//  - ask range         -> filters.askRange { minLakhs, maxLakhs }
//  - date range        -> filters.dateRange { fromIso, toIso } (documented no-op in filterDeals)
//  - search            -> filters.query (case-insensitive companyName substring)

import { useState } from "react";
import { Search } from "lucide-react";

import { sectors } from "@/data/sectors";
import type { DealFilters } from "@/lib/deal-pipeline";
import { DEAL_STAGE_ORDER } from "@/types";

const FIELD_CLASS =
  "rounded-lg border border-border bg-card px-3 py-2 text-sm text-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export interface PipelineFilterBarProps {
  /** Lifts the assembled DealFilters up to the board on every change. */
  onChange: (filters: DealFilters) => void;
}

/** Build a normalised DealFilters from the raw UI field values. */
function buildFilters(raw: {
  sector: string;
  fromIndex: number;
  toIndex: number;
  askMin: string;
  askMax: string;
  dateFrom: string;
  dateTo: string;
  query: string;
}): DealFilters {
  const filters: DealFilters = {};

  if (raw.sector !== "") {
    filters.sector = raw.sector;
  }

  // Only treat the stage range as active when it narrows from the full span.
  const lastIndex = DEAL_STAGE_ORDER.length - 1;
  if (raw.fromIndex !== 0 || raw.toIndex !== lastIndex) {
    filters.stageRange = { fromIndex: raw.fromIndex, toIndex: raw.toIndex };
  }

  const min = Number(raw.askMin);
  const max = Number(raw.askMax);
  const hasMin = raw.askMin !== "" && Number.isFinite(min);
  const hasMax = raw.askMax !== "" && Number.isFinite(max);
  if (hasMin || hasMax) {
    filters.askRange = {
      minLakhs: hasMin ? min : 0,
      maxLakhs: hasMax ? max : Number.MAX_SAFE_INTEGER,
    };
  }

  if (raw.dateFrom !== "" && raw.dateTo !== "") {
    filters.dateRange = { fromIso: raw.dateFrom, toIso: raw.dateTo };
  }

  const trimmed = raw.query.trim();
  if (trimmed !== "") {
    filters.query = trimmed;
  }

  return filters;
}

export function PipelineFilterBar({ onChange }: PipelineFilterBarProps) {
  const lastIndex = DEAL_STAGE_ORDER.length - 1;

  const [sector, setSector] = useState("");
  const [fromIndex, setFromIndex] = useState(0);
  const [toIndex, setToIndex] = useState(lastIndex);
  const [askMin, setAskMin] = useState("");
  const [askMax, setAskMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [query, setQuery] = useState("");

  // Emit a freshly-built DealFilters whenever any control changes.
  function emit(next: Partial<Record<string, string | number>>) {
    const raw = {
      sector,
      fromIndex,
      toIndex,
      askMin,
      askMax,
      dateFrom,
      dateTo,
      query,
      ...next,
    } as Parameters<typeof buildFilters>[0];
    onChange(buildFilters(raw));
  }

  return (
    <section
      aria-label="Filter deals"
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Search */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Search company</span>
          <span className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                emit({ query: e.target.value });
              }}
              placeholder="Company name…"
              className={`${FIELD_CLASS} w-full pl-9`}
            />
          </span>
        </label>

        {/* Sector */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Sector</span>
          <select
            value={sector}
            onChange={(e) => {
              setSector(e.target.value);
              emit({ sector: e.target.value });
            }}
            className={FIELD_CLASS}
          >
            <option value="">All sectors</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        {/* Stage range — from */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Stage from</span>
          <select
            value={fromIndex}
            onChange={(e) => {
              const v = Number(e.target.value);
              setFromIndex(v);
              emit({ fromIndex: v });
            }}
            className={FIELD_CLASS}
          >
            {DEAL_STAGE_ORDER.map((stage, i) => (
              <option key={stage} value={i}>
                {stage}
              </option>
            ))}
          </select>
        </label>

        {/* Stage range — to */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Stage to</span>
          <select
            value={toIndex}
            onChange={(e) => {
              const v = Number(e.target.value);
              setToIndex(v);
              emit({ toIndex: v });
            }}
            className={FIELD_CLASS}
          >
            {DEAL_STAGE_ORDER.map((stage, i) => (
              <option key={stage} value={i}>
                {stage}
              </option>
            ))}
          </select>
        </label>

        {/* Ask min */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Ask min (₹ lakhs)</span>
          <input
            type="number"
            min={0}
            value={askMin}
            onChange={(e) => {
              setAskMin(e.target.value);
              emit({ askMin: e.target.value });
            }}
            placeholder="0"
            className={FIELD_CLASS}
          />
        </label>

        {/* Ask max */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Ask max (₹ lakhs)</span>
          <input
            type="number"
            min={0}
            value={askMax}
            onChange={(e) => {
              setAskMax(e.target.value);
              emit({ askMax: e.target.value });
            }}
            placeholder="Any"
            className={FIELD_CLASS}
          />
        </label>

        {/* Date from */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Added from</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              emit({ dateFrom: e.target.value });
            }}
            className={FIELD_CLASS}
          />
        </label>

        {/* Date to */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Added to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              emit({ dateTo: e.target.value });
            }}
            className={FIELD_CLASS}
          />
        </label>
      </div>
    </section>
  );
}

export default PipelineFilterBar;
