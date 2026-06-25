"use client";

// src/components/charts/ChartAreaFundingTimeline.tsx
//
// Area chart of quarterly funding over time (admin dashboard, Req 13). Accent
// fill with a primary-blue stroke per design. One of the only recharts
// importers (Req 23.2).

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FundingTimelinePoint } from "@/types";
import { ChartFrame } from "./ChartFrame";
import { ChartEmpty } from "./ChartEmpty";
import { ChartTooltip } from "./ChartTooltip";
import { AXIS_TICK_STYLE, CHART_TOKENS } from "./chart-tokens";

export interface ChartAreaFundingTimelineProps {
  data: FundingTimelinePoint[];
}

function summarize(data: FundingTimelinePoint[]): string {
  const first = data[0];
  const last = data[data.length - 1];
  if (!first || !last) return "Funding timeline. Illustrative data.";
  const direction =
    last.rupeesCrore > first.rupeesCrore ? "rose" : "fell";
  return `Funding ${direction} from ₹${first.rupeesCrore} Cr in ${first.quarter} to ₹${last.rupeesCrore} Cr in ${last.quarter}, across ${data.length} quarters. Illustrative data.`;
}

export function ChartAreaFundingTimeline({
  data,
}: ChartAreaFundingTimelineProps) {
  if (data.length === 0) return <ChartEmpty label="No funding timeline data" />;

  return (
    <ChartFrame
      ariaLabel="Area chart of funding over time by quarter"
      srSummary={summarize(data)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={CHART_TOKENS.grid} vertical={false} />
          <XAxis
            dataKey="quarter"
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
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: CHART_TOKENS.grid }} />
          <Area
            type="monotone"
            dataKey="rupeesCrore"
            name="Funding (₹ Cr)"
            stroke={CHART_TOKENS.primary}
            strokeWidth={2}
            fill={CHART_TOKENS.accent}
            fillOpacity={0.15}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
