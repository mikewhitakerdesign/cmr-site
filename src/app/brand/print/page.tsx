import type { Metadata } from "next";
import { PrintChapterOpener } from "@/components/brand/chapter";
import { PrintPlate } from "@/components/brand/kit";
import { PrintColophon, PrintContents, PrintCover } from "@/components/brand/print";
import { chapters } from "@/content/brand";
import { MANUAL, pdfPageMap, plateNumber } from "@/lib/brand/manual";

export const metadata: Metadata = {
  // Chromium writes the document title into the PDF's Title field.
  title: `${MANUAL.title}, version ${MANUAL.version}`,
  description: "Print source for the Brand Standards PDF.",
  alternates: { canonical: "/brand/print" },
  // A production artifact, not a page for readers: the PDF is the public form. Never listed in the sitemap.
  robots: { index: false, follow: false },
};

/**
 * /brand/print — the source of the PDF (scripts/brand/build-pdf.mjs prints
 * this page to public/downloads). Cover, contents, then every chapter's opener
 * and plates, then the colophon: the same chapter data and the same plate
 * components as the website, each on one fixed-size page (src/styles/brand.css).
 * On screen it is a proofing view of every page.
 */
export default function BrandPrintPage() {
  const map = pdfPageMap(chapters);
  return (
    <div className="brand-print" data-slot="brand-print" data-pages={map.total}>
      <PrintCover />
      <PrintContents chapters={chapters} map={map} />
      {chapters.map((chapter, c) => (
        <div key={chapter.slug} className="contents">
          <PrintChapterOpener chapter={chapter} page={map.chapters[c].opener} firstPlatePage={map.chapters[c].firstPlate} />
          {chapter.plates.map((plate, i) => (
            <PrintPlate
              key={plate.id}
              plate={plate}
              number={plateNumber(chapter, i)}
              chapter={`${chapter.number} ${chapter.name}`}
              page={map.chapters[c].firstPlate + i}
            />
          ))}
        </div>
      ))}
      <PrintColophon page={map.colophon} />
    </div>
  );
}
