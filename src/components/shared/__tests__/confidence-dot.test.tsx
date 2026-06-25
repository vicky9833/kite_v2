/**
 * Component / EXAMPLE tests — ConfidenceDot shared primitive (task 1.18).
 *
 * Deterministic example tests (NOT property-based) that render the shared
 * {@link ConfidenceDot} for every {@link EligibilityStatus} and assert:
 *  - a non-empty, human-readable accessible name via `aria-label` (Req 22.3),
 *  - the 10px size classes + correct semantic color token per status (Req 22.1/22.2),
 *  - the visible inline label is absent by default and present with `showLabel`,
 *  - meaning is never conveyed by color alone — every status exposes a
 *    programmatic name regardless of `showLabel` (Req 27.8).
 */

import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { ConfidenceDot } from "@/components/shared/ConfidenceDot";
import type { EligibilityStatus } from "@/types";

/** Expected human-readable label + color token for each status. */
const CASES: ReadonlyArray<{
  status: EligibilityStatus;
  label: string;
  color: string;
}> = [
  { status: "definitely-eligible", label: "Definitely eligible", color: "bg-success" },
  { status: "likely-eligible", label: "Likely eligible", color: "bg-warning" },
  { status: "check-requirements", label: "Check requirements", color: "bg-muted" },
  { status: "not-eligible", label: "Not eligible", color: "bg-danger" },
];

describe("ConfidenceDot", () => {
  describe("accessible name (aria-label) per status", () => {
    it.each(CASES)(
      "$status exposes the expected non-empty aria-label",
      ({ status, label }) => {
        render(<ConfidenceDot status={status} />);
        const dot = screen.getByRole("img");
        expect(dot).toHaveAttribute("aria-label", label);
        expect(dot.getAttribute("aria-label")?.trim()).not.toBe("");
      }
    );
  });

  describe("size + color token classes per status", () => {
    it.each(CASES)(
      "$status dot carries 10px size classes and the $color token",
      ({ status, color }) => {
        render(<ConfidenceDot status={status} />);
        const dot = screen.getByRole("img");
        expect(dot).toHaveClass("h-2.5");
        expect(dot).toHaveClass("w-2.5");
        expect(dot).toHaveClass("rounded-full");
        expect(dot).toHaveClass(color);
      }
    );
  });

  describe("visible inline label visibility", () => {
    it.each(CASES)(
      "$status does NOT render visible label text by default",
      ({ status, label }) => {
        const { container } = render(<ConfidenceDot status={status} />);
        // The aria-label still carries the name, but no visible text node does.
        expect(screen.queryByText(label)).not.toBeInTheDocument();
        expect(container.textContent ?? "").not.toContain(label);
      }
    );

    it.each(CASES)(
      "$status renders visible label text when showLabel is set",
      ({ status, label }) => {
        const { container } = render(
          <ConfidenceDot status={status} showLabel />
        );
        expect(screen.getByText(label)).toBeInTheDocument();
        expect(container.textContent ?? "").toContain(label);
      }
    );
  });

  describe("never color-only", () => {
    it.each(CASES)(
      "$status exposes a programmatic name regardless of showLabel",
      ({ status, label }) => {
        // Without label
        const withoutLabel = render(<ConfidenceDot status={status} />);
        const dotNoLabel = withoutLabel.getByRole("img");
        expect(dotNoLabel.getAttribute("aria-label")?.trim()).toBe(label);
        withoutLabel.unmount();

        // With label
        render(<ConfidenceDot status={status} showLabel />);
        const dotWithLabel = screen.getByRole("img");
        expect(dotWithLabel.getAttribute("aria-label")?.trim()).toBe(label);
      }
    );
  });
});
