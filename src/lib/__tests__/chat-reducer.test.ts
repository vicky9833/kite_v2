// src/lib/__tests__/chat-reducer.test.ts
// Feature: kite-events-gia-assistant-support, Property 7

import { describe, it, expect } from "vitest";
import {
  INITIAL_CHAT_STATE,
  chatReducer,
  isAtExchangeCap,
  makeAssistantMessage,
  makeUserMessage,
} from "@/lib/chat-reducer";

describe("chat-reducer", () => {
  // Property 7: reducer purity / transitions
  it("Property 7: SEND appends one user message and increments exchanges", () => {
    const msg = makeUserMessage("hello");
    const next = chatReducer(INITIAL_CHAT_STATE, { type: "SEND", message: msg });
    expect(next.messages.length).toBe(1);
    expect(next.messages[0]).toBe(msg);
    expect(next.exchanges).toBe(1);
    expect(next.input).toBe("");
    expect(next.error).toBeNull();
    // input unchanged on the original (immutability)
    expect(INITIAL_CHAT_STATE.messages.length).toBe(0);
  });

  it("RECEIVE appends an assistant message and clears loading/error", () => {
    const loading = chatReducer(
      { ...INITIAL_CHAT_STATE, loading: true, error: "x" },
      { type: "RECEIVE", message: makeAssistantMessage({ text: "hi", suggestions: [] }) },
    );
    expect(loading.loading).toBe(false);
    expect(loading.error).toBeNull();
    expect(loading.messages.length).toBe(1);
    expect(loading.messages[0]?.role).toBe("assistant");
  });

  it("START_LOADING sets loading; ERROR clears it and records the message", () => {
    const l = chatReducer(INITIAL_CHAT_STATE, { type: "START_LOADING" });
    expect(l.loading).toBe(true);
    const e = chatReducer(l, { type: "ERROR", error: "boom" });
    expect(e.loading).toBe(false);
    expect(e.error).toBe("boom");
  });

  it("CLEAR resets to initial state", () => {
    const dirty = chatReducer(
      { ...INITIAL_CHAT_STATE, input: "draft", exchanges: 5 },
      { type: "SEND", message: makeUserMessage("x") },
    );
    const cleared = chatReducer(dirty, { type: "CLEAR" });
    expect(cleared).toEqual(INITIAL_CHAT_STATE);
  });

  it("isAtExchangeCap reflects the 20-exchange ceiling", () => {
    expect(isAtExchangeCap({ ...INITIAL_CHAT_STATE, exchanges: 19 })).toBe(false);
    expect(isAtExchangeCap({ ...INITIAL_CHAT_STATE, exchanges: 20 })).toBe(true);
  });
});
