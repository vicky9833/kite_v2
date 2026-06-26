"use client";

import { useState } from "react";

/**
 * HeroVisuals — license-clean, self-contained SVG visuals for the hero carousel
 * slides. No external/stock imagery and no real-person photographs are bundled;
 * everything here is hand-drawn SVG in the institutional Karnataka palette,
 * keeping the government-grade restraint (flat tokens, no glow, no gradients
 * beyond a single subtle panel wash). All visuals are decorative
 * (`aria-hidden`) — the meaning lives in the slide's text.
 *
 * The LeadershipPortrait additionally exposes a drop-in photo slot: place an
 * official, licensed portrait at `public/hero/cm-portrait.jpg` and it will
 * render in place of the emblem fallback (see public/hero/README.md).
 */

const PANEL =
  "relative hidden aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:block";

/** Stylized Karnataka map with the seven Beyond Bengaluru + capital nodes. */
export function KarnatakaMapVisual() {
  // Approximate, stylized node positions (not a survey-accurate map).
  const nodes: { cx: number; cy: number; label: string; hub?: boolean }[] = [
    { cx: 92, cy: 70, label: "Belagavi" },
    { cx: 120, cy: 96, label: "Hubballi-Dharwad" },
    { cx: 150, cy: 70, label: "Kalaburagi" },
    { cx: 118, cy: 150, label: "Shivamogga" },
    { cx: 96, cy: 196, label: "Mangaluru" },
    { cx: 150, cy: 188, label: "Mysuru" },
    { cx: 176, cy: 150, label: "Tumakuru" },
    { cx: 196, cy: 168, label: "Bengaluru", hub: true },
  ];

  return (
    <div className={PANEL} aria-hidden="true">
      <svg viewBox="0 0 300 280" className="h-full w-full">
        {/* Stylized state silhouette */}
        <path
          d="M104 36 L150 44 L176 40 L196 64 L214 96 L210 132 L194 150 L206 182 L176 214 L150 226 L120 214 L96 224 L78 196 L86 160 L72 130 L80 96 L88 60 Z"
          className="fill-accent/10 stroke-accent/40"
          strokeWidth="2"
        />
        {/* Connections from Bengaluru hub */}
        {nodes
          .filter((n) => !n.hub)
          .map((n) => (
            <line
              key={n.label}
              x1={196}
              y1={168}
              x2={n.cx}
              y2={n.cy}
              className="stroke-white/15"
              strokeWidth="1"
            />
          ))}
        {/* Nodes */}
        {nodes.map((n) => (
          <circle
            key={n.label}
            cx={n.cx}
            cy={n.cy}
            r={n.hub ? 7 : 4}
            className={n.hub ? "fill-accent" : "fill-white/70"}
          />
        ))}
        <text x={150} y={258} textAnchor="middle" className="fill-white/55 text-[11px]">
          Karnataka · 6 Beyond Bengaluru clusters
        </text>
      </svg>
    </div>
  );
}

/** Hub-and-spoke cluster network. */
export function ClusterNetworkVisual() {
  const spokes = [
    { x: 150, y: 40 },
    { x: 244, y: 90 },
    { x: 244, y: 190 },
    { x: 150, y: 240 },
    { x: 56, y: 190 },
    { x: 56, y: 90 },
  ];
  return (
    <div className={PANEL} aria-hidden="true">
      <svg viewBox="0 0 300 280" className="h-full w-full">
        {spokes.map((s, i) => (
          <line key={i} x1={150} y1={140} x2={s.x} y2={s.y} className="stroke-white/15" strokeWidth="1.5" />
        ))}
        {spokes.map((s, i) => (
          <g key={`n${i}`}>
            <circle cx={s.x} cy={s.y} r={16} className="fill-white/5 stroke-white/25" strokeWidth="1.5" />
            <circle cx={s.x} cy={s.y} r={5} className="fill-accent/80" />
          </g>
        ))}
        <circle cx={150} cy={140} r={28} className="fill-accent/15 stroke-accent" strokeWidth="2" />
        <text x={150} y={145} textAnchor="middle" className="fill-white text-[12px] font-semibold">
          ₹75 Cr
        </text>
      </svg>
    </div>
  );
}

