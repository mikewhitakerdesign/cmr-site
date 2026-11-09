"use client";

import { useEffect, useRef, useState } from "react";
import { ContourField } from "@/components/ContourField";

/**
 * The /hills rows' hover fill (PR #4 final pass, Owner direction 2026-11-09):
 * ONE shared contour layer behind the whole list, revealed only through the
 * active row. Place it as a child of a `relative isolate` wrapper around the
 * list; rows are `li[data-hill]`.
 *
 *   - One WebGL instance for every row, created on the first hover or keyboard
 *     focus and paused whenever no row is active (no GPU work while hidden).
 *   - The active row is cut out with `clip-path: inset(…)`, which glides to
 *     the next row as the pointer or focus moves; the layer fades in and out.
 *   - Subtle: the "Flat is a state of mind" motion, lighter (its grey lines at
 *     60% opacity, smaller landforms).
 *   - Reduced motion: one still frame and no glide or fade. Software WebGL:
 *     one still frame (ContourField). Touch-only devices: focus only.
 *   - Decorative: aria-hidden, no pointer events; the row's link, underline,
 *     ↗ nudge and focus ring are unchanged.
 */
export function DirectoryHoverField() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [clip, setClip] = useState<string | undefined>();

  useEffect(() => {
    const layer = ref.current;
    const wrap = layer?.parentElement;
    if (!layer || !wrap) return;
    const canHover = window.matchMedia?.("(hover: hover)").matches ?? false;
    let hovered: HTMLElement | null = null;
    let focused: HTMLElement | null = null;

    const update = () => {
      const row = hovered ?? focused;
      if (!row) return setClip(undefined);
      const w = wrap.getBoundingClientRect();
      const r = row.getBoundingClientRect();
      setMounted(true);
      setClip(`inset(${r.top - w.top}px ${w.right - r.right}px ${w.bottom - r.bottom}px ${r.left - w.left}px)`);
    };
    const rowOf = (t: EventTarget | null) => (t instanceof Element ? (t.closest("li[data-hill]") as HTMLElement | null) : null);

    const over = (e: PointerEvent) => {
      hovered = rowOf(e.target);
      update();
    };
    const leave = () => {
      hovered = null;
      update();
    };
    const focusIn = (e: FocusEvent) => {
      focused = rowOf(e.target);
      update();
    };
    const focusOut = (e: FocusEvent) => {
      if (!wrap.contains(e.relatedTarget as Node | null)) focused = null;
      update();
    };
    if (canHover) {
      wrap.addEventListener("pointerover", over);
      wrap.addEventListener("pointerleave", leave);
    }
    wrap.addEventListener("focusin", focusIn);
    wrap.addEventListener("focusout", focusOut);
    window.addEventListener("resize", update);
    return () => {
      wrap.removeEventListener("pointerover", over);
      wrap.removeEventListener("pointerleave", leave);
      wrap.removeEventListener("focusin", focusIn);
      wrap.removeEventListener("focusout", focusOut);
      window.removeEventListener("resize", update);
    };
  }, []);

  const active = clip !== undefined;
  return (
    <div
      ref={ref}
      aria-hidden
      data-slot="directory-hover-field"
      data-active={active || undefined}
      style={{ clipPath: clip ?? "inset(50% 0 50% 0)" }}
      className="pointer-events-none absolute inset-0 -z-10 opacity-0 motion-safe:transition-[opacity,clip-path] motion-safe:duration-300 motion-safe:ease-out data-active:opacity-60"
    >
      {mounted && <ContourField className="bg-background text-(--cmr-contour-on-light)" scale={300} levels={8} seed={5} paused={!active} />}
    </div>
  );
}
