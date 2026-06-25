// src/components/charts/chart-tokens.ts
//
// KITE chart tokens — a single constants module that maps the canonical KITE
// design tokens (authored as HSL CSS variables in globals.css and wired into
// tailwind.config.ts) into the literal color strings Recharts needs for `fill`,
// `stroke`, etc. Every chart wrapper styles itself exclusively from here so the
// nine charts render with one identical visual language (Req 23.4, 29.6, 29.7).
//
// We reference the CSS variables (`hsl(var(--token))`) rather than hard-coding
// hex so the charts stay in lock-step with the rest of the design system: if a
// token changes in globals.css, the charts follow automatically.

/** Wrap a KITE HSL CSS variable, with an optional alpha (0..1). */
function tokenColor(name: string, alpha?: number): string {
  return alpha === undefined
    ? `hsl(var(--${name}))`
    : `hsl(var(--${name}) / ${alpha})`;
}

export const CHART_TOKENS = {
  /** Primary blue — used for primary data series (lines/bars/strokes). */
  primary: tokenColor("primary"),
  /** Accent orange — used for highlights / secondary emphasis / area fills. */
  accent: tokenColor("accent"),
  /** Very-low-opacity gridlines so the plot reads as a flat surface. */
  grid: tokenColor("border", 0.6),
  /** Muted caption-sized axis labels/ticks. */
  axis: tokenColor("muted"),
  /** Muted color for de-emphasised text. */
  muted: tokenColor("muted"),
  /** Card/surface background behind the plot. */
  card: tokenColor("card"),
  /** Hairline border color (tooltips, frame). */
  border: tokenColor("border"),
  /** Status colors — only ever used to encode status, never decoration. */
  success: tokenColor("success"),
  warning: tokenColor("warning"),
  danger: tokenColor("danger"),
} as const;

/**
 * A small categorical palette for charts that need more than two series
 * (e.g. pies / treemaps). Kept token-driven and intentionally restrained:
 * primary + accent lead, with the remaining KITE accents filling out the rest.
 */
export const CHART_SERIES: readonly string[] = [
  tokenColor("primary"),
  tokenColor("accent"),
  tokenColor("teal"),
  tokenColor("purple"),
  tokenColor("info"),
  tokenColor("pink"),
];

/** Shared Recharts axis styling so every wrapper's axes look identical. */
export const AXIS_TICK_STYLE = {
  fill: CHART_TOKENS.axis,
  fontSize: 12,
} as const;

/** Default reserved chart height (matches ChartFrame's default, prevents CLS). */
export const CHART_HEIGHT = 280;
