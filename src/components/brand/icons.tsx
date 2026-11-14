import type { SVGProps } from "react";

/**
 * Icons used only by the Brand Standards. Drawn on the same 16px grid and
 * 1.1667 stroke as the site's icons (src/components/icons.tsx), so they sit
 * beside them without looking like a second set. Decorative.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, "children">;

const base = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.16667,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

export const DownloadIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M8 2v8.5M4.5 7 8 10.5 11.5 7M2.5 13.5h11" />
  </svg>
);

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="m4 6 4 4 4-4" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="m3 8.5 3.5 3.5L13 5" />
  </svg>
);

export const CopyIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
    <path d="M3.5 10.5h-.5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h6.5a1 1 0 0 1 1 1v.5" />
  </svg>
);
