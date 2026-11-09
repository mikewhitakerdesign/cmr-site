import { tintVars } from "@/lib/tints";

/**
 * Props for one pale tie-dye circle (the homepage club-totals treatment: the
 * `cmr-tie-dye` fill on a clipped circle, tints cycling mint, peach, lavender,
 * blue). The caller renders `<span className="cmr-tie-dye absolute -z-10" />`
 * first. Static: no motion. Black text on every tint is at least 17:1.
 */
export const cmrTieDyeCircle = (i: number) => ({
  style: tintVars(i),
  className:
    "relative isolate flex aspect-square w-full max-w-[162px] flex-col items-center justify-center overflow-hidden rounded-full bg-(--tie-wash) p-4 text-center md:w-[150px] md:max-w-none lg:w-[220px] lg:p-6",
});
