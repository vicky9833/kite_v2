"use client";

// src/components/charts/ChartLineFunding.tsx
//
// Line chart of monthly sector funding (startup dashboard, Req 6.4). This file
// is one of the ONLY places `recharts` is imported (Req 23.2). Styled with KITE
// tokens only: primary-blue stroke, very-low-opacity gridlines, muted caption
// axes, the shared crisp-shadow rounded tooltip.

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FundingPoint } from "@/types";
import { ChartFrame } from "./ChartFrame";
import { ChartEmpty } from "./ChartEmpty";
import { ChartTooltip } from "./ChartTooltip";
import { AXIS_TICK_STYLE, CHART_TOKENS } from "./chart-tokens";

export interface ChartLineFundingProps {
  data: FundingPoint[];
  sectorName: string;
}

function summarize(data: FundingPoint[], sectorName: string): string {
  const first = data[0];
  const last = data[data.length - 1];
  if (!first || !last) return `Monthly funding for ${sectorName}.`;
  const direction =
    last.rupeesCrore > first.rupeesCrore
      ? "rose"
      : last.rupeesCrore < first.rupeesCrore
        ? "fell"
        : "held steady";
  return `Monthly funding for ${sectorName} ${direction} from ₹${first.rupeesCrore} Cr in ${first.month} to ₹${last.rupeesCrore} Cr in ${last.month}, across ${data.length} months. Illustrative data.`;
}

export function ChartLineFunding({ data, sectorName }: ChartLineFundingProps) {
  if (data.length === 0) return <ChartEmpty label="No funding data" />;

  return (
    <ChartFrame
      ariaLabel={`Line chart of monthly funding for ${sectorName}`}
      srSummary={summarize(data, sectorName)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={CHART_TOKENS.grid} vertical={false} />
          <XAxis
            dataKey="month"
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
          <Line
            type="monotone"
            dataKey="rupeesCrore"
            name="Funding (₹ Cr)"
            stroke={CHART_TOKENS.primary}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
