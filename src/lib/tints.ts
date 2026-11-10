import type { CSSProperties } from "react";

/**
 * Tie-dye tints, in display order: mint, peach, lavender, blue (Owner
 * direction, Round 2). Each circle reads its wash, dye and a neighbor's dye as
 * an accent, so the four echo the Just show up mesh gradient without any one
 * of them turning saturated. Colors are the CMR pastel set in src/styles/cmr.css.
 * Used by the homepage club totals and the hill pages' repeat circles, with
 * the `cmr-tie-dye` utility.
 */
export const TINTS = ["mint", "peach", "lavender", "blue"] as const;
export const tintVars = (i: number) => {
  const t = TINTS[i % 4];
  const accent = TINTS[(i + 1) % 4];
  return {
    "--tie-wash": `var(--cmr-tint-${t}-wash)`,
    "--tie-dye": `var(--cmr-tint-${t}-dye)`,
    "--tie-accent": `var(--cmr-tint-${accent}-dye)`,
  } as CSSProperties;
};

/** The neutral version of the tie-dye (hill cards' "TBD" circles): very light greys. */
export const grayTintVars = {
  "--tie-wash": "var(--cmr-tint-gray-wash)",
  "--tie-dye": "var(--cmr-tint-gray-dye)",
  "--tie-accent": "var(--cmr-tint-gray-dye)",
} as CSSProperties;
