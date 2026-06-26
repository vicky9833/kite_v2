"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Send, Sparkles } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { requestAssistant } from "@/lib/ai-assistant-request";
import {
  INITIAL_CHAT_STATE,
  chatReducer,
  isAtExchangeCap,
  makeAssistantMessage,
  makeUserMessage,
} from "@/lib/chat-reducer";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

/**
 * Quick-start questions shown as click-to-send chips before the first message
 * and as suggested follow-ups afterwards (Req 9.5).
 */
const SAMPLE_QUESTIONS: readonly string[] = [
  "How do I register my startup with KITE?",
  "Which schemes am I eligible for?",
  "What is the ELEVATE program?",
  "How do I connect with investors?",
  "What are the Beyond Bengaluru clusters?",
] as const;

/**
 * AIAssistantButton — the floating AI entry point and its full chat panel
 * (Req 9). The panel wires the chat reducer to an actual response path: it
 * attempts the Anthropic Artifacts API and otherwise uses the deterministic
 * rule engine, so the assistant always responds. State is session-only and
 * resets when the panel closes or the page refreshes.
 */
export function AIAssistantButton(): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(false);
  const [state, dispatch] = React.useReducer(chatReducer, INITIAL_CHAT_STATE);
  const router = useRouter();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const lastUserMessageRef = React.useRef<string>("");

  const hasMessages = state.messages.length > 0;
  const atCap = isAtExchangeCap(state);

  // Auto-scroll to the newest message / loading indicator.
  React.useEffect(() => {
    const node = scrollRef.current;
    if (node && typeof node.scrollTo === "function") {
      node.scrollTo({ top: node.scrollHeight });
    }
  }, [state.messages, state.loading]);

  const send = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || state.loading || atCap) return;

      lastUserMessageRef.current = trimmed;
      const userMessage = makeUserMessage(trimmed);
      dispatch({ type: "SEND", message: userMessage });
      dispatch({ type: "START_LOADING" });

      try {
        // Build the conversation snapshot including the just-sent user message.
        const conversation: ChatMessage[] = [...state.messages, userMessage];
        const response = await requestAssistant(conversation);
        dispatch({ type: "RECEIVE", message: makeAssistantMessage(response) });
      } catch {
        dispatch({
          type: "ERROR",
          error: "Something went wrong reaching the assistant. Please try again.",
        });
      }
    },
    [state.loading, state.messages, atCap],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(state.input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(state.input);
    }
  };

  const handleSuggestion = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const retry = () => {
    if (lastUserMessageRef.current) void send(lastUserMessageRef.current);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Ask KITE AI"
        className="animate-ai-pulse fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg outline-none transition-colors hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Sparkles className="h-6 w-6" aria-hidden="true" />
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>Ask KITE AI</SheetTitle>
            {hasMessages && (
              <button
                type="button"
                onClick={() => dispatch({ type: "CLEAR" })}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-caption text-muted transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Clear Conversation
              </button>
            )}
          </div>
          <SheetDescription>
            Your guide to Karnataka&apos;s innovation ecosystem.
          </SheetDescription>
        </SheetHeader>

        {/* Conversation */}
        <div ref={scrollRef} className="mt-6 flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {!hasMessages && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm text-foreground">
                Hello! I&apos;m KITE AI. Ask me about schemes, eligibility,
                registration, programs, clusters, investors, or international
                partnerships. Pick a question below to get started.
              </p>
            </div>
          )}

          {state.messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="flex justify-end" role="status">
                <div className="max-w-[85%] rounded-xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {message.content}
                </div>
              </div>
            ) : (
              <div key={message.id} className="flex flex-col gap-2">
                <span className="text-caption font-semibold uppercase tracking-wide text-accent">
                  KITE AI
                </span>
                <div
                  role="status"
                  aria-live="polite"
                  className="max-w-[90%] rounded-xl rounded-bl-sm border border-border bg-surface px-4 py-2.5 text-sm text-foreground"
                >
                  {message.content}
                </div>
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((s) => (
                      <button
                        key={s.href}
                        type="button"
                        onClick={() => handleSuggestion(s.href)}
                        className="rounded-full border border-border bg-card px-3 py-1 text-caption text-primary transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}

          {state.loading && (
            <div className="flex items-center gap-1.5" aria-live="polite" aria-label="Loading response">
              <span className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:300ms]" />
            </div>
          )}

          {state.error && (
            <div role="alert" className="flex flex-col gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">{state.error}</p>
              <button
                type="button"
                onClick={retry}
                className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-caption text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Try Again
              </button>
            </div>
          )}

          {/* Quick-start / suggested follow-up chips */}
          {!atCap && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {hasMessages ? "Suggested follow-ups" : "Try asking"}
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    disabled={state.loading}
                    onClick={() => void send(question)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {atCap && (
            <p className="rounded-lg border border-border bg-surface p-3 text-caption text-muted">
              You&apos;ve reached the conversation limit for this preview. Use
              Clear Conversation to start fresh.
            </p>
          )}
        </div>

        {/* Composer */}
        <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-2 border-t border-border pt-4">
          <div className="flex-1">
            <label htmlFor="kite-ai-input" className="sr-only">
              Type your message
            </label>
            <textarea
              id="kite-ai-input"
              rows={1}
              value={state.input}
              onChange={(e) => dispatch({ type: "SET_INPUT", value: e.target.value })}
              onKeyDown={handleKeyDown}
              disabled={atCap}
              placeholder="Ask about schemes, registration, clusters…"
              className="max-h-32 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            aria-label="Send Message"
            disabled={state.loading || atCap || state.input.trim().length === 0}
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
            )}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default AIAssistantButton;
