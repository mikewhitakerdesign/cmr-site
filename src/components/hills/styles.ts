import { fluidType } from "@/lib/fluid";

/**
 * Type shared by the Chicago Hills pages (Figma Hill Details 1:6363 / 1:6703 /
 * 1:7032). Same conventions as the homepage: fluid values between the 393 /
 * 768 / 1400 frames (src/lib/fluid.ts), MWDS fonts (Geist, Geist Mono).
 */

/** "ELEVATION GAIN", "RUN IT WITH US": Geist Mono 14/21, +1.5px, uppercase. */
export const EYEBROW = "font-mono text-[14px] leading-[21px] tracking-[0.107em] uppercase";

/** Section headings ("What goes up."): 36/34.2 mobile and tablet, 64/60.8 desktop, −0.03em. */
export const sectionHeading = () => fluidType([36, 36, 64], [34.2, 34.2, 60.8]);
export const SECTION_HEADING = "font-black tracking-[-0.03em] text-balance";

/** Body copy 18/27. */
export const BODY = "text-[18px] leading-[27px]";
