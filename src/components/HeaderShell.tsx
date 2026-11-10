"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll offsets for the compact header. Hysteresis keeps the bar from
 * flickering when the scroll position hovers near one threshold.
 */
export const COMPACT_ENTER_Y = 96;
export const COMPACT_EXIT_Y = 16;

export function nextCompactState(compact: boolean, scrollY: number): boolean {
  return compact ? scrollY > COMPACT_EXIT_Y : scrollY > COMPACT_ENTER_Y;
}

/** Mobile top row (logo + CTA) height: it can only hide once scrolled past it. */
export const TOP_ROW_H = 64;
/** Scroll distance in one direction before the top row hides or returns (ignores jitter). */
export const DIRECTION_SLOP = 6;

/**
 * Mobile only: whether the top row should be hidden after scrolling from
 * `lastY` to `y`. Down past the row hides it, up brings it back, small moves
 * keep the current state, and it always shows near the top of the page.
 */
export function nextHideTopState(hidden: boolean, lastY: number, y: number): boolean {
  if (y <= TOP_ROW_H) return false;
  if (y - lastY > DIRECTION_SLOP) return true;
  if (lastY - y > DIRECTION_SLOP) return false;
  return hidden;
}

/**
 * The sticky <header> element. Sets `data-compact` once the page scrolls, so
 * the header's own markup (a Server Component) can shrink with
 * `group-data-[compact]/header:` classes, and `data-animating` for 400ms
 * around each change so transitions apply only then. The attribute is toggled
 * directly: scrolling never re-renders React.
 *
 * Layout never changes: this element keeps its expanded height (`className`
 * sets a min-height) and ignores pointer events, and only the visible bar inside
 * it (`[data-slot=header-bar]`, pointer-events auto) shrinks. A header that
 * resized in the page flow made Chrome's scroll anchoring push the scroll
 * position around — a smooth scroll to the top could stop ~20px short.
 *
 * Mobile (below 768, PR #4 final refinements): also sets `data-hide-top` while
 * scrolling down, so the header slides its top row (logo + CTA) away and
 * keeps the link row pinned; scrolling up removes it. Keyboard focus on
 * anything outside the link row (the logo, the CTA) removes it too.
 */
export function HeaderShell({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let compact = false;
    let hideTop = false;
    let lastY = window.scrollY;
    let frame = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const mobile = window.matchMedia?.("(max-width: 767.98px)");
    const setHideTop = (next: boolean) => {
      if (next === hideTop) return;
      hideTop = next;
      el.toggleAttribute("data-hide-top", next);
    };
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setHideTop(mobile?.matches ? nextHideTopState(hideTop, lastY, y) : false);
      lastY = y;
      const next = nextCompactState(compact, y);
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
    // Focus on the hidden row (logo, CTA) brings it back.
    const onFocusIn = (e: FocusEvent) => {
      if (!(e.target as Element).closest("[data-slot=primary-nav]")) setHideTop(false);
    };
    const onBreakpoint = () => update();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("focusin", onFocusIn);
    mobile?.addEventListener?.("change", onBreakpoint);
    return () => {
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("focusin", onFocusIn);
      mobile?.removeEventListener?.("change", onBreakpoint);
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, []);

  return (
    <header ref={ref} className={cn("group/header pointer-events-none sticky top-0 z-50", className)}>
      {children}
    </header>
  );
}
