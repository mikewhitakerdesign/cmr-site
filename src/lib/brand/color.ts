/**
 * Colour arithmetic for the Brand Standards (/brand). Pure functions, no DOM:
 * the swatches, the contrast table and the contrast checker all read these, so
 * every figure the manual prints is computed from the source value, never typed in.
 */

export type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
}

export const rgbToHex = ({ r, g, b }: Rgb) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

export const formatRgb = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return `${r} ${g} ${b}`;
};

export function formatHsl(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return `${h}° ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Device CMYK by arithmetic (no ICC profile, no ink limit, no dot gain). It is a
 * starting point for a printer's proof, not a colour match, and the manual
 * labels it that way wherever it is shown.
 */
export function formatCmykUnproofed(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const k = 1 - Math.max(R, G, B);
  if (k >= 1) return "0 0 0 100";
  const pct = (v: number) => Math.round(((1 - v - k) / (1 - k)) * 100);
  return `${pct(R)} ${pct(G)} ${pct(B)} ${Math.round(k * 100)}`;
}

/** WCAG 2.x relative luminance. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG 2.x contrast ratio, 1–21. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const formatRatio = (ratio: number) => `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`;

export type WcagGrade = "AAA" | "AA" | "AA large" | "Fail";

/** The best WCAG 2.2 level a text pairing reaches. "AA large" = large text and UI boundaries only (≥ 3:1). */
export function wcagGrade(ratio: number): WcagGrade {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "Fail";
}

/** `color-mix(in srgb, a p%, b)` as the browser computes it for opaque colours. */
export function mixSrgb(a: string, b: string, weightA: number): string {
  const [x, y] = [hexToRgb(a), hexToRgb(b)];
  const m = (p: number, q: number) => p * weightA + q * (1 - weightA);
  return rgbToHex({ r: m(x.r, y.r), g: m(x.g, y.g), b: m(x.b, y.b) });
}

/** A colour at `alpha` over an opaque ground, flattened (e.g. 70% black on white). */
export const overlay = (fg: string, bg: string, alpha: number) => mixSrgb(fg, bg, alpha);
