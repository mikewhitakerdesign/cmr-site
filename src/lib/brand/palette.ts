import { cssVar } from "@/lib/brand/tokens";

/**
 * The CMR palette as the Brand Standards presents it (Owner decisions, Review
 * 01): Primary is black, white and the neutral scale, unchanged; Secondary is
 * the six wash and dye families. Working colors are the interface's functional
 * colors (the accent among them), documented as such and not as brand colors.
 * Each is tied to the CSS custom property the site uses; values are resolved
 * from the stylesheets (./tokens.ts), never typed here.
 *
 * Server-only (./tokens.ts reads files). Pass `BrandColor`s to client
 * components as props.
 *
 * MWDS integration (future): `cssVar` is the only field expected to change,
 * when CMR-only variables (`--cmr-*`) become MWDS variables.
 */
export type BrandColor = {
  id: string;
  name: string;
  /** The custom property, without the leading dashes. */
  cssVar: string;
  /** Where the value is authored, in plain words. */
  origin: string;
  hex: string;
  role?: string;
};

const MWDS = "MWDS token (Figma)";
const CMR = "CMR layer (src/styles/cmr.css)";

const c = (id: string, name: string, v: string, origin: string, role?: string): BrandColor => ({
  id,
  name,
  cssVar: v,
  origin,
  hex: cssVar(v),
  role,
});

const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;

/** Primary: pure black and pure white. */
export const primary: BrandColor[] = [
  c("black", "Black", "primary", MWDS, "Type, primary buttons, full-width black sections, the badge."),
  c("white", "White", "background", MWDS, "The page. Type on black."),
];

/** The neutral scale, 50 to 950, exactly as the token set defines it. */
export const neutrals: BrandColor[] = STEPS.map((s) => c(`neutral-${s}`, `Neutral ${s}`, `mwd-brand-brand-neutrals-${s}`, MWDS));

const TINT_NAMES = ["mint", "peach", "lavender", "blue", "mauve", "gray"] as const;
export type TintName = (typeof TINT_NAMES)[number];

/** Secondary: six families, each a pale wash and a slightly deeper dye. */
export const tints: { name: TintName; label: string; note: string; wash: BrandColor; dye: BrandColor }[] = TINT_NAMES.map((t) => {
  const label = t[0].toUpperCase() + t.slice(1);
  const origin = t === "mint" ? `${CMR}, alias of MWDS mint` : CMR;
  const note =
    t === "mauve" ? "Seasonal: the autumn weather art." : t === "gray" ? "The neutral tie-dye: figure frames and values not yet counted." : "The tie-dye rotation.";
  return {
    name: t,
    label,
    note,
    wash: c(`${t}-wash`, `${label} wash`, `cmr-tint-${t}-wash`, origin),
    dye: c(`${t}-dye`, `${label} dye`, `cmr-tint-${t}-dye`, origin),
  };
});

/** Working colors: named for their job in the interface. Until the MWDS integration, they stay as they are. */
export const functional: BrandColor[] = [
  c("accent", "Accent", "accent", MWDS, "Success messages and the Questions button. The same value as the mint dye."),
  c("muted", "Muted surface", "muted", MWDS, "The footer."),
  c("border", "Border", "border", MWDS, "Hairlines, gray panels."),
  c("muted-foreground", "Muted text", "muted-foreground", MWDS, "Secondary text on white."),
  c("quiet-ink", "Quiet ink", "cmr-quiet-ink", CMR, "All footer text and the footer wordmark."),
  c("contour-on-light", "Contour on light", "cmr-contour-on-light", CMR, "Contour lines on white."),
  c("contour-on-dark", "Contour on dark", "cmr-contour-on-dark", CMR, "The static contour pattern on black."),
  c("quiet-edge", "Contour, animated", "cmr-quiet-edge", CMR, "The moving contour lines on black; footer input border."),
  c("primary-hover", "Black, pressed", "primary-hover", MWDS, "Pressed state of white buttons on black."),
  c("destructive", "Error", "destructive", MWDS, "Form errors."),
  c("ring-error", "Error ring", "ring-error", MWDS, "Focus ring on an invalid field."),
];

/** Every color, for lookups by id. */
export const allColors = (): BrandColor[] => [...primary, ...neutrals, ...tints.flatMap((t) => [t.wash, t.dye]), ...functional];

export const colorById = (id: string): BrandColor => {
  const found = allColors().find((x) => x.id === id);
  if (!found) throw new Error(`Unknown brand colour: ${id}`);
  return found;
};
