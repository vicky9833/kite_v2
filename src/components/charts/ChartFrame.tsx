"use client";

// src/components/charts/ChartFrame.tsx
//
// ChartFrame wraps every chart in an accessible, flat KITE surface. It exposes
// an `aria-label` describing the chart and an adjacent sr-only <figcaption>
// prose summary of the primary data, so screen-reader users get the headline
// takeaway without parsing the SVG (Req 28.1, 28.2). The container reserves a
// fixed height (default 280) so there is no layout shift while the lazy chart
// resolves (Req 23.7, 27.4). Styling is white card bg + rounded border + crisp
// shadow only — no gradients/blobs/glow (Req 29.6, 29.7).

import type { ReactNode } from "react";
import { CHART_HEIGHT } from "./chart-tokens";

export interface ChartFrameProps {
  /** Describes the chart, e.g. "Line chart of monthly funding for FinTech". */
  ariaLabel: string;
  /** sr-only prose summary of the primary data. */
  srSummary: string;
  /** Reserved height in px (no CLS). Defaults to the shared chart height. */
  height?: number;
  /** The Recharts ResponsiveContainer subtree. */
  children: ReactNode;
}

export function ChartFrame({
  ariaLabel,
  srSummary,
  height = CHART_HEIGHT,
  children,
}: ChartFrameProps) {
  return (
    <figure
      role="group"
      aria-label={ariaLabel}
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div style={{ height }} className="w-full">
        {children}
      </div>
      <figcaption className="sr-only">{srSummary}</figcaption>
    </figure>
  );
}
