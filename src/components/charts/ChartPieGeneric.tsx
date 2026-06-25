"use client";

// src/components/charts/ChartPieGeneric.tsx
//
// Generic pie chart over DemographicSlice[] — reused three times on the admin
// dashboard for the women-led, stage, and age breakdowns (Req 17). Caller
// supplies the title + aria/summary copy so each instance stays self-describing.
// Slices use the restrained token-driven categorical palette. One of the only
// recharts importers (Req 23.2).

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DemographicSlice } from "@/types";
import { ChartFrame } from "./ChartFrame";
import { ChartEmpty } from "./ChartEmpty";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_SERIES } from "./chart-tokens";

export interface ChartPieGenericProps {
  data: DemographicSlice[];
  /** Short chart title, e.g. "Women-led startups". */
  title: string;
  /** Accessible label, e.g. "Pie chart of women-led startup share". */
  ariaLabel: string;
  /** Optional sr-only prose summary; a sensible default is derived if omitted. */
  srSummary?: string;
}

function defaultSummary(data: DemographicSlice[], title: string): string {
  const parts = data.map((d) => `${d.label} ${d.value}`).join(", ");
  return `${title}: ${parts}. Illustrative data.`;
}

export function ChartPieGeneric({
  data,
  title,
  ariaLabel,
  srSummary,
}: ChartPieGenericProps) {
  if (data.length === 0) return <ChartEmpty label={`No ${title.toLowerCase()} data`} />;

  return (
    <ChartFrame
      ariaLabel={ariaLabel}
      srSummary={srSummary ?? defaultSummary(data, title)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius="70%"
            isAnimationActive={false}
          >
            {data.map((slice, index) => (
              <Cell
                key={slice.label}
                fill={CHART_SERIES[index % CHART_SERIES.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
