import { BrandBadge } from "@/components/brand/BrandBadge";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { PrintPage, SpecList } from "@/components/brand/kit";
import { LABEL } from "@/components/brand/styles";
import { SparseContours } from "@/components/brand/SparseContours";
import { LOGO_DOWNLOADS, MANUAL, MANUAL_ADDRESS, READING, SITE_HOST, pdfPageMap, type BrandChapter } from "@/lib/brand/manual";
import { tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

/**
 * Pages that exist only in the PDF: cover, contents and colophon. Everything
 * between them is the website's own chapters (src/app/brand/print/page.tsx).
 */

const pad = (n: number) => String(n).padStart(2, "0");
const longDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export function PrintCover() {
  return (
    <PrintPage bleed tone="dark" page={1} label="Cover">
      <SparseContours strokeWidth={1.25} />
      <div className="relative flex h-full flex-col justify-between p-16">
        <div className="flex items-start justify-between">
          <BrandBadge ink="white" className="w-[188px]" />
          <p className={cn(LABEL, "text-right text-[11px] leading-5 text-foreground/75")}>
            Version {MANUAL.version}
            <br />
            {longDate(MANUAL.date)}
          </p>
        </div>
        <div className="flex items-end justify-between gap-12">
          <h1 className="text-[184px] leading-[0.84] font-black tracking-[-0.05em]">
            Brand{" "}
            <br />
            standards.
          </h1>
          <div style={tintVars(0)} className="relative isolate mb-3 flex size-[200px] shrink-0 items-center justify-center overflow-hidden rounded-full text-center science-light text-foreground">
            <span aria-hidden className="cmr-tie-dye absolute -z-10" />
            <span className="text-[18px] leading-[1.15] font-extrabold">
              Make your
              <br />
              own mtns.
            </span>
          </div>
        </div>
        <p className={cn(LABEL, "flex justify-between text-[11px] text-foreground/75")}>
          <span>Chicago Mountain Runners</span>
          <span>{MANUAL_ADDRESS}</span>
        </p>
      </div>
    </PrintPage>
  );
}

export function PrintContents({ chapters, map }: { chapters: readonly BrandChapter[]; map: ReturnType<typeof pdfPageMap> }) {
  return (
    <PrintPage page={2} running="Contents" label="Contents">
      <div className="grid min-h-0 flex-1 grid-cols-12 gap-12">
        <div className="col-span-4 flex flex-col justify-between">
          <div>
            <h2 className="text-[88px] leading-[0.9] font-black tracking-[-0.045em]">Contents.</h2>
            <p className="mt-8 max-w-[34ch] text-[15px] leading-[23px] text-foreground/75">
              How Chicago Mountain Runners looks, sounds and behaves: for anyone designing, writing, printing or building in its name.
            </p>
          </div>
          <div>
            <h3 className={cn(LABEL, "mb-3 text-foreground/65")}>How to read it</h3>
            <ul className="border-t border-foreground/20">
              {READING.map(([k, v]) => (
                <li key={k} className="flex items-baseline gap-3 border-b border-foreground/20 py-2">
                  <span className={cn(LABEL, "w-[92px] shrink-0 text-[11px] text-foreground/65")}>{k}</span>
                  <span className="text-[13px] leading-[18px] text-foreground/75">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ol className="col-span-8 flex flex-col justify-between border-t border-foreground">
          {chapters.map((c, i) => (
            <li key={c.slug} className="flex flex-1 items-center gap-6 border-b border-foreground/25">
              <span className="w-8 shrink-0 font-mono text-[13px] text-foreground/65">{c.number}</span>
              <span className="w-[250px] shrink-0 text-[30px] leading-8 font-black tracking-[-0.03em]">{c.name}</span>
              <span className="flex-1 text-[13px] leading-[18px] text-foreground/70">{c.summary}</span>
              <span className="w-8 shrink-0 text-right font-mono text-[13px]">{pad(map.chapters[i].opener)}</span>
            </li>
          ))}
          <li className="flex flex-1 items-center gap-6">
            <span className="w-8 shrink-0 font-mono text-[13px] text-foreground/65">—</span>
            <span className="w-[250px] shrink-0 text-[30px] leading-8 font-black tracking-[-0.03em]">Colophon</span>
            <span className="flex-1 text-[13px] leading-[18px] text-foreground/70">About this document, and how it is made.</span>
            <span className="w-8 shrink-0 text-right font-mono text-[13px]">{pad(map.colophon)}</span>
          </li>
        </ol>
      </div>
    </PrintPage>
  );
}

export function PrintColophon({ page }: { page: number }) {
  return (
    <PrintPage tone="muted" page={page} running="Colophon" label="Colophon">
      <div className="grid min-h-0 flex-1 grid-cols-12 gap-12">
        <div className="col-span-5 flex flex-col justify-between">
          <div>
            <h2 className="text-[88px] leading-[0.9] font-black tracking-[-0.045em]">Colophon.</h2>
            <p className="mt-8 max-w-[40ch] text-[15px] leading-[23px] text-foreground/75">
              This PDF is printed from the Brand Standards on the CMR website. The two share one set of chapters and one set of values, so they cannot
              disagree. When they are rebuilt, both change.
            </p>
            <p className="mt-4 max-w-[40ch] text-[15px] leading-[23px] text-foreground/75">
              The logo files are downloaded from the website, at {SITE_HOST}
              {LOGO_DOWNLOADS.section}. Questions about using the brand go through the Questions form on any page of the site. Changes to a standard
              need the Owner&apos;s approval; see Governance.
            </p>
          </div>
          <BrandWordmark className="w-[340px] text-(--cmr-quiet-ink)" />
        </div>
        <div className="col-span-7">
          <SpecList
            rows={[
              ["Document", MANUAL.title],
              ["Version", MANUAL.version],
              ["Edition date", longDate(MANUAL.date)],
              ["Owner", "Michael Whitaker, Founder & Director"],
              ["Live version", MANUAL_ADDRESS],
              ["Typefaces", "Geist and Geist Mono (SIL Open Font License 1.1)"],
              ["Page", "US Letter landscape, 11 × 8.5 in"],
              ["Color", "sRGB. Not a press-ready CMYK file."],
              ["Values", "Read from the site's design tokens at build time"],
              ["Logo files", `${SITE_HOST}${LOGO_DOWNLOADS.section}`],
              ["Photography", "Homepage hero photograph: the Owner's. Other image rights are noted in Photography."],
              ["Trademarks", "™ appears as in the supplied artwork. This document makes no statement about registration."],
            ]}
          />
          <p className="mt-6 text-[12px] leading-[18px] text-foreground/65">
            © {MANUAL.date.slice(0, 4)} Chicago Mountain Runners. The marks and artwork shown are the property of Chicago Mountain Runners and may be
            used only as these standards describe.
          </p>
        </div>
      </div>
    </PrintPage>
  );
}
