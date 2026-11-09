import { DISPLAY_HEADING, displayHeading } from "@/lib/headings";
import { cn } from "@/lib/utils";

/**
 * Type shared by the Chicago Hills pages (Figma Hill Details 1:6363 / 1:6703 /
 * 1:7032). Same conventions as the homepage: fluid values between the 393 /
 * 768 / 1400 frames (src/lib/fluid.ts), MWDS fonts (Geist, Geist Mono).
 */

/** "RUN IT WITH US": Geist Mono 14/21, +1.5px, uppercase. */
export const EYEBROW = "font-mono text-[14px] leading-[21px] tracking-[0.107em] uppercase";

/**
 * Section headings: the homepage "Get high in the city." size (48 / 54 / 96)
 * for every section heading except the hero name and the lede (Owner
 * direction, refinement pass 2026-11-08; was 36 / 36 / 64).
 */
export const sectionHeading = displayHeading;
export const SECTION_HEADING = cn(DISPLAY_HEADING, "text-balance");

/** Body copy 18/27. */
export const BODY = "text-[18px] leading-[27px]";