/** Ascending funding bars. */
export function FundingVisual() {
  const bars = [40, 70, 95, 130, 170, 210];
  const barWidth = 30;
  const gap = 14;
  const baseY = 230;
  return (
    <div className={PANEL} aria-hidden="true">
      <svg viewBox="0 0 300 280" className="h-full w-full">
        <line x1={30} y1={baseY} x2={276} y2={baseY} className="stroke-white/20" strokeWidth="1.5" />
        {bars.map((h, i) => {
          const x = 40 + i * (barWidth + gap);
          return (
            <rect
              key={i}
              x={x}
              y={baseY - h}
              width={barWidth}
              height={h}
              rx={4}
              className={i === bars.length - 1 ? "fill-accent" : "fill-white/25"}
            />
          );
        })}
        <text x={150} y={36} textAnchor="middle" className="fill-white text-[14px] font-semibold">
          22 schemes · $79B raised
        </text>
      </svg>
    </div>
  );
}

/** Globe with alliance connection arcs. */
export function GlobalAllianceVisual() {
  const dots = [
    { x: 96, y: 96 },
    { x: 150, y: 70 },
    { x: 210, y: 104 },
    { x: 196, y: 176 },
    { x: 120, y: 192 },
    { x: 80, y: 150 },
  ];
  return (
    <div className={PANEL} aria-hidden="true">
      <svg viewBox="0 0 300 280" className="h-full w-full">
        <circle cx={150} cy={140} r={96} className="fill-accent/5 stroke-white/20" strokeWidth="1.5" />
        <ellipse cx={150} cy={140} rx={96} ry={36} className="fill-none stroke-white/15" strokeWidth="1" />
        <ellipse cx={150} cy={140} rx={40} ry={96} className="fill-none stroke-white/15" strokeWidth="1" />
        <line x1={54} y1={140} x2={246} y2={140} className="stroke-white/15" strokeWidth="1" />
        {dots.map((d, i) => (
          <line key={`l${i}`} x1={150} y1={140} x2={d.x} y2={d.y} className="stroke-accent/30" strokeWidth="1" />
        ))}
        {dots.map((d, i) => (
          <circle key={`d${i}`} cx={d.x} cy={d.y} r={4} className="fill-accent" />
        ))}
        <circle cx={150} cy={140} r={6} className="fill-white" />
        <text x={150} y={262} textAnchor="middle" className="fill-white/55 text-[11px]">
          32 GIA partner countries
        </text>
      </svg>
    </div>
  );
}

/**
 * LeadershipPortrait — a drop-in slot for an official, licensed portrait
 * (e.g. the Hon'ble Chief Minister). If `public/hero/cm-portrait.jpg` is
 * present it renders; otherwise a tasteful emblem fallback is shown and the
 * name caption is suppressed (so no label sits over an empty frame).
 */
export function LeadershipPortrait() {
  const [hasPhoto, setHasPhoto] = useState(true);

  return (
    <div className={PANEL} aria-hidden="true">
      {hasPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/hero/cm-portrait.jpg"
          alt=""
          className="h-full w-full object-cover"
          onError={() => setHasPhoto(false)}
        />
      ) : (
        <svg viewBox="0 0 300 280" className="h-full w-full">
          <circle cx={150} cy={112} r={44} className="fill-white/10 stroke-white/25" strokeWidth="2" />
          <path
            d="M86 226 q64 -64 128 0"
            className="fill-white/10 stroke-white/25"
            strokeWidth="2"
          />
          <text x={150} y={262} textAnchor="middle" className="fill-white/55 text-[11px]">
            Government of Karnataka
          </text>
        </svg>
      )}
    </div>
  );
}
