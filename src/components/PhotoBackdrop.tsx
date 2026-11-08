import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Full-bleed photograph plus the CMR mesh-gradient wash, behind a section's
 * content — Figma Hero (1:377) and Just show up (1:296), which fill the frame
 * with a photo and the authored "Mesh gradient" shader on top.
 *
 * The gradient is the static shader baked to /home/mesh-gradient.png
 * (scripts/assets/bake-mesh-gradient.mjs) and stretched to the section, which
 * is exact because the mesh is defined in normalized coordinates. No WebGPU,
 * no client JavaScript (Owner decision D2).
 *
 * The parent section must establish a stacking context (`isolate`); the
 * backdrop sits behind it at `-z-10`. Decorative: the photo carries no
 * information the section text doesn't.
 */
export function PhotoBackdrop({
  image,
  gradientOpacity,
  className,
  children,
}: {
  /** The photo, absolutely filling the backdrop (next/image `fill` or a <picture>). */
  image: ReactNode;
  /** Layer opacity from Figma: 20% on the hero, 50% on Just show up. */
  gradientOpacity: "20" | "50";
  className?: string;
  /** Optional extra layers above the gradient (e.g. a legibility shade). */
  children?: ReactNode;
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {image}
      <div
        data-slot="mesh-gradient"
        className={cn(
          "absolute inset-0 bg-[url(/home/mesh-gradient.png)] bg-[length:100%_100%] bg-no-repeat",
          gradientOpacity === "20" ? "opacity-20" : "opacity-50",
        )}
      />
      {children}
    </div>
  );
}
