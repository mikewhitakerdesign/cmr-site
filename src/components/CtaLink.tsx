import Link from "next/link";
import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * CMR call-to-action link — the Hero (1:395) and Just show up (1:305) CTA pairs
 * and the header's "Join the club". Not MWDS Button instances in Figma, and MWDS
 * has no on-photo variant, so this is a CMR composition on MWDS tokens.
 *
 * Round 2 (Owner direction, 2026-11-08) replaced Figma's white / white-outline
 * pair with two solid buttons; Round 2.1 made hover flip each button to its
 * opposite; the final refinement removed the borders from the filled buttons:
 *
 *   primary    black fill, white label   hover → white fill, black label  · active neutral 100 grey
 *   secondary  white fill, black label   hover → black fill, white label  · active neutral 800
 *   outline    transparent, 1px black    hover → black fill, white label  · active neutral 800
 *              (the header's "Join the club"; for light surfaces)
 *   outlineOnDark  transparent, 1px white  hover → white fill, black label  · active neutral 100
 *              (black surfaces: hill pages' "Run it with us" and the /hills closing band)
 *   focus      3px ring + 2px gap in the surface color (white ring, black gap on photos)
 *   disabled   `aria-disabled` → 50% opacity, not clickable (links cannot be `disabled`)
 *   press      1px nudge down (motion-safe)
 *
 * Only the outlines have a border (1px, matching the header bar's bottom rule); the
 * filled variants have none, at rest or on hover. Every state is solid-on-solid
 * (21:1), independent of the photo behind it. Geometry (height, padding, type
 * size) is set by the caller. Radius 6 = `rounded-md`.
 */
export const ctaLinkVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-semibold outline-none",
    "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)",
    "motion-safe:transition-[background-color,color,border-color,transform] motion-safe:duration-150 motion-safe:active:translate-y-px",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary active:bg-border active:text-primary",
        secondary:
          "bg-primary-foreground text-primary hover:bg-primary hover:text-primary-foreground active:bg-primary-hover active:text-primary-foreground",
        outline:
          "border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground active:bg-primary-hover active:text-primary-foreground",
        // Chicago Hills: the outline's mirror for black surfaces (Hill Details "Run it with us").
        outlineOnDark:
          "border border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary active:bg-border active:text-primary",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export type CtaLinkProps = ComponentProps<typeof Link> & VariantProps<typeof ctaLinkVariants>;

export function CtaLink({ variant, className, ...props }: CtaLinkProps) {
  return <Link data-slot="cta-link" className={cn(ctaLinkVariants({ variant }), className)} {...props} />;
}
