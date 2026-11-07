// The public token contract: an explicit, human-reviewed mapping from MWDS
// (Figma) token paths to the CSS custom properties application code may use.
//
// Mirrors the contract proven in mwd-x-shadcn (translator/mapping.ts):
//   - public names follow shadcn/ui conventions (--primary, --border, …);
//   - every MWDS token is ALSO emitted as an internal `--mwd-*` property that
//     preserves the Figma alias chain; those are implementation detail.
// Nothing here is inferred by string normalization. Adding a public token is a
// deliberate edit to this file, and tests/tokens.test.ts verifies each entry
// resolves to an existing MWDS token.

/** Collection name → short CSS prefix for internal `--mwd-<prefix>-…` names. */
export const COLLECTION_PREFIX = {
  "raw colors": "raw",
  alpha: "alpha",
  "brand colors": "brand",
  "semantic colors": "color",
  spacing: "space",
  "spacing (absolute)": "space-abs",
  "border radii": "radius",
  "border radii (absolute)": "radius-abs",
  typography: "type",
  shadows: "shadow",
};

/** Public colors. Left: public CSS name (and Tailwind `--color-*` name). */
export const PUBLIC_COLORS = [
  // shadcn/ui canonical set
  ["background", "semantic colors.general.background"],
  ["foreground", "semantic colors.general.foreground"],
  ["card", "semantic colors.card.card"],
  ["card-foreground", "semantic colors.card.card foreground"],
  ["popover", "semantic colors.popover.popover"],
  ["popover-foreground", "semantic colors.popover.popover foreground"],
  ["primary", "semantic colors.general.primary"],
  ["primary-foreground", "semantic colors.general.primary foreground"],
  ["secondary", "semantic colors.general.secondary"],
  ["secondary-foreground", "semantic colors.general.secondary foreground"],
  ["muted", "semantic colors.general.muted"],
  ["muted-foreground", "semantic colors.general.muted foreground"],
  ["accent", "semantic colors.general.accent"],
  ["accent-foreground", "semantic colors.general.accent foreground"],
  ["destructive", "semantic colors.general.destructive"],
  ["destructive-foreground", "semantic colors.general.destructive foreground"],
  ["border", "semantic colors.general.border"],
  ["input", "semantic colors.general.input"],
  ["ring", "semantic colors.focus.ring"],
  // MWDS interaction-state semantics (Figma "unofficial/*" + "focus/*"),
  // used by the MWDS Button/Input variants' Hover/Focus/Error states.
  ["primary-hover", "semantic colors.unofficial.primary hover"],
  ["secondary-hover", "semantic colors.unofficial.secondary hover"],
  ["ghost-hover", "semantic colors.unofficial.ghost hover"],
  ["border-4", "semantic colors.unofficial.border 4"],
  ["destructive-border", "semantic colors.unofficial.destructive border"],
  ["ring-error", "semantic colors.focus.ring error"],
];

/** Public radius. `--radius` is the shadcn base radius; the rest feed Tailwind's scale. */
export const PUBLIC_RADIUS = [
  ["radius", "border radii.radius"],
];
export const TAILWIND_RADIUS = [
  ["xs", "border radii.rounded-xs"],
  ["sm", "border radii.rounded-sm"],
  ["md", "border radii.rounded-md"],
  ["lg", "border radii.rounded-lg"],
  ["xl", "border radii.rounded-xl"],
  ["2xl", "border radii.rounded-2xl"],
  ["3xl", "border radii.rounded-3xl"],
  ["full", "border radii.rounded-full"],
];

/** Public semantic spacing (`--space-*`). Not mapped into Tailwind's
 *  `--spacing-*` namespace, where names like `md` would collide with
 *  `--container-*` sizes; use e.g. `px-(--space-md)`. */
export const PUBLIC_SPACING = [
  "3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl",
].map((k) => [`space-${k}`, `spacing.${k}`]);

/** Tailwind's numeric spacing multiplier is MWDS's absolute base unit. */
export const TAILWIND_SPACING_BASE = "spacing (absolute).1";

/** Tailwind `text-*` utilities generated from MWDS type styles. */
export const TAILWIND_TEXT = [
  // [utility name, size, line-height, letter-spacing, weight | null]
  ["p-mini", "typography.paragraph.mini.font-size", "typography.paragraph.mini.line height", "typography.paragraph.mini.letter-spacing", null],
  ["p-sm", "typography.paragraph.small.font-size", "typography.paragraph.small.line height", "typography.paragraph.small.letter-spacing", null],
  ["p", "typography.paragraph.regular.font-size", "typography.paragraph.regular.line-height", "typography.paragraph.regular.letter-spacing", null],
  ["p-lg", "typography.paragraph.large.font-size", "typography.paragraph.large.line-height", "typography.paragraph.large.letter-spacing", null],
  ["caption", "typography.caption.font-size", "typography.caption.line-height", "typography.caption.letter-spacing", "typography.caption.font-weight"],
  ["h1", "typography.heading 1.font-size", "typography.heading 1.line-height", "typography.heading 1.letter-spacing", "typography.heading 1.weight"],
  ["h2", "typography.heading 2.font-size", "typography.heading 2.line-height", "typography.heading 2.letter-spacing", "typography.heading 2.weight"],
  ["h3", "typography.heading 3.font-size", "typography.heading 3.line-height", "typography.heading 3.letter-spacing", "typography.heading 3.heading 3 weight"],
  ["h4", "typography.heading 4.font-size", "typography.heading 4.line-height", "typography.heading 4.letter-spacing", "typography.heading 4.weight"],
];

/** Tailwind `font-*` weights from MWDS paragraph weights. */
export const TAILWIND_FONT_WEIGHT = [
  ["normal", "typography.paragraph.paragraph-weight"],
  ["medium", "typography.paragraph.paragraph-medium-weight"],
  ["semibold", "typography.paragraph.paragraph-bold-weight"],
];

/** Composite shadows (`shadow-*`), assembled from MWDS x/y/blur/spread/color parts. */
export const TAILWIND_SHADOWS = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"];

/** Font families come from next/font (self-hosted Geist), which must match the
 *  MWDS family names; tests/tokens.test.ts asserts that they do. */
export const FONT_FAMILIES = [
  ["sans", "typography.font definitions.font-family-sans", "var(--font-geist-sans)"],
  ["mono", "typography.font definitions.font-family-monospace", "var(--font-geist-mono)"],
];
