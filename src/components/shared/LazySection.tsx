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
 * SSR / no-IntersectionObserver safety: if `IntersectionObserver` is
 * unavailable (server render or unsupported environment) the children render
 * immediately rather than being hidden behind a skeleton that never resolves.
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
  // Render eagerly when IntersectionObserver is not available (SSR / unsupported).
  const [isVisible, setIsVisible] = useState(() => !hasIntersectionObserver());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible || !hasIntersectionObserver()) {
      return;
    }

    const node = containerRef.current;
    if (!node) {
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
