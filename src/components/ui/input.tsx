import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * MWDS Input (Figma: MWD x Shadcn DS → Input, Size=Large, Roundness=Default),
 * shadcn/ui-compatible API (a styled native <input>).
 *
 * State → MWDS variable mapping (verified against the component set):
 *   Empty/Value   fill general/input, stroke general/border, shadow xs, text general/foreground
 *   Placeholder   text general/muted foreground
 *   Focus         stroke unofficial/border 4 + 3px focus/ring (CMR: black)
 *   Error         stroke unofficial/destructive border (aria-invalid, or :user-invalid after interaction)
 *   Error Focus   + 3px focus/ring error
 *   Disabled      50% opacity
 * Padding: px md, py "hacks to fit scale/9p5" (9.5px) — the MWDS value, kept verbatim.
 */
export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-lg border border-border bg-input shadow-xs",
        "px-(--space-md) py-(--mwd-space-hacks-to-fit-scale-9p5)",
        "text-p-sm text-foreground placeholder:text-muted-foreground",
        "transition-[color,box-shadow,border-color] outline-none",
        "focus-visible:border-border-4 focus-visible:ring-3 focus-visible:ring-ring",
        "aria-invalid:border-destructive-border aria-invalid:focus-visible:ring-ring-error",
        "user-invalid:border-destructive-border user-invalid:focus-visible:ring-ring-error",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
