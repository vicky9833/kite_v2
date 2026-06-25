"use client";

// src/components/charts/ChartBarHorizontalSectorGrowth.tsx
//
// Horizontal bar chart of the top-10 sectors by growth percentage (admin
// dashboard, Req 16.3). layout="vertical" makes bars horizontal so sector names
// read cleanly. Accent orange highlights growth. One of the only recharts
// importers (Req 23.2).

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SectorGrowthDatum } from "@/types";
import { ChartFrame } from "./ChartFrame";
import { ChartEmpty } from "./ChartEmpty";
import { ChartTooltip } from "./ChartTooltip";
import { AXIS_TICK_STYLE, CHART_TOKENS } from "./chart-tokens";

export interface ChartBarHorizontalSectorGrowthProps {
  data: SectorGrowthDatum[];
}

function summarize(data: SectorGrowthDatum[]): string {
  const top = data[0];
  const lead = top ? ` Fastest: ${top.name} at ${top.growthPct}%.` : "";
  return `Top ${data.length} sectors by year-on-year growth.${lead} Illustrative data.`;
}

export function ChartBarHorizontalSectorGrowth({
  data,
}: ChartBarHorizontalSectorGrowthProps) {
  if (data.length === 0) return <ChartEmpty label="No sector growth data" />;

  return (
    <ChartFrame
      ariaLabel="Horizontal bar chart of top sectors by growth percentage"
      srSummary={summarize(data)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 12, bottom: 4, left: 8 }}
        >
          <CartesianGrid stroke={CHART_TOKENS.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={AXIS_TICK_STYLE}
            stroke={CHART_TOKENS.axis}
            tickLine={false}
            unit="%"
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={AXIS_TICK_STYLE}
            stroke={CHART_TOKENS.axis}
            tickLine={false}
            width={120}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: CHART_TOKENS.grid }} />
          <Bar
            dataKey="growthPct"
            name="Growth (%)"
            fill={CHART_TOKENS.accent}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
