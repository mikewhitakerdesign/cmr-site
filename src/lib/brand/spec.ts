import type { Fluid } from "@/lib/fluid";

/**
 * Brand specifications that are not design tokens: measurements of the approved
 * artwork, and mirrors of values that live in component code. One place, so a
 * chapter never types a number of its own.
 *
 * Mirrors are checked against their source by tests/lib/brand.test.ts
 * (heading roles vs src/lib/headings.ts, the gradient's control colours vs
 * scripts/assets/bake-mesh-gradient.mjs), so they cannot drift silently.
 * Colours are NOT here: they are read from the stylesheets (./tokens.ts,
 * ./palette.ts).
 *
 * MWDS integration (future): values marked "→ MWDS" are the ones expected to
 * become MWDS variables or styles; see docs/brand-standards.md.
 */

/* ------------------------------------------------------------------ */
/* Marks                                                               */
/* ------------------------------------------------------------------ */

/**
 * The CMR badge. The vector master (public/brand/logos/cmr-badge-black.svg) is
 * traced from the approved artwork, the 1386 × 728 Figma export
 * (public/brand/cmr-logo-mask-shape.svg), and cropped to the badge itself.
 * Letter geometry is measured in the master's own coordinates.
 */
export const BADGE = {
  /** The vector master's viewBox: the badge, edge to edge. */
  master: { w: 1341.2, h: 586.6 },
  /** The approved raster the master is traced from, and where the badge sits in its frame. */
  raster: { w: 1386, h: 728, crop: { x: 21.1, y: 68.1 } },
  /** The knocked-out "CMR" with its ™, in master coordinates. */
  letters: { x: 113.9, y: 181.9, w: 1096, h: 301 },
  /** Widths in production (src/components/Header.tsx), CSS px, including the header's own frame around the badge. */
  production: { mobile: 100, tablet: 128, tabletCompact: 96, desktop: 188, desktopCompact: 112 },
  /** Smallest screen width (Owner, Review 01): the smallest the site already shows it. */
  minScreenPx: 96,
} as const;

/** Badge proportion, width ÷ height. */
export const BADGE_RATIO = BADGE.master.w / BADGE.master.h;

/**
 * The stacked wordmark. Type specification read from the live text in the
 * Owner's Figma file; the vector master (public/brand/logos/cmr-wordmark-black.svg)
 * is outlined from Geist Black to this specification
 * (scripts/assets/outline-wordmark.mjs). The site footer still draws the
 * earlier trace (public/brand/cmr-wordmark.svg, 1858 × 888), which the master
 * matches to within a pixel.
 */
export const WORDMARK = {
  typeface: "Geist Black",
  fontSizePx: 350.14,
  lineHeightPx: 313.667,
  trackingPx: -5.4709,
  tm: { fontSizePx: 115.191, trackingPx: -1.7999 },
  /** The vector master's viewBox, and where the first line's caps sit in it (the round letters overshoot them by 5.6 px). */
  master: { w: 1857.8, h: 887.2, capTop: 5.6, capHeight: 248.6 },
  /** Measured on the footer's trace: its frame, the cap height, the gap between lines, and each line's width (the last with its ™). */
  traced: { w: 1858, h: 888, capHeight: 260, lineGap: 54, lineWidths: [1607, 1850, 1850] },
} as const;

/** The hill silhouette beside the homepage statement (public/home/community-mark.png). Raster only. */
export const SILHOUETTE = {
  raster: { w: 373, h: 1540 },
  /** Displayed sizes on the homepage (src/components/home/CommunityIntro.tsx), w × h. */
  production: { mobile: [30.74, 127.05], tablet: [60.55, 250.25], desktop: [93, 385] },
} as const;

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export type HeadingRoleKey = "displayXL" | "displayLarge" | "pageH1" | "impactH2" | "standardH2";

