"use client";

import { useId, useState } from "react";
import { Segmented, Slider } from "@/components/brand/demos/controls";
import { LABEL } from "@/components/brand/styles";
import { DISPLAY, HEADING_ROLES, LAYOUT, type HeadingRoleKey } from "@/lib/brand/spec";
import { fluidAt } from "@/lib/fluid";
import { cn } from "@/lib/utils";

const KEYS = Object.keys(HEADING_ROLES) as HeadingRoleKey[];
/** The largest size the preview draws at; bigger roles are scaled to it and say so. */
const PREVIEW_MAX = 132;

/**
 * Set any line in any display role, at any viewport width. Size and line
 * height are computed by the site's own fluid function (src/lib/fluid.ts) from
 * the role's three anchor values, so the figures are what a browser would use.
 */
export function TypeTester() {
  const [role, setRole] = useState<HeadingRoleKey>("impactH2");
  const [text, setText] = useState<string>(HEADING_ROLES.impactH2.example);
  const [viewport, setViewport] = useState<number>(LAYOUT.anchors.desktop);
  const [alt, setAlt] = useState<"on" | "off">("on");
  const inputId = useId();
  const spec = HEADING_ROLES[role];
  const size = fluidAt(spec.size, viewport);
  const lineHeight = fluidAt(spec.lineHeight, viewport);
  const shown = Math.min(size, PREVIEW_MAX);
  const round = (n: number) => Math.round(n * 10) / 10;

  return (
    <div data-slot="type-tester" className="grid gap-6 lg:grid-cols-[1fr_300px] lg:gap-10">
      <div className="flex min-h-[320px] flex-col justify-between overflow-hidden rounded-xl p-6 ring-1 ring-foreground/15 ring-inset md:p-8">
        <p className={cn(LABEL, "flex flex-wrap justify-between gap-x-6 gap-y-1 text-foreground/65")}>
          <span>
            {spec.name} at {viewport}px
          </span>
          <span data-slot="type-tester-size" className="text-foreground">
            {round(size)} / {round(lineHeight)} px
          </span>
        </p>
        <p
          aria-live="polite"
          style={{
            fontSize: shown,
            lineHeight: lineHeight / size,
            letterSpacing: DISPLAY.tracking.headings,
            fontFeatureSettings: alt === "on" ? `"${DISPLAY.stylisticSet}" 1` : "normal",
          }}
          className="my-8 font-black break-words"
        >
          {text || " "}
        </p>
        <p className={cn(LABEL, "text-foreground/65")}>{size > PREVIEW_MAX ? `Shown at ${Math.round((shown / size) * 100)}% to fit this frame` : spec.use}</p>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <label htmlFor={inputId} className={cn(LABEL, "mb-2 block text-foreground/65")}>
            Your line
          </label>
          <input
            id={inputId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={60}
            className="h-10 w-full rounded-md border border-foreground bg-background px-3 text-p-sm outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)"
          />
        </div>
        <div>
          <p className={cn(LABEL, "mb-2 text-foreground/65")}>Role</p>
          <div role="group" aria-label="Role" className="flex flex-col border-t border-foreground/20">
            {KEYS.map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={role === k}
                onClick={() => {
                  setRole(k);
                  setText(HEADING_ROLES[k].example);
                }}
                className={cn(
                  "flex items-baseline justify-between border-b border-foreground/20 px-2 py-2 text-left text-p-sm outline-none",
                  "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset",
                  role === k ? "bg-foreground font-semibold text-background" : "hover:bg-foreground/10",
                )}
              >
                {HEADING_ROLES[k].name}
                <span className="font-mono text-[12px]">{HEADING_ROLES[k].size[2]}</span>
              </button>
            ))}
          </div>
        </div>
        <Slider label="Viewport" value={viewport} min={LAYOUT.minViewport} max={1600} step={1} onChange={setViewport} format={(v) => `${v}px`} />
        <Segmented
          label={`Alternates (${DISPLAY.stylisticSet})`}
          value={alt}
          onChange={setAlt}
          options={[
            { value: "on", label: "On" },
            { value: "off", label: "Off" },
          ]}
        />
      </div>
    </div>
  );
}
