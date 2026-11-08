import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export type ArrowLinkProps = ComponentProps<typeof Link> & {
  /** Classes for the trailing arrow, e.g. `lg:hidden`-style responsive visibility. */
  arrowClassName?: string;
};

/**
 * Medium text link with a trailing 16px arrow, 6px gap — Figma "Link / See
 * the full schedule" (1:36), "Link / Explore all hills" (1:132) and "Run
 * details" (1:426). Inherits the surface's text color.
 *
 * Hover underlines the label and nudges the arrow 2px (motion-safe only);
 * focus shows the surface's 3px ring.
 */
export function ArrowLink({ className, arrowClassName, children, ...props }: ArrowLinkProps) {
  return (
    <Link
      className={cn(
        "group/arrow inline-flex items-center gap-1.5 rounded-xs font-medium outline-none",
        "underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowRightIcon
        className={cn(
          "size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover/arrow:translate-x-0.5",
          arrowClassName,
        )}
      />
    </Link>
  );
}
