import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const mask: CSSProperties = {
  maskImage: "url(/brand/cmr-wordmark.svg)",
  maskSize: "100% 100%",
  maskRepeat: "no-repeat",
};

/**
 * The CMR wordmark: "CHICAGO / MOUNTAIN / RUNNERS™" as one chunky block —
 * traced from the image the Owner attached for the footer (Chicago Hills
 * refinement pass, 2026-11-08; scripts/assets/trace-wordmark.mjs →
 * public/brand/cmr-wordmark.svg). Drawn as a mask over the current text color,
 * so it takes the color of its surroundings. Fixed proportions (1858:888).
 */
export function CmrWordmark({ className, decorative = false }: { className?: string; decorative?: boolean }) {
  return (
    <span
      // Decorative when its container already carries the name (e.g. a labelled link).
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Chicago Mountain Runners"}
      aria-hidden={decorative || undefined}
      data-slot="cmr-wordmark"
      style={mask}
      className={cn("block aspect-[1858/888] bg-current", className)}
    />
  );
}