/**
 * Display roles: [mobile @393, tablet @768, desktop @1400] font size and line
 * height in px. Mirror of src/lib/headings.ts (parity-tested). → MWDS
 */
export const HEADING_ROLES: Record<HeadingRoleKey, { name: string; size: Fluid; lineHeight: Fluid; use: string; example: string }> = {
  displayXL: { name: "Display XL", size: [48, 98, 209], lineHeight: [52, 102, 204], use: "The homepage hero only.", example: "MAKE YOUR OWN MTNS" },
  displayLarge: { name: "Display Large", size: [52, 96, 128], lineHeight: [47, 86, 115], use: "Page heroes: hill pages, Join, Hills on Repeat, Hills on Hills.", example: "Hills on repeat." },
  pageH1: { name: "Page H1", size: [44, 76, 100], lineHeight: [46, 78, 98], use: "Long headline heroes: About, The Science.", example: "From mountains to molehills." },
  impactH2: { name: "Impact H2", size: [48, 54, 96], lineHeight: [48, 54, 88], use: "Statement sections.", example: "Bad weather. Good hills." },
  standardH2: { name: "Standard H2", size: [44, 56, 72], lineHeight: [44, 56, 68], use: "Functional and informational sections.", example: "New here? Good." },
};

export const DISPLAY = {
  weight: 900,
  /** src/lib/headings.ts DISPLAY_HEADING, and the all-caps statements. */
  tracking: { headings: "-0.04em", statements: "-0.045em" },
  /** Geist stylistic set applied to display headings (src/styles/cmr.css `ss08`). */
  stylisticSet: "ss08",
} as const;

/** Text roles in production. Sizes in px (font size / line height). */
export const TEXT_ROLES = [
  { name: "Lede", font: "Geist", weight: 900, size: "27 / 29 to 64 / 68", detail: "Fluid. The homepage statement and each hill's opening line.", source: "src/components/home/CommunityIntro.tsx" },
  { name: "Body large", font: "Geist", weight: 400, size: "18 / 27", detail: "Section copy. 70% black on white, 90% white on black.", source: "src/lib/headings.ts BODY_TEXT_COLOR" },
  { name: "Body", font: "Geist", weight: 400, size: "16 / 24", detail: "MWDS paragraph/regular.", source: "tokens: typography/paragraph/regular" },
  { name: "Small", font: "Geist", weight: 500, size: "14 / 20", detail: "Navigation, links, labels. MWDS paragraph/small.", source: "tokens: typography/paragraph/small" },
  { name: "Mini", font: "Geist", weight: 400, size: "12 / 16", detail: "Legal line, risk notice, copyright.", source: "tokens: typography/paragraph/mini" },
  { name: "Eyebrow", font: "Geist Mono", weight: 400, size: "14 / 21", detail: "Uppercase, tracked +0.107em. Section labels.", source: "src/components/hills/styles.ts EYEBROW" },
  { name: "Data", font: "Geist Mono", weight: 400, size: "16 / 24", detail: "Times, indexes, measurements, spec rows.", source: "tokens: typography/monospaced" },
] as const;

export const TYPE_SOURCES = { roles: "src/lib/headings.ts", fluid: "src/lib/fluid.ts", fonts: "src/app/layout.tsx (next/font, self-hosted)" } as const;

/* ------------------------------------------------------------------ */
/* Layout and motion                                                   */
/* ------------------------------------------------------------------ */

/** src/components/Container.tsx and src/lib/fluid.ts. */
export const LAYOUT = {
  containerMax: 1400,
  gutter: { mobile: 24, tabletUp: 48 },
  anchors: { mobile: 393, tablet: 768, desktop: 1400 },
  minViewport: 320,
  baseUnit: 4,
} as const;

