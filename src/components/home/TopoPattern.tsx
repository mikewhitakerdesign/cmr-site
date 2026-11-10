import { cn } from "@/lib/utils";

/**
 * The "Flat is a state of mind" topographic background: the approved line
 * pattern as vector paths (public/home/topo.svg, traced from the Figma fill),
 * drawn at a constant 1.5px in 20% foreground — the original's color — and
 * cropped like `object-cover`. Static and decorative; a Server Component with
 * no client JavaScript.
 *
 * (Round 2 added a pointer-following liquid distortion here; Round 2.1 removed
 * it at the Owner's direction. No replacement animation.)
 */
export function TopoPattern({ className }: { className?: string } = {}) {
  return (
    <svg
      aria-hidden
      data-slot="topo-pattern"
      viewBox="0 0 1024 1024"
      preserveAspectRatio="xMidYMid slice"
      // Line color is the text color; hill pages without a photograph draw it white on black.
      className={cn("absolute inset-0 size-full text-foreground/20", className)}
    >
      <g stroke="currentColor" strokeWidth={1.5}>
        <use href="/home/topo.svg#topo" />
      </g>
    </svg>
  );
}
