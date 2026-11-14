import Link from "next/link";
import { Container } from "@/components/Container";
import { ArrowRightIcon } from "@/components/icons";
import { PrintPage, StatusTag } from "@/components/brand/kit";
import { LABEL } from "@/components/brand/styles";
import { HillHeroBackground, seedFor } from "@/components/hills/HillHero";
import { TopoPattern } from "@/components/home/TopoPattern";
import { EYEBROW } from "@/components/hills/styles";
import { MANUAL, chapterPath, plateNumber, type BrandChapter } from "@/lib/brand/manual";
import { FLUID_TYPE } from "@/lib/fluid";
import { displayLarge } from "@/lib/headings";
import { HERO_TOP, heroTopVars } from "@/lib/hero-spacing";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/**
 * Chapter opener on the website: the black contour hero of the hill pages and
 * The Science (the same HillHeroBackground), with the chapter's number, title,
 * one-sentence summary and a list of what is in it.
 */
export function ChapterOpener({ chapter }: { chapter: BrandChapter }) {
  return (
    <section
      aria-labelledby="chapter-heading"
      data-slot="brand-chapter-opener"
      className={cn("relative isolate overflow-hidden bg-primary text-primary-foreground", onDarkSurface)}
    >
      <HillHeroBackground seed={seedFor(`brand-${chapter.slug}`)} />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-b from-primary from-30% via-primary/75 via-60% to-primary/25 lg:bg-linear-to-r lg:from-primary lg:from-45% lg:via-primary/85 lg:via-62% lg:to-primary/0 lg:to-95%"
      />
      <Container style={heroTopVars()} className={cn(HERO_TOP, "pb-16 md:pb-20 lg:pb-24")}>
        <p className={cn(EYEBROW, "text-primary-foreground/75")}>
          <Link href="/brand" className="rounded-xs underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring">
            Brand Standards
          </Link>{" "}
          / {chapter.number}
        </p>
        <h1 id="chapter-heading" style={displayLarge()} className={cn(FLUID_TYPE, "mt-5 max-w-[12ch] font-black tracking-[-0.045em] text-balance")}>
          {chapter.title}
        </h1>
        <p className="mt-8 max-w-[560px] text-[18px] leading-[28px] text-primary-foreground/85 md:text-[20px] md:leading-[30px]">{chapter.summary}</p>
        <nav aria-label="In this chapter" className="mt-10 max-w-[720px] md:mt-12">
          <ol className="grid gap-x-10 border-t border-primary-foreground/30 sm:grid-cols-2">
            {chapter.plates.map((p, i) => (
              <li key={p.id} className="border-b border-primary-foreground/30">
                <a
                  href={`#${p.id}`}
                  className="flex items-baseline gap-4 rounded-xs py-3 text-p font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
                >
                  <span className="w-10 shrink-0 font-mono text-[13px] text-primary-foreground/70">{plateNumber(chapter, i)}</span>
                  {p.nav}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </Container>
    </section>
  );
}

/** Previous and next chapter, at the foot of every chapter page. */
export function ChapterPager({ chapters, current }: { chapters: readonly BrandChapter[]; current: BrandChapter }) {
  const i = chapters.findIndex((c) => c.slug === current.slug);
  const prev = chapters[i - 1];
  const next = chapters[i + 1];
  const cell = "group/pg flex flex-col gap-2 rounded-xs py-10 outline-none focus-visible:ring-3 focus-visible:ring-ring md:py-14";
  const title = "text-[32px] leading-9 font-black tracking-[-0.03em] underline-offset-4 group-hover/pg:underline md:text-[44px] md:leading-[46px]";
  return (
    <nav aria-label="Chapters" data-slot="brand-pager" className={cn("science-dark bg-background text-foreground", onDarkSurface)}>
      <Container className="grid md:grid-cols-2 md:gap-12">
        {prev ? (
          <Link href={chapterPath(prev.slug)} className={cell}>
            <span className={cn(LABEL, "text-foreground/65")}>Previous / {prev.number}</span>
            <span className={title}>{prev.title}</span>
          </Link>
        ) : (
          <Link href="/brand" className={cell}>
            <span className={cn(LABEL, "text-foreground/65")}>Back to / 00</span>
            <span className={title}>Overview.</span>
          </Link>
        )}
        {next ? (
          <Link href={chapterPath(next.slug)} className={cn(cell, "border-t border-foreground/25 md:items-end md:border-0 md:text-right")}>
            <span className={cn(LABEL, "text-foreground/65")}>Next / {next.number}</span>
            <span className={cn(title, "inline-flex items-center gap-3")}>
              {next.title}
              <ArrowRightIcon className="size-6 shrink-0 motion-safe:transition-transform motion-safe:group-hover/pg:translate-x-1" />
            </span>
          </Link>
        ) : (
          <Link href="/brand" className={cn(cell, "border-t border-foreground/25 md:items-end md:border-0 md:text-right")}>
            <span className={cn(LABEL, "text-foreground/65")}>End of the manual</span>
            <span className={title}>Back to the overview.</span>
          </Link>
        )}
      </Container>
    </nav>
  );
}

/** Chapter opener in the PDF: a full-bleed black page with the number set very large. */
export function PrintChapterOpener({ chapter, page, firstPlatePage }: { chapter: BrandChapter; page: number; firstPlatePage: number }) {
  return (
    <PrintPage bleed tone="dark" page={page} label={`Chapter ${chapter.number}: ${chapter.name}`}>
      <TopoPattern className="text-(--cmr-contour-on-dark)" />
      <div className="relative flex h-full flex-col justify-between p-16">
        <p className={cn(LABEL, "flex justify-between text-[11px] text-foreground/70")}>
          <span>CMR Brand Standards</span>
          <span>Chapter {chapter.number}</span>
        </p>
        <div className="grid grid-cols-12 items-end gap-12">
          <div className="col-span-7">
            <p aria-hidden className="text-[260px] leading-[0.8] font-black tracking-[-0.06em]">
              {chapter.number}
            </p>
            <h2 className="mt-10 text-[104px] leading-[0.92] font-black tracking-[-0.045em] text-balance">{chapter.title}</h2>
            <p className="mt-8 max-w-[520px] text-[19px] leading-[28px] text-foreground/85">{chapter.summary}</p>
          </div>
          <ol className="col-span-5 border-t border-foreground/40">
            {chapter.plates.map((p, i) => (
              <li key={p.id} className="flex items-baseline gap-4 border-b border-foreground/40 py-[9px] text-[15px] leading-5 font-medium">
                <span className="w-10 shrink-0 font-mono text-[12px] text-foreground/70">{plateNumber(chapter, i)}</span>
                <span className="flex-1">{p.title}</span>
                {p.status && p.status !== "established" && <StatusTag status={p.status} className="text-[9.5px]" />}
                <span className="font-mono text-[12px] text-foreground/70">{String(firstPlatePage + i).padStart(2, "0")}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className={cn(LABEL, "flex justify-between text-[10px] text-foreground/55")}>
          <span>
            Version {MANUAL.version} · {MANUAL.status}
          </span>
          <span data-slot="brand-folio">{String(page).padStart(2, "0")}</span>
        </p>
      </div>
    </PrintPage>
  );
}
