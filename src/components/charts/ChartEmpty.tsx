"use client";

// src/components/charts/ChartEmpty.tsx
//
// Internal empty-state shown by a wrapper when it receives zero data points
// (Chart_Empty_State, Req 23.6). It renders a quiet, axis-free message on the
// same flat KITE card surface so the empty case never collapses the layout.

import { CHART_HEIGHT } from "./chart-tokens";

export interface ChartEmptyProps {
  /** Short message, e.g. "No funding data". */
  label: string;
  /** Reserved height to match the chart it replaces (no CLS). */
  height?: number;
}

export function ChartEmpty({ label, height = CHART_HEIGHT }: ChartEmptyProps) {
  return (
    <div
      role="status"
      className="flex items-center justify-center rounded-xl border border-border bg-card p-4 text-caption text-muted shadow-sm"
      style={{ height }}
    >
      {label}
    </div>
  );
}
