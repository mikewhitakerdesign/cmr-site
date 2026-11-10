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

/**
 * Rocket — not in Figma. Lucide "rocket" geometry (ISC licence, lucide.dev),
 * drawn in the same outline style, for the club totals' moon line (PR #4 final
 * pass, Owner direction 2026-11-09). 24-unit grid, stroke 1.5.
 */
export function RocketIcon(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" {...base} {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

/** Find a Run icons (not in the Figma export set): Lucide geometry (ISC), 16px, same stroke as above. */
export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" strokeWidth="1.5" {...base} {...props}>
      <path d="M10 3.5L5.5 8L10 12.5" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" strokeWidth="1.5" {...base} {...props}>
      <path d="M6 3.5L10.5 8L6 12.5" />
    </svg>
  );
}

export function CalendarPlusIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" strokeWidth="1.16667" {...base} {...props}>
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M2 6.5H14M5.5 1.75V4M10.5 1.75V4M8 8.5V12M6.25 10.25H9.75" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" strokeWidth="1.16667" {...base} {...props}>
      <path d="M8 10V2M5 4.75L8 1.75L11 4.75M3 8.5V13a1 1 0 0 0 1 1H12a1 1 0 0 0 1-1V8.5" />
    </svg>
  );
}

/** What to expect icons: Lucide "repeat", "activity", "mountain" and "backpack" (ISC, lucide.dev), 24-unit grid, stroke 1.5. */
const lucide = { width: "24", height: "24", viewBox: "0 0 24 24", strokeWidth: "1.5", ...base } as const;

export function RepeatIcon(props: IconProps) {
  return (
    <svg {...lucide} {...props}>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function ActivityIcon(props: IconProps) {
  return (
    <svg {...lucide} {...props}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

export function MountainIcon(props: IconProps) {
  return (
    <svg {...lucide} {...props}>
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

export function BackpackIcon(props: IconProps) {
  return (
    <svg {...lucide} {...props}>
      <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" />
      <path d="M8 10h8" />
    </svg>
  );
}

/** Lucide "user", filled: the placeholder person in the About page's member invitation. */
export function UserIcon(props: IconProps) {
  return (
    <svg {...lucide} fill="currentColor" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
