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
 * pair with two solid buttons; Round 2.1 gave every variant a 1px border and made
 * hover flip each button to its opposite treatment:
 *
 *   primary    black fill, white label   hover → white fill, black label  · active neutral 100 grey
 *   secondary  white fill, black label   hover → black fill, white label  · active neutral 800
 *   outline    transparent, 1px black    hover → black fill, white label  · active neutral 800
 *              (the header's "Join the club"; for light surfaces)
 *   focus      3px ring + 2px gap in the surface color (white ring, black gap on photos)
 *   disabled   `aria-disabled` → 50% opacity, not clickable (links cannot be `disabled`)
 *   press      1px nudge down (motion-safe)
 *
 * The 1px border is the fill's own color at rest (invisible), and the label
 * color's opposite after the flip, so the flipped button keeps a crisp edge on
 * any surface (a white hover on pale sky, a black hover on a black section).
 * Every state is solid-on-solid (21:1), independent of the photo behind it.
 * Geometry (height, type size) is set by the caller; callers trim 1px from
 * horizontal padding where they match a Figma width. Radius 6 = `rounded-md`.
 */
export const ctaLinkVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md border font-semibold outline-none",
    "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)",
    "motion-safe:transition-[background-color,color,border-color,transform] motion-safe:duration-150 motion-safe:active:translate-y-px",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary:
          "border-primary bg-primary text-primary-foreground hover:border-primary hover:bg-primary-foreground hover:text-primary active:border-border active:bg-border active:text-primary",
        secondary:
          "border-primary-foreground bg-primary-foreground text-primary hover:border-primary-foreground hover:bg-primary hover:text-primary-foreground active:border-primary-hover active:bg-primary-hover active:text-primary-foreground",
        outline:
          "border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground active:bg-primary-hover active:text-primary-foreground",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export type CtaLinkProps = ComponentProps<typeof Link> & VariantProps<typeof ctaLinkVariants>;

export function CtaLink({ variant, className, ...props }: CtaLinkProps) {
  return <Link data-slot="cta-link" className={cn(ctaLinkVariants({ variant }), className)} {...props} />;
}
