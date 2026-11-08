"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Full turns each digit makes before landing (slot-machine feel, not a long spin). */
const LOOPS = 1;
const DIGITS = "0123456789";

type Phase = "settled" | "armed" | "rolling";

/** Position (in digit cells) of the final digit in its strip. */
export const finalIndex = (digit: number) => LOOPS * 10 + digit;

/**
 * A displayed figure ("132K", "2.5K", "240") whose digits roll vertically,
 * odometer-style, the first time it scrolls into view, then stop for good.
 *
 *   - Server render and no-JS: the final value, static.
 *   - Reduced motion, or already on screen at load: stays static (no flash of
 *     zeros, no motion).
 *   - Otherwise: on hydration the digits are parked at 0 while off-screen, and
 *     roll to their values once 40% of the figure is visible. Each digit makes
 *     one turn; durations stagger left to right (≈1.1–1.6s), ease-out.
 *
 * Only transforms animate, so there is no layout shift: each digit cell is
 * sized by its final digit. Assistive technology gets the final value as text
 * (`srLabel`); the moving strips are aria-hidden.
 */
export function Odometer({ value, srLabel, className }: { value: string; srLabel?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<Phase>("settled");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
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
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
          const order = digitIndex++;
          const target = phase === "armed" ? 0 : finalIndex(digit);
          return (
            <span key={i} className="relative block h-[1em] overflow-y-clip">
              <span className="invisible block">{ch}</span>
              <span
                className="absolute inset-x-0 top-0 flex flex-col items-center"
                style={{
                  transform: `translateY(-${target}em)`,
                  transition:
                    phase === "rolling"
                      ? `transform ${1100 + order * 160}ms cubic-bezier(0.16, 1, 0.3, 1) ${order * 60}ms`
                      : "none",
                }}
              >
                {Array.from({ length: finalIndex(digit) + 1 }, (_, k) => (
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
