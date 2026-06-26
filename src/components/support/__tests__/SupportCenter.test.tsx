// src/components/support/__tests__/SupportCenter.test.tsx
// Feature: kite-events-gia-assistant-support, Requirement 10

import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import SupportPage from "@/app/support/page";

describe("Support Center (/support)", () => {
  it("renders the hero with Ask KITE AI and Contact CTAs", () => {
    render(<SupportPage />);
    expect(screen.getByRole("heading", { level: 1, name: /help when you need it/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^ask kite ai$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact kits direct/i })).toBeInTheDocument();
  });

  it("renders the FAQ accordion with curated questions", () => {
    render(<SupportPage />);
    expect(screen.getByRole("heading", { name: /frequently asked questions/i })).toBeInTheDocument();
    expect(screen.getByText(/how do i register my startup with kite/i)).toBeInTheDocument();
  });

  it("renders verified KITS contact details", () => {
    render(<SupportPage />);
    const contact = screen.getByRole("heading", { name: /^Contact KITS$/i }).closest("section");
    expect(within(contact as HTMLElement).getByText("080-22231007")).toBeInTheDocument();
    expect(within(contact as HTMLElement).getByText("startupcell@karnataka.gov.in")).toBeInTheDocument();
  });

  it("renders department contacts and the ticket form", () => {
    render(<SupportPage />);
    expect(screen.getByRole("heading", { name: /department contacts/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /submit a support ticket/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument();
  });

  it("renders the helpline SLA section", () => {
    render(<SupportPage />);
    expect(screen.getByRole("heading", { name: /helpline hours & service levels/i })).toBeInTheDocument();
  });
});
