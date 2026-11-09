import { fluidType } from "@/lib/fluid";

/**
 * The section display heading — the size of "Get high in the city." on the
 * homepage (Figma 1:118 / 78:323 / 78:441: 48/48 mobile, 54/54 tablet,
 * 96/88 desktop, −0.04em).
 *
 * Owner direction (Chicago Hills refinement pass, 2026-11-08): every section
 * heading on the hill pages, and the homepage's "2026 club totals." and
 * "See you on the hill.", use this one size.
 */
export const displayHeading = () => fluidType([48, 54, 96], [48, 54, 88]);
export const DISPLAY_HEADING = "font-black tracking-[-0.04em]";
