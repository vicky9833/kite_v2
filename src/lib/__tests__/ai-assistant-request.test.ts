// src/lib/__tests__/ai-assistant-request.test.ts
//
// Feature: kite-events-gia-assistant-support, Requirement 9.4
// In the default (jsdom/no-Artifacts) runtime, requestAssistant falls back to
// the deterministic rule engine and always resolves with a usable response.

import { describe, it, expect, afterEach, vi } from "vitest";
import {
  isArtifactsRuntimeAvailable,
  requestAssistant,
} from "@/lib/ai-assistant-request";
import { generateRuleResponse } from "@/lib/kite-assistant-rules";
import { makeUserMessage } from "@/lib/chat-reducer";

describe("ai-assistant-request", () => {
  afterEach(() => {
    // clean up any injected bridge
    delete (window as unknown as { claude?: unknown }).claude;
    vi.restoreAllMocks();
  });

  it("reports the Artifacts runtime as unavailable by default", () => {
    expect(isArtifactsRuntimeAvailable()).toBe(false);
  });

  it("falls back to the rule engine for the latest user message", async () => {
    const messages = [makeUserMessage("How do I register my startup?")];
    const response = await requestAssistant(messages);
    expect(response).toEqual(generateRuleResponse("How do I register my startup?"));
    expect(response.text.length).toBeGreaterThan(0);
  });

  it("uses the Artifacts bridge when present and enriches with route chips", async () => {
    (window as unknown as { claude: { complete: (p: string) => Promise<string> } }).claude = {
      complete: async () => "Visit /schemes to explore all 22 schemes.",
    };
    expect(isArtifactsRuntimeAvailable()).toBe(true);
    const response = await requestAssistant([makeUserMessage("schemes?")]);
    expect(response.text).toContain("/schemes");
    expect(response.suggestions.map((s) => s.href)).toContain("/schemes");
  });

  it("falls back when the Artifacts bridge throws", async () => {
    (window as unknown as { claude: { complete: () => Promise<string> } }).claude = {
      complete: async () => {
        throw new Error("boom");
      },
    };
    const response = await requestAssistant([makeUserMessage("women founders")]);
    expect(response).toEqual(generateRuleResponse("women founders"));
  });
});
