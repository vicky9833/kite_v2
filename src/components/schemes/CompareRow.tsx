"use client";

import { cn } from "@/lib/utils";

/**
 * CompareRow — one attribute row of the Compare View comparison table
 * (`/schemes/compare`). It renders a single semantic table row: a row header
 * (`<th scope="row">`) carrying the attribute label, followed by one `<td>` per
 * scheme column (Req 17.5, 17.6, 27.5).
 *
 * Contract (chosen for simplicity + reusability): the PARENT (`CompareView`)
 * computes the cell content for every scheme column and passes it in as a
 * `cells` array. This keeps `CompareRow` a pure, presentational primitive with
 * zero coupling to `Scheme` / `EligibilityResult` / the eligibility engine /
 * context — all of which `CompareView` already owns. The same row primitive can
 * therefore render every kind of cell the Compare View needs:
 *
 *  - plain text        — Type, Status, Amount, Max Benefit, Duration
 *  - a bulleted list   — Eligibility   (parent passes a `<ul>` node per column)
 *  - a numbered list   — Documents     (parent passes an `<ol>` node per column)
 *  - "Your Eligibility"— a `ConfidenceDot` + reasons (parent passes that node)
 *
 * Because the cell ReactNode is opaque to this component, list/eligibility
 * rendering lives in the parent (or small parent-side helpers), exactly as the
 * task allows.
 *
 * The row is designed to live INSIDE a semantic `<table>` rendered by
 * `CompareView` (a `<thead>` with `<th scope="col">` per scheme + a `<tbody>`
 * of these rows), so headers associate programmatically with cells for
 * assistive technology (Req 27.5).
 *
 * Styling is restrained and government-grade: hairline borders, comfortable
 * padding, top-aligned cells (rows mix short text with multi-line lists), and a
 * left-aligned row header. No gradients, glow, or decorative flourish.
 */
export interface CompareRowProps {
  /** The attribute label rendered in the leading `<th scope="row">`. */
  label: string;
  /**
   * One ReactNode per scheme column, in the same order as the table's column
   * headers. Each entry is wrapped in a `<td>` by this component. Entries may
   * be plain strings, a bulleted/numbered list node, or a richer
   * "Your Eligibility" node — the row treats them all as opaque content.
   */
  cells: React.ReactNode[];
  /** Extra classes merged onto the `<tr>` (e.g. to accent the eligibility row). */
  className?: string;
}

export function CompareRow({ label, cells, className }: CompareRowProps) {
  return (
    <tr className={cn("border-t border-border align-top", className)}>
      <th
        scope="row"
        className="w-44 bg-card px-4 py-4 text-left align-top font-heading text-caption font-semibold uppercase tracking-wide text-muted"
      >
        {label}
      </th>
      {cells.map((cell, index) => (
        <td
          // Cells are positional and the column order is stable for a given
          // render, so the index is a correct and stable key here.
          key={index}
          className="px-4 py-4 align-top text-body text-dark"
        >
          {cell}
        </td>
      ))}
    </tr>
  );
}

export default CompareRow;
