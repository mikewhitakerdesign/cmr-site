import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Visible marker for content that is not yet verified (Owner decision D1,
 * 2026-11-07): Figma sample runs, club totals, and illustration figures are
 * shown for design review but must never read as confirmed facts. Not in the
 * Figma design — it disappears once the underlying record is `verified`.
 * Inherits the surface's text color.
 */
export function ProvisionalBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      data-provisional
      className={cn(
        "inline-flex items-center rounded-xs border border-current px-1.5 py-0.5",
        "font-mono text-p-mini uppercase tracking-[0.08em] whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}
