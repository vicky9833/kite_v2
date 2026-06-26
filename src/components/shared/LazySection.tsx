"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * LazySection — defers rendering its children until the section scrolls within
 * ~200px of the viewport (Req 22.4). Until then it renders an equal-height
 * `Skeleton` placeholder so that swapping in the real content does not shift
 * surrounding layout (no CLS — Req 22.5). Callers reserve the right space via
 * `minHeight`.
 *
 * Hydration safety: the FIRST render is identical on the server and the client
 * — it always renders the `Skeleton` placeholder (`isVisible` starts `false`).
 * Only AFTER hydration (inside `useEffect`, which never runs on the server) does
 * the component either (a) set up the `IntersectionObserver` and swap to the
 * real content once the section nears the viewport, or (b) — when
 * `IntersectionObserver` is unavailable (older/unsupported environments) —
 * reveal the children immediately. This avoids the server/client markup
 * divergence that previously produced a "div in a div" hydration error.
 *
 * Client Component (uses `IntersectionObserver` + state).
 */
export interface LazySectionProps {
  /** The deferred content rendered once the section nears the viewport. */
  children: ReactNode;
  /**
   * Height reserved for the placeholder skeleton (and minimum height of the
   * wrapper) so layout stays stable. A number is treated as pixels.
   */
  minHeight?: number | string;
  /** Extra classes merged onto the wrapper element. */
  className?: string;
}

function hasIntersectionObserver(): boolean {
  return (
    typeof window !== "undefined" && typeof IntersectionObserver !== "undefined"
  );
}

export function LazySection({
  children,
  minHeight,
  className,
}: LazySectionProps) {
  // Start hidden on BOTH server and client so the first paint matches exactly
  // (no hydration mismatch). The observer/eager-reveal is wired post-mount in
  // the effect below, which never runs during SSR.
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      return;
    }

    // No IntersectionObserver support → reveal immediately after mount.
    if (!hasIntersectionObserver()) {
      setIsVisible(true);
      return;
    }

    const node = containerRef.current;
    if (!node) {
      // Defensive: nothing to observe → reveal so content never gets stuck.
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  const style =
    minHeight === undefined
      ? undefined
      : { minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight };

  return (
    <div ref={containerRef} className={className} style={style}>
      {isVisible ? (
        children
      ) : (
        <Skeleton className={cn("h-full w-full")} style={style} />
      )}
    </div>
  );
}

export default LazySection;
