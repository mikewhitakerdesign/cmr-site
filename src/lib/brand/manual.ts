import type { ReactNode } from "react";
import { SITE_ORIGIN } from "@/lib/site";

/**
 * The Brand Standards manual (/brand): version metadata and the chapter model
 * shared by the website, the print route (/brand/print) and the PDF built from
 * it (scripts/brand/build-pdf.mjs). No React components and no file access
 * here, so client components and tests can import it.
 */
export const MANUAL = {
  title: "Chicago Mountain Runners Brand Standards",
  shortTitle: "Brand Standards",
  /** Bump with every Owner-approved change to a standard (see /brand/governance). 1.0 approved by the Owner, 2026-11-14. */
  version: "1.0",
  /** Date of this edition (YYYY-MM-DD). */
  date: "2026-11-14",
  /** The pre-built PDF, a static file (public/downloads). Rebuild with `npm run brand:pdf`. */
  pdfHref: "/downloads/cmr-brand-standards.pdf",
  pdfFile: "public/downloads/cmr-brand-standards.pdf",
  pdfDownloadName: "CMR-Brand-Standards-v1.0.pdf",
} as const;

export type PlateTone = "light" | "dark" | "muted";

/** One composition: a section on the web, one page in the PDF. */
export type BrandPlate = {
  /** Anchor id, unique within the chapter. */
  id: string;
  title: string;
  /** Short label for the sticky section bar. */
  nav: string;
  lede?: ReactNode;
  tone?: PlateTone;
  render: () => ReactNode;
};

export type BrandChapter = {
  slug: string;
  /** "01" … "09". */
  number: string;
  /** Display title, with its period: "Colour." */
  title: string;
  /** Plain name for navigation and metadata: "Colour". */
  name: string;
  /** One sentence: the landing page row, the chapter opener and the meta description. */
  summary: string;
  plates: BrandPlate[];
};

/** Serializable chapter outline for client components (the sticky bar). */
export type ChapterOutline = Pick<BrandChapter, "slug" | "number" | "name"> & { sections: { id: string; label: string }[] };

export const outlineOf = (c: BrandChapter): ChapterOutline => ({
  slug: c.slug,
  number: c.number,
  name: c.name,
  sections: c.plates.map((p) => ({ id: p.id, label: p.nav })),
});

export const chapterPath = (slug: string) => `/brand/${slug}`;

/**
 * Chapter slugs in reading order, as plain data: the sitemap reads these
 * without loading the chapters themselves. tests/lib/brand.test.ts checks that
 * the list matches the chapters in src/content/brand exactly.
 *
 * Apparel (src/content/brand/apparel.tsx) is deferred by the Owner (Review 01,
 * 2026-11-14): kept in the repository for a later edition, but not published,
 * so it has no route, no number and no PDF pages.
 */
export const CHAPTER_SLUGS = ["premise", "marks", "color", "typography", "graphic-language", "photography", "voice", "digital", "governance"] as const;

/** Where the downloadable logo files live (public/brand/logos), and the section of the manual that offers them. */
export const LOGO_DOWNLOADS = { dir: "/brand/logos", section: "/brand/marks#files" } as const;

/** Every public Brand Standards path: the landing page, then the chapters. The print route is not public. */
export const brandPaths = (): string[] => ["/brand", ...CHAPTER_SLUGS.map(chapterPath)];

/** The site's host as printed in the manual ("example.com"), from the one production origin (src/lib/site.ts). */
export const SITE_HOST = new URL(SITE_ORIGIN).host.replace(/^www\./, "");
/** Where the live manual is, as printed in the PDF's folio line. */
export const MANUAL_ADDRESS = `${SITE_HOST}/brand`;

/** "03.2": chapter number and the plate's position in it. */
export const plateNumber = (chapter: Pick<BrandChapter, "number">, index: number) => `${chapter.number}.${index + 1}`;

/**
 * PDF pagination. One plate is one page, so page numbers are arithmetic, not
 * measured: cover (1), contents (2), then per chapter an opener and its plates,
 * then the colophon.
 */
export const FRONT_MATTER_PAGES = 2;

export function pdfPageMap(chapters: readonly Pick<BrandChapter, "slug" | "plates">[]) {
  let page = FRONT_MATTER_PAGES;
  const starts = chapters.map((c) => {
    const opener = page + 1;
    page += 1 + c.plates.length;
    return { slug: c.slug, opener, firstPlate: opener + 1 };
  });
  return { chapters: starts, colophon: page + 1, total: page + 1 };
}

/** How to read the manual: three notes, on the landing page and the PDF's contents page. */
export const READING = [
  ["Rules", "The bold line is the standard; the sentence under it says why."],
  ["Examples", "Struck through means don't. Everything else shows the standard in use."],
  ["Values", "Colors and sizes are read from the website itself, so the two agree."],
] as const;

/** The landing page's own sections (the sticky bar shows these on /brand). */
export const LANDING_SECTIONS = [
  { id: "essentials", label: "The short version" },
  { id: "chapters", label: "Chapters" },
  { id: "how-to-read", label: "How to read it" },
  // Download: the PDF and the logo files.
  { id: "download", label: "Download" },
] as const;
