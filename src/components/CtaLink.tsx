import Link from "next/link";
import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * CMR call-to-action link for photographic and dark surfaces — the Hero
 * (1:395) and Just show up (1:305) CTA pairs. Not MWDS Button instances in
 * Figma, and MWDS has no on-photo variant, so this is a CMR composition on
 * MWDS tokens.
 *
 * Round 2 (Owner direction, 2026-11-08) replaced Figma's white / white-outline
 * pair with two solid buttons:
 *
 *   primary    black fill, white label   hover primary-hover (neutral 800) · active lifts to neutral 700 via 80% fill
 *   secondary  white fill, black label   hover cream (`secondary`) · active `border` grey
 *   focus      3px ring + 2px gap in the surface color (white ring, black gap on photos)
 *   disabled   `aria-disabled` → 50% opacity, not clickable (links cannot be `disabled`)
 *   press      1px nudge down (motion-safe)
 *
 * Both labels are solid on solid fills (21:1), so neither depends on the photo
 * behind it. Geometry (height, padding, type size) is set by the caller.
 * Radius 6 = `rounded-md`.
 */
export const ctaLinkVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-semibold outline-none",
    "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)",
    "motion-safe:transition-[background-color,color,transform] motion-safe:duration-150 motion-safe:active:translate-y-px",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary/80",
        secondary: "bg-primary-foreground text-primary hover:bg-secondary active:bg-border",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export type CtaLinkProps = ComponentProps<typeof Link> & VariantProps<typeof ctaLinkVariants>;

export function CtaLink({ variant, className, ...props }: CtaLinkProps) {
  return <Link data-slot="cta-link" className={cn(ctaLinkVariants({ variant }), className)} {...props} />;
}
