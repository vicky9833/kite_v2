"use client";

/**
 * KITE MobileNav (task 2.4).
 *
 * A left-side `Sheet` navigation drawer presented on small viewports, opened by
 * the Header hamburger (wired by RootLayout, task 2.9). It is a CONTROLLED
 * component: visibility is owned by the parent via `{ open, onOpenChange }`, so
 * the Header/RootLayout can toggle it from the hamburger while this component
 * stays free of its own open/close state.
 *
 * Built against the VERIFIED navigation data in `src/data/navigation.ts`. The
 * canonical nav has SIX top-level items:
 *   - FIVE dropdowns (Ecosystem, Schemes & Benefits, For Stakeholders,
 *     Beyond Bengaluru, Connect) — each with `children`; and
 *   - "Register" — a single LEAF (href `/register`).
 *
 * Reconciliation note (six vs seven): the older illustrative spec text (Req 4.2)
 * lists "seven primary items" (Home, Startups, Investors, Schemes & Benefits,
 * Incubators & Accelerators, More, Support). That was the early illustrative IA.
 * The approved/verified `navigation.ts` is the single source of truth and
 * defines the SIX items above. This component renders the verified six: the five
 * dropdowns via an `Accordion` (parent toggles + stays open) and "Register" as a
 * direct leaf link.
 *
 * Behavior mapping:
 *   - Req 4.1: left `Sheet` over a dimming overlay; slide-in within 150–400ms
 *     (shadcn Sheet defaults: open 500ms / close 300ms — confirmed below).
 *   - Req 4.2: six top-level items in a vertically scrollable list (ScrollArea).
 *   - Req 4.3: leaf items (dropdown children + Register) navigate via `<Link>`
 *     and close the sheet on click (`onOpenChange(false)`).
 *   - Req 4.4: parent (Accordion trigger) toggles nested items and STAYS open;
 *     it does NOT navigate or close. `type="multiple"` lets several stay open.
 *   - Req 4.5 / 4.6: close control, overlay click, and Escape all close (Sheet /
 *     Radix Dialog defaults).
 *   - Req 4.7 / 4.8 / 21.4: Radix Dialog traps focus while open and returns focus
 *     to the trigger (the hamburger) on close.
 *
 * NOTE on the 150–400ms requirement: shadcn's Sheet `data-[state=open]` uses a
 * 500ms duration by default. To land the OPEN slide-in inside the 150–400ms
 * window (Req 4.1) we override the open duration to 300ms on the SheetContent.
 *
 * Visual-only parity extras (kept focused): a "Sign In" link and the bilingual
 * language toggle from the verified `utilityNav` cluster. These mirror the
 * Header utilities for small viewports; the language toggle is in-memory only
 * (Req 3.12). "Register" is the verified sixth nav item and also the primary CTA.
 */

import Link from "next/link";
import { LogIn } from "lucide-react";

import {
  navigation,
  primaryCtaHref,
  utilityNav,
} from "@/data/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface MobileNavProps {
  /** Whether the drawer is open. Owned by the parent (Header / RootLayout). */
  open: boolean;
  /**
   * Called with the next open state whenever the Sheet requests a visibility
   * change (close control, overlay click, Escape) or when a leaf link is
   * activated. The parent updates its state to reflect it.
   */
  onOpenChange: (open: boolean) => void;
}

/** Shared focus-visible ring convention for MobileNav controls (Req 21.2). */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

/** Parent (dropdown) items: those exposing nested children. */
const dropdownItems: NavItem[] = navigation.filter(
  (item) => Array.isArray(item.children) && item.children.length > 0,
);

/** Leaf top-level items: those with an href and no children (e.g. "Register"). */
const leafItems: NavItem[] = navigation.filter(
  (item) => !Array.isArray(item.children) || item.children.length === 0,
);

export function MobileNav({ open, onOpenChange }: MobileNavProps): JSX.Element {
  const { toggleLanguage } = useLanguage();

  /** Close the drawer (used by leaf navigation — Req 4.3). */
  const closeNav = (): void => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/*
        side="left" → slide-in from the left edge over the dimming overlay
        (Req 4.1). Open duration overridden to 300ms to sit inside 150–400ms.
        Vertical flex column so the scrollable nav list grows and the utility
        footer pins to the bottom.
      */}
      <SheetContent
        side="left"
        className="flex w-[88%] max-w-sm flex-col gap-0 p-0 data-[state=open]:duration-300"
      >
        <SheetHeader className="space-y-1 border-b border-border px-6 py-4 text-left">
          <SheetTitle className="font-heading text-lg font-bold tracking-tight text-foreground">
            KITE
          </SheetTitle>
          <SheetDescription className="text-xs text-muted">
            Karnataka Innovation &amp; Technology Ecosystem
          </SheetDescription>
        </SheetHeader>

        {/* Vertically scrollable list of the six top-level items (Req 4.2) */}
        <ScrollArea className="flex-1">
          <nav aria-label="Mobile" className="px-3 py-2">
            {/*
              Five dropdown items via Accordion. type="multiple" so toggling a
              parent reveals its children and the parent STAYS open; opening
              another does not collapse the first (Req 4.4). The trigger does NOT
              navigate or close the sheet.
            */}
            <Accordion type="multiple" className="w-full">
              {dropdownItems.map((item) => (
                <AccordionItem
                  key={item.label}
                  value={item.label}
                  className="border-border"
                >
                  <AccordionTrigger
                    className={cn(
                      "rounded-md px-3 text-base font-medium text-foreground hover:no-underline hover:bg-surface",
                      focusRing,
                    )}
                  >
                    {item.label}
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 pl-3">
                    <ul className="flex flex-col gap-0.5 border-l border-border pl-3">
                      {item.children?.map((child) => (
                        <li key={child.label}>
                          {/* Leaf child: navigates + closes (Req 4.3) */}
                          <Link
                            href={child.href ?? "#"}
                            onClick={closeNav}
                            className={cn(
                              "block rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground",
                              focusRing,
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Top-level leaf items (e.g. "Register"): navigate + close (Req 4.3) */}
            <ul className="mt-1 flex flex-col">
              {leafItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href ?? "#"}
                    onClick={closeNav}
                    className={cn(
                      "block rounded-md px-3 py-4 text-base font-medium text-foreground transition-colors hover:bg-surface",
                      focusRing,
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </ScrollArea>

        {/* Utility footer: Sign In + language toggle (parity) and Register CTA */}
        <div className="mt-auto border-t border-border px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={utilityNav.signInHref}
              onClick={closeNav}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface",
                focusRing,
              )}
            >
              <LogIn aria-hidden className="h-5 w-5" />
              Sign In
            </Link>

            {/* Bilingual toggle — visual-only, in-memory state (Req 3.12) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground",
                focusRing,
              )}
            >
              {utilityNav.languageToggleLabel}
            </button>
          </div>

          {/* Register — primary CTA (also the verified sixth nav leaf). */}
          <Link
            href={primaryCtaHref}
            onClick={closeNav}
            className={cn(
              "mt-3 inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90",
              focusRing,
            )}
          >
            Register
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
