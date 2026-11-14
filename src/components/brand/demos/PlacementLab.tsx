"use client";

import { useState } from "react";
import { Tee, type TeeArt, type TeeGround, type TeeView } from "@/components/brand/Tee";
import { Segmented } from "@/components/brand/demos/controls";

const ART: Record<TeeView, { value: TeeArt; label: string }[]> = {
  front: [
    { value: "badge-chest", label: "Badge, left chest" },
    { value: "none", label: "Zones only" },
  ],
  back: [
    { value: "wordmark-back", label: "Wordmark" },
    { value: "expression-back", label: "Expression" },
    { value: "none", label: "Zones only" },
  ],
};

/**
 * Try the real marks in the proposed placement zones, front and back, on a
 * white, black or tie-dye ground. A diagram for discussion: nothing here is
 * production artwork or a garment specification.
 */
export function PlacementLab() {
  const [view, setView] = useState<TeeView>("front");
  const [ground, setGround] = useState<TeeGround>("white");
  const [art, setArt] = useState<TeeArt>("badge-chest");

  const changeView = (v: TeeView) => {
    setView(v);
    setArt(ART[v][0].value);
  };

  return (
    <div data-slot="placement-lab" className="grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-10">
      <div className="@container rounded-xl bg-muted p-6 md:p-10">
        <Tee view={view} ground={ground} art={art} />
        <p className="mt-6 flex justify-center">
          <span data-slot="concept-label" className="inline-flex items-center rounded-xs border border-foreground px-1.5 py-0.5 font-mono text-[11px] leading-4 tracking-[0.08em] uppercase">Concept</span>
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <Segmented
          label="View"
          value={view}
          onChange={changeView}
          options={[
            { value: "front", label: "Front" },
            { value: "back", label: "Back" },
          ]}
        />
        <Segmented label="Artwork" value={art} onChange={setArt} options={ART[view]} />
        <Segmented
          label="Ground"
          value={ground}
          onChange={setGround}
          options={[
            { value: "white", label: "White" },
            { value: "black", label: "Black" },
            { value: "tie-dye", label: "Tie-dye" },
          ]}
        />
        <p className="text-p-sm text-foreground/70">
          Zone A is the left chest. Zone B is the upper back. Zone C is the large back graphic. Sizes are set with the vendor at proof, not here.
        </p>
      </div>
    </div>
  );
}
