"use client";

// src/components/charts/ChartTooltip.tsx
//
// A shared custom Recharts tooltip content component: small, rounded, crisp
// shadow, card background, hairline border, caption-sized text (Req 29.7). Every
// wrapper passes <ChartTooltip /> as the `content` of Recharts' <Tooltip> so the
// hover affordance is visually identical across all nine charts.

import type { TooltipProps } from "recharts";

/**
 * Recharts invokes the tooltip content with `active`, `payload`, and `label`.
 * We accept the generic TooltipProps and render only when active with data.
 */
export function ChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-caption shadow-sm">
      {label !== undefined && label !== "" ? (
        <p className="mb-1 font-medium text-dark">{label}</p>
      ) : null}
      <ul className="space-y-0.5">
        {payload.map((entry, index) => (
          <li
            key={`${entry.dataKey ?? entry.name ?? "series"}-${index}`}
            className="flex items-center gap-2 text-muted"
          >
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}</span>
            <span className="ml-auto font-medium text-dark">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
