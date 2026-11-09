"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Full turns each digit makes before landing (slot-machine feel, not a long spin). */
const LOOPS = 1;
const DIGITS = "0123456789";

type Phase = "settled" | "armed" | "rolling";

/** Position (in digit cells) of the final digit in its strip. */
export const finalIndex = (digit: number) => LOOPS * 10 + digit;

/** Where a digit counting down from `from` starts: one turn above its final position. */
export const countdownStart = (from: number) => (LOOPS + 1) * 10 + from;

/** Roll timing (PR #4 final pass: a little slower than the Round 2 1.1–1.6 s). */
export const rollDuration = (order: number) => 1500 + order * 200;
export const rollDelay = (order: number) => order * 80;

/**
 * A displayed figure ("132K", "2.5K", "240") whose digits roll vertically,
 * odometer-style, the first time it scrolls into view, then stop for good.
 *
 *   - Server render and no-JS: the final value, static.
 *   - Reduced motion, or already on screen at load: stays static (no flash of
 *     zeros, no motion).
 *   - Otherwise: on hydration the digits are parked at 0 while off-screen, and
 *     roll to their values once 40% of the figure is visible. Each digit makes
 *     one turn; durations stagger left to right (≈ 1.5–2.1 s since the PR #4
 *     final pass), ease-out.
 *   - `from` (same format as `value`): count DOWN instead. Each digit that
 *     differs starts one turn above and spins down to its final digit; the
 *     others stay put. (The club totals' moon distance.)
 *   - `watch="section"`: start when the enclosing <section> comes into view
 *     (25%), so several figures in one section roll together.
 *
 * Only transforms animate, so there is no layout shift: each digit cell is
 * sized by its final digit. Assistive technology gets the final value as text
 * (`srLabel`); the moving strips are aria-hidden.
 */
export function Odometer({
  value,
  from,
  srLabel,
  className,
  watch = "self",
}: {
  value: string;
  from?: string;
  srLabel?: string;
  className?: string;
  watch?: "self" | "section";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<Phase>("settled");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const target = watch === "section" ? (el.closest("section") ?? el) : el;
    let first = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false;
          if (entry.isIntersecting) io.disconnect(); // visible at load: leave it be
          else setPhase("armed");
          return;
        }
        if (entry.isIntersecting) {
          io.disconnect();
          setPhase("rolling");
        }
      },
      { threshold: watch === "section" ? 0.25 : 0.4 },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [watch]);

  // A countdown only makes sense from a value of the same shape.
  const start = from && from.length === value.length ? from : undefined;

  let digitIndex = 0;
  return (
    <span ref={ref} data-odometer={phase} className={cn("inline-flex items-start leading-none", className)}>
      <span className="sr-only">{srLabel ?? value}</span>
      <span aria-hidden className="inline-flex items-start">
        {[...value].map((ch, i) => {
          const digit = DIGITS.indexOf(ch);
          if (digit < 0)
            return (
              <span key={i} className="block h-[1em]">
                {ch}
              </span>
            );
          const fromDigit = start ? DIGITS.indexOf(start[i]) : -1;
          const parked = start ? (fromDigit >= 0 && fromDigit !== digit ? countdownStart(fromDigit) : finalIndex(digit)) : 0;
          const moves = parked !== finalIndex(digit);
          const order = moves ? digitIndex++ : 0;
          const target = phase === "armed" ? parked : finalIndex(digit);
          const length = Math.max(parked, finalIndex(digit)) + 1;
          return (
            <span key={i} className="relative block h-[1em] overflow-y-clip">
              <span className="invisible block">{ch}</span>
              <span
                className="absolute inset-x-0 top-0 flex flex-col items-center"
                style={{
                  transform: `translateY(-${target}em)`,
                  transition:
                    phase === "rolling" && moves
                      ? `transform ${rollDuration(order)}ms cubic-bezier(0.16, 1, 0.3, 1) ${rollDelay(order)}ms`
                      : "none",
                }}
              >
                {Array.from({ length }, (_, k) => (
                  <span key={k} className="block h-[1em]">
                    {k % 10}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
