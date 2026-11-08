import Link from "next/link";
import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * CMR call-to-action link for dark and photographic surfaces — Figma
 * "Action / Find a Run" (white fill) and "Action / Become a Mtn Runner" /
 * "Action / Join Us" (2px white outline) in the Hero (1:395) and Just show up
 * (1:305) sections. These are not MWDS Button instances in Figma and MWDS has
 * no inverse-on-photo variant, so this is a CMR composition on MWDS tokens
 * (same reasoning as the header's Join Us CTA, foundation discrepancy 6).
 *
 * Geometry (height, padding, type size) differs per section and breakpoint
 * and is set by the caller. Radius 6 = `rounded-md`.
 *
 * States (not drawn in Figma; reviewed choices, see the Work Item):
 *   solid    white → hover cream (`secondary`) → active `border` grey
 *   outline  white outline on 50% black → hover inverts to white fill, black label → active grey fill
 *   focus    3px ring + 2px gap in the surface color (white ring, black gap on photos)
 *   disabled `aria-disabled` → 50% opacity, not clickable (links cannot be `disabled`)
 */
export const ctaLinkVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-semibold outline-none",
    "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)",
    "motion-safe:transition-colors motion-safe:duration-150",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        solid: "bg-primary-foreground text-primary hover:bg-secondary active:bg-border",
        outline: [
          // Translucent black fill (not in Figma, which has none): over pale sky the
          // white label measured ~1.5:1. 50% black is the smallest fill that keeps the
          // label ≥ 4.5:1 over the brightest sky in both photos (contrast test in
          // tests/e2e/home.spec.ts). Reviewed deviation, Owner decision D6.
          "border-2 border-primary-foreground bg-primary/50 text-primary-foreground",
          "hover:bg-primary-foreground hover:text-primary",
          "active:border-border active:bg-border active:text-primary",
        ],
      },
    },
    defaultVariants: { variant: "solid" },
  },
);

export type CtaLinkProps = ComponentProps<typeof Link> & VariantProps<typeof ctaLinkVariants>;

export function CtaLink({ variant, className, ...props }: CtaLinkProps) {
  return <Link data-slot="cta-link" className={cn(ctaLinkVariants({ variant }), className)} {...props} />;
}
