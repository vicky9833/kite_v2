"use client";

import * as React from "react";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/layout/CommandPalette";

/**
 * SiteChrome (task 2.9) — the CLIENT coordinator that owns the shared overlay
 * state for the global navigation chrome and renders the three interconnected
 * client components together: {@link Header}, {@link MobileNav}, and
 * {@link CommandPalette}.
 *
 * Why this exists:
 *   `RootLayout` (`app/layout.tsx`) stays a Server Component so the layout ships
 *   the smallest possible client bundle. But the Header's search trigger must
 *   open the CommandPalette and its hamburger must open the MobileNav — i.e. the
 *   three components share open/close state. A Server Component cannot hold
 *   `useState`, so this thin `"use client"` coordinator holds that state and
 *   wires the callbacks, letting RootLayout mount it as a single `<SiteChrome />`.
 *
 * Landmarks (Req 21.1): this renders exactly ONE banner — the Header's
 * `<header>` containing the single PRIMARY `<nav aria-label="Primary">`. The
 * MobileNav's `<nav aria-label="Mobile">` lives inside a Radix Dialog/Sheet that
 * is NOT present in the accessibility tree while closed, and carries a distinct
 * label, so the primary nav remains unambiguous.
 *
 * The ⌘K / Ctrl+K global shortcut is owned inside {@link CommandPalette}, so it
 * is not re-implemented here.
 */
export function SiteChrome(): React.JSX.Element {
  const [mobileNavOpen, setMobileNavOpen] = React.useState<boolean>(false);
  const [searchOpen, setSearchOpen] = React.useState<boolean>(false);

  return (
    <>
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
      />
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

export default SiteChrome;
