"use client";

// src/components/charts/ChartSkeleton.tsx
//
// Reserved-height pulse placeholder used as the dynamic-import fallback for
// every chart wrapper (see the barrel). Because it occupies exactly the same
// height as the resolved chart's ChartFrame, swapping the skeleton for the real
// chart causes no cumulative layout shift (Req 23.8, 27.4).

import { CHART_HEIGHT } from "./chart-tokens";

export interface ChartSkeletonProps {
  /** Reserved height in px — must match the chart's ChartFrame height. */
  height?: number;
}

export function ChartSkeleton({ height = CHART_HEIGHT }: ChartSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading chart"
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div
        style={{ height }}
        className="w-full animate-pulse rounded-lg bg-surface"
      />
      <span className="sr-only">Loading chart…</span>
    </div>
  );
}
