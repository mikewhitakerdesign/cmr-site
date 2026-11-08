import type { SVGProps } from "react";

/**
 * Homepage icons, exported from the CMR Figma file (Lucide geometry drawn as
 * flat frames, not MWDS icon instances). Paths, viewBoxes and stroke widths
 * are the Figma SVG exports verbatim; only the stroke color is `currentColor`
 * (Figma exports identical geometry in black and in white). Decorative:
 * every use sits beside a text label.
 *
 *   Clock      1:45  "Icon / TUE · 5:30 AM"               16px, stroke 1.16667
 *   MapPin     1:55  "Icon / Cricket Hill · Montrose Beach" 16px
 *   ArrowRight 1:39  "Icon / See the full schedule"        16px
 *   ArrowUpRight 1:64 "Icon / TUE · 5:30 AM" (row action)  20px, stroke 1.25
 *   Navigation 1:6591 "Icon / Get directions" (Hill Details) 16px
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, "children">;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

export function ClockIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" strokeWidth="1.16667" {...base} {...props}>
      <path d="M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z" />
      <path d="M8 4V8L10.6667 9.33333" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" strokeWidth="1.16667" {...base} {...props}>
      <path d="M13.3333 6.66667C13.3333 9.99533 9.64067 13.462 8.40067 14.5327C8.28515 14.6195 8.14453 14.6665 8 14.6665C7.85547 14.6665 7.71485 14.6195 7.59933 14.5327C6.35933 13.462 2.66667 9.99533 2.66667 6.66667C2.66667 5.25218 3.22857 3.89562 4.22876 2.89543C5.22896 1.89524 6.58551 1.33333 8 1.33333C9.41449 1.33333 10.771 1.89524 11.7712 2.89543C12.7714 3.89562 13.3333 5.25218 13.3333 6.66667Z" />
      <path d="M10 6.66667C10 7.77124 9.10457 8.66667 8 8.66667C6.89543 8.66667 6 7.77124 6 6.66667C6 5.5621 6.89543 4.66667 8 4.66667C9.10457 4.66667 10 5.5621 10 6.66667Z" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" strokeWidth="1.16667" {...base} {...props}>
      <path d="M3.33333 8H12.6667" />
      <path d="M8 3.33333L12.6667 8L8 12.6667" />
    </svg>
  );
}

/** Hill Details 1:6591 "Icon / Get directions" (Lucide "navigation"), 16px. */
export function NavigationIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" strokeWidth="1.16667" {...base} {...props}>
      <path d="M2 7.33333L14.6667 1.33333L8.66667 14L7.33333 8.66667L2 7.33333Z" />
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" strokeWidth="1.25" {...base} {...props}>
      <path d="M5.83333 5.83333H14.1667V14.1667" />
      <path d="M5.83333 14.1667L14.1667 5.83333" />
    </svg>
  );
}
