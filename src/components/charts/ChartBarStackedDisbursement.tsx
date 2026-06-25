"use client";

// src/components/charts/ChartBarStackedDisbursement.tsx
//
// Stacked bar chart of disbursement by cluster, split into fiscal and grant
// (admin dashboard, Req 15.5). Primary blue for fiscal, accent orange for
// grant. One of the only recharts importers (Req 23.2).

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StackedDisbursementDatum } from "@/types";
import { ChartFrame } from "./ChartFrame";
import { ChartEmpty } from "./ChartEmpty";
import { ChartTooltip } from "./ChartTooltip";
import { AXIS_TICK_STYLE, CHART_TOKENS } from "./chart-tokens";

export interface ChartBarStackedDisbursementProps {
  data: StackedDisbursementDatum[];
}

function summarize(data: StackedDisbursementDatum[]): string {
  const total = data.reduce((sum, d) => sum + d.fiscal + d.grant, 0);
  return `Disbursement split into fiscal incentives and grants across ${data.length} clusters, totalling ₹${total}. Illustrative data.`;
}

export function ChartBarStackedDisbursement({
  data,
}: ChartBarStackedDisbursementProps) {
  if (data.length === 0) return <ChartEmpty label="No disbursement data" />;

  return (
    <ChartFrame
      ariaLabel="Stacked bar chart of disbursement by cluster, split into fiscal and grant"
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
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="fiscal"
            name="Fiscal"
            stackId="disbursement"
            fill={CHART_TOKENS.primary}
          />
          <Bar
            dataKey="grant"
            name="Grant"
            stackId="disbursement"
            fill={CHART_TOKENS.accent}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
