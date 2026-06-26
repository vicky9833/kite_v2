"use client";

/**
 * KITE global Header (task 2.3).
 *
 * Fixed top bar (h-16 / 64px, `bg-dark`, white text) rendered on every page via
 * RootLayout (task 2.9). It is built against the VERIFIED navigation data in
 * `src/data/navigation.ts` — the canonical six top-level items (five dropdowns
 * + the "Register" leaf). The five dropdown items render in the desktop center
 * `NavigationMenu`; "Register" is NOT in the center menu — it is the primary CTA
 * button on the right (`primaryCtaHref`).
 *
 * Reconciliation note (Req 3.8 vs verified data): the older illustrative spec
 * text lists an explicit header "AI Assistant" button. The verified utility
 * cluster (navigation.ts → `utilityNav`) is: search, language toggle, bell,
 * Sign In, Register — with NO header AI button. The floating AIAssistantButton
 * (task 2.7) is the canonical AI entry point, so this Header intentionally does
 * NOT add an AI button and follows the verified utility cluster.
 *
 * Visual-only in this slice: the language toggle flips in-memory state only
 * (Req 3.12, via useLanguage), and the bell is a non-functional placeholder
 * (no badge, no storage, no network). The search trigger and hamburger expose
 * callback props (`onOpenSearch`, `onOpenMobileNav`) so tasks 2.5 / 2.4 / 2.9
 * can wire the CommandPalette and MobileNav without changing this component.
 */

import Link from "next/link";
// NOTE: lucide-react (installed version) ships no `Kite` icon, so the brand
// lockup uses `Rocket` — a recognizable innovation/startup glyph — as the
// closest thematic substitute. Swap to `Kite` if a future lucide-react upgrade
// adds it.
import { Bell, Menu, Rocket, Search } from "lucide-react";

import {
  navigation,
  primaryCtaHref,
  utilityNav,
} from "@/data/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export interface HeaderProps {
  /**
   * Opens the CommandPalette search overlay (wired by task 2.5 / 2.9). When
   * omitted the search trigger is still rendered and operable but performs no
   * action — keeping the Header self-contained for isolated rendering/tests.
   */
  onOpenSearch?: () => void;
  /**
   * Opens the MobileNav drawer (wired by task 2.4 / 2.9). When omitted the
   * hamburger is still rendered with its accessible label.
   */
  onOpenMobileNav?: () => void;
}

/** Shared focus-visible ring convention for Header controls (Req 21.2). */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark";

/** Items rendered in the desktop center menu: only the dropdown (parent) items. */
const dropdownItems: NavItem[] = navigation.filter(
  (item) => Array.isArray(item.children) && item.children.length > 0,
);

export function Header({
  onOpenSearch,
  onOpenMobileNav,
}: HeaderProps): JSX.Element {
  const { toggleLanguage } = useLanguage();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 w-full bg-dark text-white">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        {/* Left: brand lockup */}
        <Link
          href="/"
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-lg text-white",
            focusRing,
          )}
        >
          <Rocket aria-hidden className="h-7 w-7 text-accent" />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-[22px] font-bold tracking-tight text-white">
              KITE
            </span>
            <span className="hidden text-[11px] leading-tight text-white/70 xl:block">
              Karnataka Innovation &amp; Technology Ecosystem
            </span>
          </span>
        </Link>

        {/* Center: desktop dropdown navigation (≥ lg) */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {dropdownItems.map((item) => (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger
                  className={cn(
                    "px-3 bg-transparent text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white",
                    focusRing,
                  )}
                >
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[320px] gap-1 p-3">
                    {item.children?.map((child) => (
                      <li key={child.label}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={child.href ?? "#"}
                            className={cn(
                              "block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface focus:bg-surface",
                              focusRing,
                            )}
                          >
                            {child.label}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right: utility cluster */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Search trigger (opens CommandPalette — wired in task 2.5 / 2.9) */}
          <button
            type="button"
            aria-label="Search"
            onClick={onOpenSearch}
            className={cn(
              "hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white xl:inline-flex",
              focusRing,
            )}
          >
            <Search aria-hidden className="h-5 w-5" />
            <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-sans text-[11px] font-medium text-white/70">
              {utilityNav.searchShortcut}
            </kbd>
          </button>
          {/* Compact search trigger for small + intermediate viewports */}
          <button
            type="button"
            aria-label="Search"
            onClick={onOpenSearch}
            className={cn(
              "inline-flex items-center justify-center rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white xl:hidden",
              focusRing,
            )}
          >
            <Search aria-hidden className="h-5 w-5" />
          </button>

          {/* Bilingual toggle (visual-only in-memory state — Req 3.12) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className={cn(
              "hidden rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white xl:inline-flex",
              focusRing,
            )}
          >
            {utilityNav.languageToggleLabel}
          </button>

          {/* Notification bell (visual-only, no badge — Req 3.12) */}
          {utilityNav.showNotificationBell ? (
            <button
              type="button"
              aria-label="Notifications"
              className={cn(
                "hidden items-center justify-center rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white xl:inline-flex",
                focusRing,
              )}
            >
              <Bell aria-hidden className="h-5 w-5" />
            </button>
          ) : null}

          {/* Sign In (verified utility link) */}
          <Link
            href={utilityNav.signInHref}
            className={cn(
              "hidden rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 xl:inline-flex",
              focusRing,
            )}
          >
            Sign In
          </Link>

          {/* Register — primary CTA (bg-accent) */}
          <Link
            href={primaryCtaHref}
            className={cn(
              "inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90",
              focusRing,
            )}
          >
            Register
          </Link>

          {/* Hamburger — opens MobileNav (< lg). Wired in task 2.4 / 2.9. */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={onOpenMobileNav}
            className={cn(
              "inline-flex items-center justify-center rounded-lg p-2 text-white transition-colors hover:bg-white/10 lg:hidden",
              focusRing,
            )}
          >
            <Menu aria-hidden className="h-6 w-6" />
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;
