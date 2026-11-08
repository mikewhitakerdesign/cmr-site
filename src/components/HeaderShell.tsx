"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll offsets for the compact header, with hysteresis. When the header
 * shrinks the page gets shorter, and Chrome's scroll anchoring may pull
 * `scrollY` back by that difference (≈50–60px). Entering at 96 and leaving
 * at 16 keeps that correction from toggling the state straight back.
 */
export const COMPACT_ENTER_Y = 96;
export const COMPACT_EXIT_Y = 16;

export function nextCompactState(compact: boolean, scrollY: number): boolean {
  return compact ? scrollY > COMPACT_EXIT_Y : scrollY > COMPACT_ENTER_Y;
}

/**
 * The sticky <header> element. Sets `data-compact` once the page scrolls, so
 * the header's own markup (a Server Component) can shrink with
 * `group-data-[compact]/header:` classes, and `data-animating` for 400ms
 * around each change so transitions apply only then. The attribute is toggled directly:
 * scrolling never re-renders React.
 */
export function HeaderShell({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let compact = false;
    let frame = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      frame = 0;
      const next = nextCompactState(compact, window.scrollY);
      if (next !== compact) {
        compact = next;
        // Size transitions run only around this toggle, never on viewport resizes.
        el.setAttribute("data-animating", "");
        clearTimeout(settle);
        settle = setTimeout(() => el.removeAttribute("data-animating"), 400);
        el.toggleAttribute("data-compact", next);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, []);

  return (
    <header ref={ref} className={cn("group/header sticky top-0 z-50", className)}>
      {children}
    </header>
  );
}
