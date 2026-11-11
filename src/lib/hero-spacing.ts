import { fluidVars, type Fluid } from "@/lib/fluid";

/**
 * One top padding between the bottom of the global navigation and the start of a
 * page hero's content (Owner direction, 2026-11-10), for: the homepage, /hills, /about,
 * /the-science, /join, the legal pages and run detail pages. Not used by /calendar or the
 * hill detail pages, which keep their own treatments.
 *
 * Fluid [mobile @393, tablet @768, desktop @1400] in px. Use on the element that owns
 * the hero's top padding:
 *
 *   <section style={heroTopVars()} className={HERO_TOP}>
 *
 * Breadcrumbs, eyebrows and imagery sit inside that padding and keep their own spacing.
 */
export const HERO_TOP_PX: Fluid = [56, 72, 96];
export const heroTopVars = () => fluidVars({ "--hero-top": HERO_TOP_PX });
export const HERO_TOP = "pt-(--hero-top-a) md:pt-(--hero-top-b)";
