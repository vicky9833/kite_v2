// src/components/charts/index.ts
//
// The chart barrel. Dashboard consumers import chart wrappers ONLY from here and
// NEVER from `recharts` directly (Req 23.9). Each wrapper is re-exported through
// `next/dynamic` with `ssr: false` and a named, reserved-height `ChartSkeleton`
// fallback, so the wrapper chunk (and therefore the Recharts chunk) is excluded
// from each route's initial bundle and swaps in with no layout shift
// (Req 23.7, 23.8, 27.4).
//
// This file lives as `index.ts` (not `.tsx`), so the dynamic `loading` fallback
// is built with `createElement` rather than JSX.

import { createElement } from "react";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "./ChartSkeleton";

const RESERVED_HEIGHT = 280;

/** Shared reserved-height skeleton fallback for every dynamic chart. */
const chartLoading = () => createElement(ChartSkeleton, { height: RESERVED_HEIGHT });

export const ChartLineFunding = dynamic(
  () => import("./ChartLineFunding").then((m) => m.ChartLineFunding),
  { ssr: false, loading: chartLoading },
);

export const ChartBarSectorStartups = dynamic(
  () => import("./ChartBarSectorStartups").then((m) => m.ChartBarSectorStartups),
  { ssr: false, loading: chartLoading },
);

export const ChartBarHorizontalSchemes = dynamic(
  () =>
    import("./ChartBarHorizontalSchemes").then((m) => m.ChartBarHorizontalSchemes),
  { ssr: false, loading: chartLoading },
);

export const ChartAreaFundingTimeline = dynamic(
  () =>
    import("./ChartAreaFundingTimeline").then((m) => m.ChartAreaFundingTimeline),
  { ssr: false, loading: chartLoading },
);

export const ChartBarRegionStartups = dynamic(
  () => import("./ChartBarRegionStartups").then((m) => m.ChartBarRegionStartups),
  { ssr: false, loading: chartLoading },
);

export const ChartBarStackedDisbursement = dynamic(
  () =>
    import("./ChartBarStackedDisbursement").then(
      (m) => m.ChartBarStackedDisbursement,
    ),
  { ssr: false, loading: chartLoading },
);

export const ChartTreemapSectors = dynamic(
  () => import("./ChartTreemapSectors").then((m) => m.ChartTreemapSectors),
  { ssr: false, loading: chartLoading },
);

export const ChartBarHorizontalSectorGrowth = dynamic(
  () =>
    import("./ChartBarHorizontalSectorGrowth").then(
      (m) => m.ChartBarHorizontalSectorGrowth,
    ),
  { ssr: false, loading: chartLoading },
);

export const ChartPieGeneric = dynamic(
  () => import("./ChartPieGeneric").then((m) => m.ChartPieGeneric),
  { ssr: false, loading: chartLoading },
);

export const ChartBarHorizontalFunding = dynamic(
  () =>
    import("./ChartBarHorizontalFunding").then(
      (m) => m.ChartBarHorizontalFunding,
    ),
  { ssr: false, loading: chartLoading },
);

// Non-lazy primitives consumers may need directly.
export { ChartFrame } from "./ChartFrame";
export { ChartSkeleton } from "./ChartSkeleton";
