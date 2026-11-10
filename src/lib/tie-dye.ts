import type { CSSProperties } from "react";

/**
 * Tie-dye tints, in display order: mint, peach, lavender, blue. Each circle
 * reads its wash, dye and a neighbor's dye as an accent (see `cmr-tie-dye` in
 * src/styles/cmr.css). Shared by the homepage club totals and the About hero.
 */
const TINTS = ["mint", "peach", "lavender", "blue"] as const;

export function tintVars(i: number): CSSProperties {
  const t = TINTS[i % 4];
  const accent = TINTS[(i + 1) % 4];
  return {
    "--tie-wash": `var(--cmr-tint-${t}-wash)`,
    "--tie-dye": `var(--cmr-tint-${t}-dye)`,
    "--tie-accent": `var(--cmr-tint-${accent}-dye)`,
  } as CSSProperties;
}
