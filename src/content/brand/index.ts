import { color } from "@/content/brand/color";
import { digital } from "@/content/brand/digital";
import { governance } from "@/content/brand/governance";
import { graphicLanguage } from "@/content/brand/graphic-language";
import { marks } from "@/content/brand/marks";
import { photography } from "@/content/brand/photography";
import { premise } from "@/content/brand/premise";
import { typography } from "@/content/brand/typography";
import { voice } from "@/content/brand/voice";
import type { BrandChapter } from "@/lib/brand/manual";

/**
 * The Brand Standards, in reading order. This one list drives the routes
 * (/brand/[chapter]), the sticky bar, the landing page, the print route and the
 * PDF's contents and page numbers.
 *
 * Apparel (./apparel.tsx) is deferred (Owner, Review 01): it is kept for a later
 * edition but deliberately left out of this list, so it is not published.
 */
export const chapters: readonly BrandChapter[] = [premise, marks, color, typography, graphicLanguage, photography, voice, digital, governance];

export const getChapter = (slug: string) => chapters.find((c) => c.slug === slug);
