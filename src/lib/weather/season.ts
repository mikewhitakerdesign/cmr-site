import type { CSSProperties } from "react";
import type { Season } from "@/lib/weather/types";

/**
 * The season sets the tie-dye under the weather art (the `cmr-tie-dye` utility
 * reads --tie-wash, --tie-dye and --tie-accent): spring mint, summer peach,
 * autumn mauve and peach, winter lavender and icy blue. The condition never
 * changes these; it only changes the glyph on top.
 */
const PALETTE: Record<Season, [wash: string, dye: string, accent: string]> = {
  spring: ["mint", "mint", "blue"],
  summer: ["peach", "peach", "lavender"],
  autumn: ["mauve", "mauve", "peach"],
  winter: ["lavender", "blue", "lavender"],
};

export function seasonVars(season: Season): CSSProperties {
  const [wash, dye, accent] = PALETTE[season];
  return {
    "--tie-wash": `var(--cmr-tint-${wash}-wash)`,
    "--tie-dye": `var(--cmr-tint-${dye}-dye)`,
    "--tie-accent": `var(--cmr-tint-${accent}-dye)`,
  } as CSSProperties;
}
