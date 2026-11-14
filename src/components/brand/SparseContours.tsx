import { SPARSE_CONTOURS, SPARSE_CONTOURS_VIEWBOX } from "@/components/brand/sparse-contours";
import { cn } from "@/lib/utils";

/**
 * The sparse contour artwork, still: a frame of the same field the animated
 * contour backgrounds draw (scripts/assets/build-sparse-contours.mjs), for the
 * Brand Standards' static contour examples and the PDF (Owner final review,
 * 2026-11-14: fewer lines, wider spacing, like the animated treatment).
 *
 * Lines are the text color, a constant hairline at any size (non-scaling
 * stroke), cropped like `object-cover`. Decorative; a Server Component.
 * Pass `position` to move the crop, so neighbouring examples don't repeat, and
 * `area` (a viewBox inside the 1600 × 1200 field) to show part of the field, so
 * a small tile keeps the same spacing as a large one.
 */
export function SparseContours({
  className,
  strokeWidth = 1,
  position = "xMidYMid",
  area = SPARSE_CONTOURS_VIEWBOX,
}: {
  className?: string;
  strokeWidth?: number;
  position?: "xMidYMid" | "xMinYMin" | "xMaxYMax" | "xMinYMax" | "xMaxYMin";
  area?: string;
}) {
  return (
    <svg
      aria-hidden
      data-slot="sparse-contours"
      viewBox={area}
      preserveAspectRatio={`${position} slice`}
      className={cn("pointer-events-none absolute inset-0 size-full text-(--cmr-quiet-edge)", className)}
    >
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {SPARSE_CONTOURS.map((d, i) => (
          <path key={i} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}
