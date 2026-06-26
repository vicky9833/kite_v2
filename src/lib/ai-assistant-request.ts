// src/lib/ai-assistant-request.ts
//
// Request orchestration for the KITE AI Assistant (Req 9.4). Attempts the
// Anthropic Messages API via the documented Artifacts pattern when that runtime
// is available, and otherwise falls back to the pure, deterministic rule engine.
//
// In the standard Next.js runtime the Artifacts runtime (`window.claude`) is
// NOT present, so the rule engine is the de-facto path. The fallback guarantees
// the assistant always responds without exposing API keys or making blind
// cross-origin calls.

import type { AssistantResponse, ChatMessage } from "@/types";
import { buildSystemPrompt } from "@/lib/ai-assistant-system-prompt";
import {
  extractRouteSuggestions,
  generateRuleResponse,
} from "@/lib/kite-assistant-rules";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1000;

/** Minimal shape of the Artifacts `window.claude` bridge, when present. */
interface ClaudeArtifactsBridge {
  complete?: (prompt: string) => Promise<string>;
}

declare global {
  interface Window {
    claude?: ClaudeArtifactsBridge;
  }
}

/** True when the Artifacts API bridge is available in this runtime. */
export function isArtifactsRuntimeAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.claude?.complete === "function"
  );
}

/** Build the Anthropic-style messages array from the conversation. */
function toApiMessages(messages: ChatMessage[]): { role: string; content: string }[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));
}

/**
 * Attempt the Artifacts API path. Resolves to the response text, or throws if
 * the runtime is unavailable or the call fails — so the caller can fall back.
 */
async function requestViaArtifacts(messages: ChatMessage[]): Promise<string> {
  if (!isArtifactsRuntimeAvailable() || !window.claude?.complete) {
    throw new Error("Artifacts runtime unavailable");
  }
  const system = buildSystemPrompt();
  const conversation = toApiMessages(messages)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");
  const prompt = `${system}\n\n${conversation}\nAssistant:`;
  void MODEL;
  void MAX_TOKENS;
  const text = await window.claude.complete(prompt);
  if (!text || text.trim().length === 0) {
    throw new Error("Empty response from Artifacts runtime");
  }
  return text;
}

/**
 * Obtain an assistant response for the conversation. Tries the Artifacts API
 * first; on any failure falls back to the deterministic rule engine keyed on
 * the latest user message. Always resolves with a usable response (Req 9.4).
 */
export async function requestAssistant(
  messages: ChatMessage[],
): Promise<AssistantResponse> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const userText = lastUser?.content ?? "";

  if (isArtifactsRuntimeAvailable()) {
    try {
      const text = await requestViaArtifacts(messages);
      // Enrich API text with route-suggestion chips so it stays actionable.
      return { text, suggestions: extractRouteSuggestions(text) };
    } catch {
      // fall through to the rule engine
    }
  }

  return generateRuleResponse(userText);
}
