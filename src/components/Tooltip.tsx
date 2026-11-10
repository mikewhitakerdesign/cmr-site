import { cloneElement, useId, type ReactElement } from "react";
import { cn } from "@/lib/utils";

/**
 * A small supplementary tooltip for a link or button. CSS only, no dependency,
 * no script: it shows on mouse hover (after a short delay, and only on devices
 * that really hover, so touch screens never get a stuck overlay) and on
 * keyboard focus (`:focus-visible`). Below the `sm` breakpoint it is not rendered at all (phones are touch,
 * and a hidden absolute box would otherwise widen the page); `aria-describedby` still resolves. It is `pointer-events-none`, so it never
 * intercepts a click, and it is described to assistive technology through
 * `aria-describedby` on the control (a hidden description is still read), so the
 * control stays understandable without it.
 *
 * It lives outside the control, as a sibling in the wrapper, so it never
 * becomes part of the control's accessible name. Black fill, white text, like the CMR buttons.
 * `align` picks the edge it hangs from, so a tooltip near a viewport edge grows
 * inward instead of off-screen: "start" for controls at the left, "end" for the right.
 */
export function Tooltip({
  text,
  children,
  side = "top",
  align = "start",
  className,
  tipClassName,
}: {
  text: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  /** Classes for the wrapper: carry the layout the control had (grid placement, width, height). */
  className?: string;
  /** Extra classes for the tooltip itself (e.g. `max-md:hidden` where the control sits in a scrolling row). */
  tipClassName?: string;
}) {
  const id = useId();
  return (
    <span data-slot="tooltip-wrapper" className={cn("group/tip relative inline-flex", className)}>
      {cloneElement(children, { "aria-describedby": id })}
      <span
        id={id}
        role="tooltip"
        data-slot="tooltip"
        className={cn(
          "pointer-events-none invisible absolute z-50 max-sm:hidden w-max max-w-[min(300px,calc(100vw-2rem))] rounded-md bg-primary px-3 py-2 text-[13px] leading-[18px] font-medium text-primary-foreground opacity-0 shadow-[0_6px_16px_rgba(0,0,0,0.25)]",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          align === "start" && "left-0",
          align === "end" && "right-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          "motion-safe:transition-opacity motion-safe:duration-150",
          tipClassName,
          // Hover: after a short, natural delay. Keyboard focus: immediately.
          "group-hover/tip:visible group-hover/tip:opacity-100 group-hover/tip:delay-300",
          "group-has-focus-visible/tip:visible group-has-focus-visible/tip:opacity-100",
        )}
      >
        {text}
      </span>
    </span>
  );
}
