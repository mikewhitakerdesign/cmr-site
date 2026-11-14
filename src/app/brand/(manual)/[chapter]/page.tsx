import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandNav } from "@/components/brand/BrandNav";
import { ChapterOpener, ChapterPager } from "@/components/brand/chapter";
import { WebPlate } from "@/components/brand/kit";
import { chapters, getChapter } from "@/content/brand";
import { MANUAL, chapterPath, outlineOf, plateNumber } from "@/lib/brand/manual";
import { SITE_NAME } from "@/lib/site";

/** Only the manual's chapters have pages; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return chapters.map((c) => ({ chapter: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/brand/[chapter]">): Promise<Metadata> {
  const chapter = getChapter((await params).chapter);
  if (!chapter) return {};
  const title = `${chapter.name} | ${MANUAL.shortTitle} | ${SITE_NAME}`;
  return {
    title,
    description: chapter.summary,
    alternates: { canonical: chapterPath(chapter.slug) },
    openGraph: { siteName: SITE_NAME, title: `${chapter.name} | ${MANUAL.shortTitle}`, description: chapter.summary, url: chapterPath(chapter.slug), type: "website" },
  };
}

/**
 * One chapter of the Brand Standards. Every chapter is the same structure:
 * the black opener, the sticky row (chapter menu, this chapter's sections,
 * Download PDF), the chapter's plates, and the previous / next pager. Static.
 *
 * The sticky row sits in the same wrapper as the plates, so it stays through
 * them and releases before the pager and the footer (as on The Science).
 */
export default async function BrandChapterPage({ params }: PageProps<"/brand/[chapter]">) {
  const chapter = getChapter((await params).chapter);
  if (!chapter) notFound();

  return (
    <>
      <ChapterOpener chapter={chapter} />
      <div data-slot="brand-body">
        <BrandNav chapters={chapters.map(outlineOf)} />
        {chapter.plates.map((plate, i) => (
          <WebPlate key={plate.id} plate={plate} number={plateNumber(chapter, i)} />
        ))}
      </div>
      <ChapterPager chapters={chapters} current={chapter} />
    </>
  );
}
