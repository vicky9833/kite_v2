// src/components/layout/__tests__/AIAssistantChat.test.tsx
// Feature: kite-events-gia-assistant-support, Requirement 9

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

import { AIAssistantButton } from "@/components/layout/AIAssistantButton";

describe("AI Chat Assistant panel", () => {
  it("opens the panel from the floating button", () => {
    render(<AIAssistantButton />);
    fireEvent.click(screen.getByRole("button", { name: /ask kite ai/i }));
    expect(screen.getByText(/your guide to karnataka/i)).toBeInTheDocument();
  });

  it("responds to a quick-start question via the rule engine", async () => {
    render(<AIAssistantButton />);
    fireEvent.click(screen.getByRole("button", { name: /ask kite ai/i }));

    fireEvent.click(
      screen.getByRole("button", { name: /how do i register my startup with kite/i }),
    );

    // The assistant bubble (rule engine) should appear with a registration answer.
    await waitFor(() => {
      expect(screen.getByText(/registration wizard/i)).toBeInTheDocument();
    });
    // A "KITE AI" label marks the assistant message.
    expect(screen.getAllByText(/^KITE AI$/i).length).toBeGreaterThan(0);
  });

  it("exposes a labeled input and send control", () => {
    render(<AIAssistantButton />);
    fireEvent.click(screen.getByRole("button", { name: /ask kite ai/i }));
    expect(screen.getByLabelText(/type your message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });
});
