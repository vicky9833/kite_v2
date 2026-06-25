"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Static, visual-only sample questions shown inside the AI Assistant panel.
 *
 * These are non-functional placeholders (Req 6.4, 6.7): activating one does NOT
 * call any backend, network, or external service. The collection length is held
 * between 3 and 6 inclusive by {@link SAMPLE_QUESTIONS} below.
 */
const SAMPLE_QUESTIONS: readonly string[] = [
  "How do I register my startup with KITE?",
  "Which schemes am I eligible for?",
  "What is the ELEVATE program?",
  "How do I connect with investors?",
  "What are the Beyond Bengaluru clusters?",
] as const;

/**
 * AIAssistantButton — the floating bottom-right AI Assistant entry point and its
 * right slide-over panel (Req 6).
 *
 * Behaviour:
 *  - Renders a circular, accent-coloured floating button fixed to the
 *    bottom-right of the viewport that stays put while the page scrolls
 *    (Req 6.1).
 *  - The button carries a continuously looping CSS-only glow/pulse via the
 *    `.animate-ai-pulse` utility authored in `globals.css`; the global
 *    `prefers-reduced-motion` rule disables it with no JS (Req 6.2, 21.7,
 *    22.1).
 *  - Pointer click or keyboard (Enter/Space, native `<button>` semantics) opens
 *    a right `Sheet` titled "Ask KITE AI"; Radix moves focus into the panel
 *    (Req 6.3) and traps focus while open (Req 6.8, 21.4).
 *  - Closing via the Sheet close control or Escape returns focus to the
 *    floating button — the Radix default (Req 6.5, 6.6).
 *
 * The component is self-contained: it owns its open/closed state locally so the
 * RootLayout can mount it as `<AIAssistantButton />` with no external wiring.
 *
 * Visual-only: nothing here performs a network/fetch/XHR call (Req 6.7).
 */
export function AIAssistantButton(): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Ask KITE AI"
        className="animate-ai-pulse fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg outline-none transition-colors hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Sparkles className="h-6 w-6" aria-hidden="true" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>Ask KITE AI</SheetTitle>
          <SheetDescription>
            Your guide to Karnataka&apos;s innovation ecosystem.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-1 flex-col gap-6 overflow-y-auto">
          {/* Static welcome message (Req 6.4) */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-foreground">
              Hello! I&apos;m KITE AI. I can help you explore schemes, programs,
              clusters, and more across Karnataka&apos;s innovation ecosystem.
              Pick a question below to get started.
            </p>
          </div>

          {/* Sample questions — visual-only placeholders (Req 6.4, 6.7) */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AIAssistantButton;
