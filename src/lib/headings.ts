import { fluidType } from "@/lib/fluid";

/**
 * CMR heading roles — visual type only, independent of the semantic element.
 * Every page hero is an <h1> and every major section an <h2>, whatever its
 * style; the role picks the size, never the heading level. Each role is a fluid
 * [mobile @393, tablet @768, desktop @1400] pair for font size and line height
 * (see ./fluid.ts), read with FLUID_TYPE:
 *
 *   role          desktop  use
 *   displayXL       209    the homepage hero only
 *   displayLarge    128    hero of a hill detail page, Join, Hills on Repeat (/calendar), Hills on Hills (/hills)
 *   pageH1          100    hero of About and The Science
 *   impactH2         96    statement sections ("See you on the hill.", "Bad weather. Good hills.")
 *   standardH2       72    functional or informational sections ("Running calendar.", "New here? Good.")
 *
 * H3–H6, captions, metadata, figures, forms and data keep their own scales.
 * Usage: <h2 style={impactH2()} className={cn(FLUID_TYPE, DISPLAY_HEADING)}>.
 */
export const displayXL = () => fluidType([48, 98, 209], [52, 102, 204]);
export const displayLarge = () => fluidType([52, 96, 128], [47, 86, 115]);
export const pageH1 = () => fluidType([44, 76, 100], [46, 78, 98]);
/** Figma 1:118 / 78:323 / 78:441: 48/48 mobile, 54/54 tablet, 96/88 desktop, −0.04em. */
export const impactH2 = () => fluidType([48, 54, 96], [48, 54, 88]);
export const standardH2 = () => fluidType([44, 56, 72], [44, 56, 68]);

/** Weight and tracking shared by the H2 roles. */
export const DISPLAY_HEADING = "font-black tracking-[-0.04em]";

/**
 * Body-text color: the color of the approved Cricket Hill description ("The
 * mountain at Montrose." copy), 70% black (≈ #4d4d4d, 8.4:1 on white). One
 * name for it, so the paragraphs that share it can't drift apart: that
 * description, the homepage "Get high in the city." copy and the /hills intro
 * (PR #4 final pass, Owner direction 2026-11-09). Not applied site-wide.
 */
export const BODY_TEXT_COLOR = "text-foreground/70";
