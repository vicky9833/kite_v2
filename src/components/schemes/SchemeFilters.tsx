"use client";

import * as React from "react";
import { Search, ChevronDown } from "lucide-react";

import type { CurrentStage } from "@/types";
import { sectors } from "@/data/sectors";
import { cn } from "@/lib/utils";
import {
  INITIAL_SCHEME_FILTERS,
  type SchemeFilterState,
} from "@/components/schemes/scheme-filter-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

/**
 * Controlled filter state for the Schemes Hub (Req 13.1).
 *
 * The shape + initial value live in `./scheme-filter-state` (a dependency-free
 * module) so the Hub can reference them without statically importing this
 * Radix-heavy component. Re-exported here for backward compatibility.
 */
export {
  INITIAL_SCHEME_FILTERS,
  type SchemeFilterState,
} from "@/components/schemes/scheme-filter-state";

export interface SchemeFiltersProps {
  value: SchemeFilterState;
  onChange: (next: SchemeFilterState) => void;
}

/** The five CurrentStage values, in lifecycle order (matches the type union). */
const STAGE_OPTIONS: readonly CurrentStage[] = [
  "Idea",
  "PoC",
  "Early Revenue",
  "Growth",
  "Scale",
];

const TYPE_TABS: ReadonlyArray<{ value: SchemeFilterState["type"]; label: string }> = [
  { value: "All", label: "All" },
  { value: "fiscal", label: "Fiscal Incentives" },
  { value: "grant", label: "Grant-in-Aid" },
];

export function SchemeFilters({ value, onChange }: SchemeFiltersProps) {
  const setType = (type: SchemeFilterState["type"]) => onChange({ ...value, type });

  const setStatus = (status: SchemeFilterState["status"]) =>
    onChange({ ...value, status });

  const setSearch = (search: string) => onChange({ ...value, search });

  const toggleSector = (id: string, checked: boolean) => {
    const nextSectors = checked
      ? [...value.sectors, id]
      : value.sectors.filter((s) => s !== id);
    onChange({ ...value, sectors: nextSectors });
  };

  const toggleStage = (stage: CurrentStage) => {
    const isSelected = value.stages.includes(stage);
    const nextStages = isSelected
      ? value.stages.filter((s) => s !== stage)
      : [...value.stages, stage];
    onChange({ ...value, stages: nextStages });
  };

  const sectorSummary =
    value.sectors.length === 0
      ? "All sectors"
      : `${value.sectors.length} sector${value.sectors.length === 1 ? "" : "s"}`;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
      {/* Type segmented control (controlled). Modeled as a group of toggle
          buttons with `aria-pressed` — NOT an ARIA tablist — because these
          buttons filter the card grid rendered elsewhere rather than switching
          associated tab panels. (A tablist's triggers would carry an
          `aria-controls` pointing at tab panels that do not exist here.) This
          mirrors the Stage chip group below. */}
      <div className="flex flex-col gap-1.5">
        <span id="scheme-type-label" className="text-xs font-medium text-muted-foreground">
          Type
        </span>
        <div
          role="group"
          aria-labelledby="scheme-type-label"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-transparent p-1"
        >
          {TYPE_TABS.map((tab) => {
            const selected = value.type === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setType(tab.value)}
                className={cn(
                  "inline-flex h-7 items-center rounded px-3 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-surface",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Secondary-sector multi-select. Native <details> disclosure keeps
            the affordance keyboard-accessible without pulling a Radix popover
            (and its positioning library) into the 22-card hub's First Load. */}
        <div className="flex flex-col gap-1.5">
          <span id="scheme-sector-label" className="text-xs font-medium text-muted-foreground">
            Sectors
          </span>
          <details className="group relative">
            <summary
              aria-labelledby="scheme-sector-label"
              className="flex h-9 min-w-[11rem] cursor-pointer list-none items-center justify-between gap-2 rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring [&::-webkit-details-marker]:hidden"
            >
              <span className={cn(value.sectors.length === 0 && "text-muted-foreground")}>
                {sectorSummary}
              </span>
              <ChevronDown
                className="h-4 w-4 opacity-50 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="absolute left-0 z-50 mt-1 w-64 rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md">
              <div
                role="group"
                aria-label="Filter by sector"
                className="max-h-72 overflow-y-auto"
              >
                {sectors.map((sector) => {
                  const checkboxId = `sector-${sector.id}`;
                  const checked = value.sectors.includes(sector.id);
                  return (
                    <label
                      key={sector.id}
                      htmlFor={checkboxId}
                      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-surface"
                    >
                      <Checkbox
                        id={checkboxId}
                        checked={checked}
                        onCheckedChange={(state) => toggleSector(sector.id, state === true)}
                      />
                      <span>{sector.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </details>
        </div>

        {/* Stage multi-select (chip toggles) */}
        <div className="flex flex-col gap-1.5">
          <span id="scheme-stage-label" className="text-xs font-medium text-muted-foreground">
            Stage
          </span>
          <div
            role="group"
            aria-labelledby="scheme-stage-label"
            className="flex flex-wrap items-center gap-1.5"
          >
            {STAGE_OPTIONS.map((stage) => {
              const selected = value.stages.includes(stage);
              return (
                <button
                  key={stage}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleStage(stage)}
                  className={cn(
                    "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selected
                      ? "border-transparent bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-transparent text-foreground hover:bg-surface"
                  )}
                >
                  {stage}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex flex-col gap-1.5">
          <span id="scheme-status-label" className="text-xs font-medium text-muted-foreground">
            Status
          </span>
          <Select
            value={value.status}
            onValueChange={(next) => setStatus(next as SchemeFilterState["status"])}
          >
            <SelectTrigger
              aria-labelledby="scheme-status-label"
              className="min-w-[9rem]"
            >
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="scheme-search"
            className="text-xs font-medium text-muted-foreground"
          >
            Search
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="scheme-search"
              type="search"
              value={value.search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search schemes"
              aria-label="Search schemes"
              className="w-full pl-9 sm:w-64"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchemeFilters;
