"use client";

import { useState } from "react";
import { BrandBadge } from "@/components/brand/BrandBadge";
import { Segmented, Slider } from "@/components/brand/demos/controls";
import { LABEL, WEB_ONLY } from "@/components/brand/styles";
import { BADGE } from "@/lib/brand/spec";
import { cn } from "@/lib/utils";

type Ground = "white" | "black" | "muted" | "tint";

const GROUND: Record<Ground, string> = {
  white: "bg-background text-foreground",
  black: "science-dark bg-background text-foreground",
  muted: "bg-muted text-(--cmr-quiet-ink)",
  tint: "bg-(--cmr-tint-peach-wash) text-foreground",
};

/**
 * The badge on each ground, at any size, with its clear space drawn from the
 * artwork's own measurements (src/lib/brand/spec.ts BADGE): the dashed box
 * stands off the badge by x, the height of its letters. The badge is the
 * vector master (BrandBadge).
 */
export function LogoStage() {
  const [ground, setGround] = useState<Ground>("white");
  const [space, setSpace] = useState<"on" | "off">("on");
  const [width, setWidth] = useState(240);
  const { master: M, letters } = BADGE;
  const x = letters.h;

  return (
    <div data-slot="logo-stage" className="grid gap-6 lg:grid-cols-[1fr_280px] lg:gap-10 [.brand-print_&]:h-full [.brand-print_&]:grid-cols-1">
      <div className={cn("relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-xl p-8 ring-1 ring-foreground/15 ring-inset [.brand-print_&]:min-h-0", GROUND[ground])}>
        <div className="relative" style={{ width }}>
          <BrandBadge ink={ground === "black" ? "white" : "black"} className="w-full" />
          {space === "on" && (
            <>
              <svg aria-hidden viewBox={`0 0 ${M.w} ${M.h}`} className="pointer-events-none absolute inset-0 size-full overflow-visible" fill="none" stroke="currentColor">
                <rect x={-x} y={-x} width={M.w + 2 * x} height={M.h + 2 * x} strokeWidth="1" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
                {/* x, drawn once on each axis between the badge and the clear-space box. */}
                <line x1={M.w} y1={M.h / 2} x2={M.w + x} y2={M.h / 2} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <line x1={M.w / 2} y1={-x} x2={M.w / 2} y2={0} strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </svg>
              <span className={cn(LABEL, "absolute top-1/2 left-full ml-[8%] -translate-y-[150%] text-[11px]")}>x</span>
              <span className={cn(LABEL, "absolute bottom-full left-1/2 mb-[12%] ml-2 text-[11px]")}>x</span>
            </>
          )}
        </div>
        <p className={cn(LABEL, "absolute bottom-4 left-4 text-[11px] opacity-70")}>
          {width}px wide{space === "on" ? " · x = letter height" : ""}
        </p>
      </div>

      <div className={cn("flex flex-col gap-6", WEB_ONLY)}>
        <Segmented
          label="Ground"
          value={ground}
          onChange={setGround}
          options={[
            { value: "white", label: "White" },
            { value: "black", label: "Black" },
            { value: "muted", label: "Gray" },
            { value: "tint", label: "Tint" },
          ]}
        />
        <Segmented
          label="Clear space"
          value={space}
          onChange={setSpace}
          options={[
            { value: "on", label: "Show" },
            { value: "off", label: "Hide" },
          ]}
        />
        <Slider label="Width" value={width} min={48} max={320} step={4} onChange={setWidth} format={(v) => `${v}px`} />
        <p className="text-p-sm text-foreground/70">
          Drag the width down to {BADGE.minScreenPx}px, the smallest the badge is shown on screen, then below it to see where the ™ gives out.
        </p>
      </div>
    </div>
  );
}
