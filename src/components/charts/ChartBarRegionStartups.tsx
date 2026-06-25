"use client";

// src/components/charts/ChartBarRegionStartups.tsx
//
// Vertical bar chart of startup counts per region (admin dashboard, Req 15.4).
// Shares the ClusterCountDatum[] shape with ChartBarSectorStartups but stays a
// separate wrapper so the admin surface can evolve independently. One of the
// only recharts importers (Req 23.2).

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ClusterCountDatum } from "@/types";
import { ChartFrame } from "./ChartFrame";
import { ChartEmpty } from "./ChartEmpty";
import { ChartTooltip } from "./ChartTooltip";
import { AXIS_TICK_STYLE, CHART_TOKENS } from "./chart-tokens";

export interface ChartBarRegionStartupsProps {
  data: ClusterCountDatum[];
}

function summarize(data: ClusterCountDatum[]): string {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const top = [...data].sort((a, b) => b.count - a.count)[0];
  const lead = top ? ` Led by ${top.cluster} with ${top.count}.` : "";
  return `Startup counts across ${data.length} regions, totalling ${total}.${lead} Illustrative data.`;
}

export function ChartBarRegionStartups({
  data,
}: ChartBarRegionStartupsProps) {
  if (data.length === 0) return <ChartEmpty label="No regional data" />;

  return (
    <ChartFrame
      ariaLabel="Bar chart of startup counts by region"
      srSummary={summarize(data)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={CHART_TOKENS.grid} vertical={false} />
          <XAxis
            dataKey="cluster"
            tick={AXIS_TICK_STYLE}
            stroke={CHART_TOKENS.axis}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_TICK_STYLE}
            stroke={CHART_TOKENS.axis}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: CHART_TOKENS.grid }} />
          <Bar
            dataKey="count"
            name="Startups"
            fill={CHART_TOKENS.primary}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
