"use client";

import { useEffect, useRef } from "react";
import { MOTION_EVENT, motionOff } from "@/lib/motion";
import { tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

export type HeroCircle = { text: string; size: number; left: number; top: number };

/**
 * The four About-hero circles (tie-dye fills from `@/lib/tints`).
 *
 * Motion is decorative and governed by the site's one motion preference
 * (`html[data-motion]`, src/lib/motion.ts: system reduced motion and the
 * footer's Pause motion): a slow float (CSS, transform only, `.about-float` in
 * cmr.css) and, on desktop pointers only, a restrained drift toward the cursor
 * (≤ 10px, deeper circles move a little more). Nothing moves when motion is
 * off. The list takes no pointer events, so it never interferes with text.
 */
export function HeroCircles({ circles }: { circles: HeroCircle[] }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia?.("(hover: hover) and (pointer: fine) and (min-width: 1280px)").matches) return;
    const reset = () => {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };
    const onMove = (e: PointerEvent) => {
      if (motionOff()) return reset();
      el.style.setProperty("--mx", String((e.clientX / window.innerWidth - 0.5) * 2));
      el.style.setProperty("--my", String((e.clientY / window.innerHeight - 0.5) * 2));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener(MOTION_EVENT, reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", reset);
      window.removeEventListener(MOTION_EVENT, reset);
    };
  }, []);

  return (
    <ul
      ref={ref}
      className={cn(
        "relative z-10 mt-12 -mb-10 grid max-w-[460px] grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-6 md:-mb-14 md:max-w-[560px]",
        "xl:pointer-events-none xl:absolute xl:top-4 xl:right-12 xl:mt-0 xl:mb-0 xl:block xl:h-[776px] xl:w-[440px] xl:max-w-none",
      )}
    >
      {circles.map((c, i) => (
        <li
          key={c.text}
          style={
            {
              ...tintVars(i),
              "--size": `${c.size}px`,
              "--left": `${c.left}px`,
              "--top": `${c.top}px`,
              "--depth": 6 + i * 2,
            } as React.CSSProperties
          }
          className={cn(
            "about-parallax",
            i % 2 === 1 && "mt-6 md:mt-8 xl:mt-0",
            "xl:absolute xl:left-(--left) xl:top-(--top) xl:w-(--size)",
          )}
        >
          <div
            style={{ "--float-delay": `${-i * 2.3}s`, "--float-dur": `${7 + i}s` } as React.CSSProperties}
            className={cn(
              "about-float relative isolate flex aspect-square w-full items-center justify-center overflow-hidden rounded-full px-[14%] text-center",
              // Same drop shadow as the site's map images (RunMap, FindTheMountain).
              "shadow-[0_8px_14px_rgba(65,65,65,0.28)]",
              "text-[15px] leading-[1.15] font-extrabold text-balance sm:text-[19px] md:text-[22px]",
              "xl:text-[22px] xl:leading-[1.1]",
              i === 3 && "xl:text-[24px]",
            )}
          >
            <span aria-hidden className="cmr-tie-dye absolute -z-10" />
            {c.text}
          </div>
        </li>
      ))}
    </ul>
  );
}
