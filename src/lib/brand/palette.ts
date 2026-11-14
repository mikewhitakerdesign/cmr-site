import type { Status } from "@/lib/brand/manual";
import { cssVar } from "@/lib/brand/tokens";

/**
 * The CMR palette as the Brand Standards presents it: names, roles and status,
 * each tied to the CSS custom property the site uses. Values are resolved from
 * the stylesheets (./tokens.ts), never typed here.
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
  status: Status;
};

const MWDS = "MWDS token (Figma)";
const CMR = "CMR layer (src/styles/cmr.css)";

const c = (id: string, name: string, v: string, origin: string, status: Status, role?: string): BrandColor => ({
  id,
  name,
  cssVar: v,
  origin,
  hex: cssVar(v),
  role,
  status,
});

const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;

export const core: BrandColor[] = [
  c("black", "Black", "primary", MWDS, "established", "Type, primary buttons, full-width black sections, the badge."),
  c("white", "White", "background", MWDS, "established", "The page. Type on black."),
];

export const neutrals: BrandColor[] = STEPS.map((s) =>
  c(`neutral-${s}`, `Neutral ${s}`, `mwd-brand-brand-neutrals-${s}`, MWDS, "established"),
);

export const mint: BrandColor[] = STEPS.map((s) => c(`mint-${s}`, `Mint ${s}`, `mwd-brand-brand-shades-${s}`, MWDS, "established"));

export const cream = c("cream", "Cream", "mwd-raw-cmr-cream", MWDS, "established", "The MWDS secondary button fill. Not used on a surface today.");

const TINT_NAMES = ["mint", "peach", "lavender", "blue", "mauve", "gray"] as const;
export type TintName = (typeof TINT_NAMES)[number];

export const tints: { name: TintName; label: string; note: string; wash: BrandColor; dye: BrandColor }[] = TINT_NAMES.map((t) => {
  const label = t[0].toUpperCase() + t.slice(1);
  const origin = t === "mint" ? `${CMR}, alias of MWDS mint` : CMR;
  const note =
    t === "mauve" ? "Autumn weather art only." : t === "gray" ? "The neutral tie-dye: figure frames and unknown values." : "Tie-dye rotation.";
  return {
    name: t,
    label,
    note,
    wash: c(`${t}-wash`, `${label} wash`, `cmr-tint-${t}-wash`, origin, "established"),
    dye: c(`${t}-dye`, `${label} dye`, `cmr-tint-${t}-dye`, origin, "established"),
  };
});

export const functional: BrandColor[] = [
  c("accent", "Accent", "accent", MWDS, "established", "Success messages and the Questions button. Mint 100."),
  c("muted", "Muted surface", "muted", MWDS, "established", "The footer."),
  c("border", "Border", "border", MWDS, "established", "Hairlines, gray panels."),
  c("muted-foreground", "Muted text", "muted-foreground", MWDS, "established", "Secondary text on white."),
  c("quiet-ink", "Quiet ink", "cmr-quiet-ink", CMR, "established", "All footer text and the footer wordmark."),
  c("contour-on-light", "Contour on light", "cmr-contour-on-light", CMR, "established", "Contour lines on white."),
  c("contour-on-dark", "Contour on dark", "cmr-contour-on-dark", CMR, "established", "The static contour pattern on black."),
  c("quiet-edge", "Contour, animated", "cmr-quiet-edge", CMR, "established", "The moving contour lines on black; footer input border."),
  c("primary-hover", "Black, pressed", "primary-hover", MWDS, "established", "Hover and active on black buttons."),
  c("destructive", "Error", "destructive", MWDS, "established", "Form errors."),
  c("ring-error", "Error ring", "ring-error", MWDS, "established", "Focus ring on an invalid field."),
];

/** Every colour, for lookups by id. */
export const allColors = (): BrandColor[] => [...core, ...neutrals, ...mint, cream, ...tints.flatMap((t) => [t.wash, t.dye]), ...functional];

export const colorById = (id: string): BrandColor => {
  const found = allColors().find((x) => x.id === id);
  if (!found) throw new Error(`Unknown brand colour: ${id}`);
  return found;
};
