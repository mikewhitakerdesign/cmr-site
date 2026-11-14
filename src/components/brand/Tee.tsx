import { useId, type ReactNode } from "react";
import { BrandBadge } from "@/components/brand/BrandBadge";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { LABEL } from "@/components/brand/styles";
import { tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

/**
 * A T-shirt as a diagram, for showing where artwork could sit. It is a
 * schematic, not a garment spec and not a mockup of a product: the outline is
 * generic, nothing is to scale, and every use in the manual is labelled as a
 * concept. The marks drawn on it are the real, unmodified CMR artwork.
 */
export type TeeView = "front" | "back";
export type TeeGround = "white" | "black" | "tie-dye";
export type TeeArt = "badge-chest" | "wordmark-back" | "expression-back" | "none";

const W = 400;
const H = 440;
const BODY = "L340 55 L388 132 L334 164 L314 132 L314 412 L86 412 L86 132 L66 164 L12 132 L60 55 Z";
const OUTLINE: Record<TeeView, string> = {
  front: `M132 30 C150 62 250 62 268 30 ${BODY}`,
  back: `M132 30 C160 42 240 42 268 30 ${BODY}`,
};

export function Tee({
  view,
  ground = "white",
  art = "none",
  zones = true,
  className,
  caption,
}: {
  view: TeeView;
  ground?: TeeGround;
  art?: TeeArt;
  /** Draw the dashed placement zones. */
  zones?: boolean;
  className?: string;
  caption?: ReactNode;
}) {
  const clip = `tee-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const dark = ground === "black";
  const ink = dark ? "text-primary-foreground" : "text-primary";

  return (
    <figure data-slot="brand-tee" data-view={view} className={className}>
      <div className={cn("relative mx-auto w-full max-w-[420px]", ink)} style={{ aspectRatio: `${W} / ${H}` }}>
        <svg aria-hidden viewBox={`0 0 ${W} ${H}`} className="absolute size-0">
          <defs>
            <clipPath id={clip} clipPathUnits="objectBoundingBox">
              <path d={OUTLINE[view]} transform={`scale(${1 / W} ${1 / H})`} />
            </clipPath>
          </defs>
        </svg>
        {/* The cloth. */}
        <div style={{ clipPath: `url(#${clip})`, ...(ground === "tie-dye" ? tintVars(2) : {}) }} className={cn("absolute inset-0 isolate overflow-hidden", dark ? "bg-primary" : "bg-background")}>
          {ground === "tie-dye" && <span aria-hidden className="cmr-tie-dye absolute -z-10" />}
        </div>
        <svg aria-hidden viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full text-primary" fill="none" stroke="currentColor" strokeLinejoin="round">
          <path d={OUTLINE[view]} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
          {zones && view === "front" && <rect x="222" y="104" width="66" height="44" strokeWidth="1" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" className={dark ? "text-primary-foreground" : undefined} stroke="currentColor" />}
          {zones && view === "back" && (
            <>
              <rect x="126" y="84" width="148" height="78" strokeWidth="1" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" className={dark ? "text-primary-foreground" : undefined} stroke="currentColor" />
              <rect x="112" y="178" width="176" height="190" strokeWidth="1" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" className={dark ? "text-primary-foreground" : undefined} stroke="currentColor" opacity="0.5" />
            </>
          )}
        </svg>

        {/* Artwork, placed in percentages of the diagram. */}
        {view === "front" && art === "badge-chest" && (
          <div className="absolute" style={{ left: "57%", top: "24.6%", width: "13.5%" }}>
            <BrandBadge ink={dark ? "white" : "black"} className="w-full" decorative />
          </div>
        )}
        {view === "back" && art === "wordmark-back" && (
          <div className="absolute" style={{ left: "34%", top: "21.5%", width: "32%" }}>
            <BrandWordmark decorative className="w-full" />
          </div>
        )}
        {view === "back" && art === "expression-back" && (
          <p aria-hidden className="absolute text-center font-black tracking-[-0.045em] uppercase" style={{ left: "29%", top: "44%", width: "42%", fontSize: "clamp(14px, 4.2cqw, 30px)", lineHeight: 0.9 }}>
            Hills
            <br />
            on
            <br />
            repeat.
          </p>
        )}

        {zones && view === "front" && <span className={cn(LABEL, "absolute text-[10px]")} style={{ left: "57%", top: "35%" }}>A</span>}
        {zones && view === "back" && (
          <>
            <span className={cn(LABEL, "absolute text-[10px]")} style={{ left: "70%", top: "20%" }}>B</span>
            <span className={cn(LABEL, "absolute text-[10px] opacity-60")} style={{ left: "73.5%", top: "41%" }}>C</span>
          </>
        )}
      </div>
      {caption && <figcaption className="mt-3 text-center text-p-sm text-muted-foreground [.brand-print_&]:text-[13px] [.brand-print_&]:leading-[18px]">{caption}</figcaption>}
    </figure>
  );
}
