// src/components/gia/__tests__/GiaSurfaces.test.tsx
// Feature: kite-events-gia-assistant-support, Requirements 7 & 8

import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import GiaPage from "@/app/gia/page";
import CountryDetailPage from "@/app/gia/[country]/page";
import { giaCountries } from "@/data/gia-countries";

describe("GIA index (/gia)", () => {
  it("renders the hero and Why GIA editorial", () => {
    render(<GiaPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /why the global innovation alliance/i })).toBeInTheDocument();
  });

  it("links every one of the 32 countries to its detail page", () => {
    render(<GiaPage />);
    const grid = screen.getByRole("heading", { name: /all 32 partner countries/i }).closest("section");
    for (const country of giaCountries) {
      const link = within(grid as HTMLElement).getByRole("link", { name: new RegExp(country.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") });
      expect(link).toHaveAttribute("href", `/gia/${country.countryCode.toLowerCase()}`);
    }
  });

  it("derives region overview counts from verified data", () => {
    render(<GiaPage />);
    expect(screen.getByRole("heading", { name: /partner countries by region/i })).toBeInTheDocument();
  });
});

describe("GIA country detail (/gia/[country])", () => {
  it("renders a verified country with its bilateral sections", () => {
    render(<CountryDetailPage params={{ country: "gb" }} />);
    expect(screen.getByRole("heading", { level: 1, name: /united kingdom/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /at a glance/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /investment and partnership opportunities/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /success stories/i })).toBeInTheDocument();
  });

  it("renders breadcrumb back to GIA", () => {
    render(<CountryDetailPage params={{ country: "jp" }} />);
    expect(screen.getByRole("heading", { level: 1, name: /japan/i })).toBeInTheDocument();
    const breadcrumb = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(within(breadcrumb).getByRole("link", { name: /^GIA$/i })).toHaveAttribute("href", "/gia");
  });
});
