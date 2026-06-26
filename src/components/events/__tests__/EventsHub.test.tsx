// src/components/events/__tests__/EventsHub.test.tsx
// Feature: kite-events-gia-assistant-support, Requirement 6

import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import EventsPage from "@/app/events/page";
import { events } from "@/data/events";

describe("Events & Media Hub (/events)", () => {
  it("replaces the stub and renders the hero with two CTAs", () => {
    render(<EventsPage />);
    expect(screen.queryByText(/content is forthcoming/i)).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse upcoming events/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view media coverage/i })).toBeInTheDocument();
  });

  it("features Bengaluru Tech Summit 2026", () => {
    render(<EventsPage />);
    const featured = screen.getByRole("heading", { name: /featured event/i }).closest("section");
    expect(featured).not.toBeNull();
    expect(within(featured as HTMLElement).getByText(/Bengaluru Tech Summit 2026/i)).toBeInTheDocument();
  });

  it("renders every verified event in the upcoming grid", () => {
    render(<EventsPage />);
    const grid = screen.getByRole("heading", { name: /^Upcoming Events$/i }).closest("section");
    for (const event of events) {
      expect(within(grid as HTMLElement).getByText(event.name)).toBeInTheDocument();
    }
  });

  it("marks the media and announcements sections illustrative", () => {
    render(<EventsPage />);
    expect(screen.getByRole("heading", { name: /in the news/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Karnataka Government Announcements/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/^Illustrative$/i).length).toBeGreaterThan(0);
  });

  it("renders the subscribe form and social section", () => {
    render(<EventsPage />);
    expect(screen.getByRole("heading", { name: /stay updated/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /connect with the ecosystem/i })).toBeInTheDocument();
  });
});
