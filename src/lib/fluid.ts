import type { CSSProperties } from "react";

/**
 * Fluid values between the three Figma homepage frames.
 *
 * The homepage is designed at 393 (Home / Mobile), 768 (Home / Tablet) and
 * the 1400px container (Home / Desktop is a 1732px frame whose content stops
 * at 1400). A fluid value equals the Figma value exactly at each anchor and
 * interpolates linearly between them, so type and spacing never jump or
 * collide between frames:
 *
 *   < 768   mobile → tablet line, extrapolated down to 320px, capped at the tablet value
 *   ≥ 768   tablet → desktop line, clamped between the two values
 *
 * The switch at 768 matches Tailwind's `md` breakpoint, so a pair of custom
 * properties (`-a` below md, `-b` from md up) carries each value. Components
 * read them with static Tailwind classes, e.g.
 *
 *   const v = fluidVars({ "--hero-pt": [52, 66, 115] });
 *   <div style={v} className="pt-(--hero-pt-a) md:pt-(--hero-pt-b)" />
 *
 * Values are CMR layout values, not design tokens: they reproduce the
 * approved Figma frames (most are off the MWDS type scale; see the Work Item's
 * design-to-code table) and are candidates for Figma variables later.
 */

export const FLUID_ANCHORS = { mobile: 393, tablet: 768, desktop: 1400 } as const;
/** Narrowest supported viewport; mobile values extrapolate down to here. */
export const FLUID_MIN_VIEWPORT = 320;

/** [mobile @393, tablet @768, desktop @1400+] in px. */
export type Fluid = readonly [mobile: number, tablet: number, desktop: number];

const { mobile: M, tablet: T, desktop: D } = FLUID_ANCHORS;

const lerp = (w: number, w0: number, v0: number, w1: number, v1: number) =>
  v0 + ((v1 - v0) * (w - w0)) / (w1 - w0);

const fmt = (n: number) => {
  const s = n.toFixed(4).replace(/\.?0+$/, "");
  return s === "-0" ? "0" : s;
};

/** CSS for one linear segment, clamped to [lo, hi]. */
function segment(w0: number, v0: number, w1: number, v1: number, lo: number, hi: number): string {
  if (v0 === v1) return `${fmt(v0)}px`;
  const slope = (v1 - v0) / (w1 - w0);
  const intercept = v0 - slope * w0;
  const [min, max] = lo <= hi ? [lo, hi] : [hi, lo];
  return `clamp(${fmt(min)}px, calc(${fmt(intercept)}px + ${fmt(slope * 100)}vw), ${fmt(max)}px)`;
}

/** The `-a` (below md) and `-b` (md and up) CSS values for a fluid value. */
export function fluidCss([m, t, d]: Fluid): { a: string; b: string } {
  const floor = lerp(FLUID_MIN_VIEWPORT, M, m, T, t);
  return {
    a: segment(M, m, T, t, floor, t),
    b: segment(T, t, D, d, t, d),
  };
}

/** The value the generated CSS resolves to at viewport width `w` (for tests). */
export function fluidAt([m, t, d]: Fluid, w: number): number {
  if (w < T) {
    const floor = lerp(FLUID_MIN_VIEWPORT, M, m, T, t);
    const v = lerp(w, M, m, T, t);
    return Math.min(Math.max(v, Math.min(floor, t)), Math.max(floor, t));
  }
  const v = lerp(w, T, t, D, d);
  return Math.min(Math.max(v, Math.min(t, d)), Math.max(t, d));
}

/** Style object defining `<name>-a` and `<name>-b` for each fluid value. */
export function fluidVars(values: Record<`--${string}`, Fluid>): CSSProperties {
  const style: Record<string, string> = {};
  for (const [name, value] of Object.entries(values)) {
    const { a, b } = fluidCss(value as Fluid);
    style[`${name}-a`] = a;
    style[`${name}-b`] = b;
  }
  return style as CSSProperties;
}

/**
 * Fluid font size and line height on one element, read through
 * `--fs-*` / `--lh-*`. Each element that uses FLUID_TYPE sets its own values.
 */
export const FLUID_TYPE =
  "text-(length:--fs-a) leading-(--lh-a) md:text-(length:--fs-b) md:leading-(--lh-b)";

export function fluidType(fontSize: Fluid, lineHeight: Fluid): CSSProperties {
  return fluidVars({ "--fs": fontSize, "--lh": lineHeight });
}
