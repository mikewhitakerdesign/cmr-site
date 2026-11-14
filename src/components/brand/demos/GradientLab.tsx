"use client";

import Image from "next/image";
import { useState } from "react";
import { Slider } from "@/components/brand/demos/controls";
import { LABEL } from "@/components/brand/styles";
import { MESH_OPACITY } from "@/lib/brand/spec";
import { cn } from "@/lib/utils";

const STOPS = [
  { value: 0, label: "None" },
  { value: MESH_OPACITY.hero, label: "Hero" },
  { value: MESH_OPACITY.justShowUp, label: "Just show up" },
];

/**
 * The mesh gradient over the homepage hero photograph, at any opacity. The two
 * values in production are marked; everything else is here to show why they
 * were chosen.
 */
export function GradientLab() {
  const [opacity, setOpacity] = useState<number>(MESH_OPACITY.hero);
  const established = opacity === MESH_OPACITY.hero || opacity === MESH_OPACITY.justShowUp;

  return (
    <div data-slot="gradient-lab" className="grid gap-6 lg:grid-cols-[1fr_280px] lg:gap-10">
      <div className="relative isolate aspect-[16/9] overflow-hidden rounded-xl bg-primary">
        <Image src="/home/hero.jpg" alt="" fill sizes="(min-width: 1024px) 900px, 100vw" className="object-cover object-[50%_72%]" />
        <div aria-hidden style={{ opacity: opacity / 100 }} className="absolute inset-0 bg-[url(/home/mesh-gradient.png)] bg-[length:100%_100%]" />
        <p className={cn(LABEL, "absolute top-4 left-4 text-[11px] text-primary-foreground")}>
          Gradient {opacity}% · {established ? "in production" : "not in use"}
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <Slider label="Gradient opacity" value={opacity} min={0} max={100} step={5} onChange={setOpacity} format={(v) => `${v}%`} />
        <div role="group" aria-label="Production values" className="flex flex-wrap gap-2">
          {STOPS.map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={opacity === s.value}
              onClick={() => setOpacity(s.value)}
              className={cn(
                "h-9 rounded-md border border-foreground px-3 text-p-sm font-medium outline-none",
                "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)",
                opacity === s.value ? "bg-foreground text-background" : "hover:bg-foreground/10",
              )}
            >
              {s.label} {s.value}%
            </button>
          ))}
        </div>
        <p className="text-p-sm text-foreground/70">Past 50% the photograph stops being a place and becomes a color field. That is the ceiling.</p>
      </div>
    </div>
  );
}
