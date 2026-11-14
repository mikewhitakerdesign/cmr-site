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
  /** Bump with every Owner-approved change to a standard (see /brand/governance). */
  version: "0.9",
  status: "Owner review draft",
  /** Date of this edition (YYYY-MM-DD). */
  date: "2026-11-13",
  /** The pre-built PDF, a static file (public/downloads). Rebuild with `npm run brand:pdf`. */
  pdfHref: "/downloads/cmr-brand-standards.pdf",
  pdfFile: "public/downloads/cmr-brand-standards.pdf",
  pdfDownloadName: "CMR-Brand-Standards-v0.9.pdf",
} as const;

/**
 * How firmly a statement in the manual is supported. The site already marks
 * approximate figures "≈" and unconfirmed content "provisional"; the manual
 * uses the same honesty for its own standards.
 */
export type Status = "established" | "inferred" | "proposed" | "unresolved";

export const STATUS: Record<Status, { label: string; meaning: string }> = {
  established: { label: "Established", meaning: "In approved artwork, tokens or copy, or used consistently on the live site." },
  inferred: { label: "Inferred", meaning: "Clear from how the site is built, but never written down as a rule until now." },
  proposed: { label: "Proposed", meaning: "A recommendation in this manual. Not a standard until the Owner approves it." },
  unresolved: { label: "Unresolved", meaning: "Not enough evidence to specify. Needs an Owner decision or a missing source file." },
};

export type PlateTone = "light" | "dark" | "muted";

/** One composition: a section on the web, one page in the PDF. */
export type BrandPlate = {
  /** Anchor id, unique within the chapter. */
  id: string;
  title: string;
  /** Short label for the sticky section bar. */
  nav: string;
  lede?: ReactNode;
  status?: Status;
  tone?: PlateTone;
  render: () => ReactNode;
};

export type BrandChapter = {
  slug: string;
  /** "01" … "10". */
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
 */
export const CHAPTER_SLUGS = ["premise", "marks", "color", "typography", "graphic-language", "photography", "voice", "digital", "apparel", "governance"] as const;

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

/** The landing page's own sections (the sticky bar shows these on /brand). */
export const LANDING_SECTIONS = [
  { id: "essentials", label: "The short version" },
  { id: "chapters", label: "Chapters" },
  { id: "how-to-read", label: "How to read it" },
  { id: "download", label: "Download" },
] as const;
