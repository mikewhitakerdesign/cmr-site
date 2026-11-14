"use client";

import { useState } from "react";
import { ContourField } from "@/components/ContourField";
import { Segmented } from "@/components/brand/demos/controls";
import { LABEL } from "@/components/brand/styles";
import { TopoPattern } from "@/components/home/TopoPattern";
import { CONTOUR } from "@/lib/brand/spec";
import { cn } from "@/lib/utils";

const PRESETS = [
  { id: "hero", name: "Hill heroes", scale: CONTOUR.settings[0].scale, levels: CONTOUR.settings[0].levels, ground: "black" },
  { id: "flat", name: "Flat is a state of mind", scale: CONTOUR.settings[1].scale, levels: CONTOUR.settings[1].levels, ground: "white" },
  { id: "default", name: "Component default", scale: CONTOUR.defaults.scale, levels: CONTOUR.defaults.levels, ground: "white" },
] as const;
type PresetId = (typeof PRESETS)[number]["id"];

/**
 * The live contour field (the site's ContourField) in the three settings it
 * ships with. It obeys the site's motion preference: with motion paused or
 * reduced it holds one still frame, and without WebGL it shows the static
 * pattern, exactly as on the hill pages.
 */
export function ContourLab() {
  const [id, setId] = useState<PresetId>("hero");
  const p = PRESETS.find((x) => x.id === id)!;
  const black = p.ground === "black";

  return (
    <div data-slot="contour-lab">
      <div
        className={cn(
          "relative isolate h-[360px] overflow-hidden rounded-xl ring-1 ring-foreground/15 ring-inset md:h-[440px]",
          black ? "bg-primary text-primary-foreground" : "bg-background text-foreground",
        )}
      >
        <div className="absolute inset-0 -z-10">
          <ContourField
            // A new setting is a new field.
            key={id}
            className={black ? "bg-primary text-(--cmr-quiet-edge)" : "bg-background text-(--cmr-contour-on-light)"}
            scale={p.scale}
            levels={p.levels}
            seed={4}
            fallback={<TopoPattern className={black ? "text-(--cmr-contour-on-dark)" : undefined} />}
          />
        </div>
        <p className="pointer-events-none absolute inset-x-6 bottom-6 text-[clamp(36px,7vw,88px)] leading-[0.92] font-black tracking-[-0.045em]">
          {black ? "CRICKET HILL" : "FLAT IS A STATE OF MIND."}
        </p>
        <p className={cn(LABEL, "absolute top-4 left-4 text-[11px] opacity-75")}>
          scale {p.scale} · levels {p.levels} · {CONTOUR.lineWidthPx}px line
        </p>
      </div>
      <Segmented className="mt-6" label="Setting" value={id} onChange={setId} options={PRESETS.map((x) => ({ value: x.id, label: x.name }))} />
    </div>
  );
}