/** Durations in ms, as written in the components that use them. */
export const MOTION = [
  { name: "Press and hover", value: "150 ms", where: "Buttons, arrow links", source: "src/components/CtaLink.tsx" },
  { name: "Header resize", value: "300 ms ease-out", where: "Sticky header, compact state", source: "src/components/Header.tsx" },
  { name: "Map zoom", value: "450 ms", where: "Run map image, hover only", source: "src/styles/cmr.css" },
  { name: "Odometer roll", value: "1.5 s + 0.2 s per digit", where: "Club totals, once per page load", source: "src/components/Odometer.tsx" },
  { name: "Circle float", value: "8 s alternate", where: "About hero circles, ±5 px", source: "src/styles/cmr.css" },
  { name: "Contour drift", value: "0.036 noise units / s, up to 30 fps", where: "Hill heroes, Flat is a state of mind", source: "src/components/ContourField.tsx" },
] as const;

/* ------------------------------------------------------------------ */
/* Graphic language                                                    */
/* ------------------------------------------------------------------ */

/** ContourField settings in production. */
export const CONTOUR = {
  lineWidthPx: 1,
  staticLineWidthPx: 1,
  settings: [
    { name: "Hill and Science heroes", scale: 940, levels: 4.5, ground: "Black", line: "--cmr-quiet-edge", source: "src/components/hills/HillHero.tsx" },
    { name: "Flat is a state of mind", scale: 460, levels: 10, ground: "White", line: "--cmr-contour-on-light", source: "src/components/home/FlatStateOfMind.tsx" },
  ],
  defaults: { scale: 520, levels: 9, speed: 0.036 },
  /** The still artwork used in the manual and the PDF (scripts/assets/build-sparse-contours.mjs). The site's own fallbacks keep public/home/topo.svg. */
  staticPattern: { file: "public/home/topo-sparse.svg", paths: 26, viewBox: 1600 },
} as const;

/**
 * The mesh gradient's 16 authored control colours, row by row (4 × 4), from the
 * Figma shader as recorded in scripts/assets/bake-mesh-gradient.mjs
 * (parity-tested). sRGB 0–1.
 */
export const MESH_GRADIENT: readonly (readonly [number, number, number])[][] = [
  [[1, 0.42, 0.42], [1, 0.64, 0.42], [1, 0.82, 0.42], [1, 0.82, 0.4]],
  [[0.7, 0.3, 0.6], [0.8, 0.55, 0.5], [0.9, 0.7, 0.45], [0.5, 0.7, 0.35]],
  [[0.4, 0.5, 0.7], [0.35, 0.65, 0.65], [0.2, 0.65, 0.55], [0.1, 0.55, 0.7]],
  [[0.02, 0.84, 0.63], [0.1, 0.7, 0.65], [0.1, 0.6, 0.7], [0.07, 0.54, 0.7]],
];

export const meshHex = ([r, g, b]: readonly [number, number, number]) =>
  `#${[r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")}`;

/** Layer opacity of the gradient over a photograph (src/components/PhotoBackdrop.tsx): 25% on the homepage hero, 50% on "Just show up." (Owner, Review 01). */
export const MESH_OPACITY = { hero: 25, justShowUp: 50 } as const;

/** Circle systems in production. */
export const CIRCLES = {
  clubTotals: { desktop: 280, tablet: 150, mobile: 200, columns: "4 across, 2 × 2 on phones", source: "src/components/home/ClubTotals.tsx" },
  aboutHero: { desktop: 280, tablet: 240, mobile: 200, overlap: "25% of the diameter", source: "src/components/about/HeroCircles.tsx" },
  tints: ["mint", "peach", "lavender", "blue"],
} as const;

/** Hill profile drawing rules (public/home/README.md, scripts/assets/terrain). */
export const HILL_PROFILE = {
  contourBands: 12,
  rounding: "5 ft",
  exaggeration: "55 + 75 × square root of (rise ÷ 60), in px",
  data: "USGS 3DEP elevation data via AWS Terrain Tiles (zoom 15, ≈ 3.5 m per pixel)",
} as const;
