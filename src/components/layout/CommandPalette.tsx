"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { NavItem } from "@/types";
import { navigation, utilityNav } from "@/data/navigation";
import { schemes } from "@/data/schemes";
import { clusters } from "@/data/clusters";
import { policies } from "@/data/policies";
import { events } from "@/data/events";
import { filterDestinations } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

/**
 * A single navigable destination surfaced by the Command Palette. Reuses the
 * {@link NavItem} shape (label + required href) so the shared, pure
 * `filterDestinations` helper can drive the visible list (Property 2).
 */
type Destination = NavItem & { href: string };

/**
 * Flatten the {@link navigation} tree and append the content collections into a
 * de-duplicated, ordered list of leaf destinations (Req 7.2).
 *
 * Ordering (first-seen wins on the final de-duplication):
 * 1. Navigation leaves — parent items contribute their leaf children; leaf items
 *    (those with an `href`, e.g. "Register") contribute themselves.
 * 2. The utility "Sign In" destination.
 * 3. Content destinations — schemes, clusters, policies, then events — so every
 *    detail route is searchable, not just the curated nav entries.
 *
 * Nav comes first so the existing ordering for nav items is preserved; content
 * routes already referenced by the nav (e.g. `/schemes/elevate`) are dropped by
 * the de-duplication rather than duplicated.
 */
function buildDestinations(items: NavItem[]): Destination[] {
  const flat: Destination[] = [];

  const visit = (item: NavItem): void => {
    if (item.children && item.children.length > 0) {
      item.children.forEach(visit);
      return;
    }
    if (typeof item.href === "string" && item.href.length > 0) {
      flat.push({ label: item.label, href: item.href });
    }
  };

  items.forEach(visit);

  // Append the visual-only "Sign In" utility destination.
  flat.push({ label: "Sign In", href: utilityNav.signInHref });

  // Append the content collections as searchable destinations.
  schemes.forEach((scheme) => {
    flat.push({ label: scheme.name, href: `/schemes/${scheme.id}` });
  });
  clusters.forEach((cluster) => {
    flat.push({ label: cluster.name, href: cluster.href });
  });
  policies.forEach((policy) => {
    flat.push({ label: policy.name, href: policy.href });
  });
  events.forEach((event) => {
    flat.push({ label: event.name, href: event.href });
  });

  // De-duplicate by href, preserving first-seen order.
  const seen = new Set<string>();
  return flat.filter((destination) => {
    if (seen.has(destination.href)) {
      return false;
    }
    seen.add(destination.href);
    return true;
  });
}

/** All navigable destinations — computed once at module load. */
const DESTINATIONS: Destination[] = buildDestinations(navigation);

export interface CommandPaletteProps {
  /** Whether the palette overlay is open. Controlled by the Header/RootLayout. */
  open: boolean;
  /** Notifies the owner when the open state should change. */
  onOpenChange: (open: boolean) => void;
}

/**
 * CommandPalette — a keyboard-friendly search overlay built on the shadcn
 * `command` (cmdk) primitive (Req 7).
 *
 * Behavior:
 * - Controlled via `{ open, onOpenChange }` so the Header search trigger (and
 *   the ⌘K / Ctrl+K global shortcut) can open it. Opening moves focus to the
 *   input (handled by the dialog + `CommandInput` autofocus) (Req 7.1).
 * - Destinations are a flat list flattened from `navigation` and appended with
 *   the schemes, clusters, policies, and events collections (Req 7.2).
 * - Filtering uses the shared `filterDestinations` semantics — a case-insensitive
 *   substring match on `label` — with cmdk's built-in filter disabled
 *   (`shouldFilter={false}`) so the visible list matches Property 2 exactly
 *   (Req 7.3).
 * - When nothing matches, a "No results found." indication shows and the palette
 *   stays open (Req 7.4).
 * - Selecting a destination (click or Enter on the highlighted item) navigates
 *   via the Next router and closes (Req 7.5). Arrow keys move the highlight and
 *   Enter activates it (cmdk built-in) (Req 7.7).
 * - Escape closes and returns focus to the trigger (Dialog default) (Req 7.6).
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  // Reset the query whenever the palette closes so it reopens clean.
  React.useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  // ⌘K / Ctrl+K global shortcut opens the palette (Req 7.1 entry point).
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange]);

  // Drive the visible list with the shared, pure filter (Property 2, Req 7.3).
  const visible = filterDestinations(DESTINATIONS, query) as Destination[];

  const handleSelect = React.useCallback(
    (href: string): void => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0">
        <DialogTitle className="sr-only">Search KITE</DialogTitle>
        <DialogDescription className="sr-only">
          Search for a destination and press Enter to navigate.
        </DialogDescription>
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3"
        >
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search destinations..."
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Destinations">
              {visible.map((destination) => (
                <CommandItem
                  key={destination.href}
                  // `value` must be unique so cmdk keying/highlight is stable;
                  // include the href because labels can repeat across sections.
                  value={`${destination.label} ${destination.href}`}
                  onSelect={() => handleSelect(destination.href)}
                >
                  {destination.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export default CommandPalette;
