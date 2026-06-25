"use client";

// src/components/charts/ChartBarHorizontalFunding.tsx
//
// Horizontal bar chart of the top-10 sectors by funding (₹ Cr) — Investor
// Connect "Sector Performance" (Req 13.2). layout="vertical" makes the bars
// horizontal so sector names read cleanly down the Y axis; the value axis is
// rupee-crore funding (data key `fundingCrore`). This is a genuinely new chart
// type — no existing wrapper expresses "funding ₹ Cr by sector" — and is the
// ONLY new file importing recharts for this suite (Req 36.1, 36.3).

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SectorFundingDatum } from "@/types";
import { ChartFrame } from "./ChartFrame";
import { ChartEmpty } from "./ChartEmpty";
import { ChartTooltip } from "./ChartTooltip";
import { AXIS_TICK_STYLE, CHART_TOKENS } from "./chart-tokens";

export interface ChartBarHorizontalFundingProps {
  data: SectorFundingDatum[];
}

function summarize(data: SectorFundingDatum[]): string {
  const top = data[0];
  const lead = top ? ` Leader: ${top.name} at ₹${top.fundingCrore} Cr.` : "";
  return `Top ${data.length} sectors by funding in ₹ Cr.${lead} Illustrative data.`;
}

export function ChartBarHorizontalFunding({
  data,
}: ChartBarHorizontalFundingProps) {
  // Chart_Empty branch (Req 13.2): no data → reserved-height empty state.
  if (data.length === 0) return <ChartEmpty label="No sector funding data" />;

  // Chart_Loaded branch: render the horizontal bar in a labeled frame.
  return (
    <ChartFrame
      ariaLabel="Horizontal bar chart of top sectors by funding in rupees crore"
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
            unit=" Cr"
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
            dataKey="fundingCrore"
            name="Funding (₹ Cr)"
            fill={CHART_TOKENS.primary}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
