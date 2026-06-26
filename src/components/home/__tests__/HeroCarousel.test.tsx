// src/components/home/__tests__/HeroCarousel.test.tsx
// Hero carousel behaviour (v1.0.x — hero carousel).

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { HeroSection } from "@/components/home/HeroSection";

describe("HeroSection carousel", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts on the ecosystem slide with the canonical h1 and two CTAs", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Innovation & Technology Ecosystem/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register Your Startup" })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: "Explore Schemes & Benefits" })).toHaveAttribute("href", "/schemes");
  });

  it("renders carousel controls and four slide tabs", () => {
    render(<HeroSection />);
    expect(screen.getByRole("button", { name: /previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pause carousel/i })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
  });

  it("advances to the next slide on Next and keeps exactly one h1", () => {
    render(<HeroSection />);
    fireEvent.click(screen.getByRole("button", { name: /next slide/i }));

    // The second slide (Beyond Bengaluru) is now active.
    expect(
      screen.getByRole("heading", { level: 1, name: /Innovation across all of Karnataka/i }),
    ).toBeInTheDocument();
    // Still exactly one h1 in the DOM.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    // The ecosystem slide's content is gone.
    expect(screen.queryByText(/183 soonicorns/i)).toBeNull();
  });

  it("auto-advances on a timer and stops when paused", () => {
    render(<HeroSection />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");

    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");

    fireEvent.click(screen.getByRole("button", { name: /pause carousel/i }));
    act(() => {
      vi.advanceTimersByTime(21000);
    });
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  });

  it("wraps from the last slide back to the first", () => {
    render(<HeroSection />);
    fireEvent.click(screen.getByRole("button", { name: /previous slide/i }));
    // Previous from slide 0 wraps to the last slide (GIA).
    expect(
      screen.getByRole("heading", { level: 1, name: /open to the world/i }),
    ).toBeInTheDocument();
  });
});
