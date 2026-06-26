// src/components/home/__tests__/EcosystemNewsCarousel.test.tsx
// v1.0.1 polish patch — ecosystem news carousel behaviour

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { EcosystemNewsCarousel } from "@/components/home/EcosystemNewsCarousel";
import { generateEcosystemNews } from "@/lib/synthetic-ecosystem-news";

const NEWS = generateEcosystemNews();

describe("EcosystemNewsCarousel", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("exposes a labelled carousel region and marks it illustrative", () => {
    render(<EcosystemNewsCarousel />);
    expect(screen.getByRole("region", { name: /ecosystem news carousel/i })).toBeInTheDocument();
    expect(screen.getByText(/^Illustrative$/i)).toBeInTheDocument();
  });

  it("renders Previous, Next, and Pause controls", () => {
    render(<EcosystemNewsCarousel />);
    expect(screen.getByRole("button", { name: /previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pause carousel/i })).toBeInTheDocument();
  });

  it("advances the selected dot on Next", () => {
    render(<EcosystemNewsCarousel />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("button", { name: /next slide/i }));
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  });

  it("auto-advances on a timer and stops when paused", () => {
    render(<EcosystemNewsCarousel />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");

    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");

    // Pause, then confirm it no longer advances.
    fireEvent.click(screen.getByRole("button", { name: /pause carousel/i }));
    act(() => {
      vi.advanceTimersByTime(14000);
    });
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  });

  it("pauses on hover (mouse enter) and resumes on leave", () => {
    render(<EcosystemNewsCarousel />);
    const region = screen.getByRole("region", { name: /ecosystem news carousel/i });
    const tabs = screen.getAllByRole("tab");

    fireEvent.mouseEnter(region);
    act(() => {
      vi.advanceTimersByTime(14000);
    });
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");

    fireEvent.mouseLeave(region);
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  });

  it("supports keyboard arrows to change slide", () => {
    render(<EcosystemNewsCarousel />);
    const region = screen.getByRole("region", { name: /ecosystem news carousel/i });
    const tabs = screen.getAllByRole("tab");

    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
  });

  it("renders all news headlines (active + inactive slides present in DOM)", () => {
    render(<EcosystemNewsCarousel />);
    for (const item of NEWS) {
      expect(screen.getAllByText(item.headline).length).toBeGreaterThan(0);
    }
  });
});
