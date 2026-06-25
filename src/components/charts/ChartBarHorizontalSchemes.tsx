"use client";

// src/components/charts/ChartBarHorizontalSchemes.tsx
//
// Horizontal bar chart of top-5 scheme disbursement for a sector (startup
// dashboard, Req 6.6). layout="vertical" makes bars horizontal so long scheme
// names read cleanly. One of the only recharts importers (Req 23.2).

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SchemeDisbursementDatum } from "@/types";
import { ChartFrame } from "./ChartFrame";
import { ChartEmpty } from "./ChartEmpty";
import { ChartTooltip } from "./ChartTooltip";
import { AXIS_TICK_STYLE, CHART_TOKENS } from "./chart-tokens";

export interface ChartBarHorizontalSchemesProps {
  data: SchemeDisbursementDatum[];
  sectorName: string;
}

function summarize(
  data: SchemeDisbursementDatum[],
  sectorName: string,
): string {
  const top = data[0];
  const lead = top
    ? ` Top scheme ${top.schemeName} at ₹${top.rupees}.`
    : "";
  return `Disbursement across ${data.length} top schemes for ${sectorName}.${lead} Illustrative data.`;
}

export function ChartBarHorizontalSchemes({
  data,
  sectorName,
}: ChartBarHorizontalSchemesProps) {
  if (data.length === 0) return <ChartEmpty label="No scheme data" />;

  return (
    <ChartFrame
      ariaLabel={`Horizontal bar chart of top scheme disbursement for ${sectorName}`}
      srSummary={summarize(data, sectorName)}
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
          />
          <YAxis
            type="category"
            dataKey="schemeName"
            tick={AXIS_TICK_STYLE}
            stroke={CHART_TOKENS.axis}
            tickLine={false}
            width={140}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: CHART_TOKENS.grid }} />
          <Bar
            dataKey="rupees"
            name="Disbursed (₹)"
            fill={CHART_TOKENS.primary}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
