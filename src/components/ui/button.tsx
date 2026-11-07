import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * MWDS Button (Figma: MWD x Shadcn DS → Button), shadcn/ui-compatible API.
 *
 * Only the variants/sizes verified against the MWDS component set are
 * implemented. Each state maps to the variable the MWDS variant binds:
 *   Primary   fill general/primary → hover unofficial/primary hover
 *   Secondary fill general/secondary (CMR: warm cream) → hover unofficial/secondary hover
 *   Focus     3px spread drop shadow in focus/ring (CMR: black), no offset
 *   Disabled  50% opacity
 * Sizes: Default h36 px md · Large h40 px xl · Extra Large h48 px 2xl, radius rounded-lg.
 */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-(--space-xs) whitespace-nowrap",
    "rounded-lg font-medium transition-colors outline-none",
    "focus-visible:ring-3 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover focus-visible:bg-secondary-hover",
      },
      size: {
        default: "h-9 px-(--space-md) py-(--space-xs) text-p-sm",
        lg: "h-10 px-(--space-xl) py-(--space-xs) text-p-sm",
        xl: "h-12 px-(--space-2xl) py-(--space-sm) text-p",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (e.g. a Next.js `Link`) with button styling. */
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
