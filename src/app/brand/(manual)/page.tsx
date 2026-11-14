import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandNav } from "@/components/brand/BrandNav";
import { DownloadIcon } from "@/components/brand/icons";
import { LABEL } from "@/components/brand/styles";
import { CmrLogo } from "@/components/CmrLogo";
import { Container } from "@/components/Container";
import { ctaLinkVariants } from "@/components/CtaLink";
import { HillContourArt } from "@/components/hills/HillContourArt";
import { HillHeroBackground, seedFor } from "@/components/hills/HillHero";
import { EYEBROW } from "@/components/hills/styles";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/icons";
import { chapters } from "@/content/brand";
import { LOGO_DOWNLOADS, MANUAL, READING, chapterPath, outlineOf } from "@/lib/brand/manual";
import { FLUID_TYPE } from "@/lib/fluid";
import { DISPLAY_HEADING, displayLarge, impactH2, standardH2 } from "@/lib/headings";
import { HERO_TOP, heroTopVars } from "@/lib/hero-spacing";
import { SITE_NAME } from "@/lib/site";
import { onDarkSurface } from "@/lib/surfaces";
import { tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

const DESCRIPTION =
  "How Chicago Mountain Runners looks, sounds and behaves: the marks, color, typography, graphic language, photography, voice and digital standards, with the logo files.";

export const metadata: Metadata = {
  title: `${MANUAL.shortTitle} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: "/brand" },
  openGraph: { siteName: SITE_NAME, title: MANUAL.shortTitle, description: DESCRIPTION, url: "/brand", type: "website" },
};

const longDate = new Date(`${MANUAL.date}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

/** One "short version" tile: a small composition made of the real thing, linking to its chapter. */
function Essential({ href, label, title, children, className }: { href: string; label: string; title: string; children: ReactNode; className?: string }) {
  return (
    <li>
      <Link href={href} className="group/es block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)">
        <div className={cn("relative isolate flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl", className)}>{children}</div>
        <p className={cn(LABEL, "mt-4 text-foreground/65")}>{label}</p>
        <p className="mt-1 text-[22px] leading-7 font-black tracking-[-0.02em] underline-offset-4 group-hover/es:underline">{title}</p>
      </Link>
    </li>
  );
}

/**
 * /brand — the Brand Standards' front door: what the manual is, the six things
 * to know if you read nothing else, the chapters, how to read it, and the
 * downloads. Static. The hero carries no buttons (Owner, Review 01): the sticky
 * row below it already holds the chapter menu and Download PDF.
 */
export default function BrandLandingPage() {
  const href = (slug: string) => (chapters.some((c) => c.slug === slug) ? chapterPath(slug) : "/brand");

  return (
    <>
      <section aria-labelledby="brand-heading" data-slot="brand-hero" className={cn("relative isolate overflow-hidden bg-primary text-primary-foreground", onDarkSurface)}>
        <HillHeroBackground seed={seedFor("brand-standards")} />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-primary from-30% via-primary/75 via-60% to-primary/25 lg:bg-linear-to-r lg:from-primary lg:from-45% lg:via-primary/85 lg:via-62% lg:to-primary/0 lg:to-95%"
        />
        <Container style={heroTopVars()} className={cn(HERO_TOP, "pb-16 md:pb-20 lg:pb-24")}>
          <p className={cn(EYEBROW, "text-primary-foreground/75")}>
            Version {MANUAL.version}
          </p>
          <h1 id="brand-heading" style={displayLarge()} className={cn(FLUID_TYPE, "mt-5 font-black tracking-[-0.045em]")}>
            <span className="block">Brand</span> <span className="block">standards.</span>
          </h1>
          <p className="mt-8 max-w-[560px] text-[18px] leading-[28px] text-primary-foreground/85 md:mt-10 md:text-[20px] md:leading-[30px]">
            A running club for a city without mountains needs a fairly clear idea of itself. This is how Chicago Mountain Runners looks, sounds and
            behaves, written down so anyone can get it right.
          </p>
        </Container>
      </section>

      <div data-slot="brand-body">
        <BrandNav chapters={chapters.map(outlineOf)} />

        <section id="essentials" aria-labelledby="essentials-heading" className="-scroll-mt-8 bg-background py-16 text-foreground md:-scroll-mt-14 md:py-24 lg:py-28">
          <Container>
            <div className="grid gap-x-12 gap-y-6 lg:grid-cols-12">
              <h2 id="essentials-heading" style={impactH2()} className={cn(FLUID_TYPE, DISPLAY_HEADING, "text-balance lg:col-span-7")}>
                The short version.
              </h2>
              <p className="max-w-[52ch] text-[18px] leading-[28px] text-foreground/75 lg:col-span-5 lg:pt-4">
                Six things carry most of the identity. Get these right and the rest tends to follow. Each one opens its chapter.
              </p>
            </div>
            <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
              <Essential href={href("marks")} label="02 Marks" title="One badge, used small and left alone." className="border border-foreground/15 bg-background">
                <CmrLogo className="aspect-[188/98] w-[56%]" />
              </Essential>
              <Essential href={href("color")} label="03 Color" title="Black and white, then six pale colors." className="border border-foreground/15">
                <div className="absolute inset-0 grid grid-cols-2">
                  <div className="bg-primary" />
                  <div className="bg-background" />
                </div>
                <span aria-hidden style={tintVars(0)} className="relative isolate block size-[34%] overflow-hidden rounded-full ring-1 ring-foreground/10">
                  <span className="cmr-tie-dye absolute -z-10" />
                </span>
              </Essential>
              <Essential href={href("typography")} label="04 Typography" title="Geist Black, set tight, ending in a period." className="bg-primary text-primary-foreground">
                <p className="text-[clamp(56px,11vw,128px)] leading-none font-black tracking-[-0.05em]">Mtns.</p>
              </Essential>
              <Essential href={href("graphic-language")} label="05 Graphic language" title="Contour lines and circles." className="border border-foreground/15 bg-background">
                <HillContourArt slug="cricket-hill" className="w-[58%]" />
              </Essential>
              <Essential href={href("photography")} label="06 Photography" title="Real places, real weather." className="bg-primary">
                <Image src="/home/hero.jpg" alt="" fill sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw" className="-z-10 object-cover object-[50%_72%]" />
                <div aria-hidden className="absolute inset-0 -z-10 bg-[url(/home/mesh-gradient.png)] bg-[length:100%_100%] opacity-25" />
              </Essential>
              <Essential href={href("voice")} label="07 Voice" title="Deadpan, specific, kind." className="">
                <span aria-hidden style={tintVars(2)} className="absolute inset-0 -z-10 overflow-hidden">
                  <span className="cmr-tie-dye absolute" />
                </span>
                <p className="px-6 text-center text-[clamp(22px,3.2vw,34px)] leading-[1.1] font-black tracking-[-0.03em]">
                  Chicago <s>Hills</s> Mountains
                </p>
              </Essential>
            </ul>
          </Container>
        </section>

        <section id="chapters" aria-labelledby="chapters-heading" className={cn("science-dark -scroll-mt-8 bg-background py-16 text-foreground md:-scroll-mt-14 md:py-24 lg:py-28", onDarkSurface)}>
          <Container>
            <p className={cn(EYEBROW, "text-foreground/70")}>{chapters.length} chapters</p>
            <h2 id="chapters-heading" style={impactH2()} className={cn(FLUID_TYPE, DISPLAY_HEADING, "mt-4 text-balance")}>
              The whole thing.
            </h2>
            <ol className="mt-10 border-t border-foreground md:mt-14">
              {chapters.map((c) => (
                <li key={c.slug} className="border-b border-foreground/40">
                  <Link
                    href={chapterPath(c.slug)}
                    className="group/row grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 rounded-xs py-5 outline-none focus-visible:ring-3 focus-visible:ring-ring md:grid-cols-[4rem_minmax(0,22rem)_1fr_auto] md:gap-x-8 md:py-6"
                  >
                    <span className="font-mono text-p text-foreground/70">{c.number}</span>
                    <span className="text-[28px] leading-8 font-semibold tracking-[-1px] underline-offset-4 group-hover/row:underline md:text-[40px] md:leading-[44px]">{c.name}</span>
                    <span className="col-span-2 col-start-2 mt-2 text-p-sm text-foreground/70 md:col-span-1 md:col-start-3 md:mt-0 md:text-p">{c.summary}</span>
                    <ArrowUpRightIcon className="col-start-3 row-start-1 size-5 self-center md:col-start-4" />
                  </Link>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section id="how-to-read" aria-labelledby="how-heading" className="-scroll-mt-8 bg-background py-16 text-foreground md:-scroll-mt-14 md:py-24 lg:py-28">
          <Container className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="how-heading" style={standardH2()} className={cn(FLUID_TYPE, DISPLAY_HEADING, "text-balance")}>
                How to read it.
              </h2>
              <p className="mt-6 max-w-[48ch] text-[18px] leading-[28px] text-foreground/75">
                Everything in the manual is the standard. Where something depends on a material or a vendor, like the smallest size of the badge on
                a shirt, the manual says so in plain words and tells you how to settle it.
              </p>
              <p className="mt-4 max-w-[48ch] text-[18px] leading-[28px] text-foreground/75">
                The pixel values describe the website. On paper, fabric or anything else, keep the relationships and let the sizes follow the format.
              </p>
            </div>
            <dl className="border-t border-foreground lg:col-span-7">
              {READING.map(([k, v]) => (
                <div key={k} className="grid gap-x-8 gap-y-2 border-b border-foreground/20 py-5 sm:grid-cols-[9rem_1fr] sm:items-baseline">
                  <dt className={cn(LABEL, "text-foreground/65")}>{k}</dt>
                  <dd className="text-[18px] leading-[27px] text-foreground/80">{v}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        <section id="download" aria-labelledby="download-heading" className="-scroll-mt-8 border-t border-foreground/15 bg-muted py-16 text-foreground [--focus-offset:var(--muted)] md:-scroll-mt-14 md:py-24">
          <Container className="grid items-end gap-x-12 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 id="download-heading" style={standardH2()} className={cn(FLUID_TYPE, DISPLAY_HEADING, "text-balance")}>
                Take it with you.
              </h2>
              <p className="mt-6 max-w-[52ch] text-[18px] leading-[28px] text-foreground/75">
                The complete manual as one PDF: every chapter, laid out for the page, with the same values as this site. US Letter landscape. The logo
                files are in Marks.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:justify-self-end">
              <a href={MANUAL.pdfHref} download={MANUAL.pdfDownloadName} className={cn(ctaLinkVariants({ variant: "primary" }), "h-14 gap-2.5 px-7 text-[18px] leading-[27px]")}>
                <DownloadIcon className="size-[18px]" />
                Download PDF
              </a>
              <a
                href={LOGO_DOWNLOADS.section}
                className="group/lf inline-flex items-center gap-1.5 rounded-xs text-p font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)"
              >
                Logo files
                <ArrowRightIcon className="size-4 motion-safe:transition-transform motion-safe:group-hover/lf:translate-x-0.5" />
              </a>
              <p className={cn(LABEL, "text-foreground/65")}>
                Version {MANUAL.version} · {longDate}
              </p>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
