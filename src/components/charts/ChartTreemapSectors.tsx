"use client";

// src/components/charts/ChartTreemapSectors.tsx
//
// Treemap of the 20 canonical sectors sized by startup count, shaded by funding
// intensity (admin dashboard, Req 16.2). Shading interpolates the primary-blue
// token's opacity by `fundingIntensity ∈ [0,1]` — token-driven, no decoration.
// One of the only recharts importers (Req 23.2).

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import type { SectorTreemapDatum } from "@/types";
import { ChartFrame } from "./ChartFrame";
import { ChartEmpty } from "./ChartEmpty";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_TOKENS } from "./chart-tokens";

export interface ChartTreemapSectorsProps {
  data: SectorTreemapDatum[];
}

function summarize(data: SectorTreemapDatum[]): string {
  const top = [...data].sort((a, b) => b.startupCount - a.startupCount)[0];
  const lead = top ? ` Largest: ${top.name} with ${top.startupCount} startups.` : "";
  return `Treemap of ${data.length} sectors sized by startup count and shaded by funding intensity.${lead} Illustrative data.`;
}

interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  fundingIntensity?: number;
}

/** Renders one treemap cell: token-blue fill with opacity by funding intensity. */
function TreemapCell(props: TreemapContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name, fundingIntensity = 0 } = props;
  const opacity = 0.35 + 0.6 * Math.min(Math.max(fundingIntensity, 0), 1);
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={CHART_TOKENS.primary}
        fillOpacity={opacity}
        stroke={CHART_TOKENS.card}
        strokeWidth={2}
      />
      {width > 56 && height > 20 ? (
        <text
          x={x + 6}
          y={y + 16}
          fill={CHART_TOKENS.card}
          fontSize={11}
        >
          {name}
        </text>
      ) : null}
    </g>
  );
}

export function ChartTreemapSectors({ data }: ChartTreemapSectorsProps) {
  if (data.length === 0) return <ChartEmpty label="No sector data" />;

  return (
    <ChartFrame
      ariaLabel="Treemap of sectors sized by startup count and shaded by funding intensity"
      srSummary={summarize(data)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="startupCount"
          nameKey="name"
          stroke={CHART_TOKENS.card}
          content={<TreemapCell />}
          isAnimationActive={false}
        >
          <Tooltip content={<ChartTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
