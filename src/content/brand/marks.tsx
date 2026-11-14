import Image from "next/image";
import type { ReactNode } from "react";
import { BrandBadge } from "@/components/brand/BrandBadge";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { LogoStage } from "@/components/brand/demos/LogoStage";
import { DownloadIcon } from "@/components/brand/icons";
import { Frame, Pending, Rule, SpecList, SpecTable, Usage } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_GROW, PRINT_ONLY, PRINT_ROWS_1, PRINT_ROWS_2, WEB_ONLY } from "@/components/brand/styles";
import { TopoPattern } from "@/components/home/TopoPattern";
import { LOGO_DOWNLOADS, SITE_HOST, type BrandChapter } from "@/lib/brand/manual";
import { BADGE, BADGE_RATIO, WORDMARK } from "@/lib/brand/spec";
import { tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

const r2 = (n: number) => Math.round(n * 100) / 100;
const pct = (n: number) => `${Math.round(n * 100)}%`;

function FamilyCard({ rank, name, role, children }: { rank: string; name: string; role: string; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-col">
      <Frame className="flex aspect-[4/3] items-center justify-center p-8 [.brand-print_&]:aspect-auto [.brand-print_&]:min-h-0 [.brand-print_&]:flex-1">{children}</Frame>
      <p className={cn(LABEL, "mt-4 text-foreground/65")}>{rank}</p>
      <p className="mt-1 text-[24px] leading-7 font-black tracking-[-0.03em]">{name}</p>
      <p className="mt-1 text-p-sm text-foreground/75">{role}</p>
    </div>
  );
}

const badge = (className: string, ink: "black" | "white" = "black") => <BrandBadge ink={ink} className={className} />;

/** The homepage photograph, as a ground for the grounds plate. `position` picks the window onto it. */
const heroGround = (position: string) => (
  <Image src="/home/hero.jpg" alt="" fill sizes="(min-width: 1024px) 300px, 50vw" className="-z-10 object-cover" style={{ objectPosition: position }} />
);

/** One downloadable file set: a preview, its name, and SVG and PNG links. */
function LogoFile({ mark, ink, title, use }: { mark: "badge" | "wordmark"; ink: "black" | "white"; title: string; use: string }) {
  const name = `cmr-${mark}-${ink}`;
  const pill = "inline-flex h-9 items-center gap-1.5 rounded-md border border-foreground px-3 font-mono text-[13px] leading-none tracking-[0.06em] uppercase [.brand-print_&]:h-7 [.brand-print_&]:px-2 [.brand-print_&]:text-[12px]";
  const link = (ext: "svg" | "png") => (
    <>
      {/* In the PDF a link would resolve to the build server, so the format is printed as a label; the address is given in text below. */}
      <span className={cn(pill, PRINT_ONLY, "[.brand-print_&]:inline-flex")}>{ext}</span>
      <a
      href={`${LOGO_DOWNLOADS.dir}/${name}.${ext}`}
      download={`${name}.${ext}`}
      aria-label={`Download the ${title.toLowerCase()} as ${ext.toUpperCase()}`}
      className={cn(pill, WEB_ONLY, "outline-none hover:bg-foreground hover:text-background focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset) motion-safe:transition-colors")}
    >
      <DownloadIcon className="size-3.5" />
      {ext}
    </a>
    </>
  );
  return (
    <li data-slot="logo-file" className="flex min-h-0 flex-col">
      <Frame ground={ink === "white" ? "black" : "white"} className="flex aspect-[16/10] items-center justify-center p-6 [.brand-print_&]:aspect-auto [.brand-print_&]:min-h-0 [.brand-print_&]:flex-1">
        {mark === "badge" ? badge("w-[62%]", ink) : <BrandWordmark className="w-[62%]" />}
      </Frame>
      <p className="mt-3 text-p-sm font-semibold">{title}</p>
      <p className="font-mono text-[12px] leading-5 text-foreground/65">{name}.svg · .png</p>
      <p className="mt-1 text-[14px] leading-5 text-foreground/70">{use}</p>
      <p className="mt-3 flex gap-2">
        {link("svg")}
        {link("png")}
      </p>
    </li>
  );
}

export const marks: BrandChapter = {
  slug: "marks",
  number: "02",
  title: "The marks.",
  name: "Marks",
  summary: "A badge and a wordmark. What each one is for, how much room it needs, what to put it on, and where to download it.",
  plates: [
    {
      id: "family",
      title: "Two marks, one order.",
      nav: "The family",
      lede: "The badge is the signature: it goes first, and on most things it goes alone. The stacked wordmark is the full name, for when the name has to be spelled out or there is room to be large.",
      render: () => (
        <>
          <div className={cn("grid gap-x-6 gap-y-10 md:grid-cols-2", PRINT_GROW, PRINT_ROWS_1)}>
            <FamilyCard rank="Primary" name="The badge" role="The signature. Small, in a corner, on everything.">
              {badge("w-[56%]")}
            </FamilyCard>
            <FamilyCard rank="Full name" name="The wordmark" role="When the name must be spelled out, and when there is room to be large.">
              <BrandWordmark className="w-[58%]" />
            </FamilyCard>
          </div>
          <div className={cn("mt-10 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="One leads.">The site shows the badge in the header and the wordmark in the footer. When both appear in one piece, one is clearly larger or clearly first, and they sit apart.</Rule>
            <Rule title="No lockup, yet.">There is no approved combination of badge and wordmark. Do not build one; the Owner may design one later.</Rule>
            <Rule title="The ™ stays.">Both marks carry a ™ in the artwork. Keep it.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "badge",
      title: "The badge.",
      nav: "Badge",
      lede: "Three letters knocked out of a black shape. The shape is not an oval: it is flatter along the bottom and higher on one shoulder, like a hill drawn from memory. That irregularity is the mark.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="grid gap-4 lg:col-span-7 [.brand-print_&]:grid-rows-2">
            <Frame label="On white" className="flex min-h-[220px] items-center justify-center p-8 [.brand-print_&]:min-h-0">
              {badge("w-[56%] max-w-[400px]")}
            </Frame>
            <Frame ground="black" label="On black" className="flex min-h-[220px] items-center justify-center p-8 [.brand-print_&]:min-h-0">
              {badge("w-[56%] max-w-[400px]", "white")}
            </Frame>
          </div>
          <div className="flex flex-col lg:col-span-5">
            <SpecList
              rows={[
                ["Shape, width to height", `${r2(BADGE_RATIO)} : 1`],
                ["Letters", "C M R, knocked out"],
                ["Letter height", `${pct(BADGE.letters.h / BADGE.master.h)} of the badge's height`],
                ["™", "Top right of the R, knocked out"],
                ["Color", "One. Black, or white on black."],
                ["Master", "Vector (SVG). See Files."],
              ]}
            />
            <div className={cn("mt-6 grid gap-6", PRINT_BOTTOM)}>
              <Rule title="It is always solid.">One flat color with the letters cut out, so whatever is behind the badge shows through them.</Rule>
              <Rule title="The letters are artwork.">They are not set in Geist or any font in the system. Never retype them.</Rule>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "space",
      title: "Clear space and size.",
      nav: "Space and size",
      lede: "Give the badge room equal to the height of its own letters on every side. On screen it is never narrower than 96 pixels, the smallest size the site already uses.",
      render: () => (
        <div className={cn("flex flex-col", PRINT_GROW)}>
          <div className={PRINT_GROW}>
            <LogoStage />
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 [.brand-print_&]:mt-6">
            <div className="lg:col-span-7">
              <SpecTable
                caption="Badge widths on the CMR website"
                head={["Where", "Width"]}
                mono={[1]}
                rows={[
                  ["Header, desktop", `${BADGE.production.desktop} px`],
                  ["Header, desktop, scrolled", `${BADGE.production.desktopCompact} px`],
                  ["Header, tablet", `${BADGE.production.tablet} px`],
                  ["Header, phone", `${BADGE.production.mobile} px`],
                  ["Header, tablet, scrolled", `${BADGE.production.tabletCompact} px, the smallest in use`],
                ]}
              />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-5">
              <Pending status="provisional" title={`Smallest on screen: ${BADGE.minScreenPx} px wide.`}>
                Below this the ™ stops resolving. Where something smaller is needed, use the site icon (see Files), not a shrunken badge.
              </Pending>
              <Pending title="Smallest in print, embroidery and on other materials.">
                Depends on the method and the material. Agree it with the vendor and approve a physical proof. Screen sizes do not carry over.
              </Pending>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "wordmark",
      title: "The wordmark.",
      nav: "Wordmark",
      lede: "The full name in three stacked lines of Geist Black capitals, flush left, set tight. Its vector master is outlined from the type itself; use the master, never a fresh setting of the font.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="flex flex-col lg:col-span-7">
            <Frame className="flex min-h-[300px] flex-1 items-center justify-center p-10">
              <div className="relative w-full max-w-[520px]">
                <BrandWordmark className="w-full" />
                {/* Cap height and baseline of each line, from the master's own type specification. */}
                <svg aria-hidden viewBox={`0 0 ${WORDMARK.master.w} ${WORDMARK.master.h}`} className="pointer-events-none absolute inset-0 size-full overflow-visible text-foreground" fill="none" stroke="currentColor">
                  {[0, 1, 2].flatMap((i) => {
                    const top = WORDMARK.master.capTop + i * WORDMARK.lineHeightPx;
                    return [top, top + WORDMARK.master.capHeight].map((v) => (
                      <line key={`${i}-${v}`} x1={-90} x2={WORDMARK.master.w + 40} y1={v} y2={v} strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" opacity="0.45" />
                    ));
                  })}
                </svg>
                <span className={cn(LABEL, "absolute top-[1%] right-full mr-3 text-[10px] text-foreground/70")}>Cap</span>
                <span className={cn(LABEL, "absolute top-[26%] right-full mr-3 text-[10px] text-foreground/70")}>Base</span>
              </div>
            </Frame>
            <Frame ground="muted" label="As used: the footer" className="mt-4 flex items-center justify-center p-8">
              <BrandWordmark className="w-[46%] max-w-[280px] text-(--cmr-quiet-ink)" />
            </Frame>
          </div>
          <div className="flex flex-col lg:col-span-5">
            <SpecList
              rows={[
                ["Typeface", WORDMARK.typeface],
                ["Lines", "Three, flush left"],
                ["Leading", `${r2(WORDMARK.lineHeightPx / WORDMARK.fontSizePx)} × the type size`],
                ["Tracking", `${r2((WORDMARK.trackingPx / WORDMARK.fontSizePx) * 100)}% (−1/64 em)`],
                ["™", `${pct(WORDMARK.tm.fontSizePx / WORDMARK.fontSizePx)} of the type size, hung from the cap height after RUNNERS`],
                ["Proportion", `${r2(WORDMARK.master.w / WORDMARK.master.h)} : 1`],
              ]}
            />
            <div className={cn("mt-6 grid gap-6", PRINT_BOTTOM)}>
              <Rule title="Three lines, flush left.">CHICAGO is shorter than the lines below it. That ragged right edge is correct. Do not justify or center it.</Rule>
              <Rule title="Never one line.">Chicago Mountain Runners in a sentence is just text. The wordmark is the stack.</Rule>
              <Rule title="Never rebuilt.">No resetting it in Geist, no other typeface, no adjusting the spacing. The master file is the wordmark.</Rule>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "grounds",
      title: "Color and ground.",
      nav: "Grounds",
      lede: "The marks are one color: black on light grounds, white on dark ones, quiet gray in the footer. On a photograph or a pattern, find the calm part of the picture, or move the mark until there is one.",
      render: () => (
        <>
          <div className={cn("grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 [.brand-print_&]:gap-y-5", PRINT_GROW, PRINT_ROWS_2)}>
            <Usage kind="do" caption="Black on white. The header." fill>
              {badge("w-[60%]")}
            </Usage>
            <Usage kind="do" ground="black" caption="White on black." fill>
              {badge("w-[60%]", "white")}
            </Usage>
            <Usage kind="do" ground="muted" caption="Quiet ink on the gray footer. Wordmark only." fill>
              <BrandWordmark className="w-[62%] text-(--cmr-quiet-ink)" />
            </Usage>
            <Usage kind="do" caption="Black on tie-dye. The cloth shows through the letters." stageClassName="border-0" fill>
              <span aria-hidden style={tintVars(1)} className="absolute inset-0 -z-10 overflow-hidden">
                <span className="cmr-tie-dye absolute" />
              </span>
              {badge("w-[60%]")}
            </Usage>
            <Usage kind="do" caption="Black on open sky. A calm, light part of the photograph." stageClassName="border-0 bg-primary" fill>
              {heroGround("50% 6%")}
              {badge("w-[52%]")}
            </Usage>
            <Usage kind="dont" caption="Across the horizon and the runner. Neither the badge nor the picture reads." stageClassName="border-0 bg-primary" fill>
              {heroGround("50% 96%")}
              <span className="absolute top-[64%] left-1/2 w-[52%] -translate-x-1/2 -translate-y-1/2">{badge("w-full")}</span>
            </Usage>
            <Usage kind="do" caption="The same photograph, with the badge moved up into the sky." stageClassName="border-0 bg-primary" fill>
              {heroGround("50% 96%")}
              <span className="absolute top-[10%] left-[8%] w-[40%]">{badge("w-full")}</span>
            </Usage>
            <Usage kind="dont" caption="Over a busy pattern. Lines run through the letters." fill>
              <TopoPattern className="-z-10 text-foreground/55" />
              {badge("w-[60%]")}
            </Usage>
          </div>
          <div className={cn("mt-10 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="Contrast first.">Black on white and white on black are 21:1. On the pale secondary colors and tie-dye, the mark is black.</Rule>
            <Rule title="Find the calm part.">On a photograph, put the mark where the picture is plain and even: sky, grass, shadow. If there is no such place, choose another photograph.</Rule>
            <Rule title="Nothing added.">Never a box, a glow or a shadow to rescue a mark on a difficult background. Move it instead.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "misuse",
      title: "Leave it alone.",
      nav: "Misuse",
      lede: "The marks arrive finished. Every example below is the real artwork with one thing done to it, and each is struck through the way CMR strikes its own second thoughts.",
      render: () => (
        <div className={cn("grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 [.brand-print_&]:gap-y-5", PRINT_GROW, PRINT_ROWS_2)}>
          {(
            [
              ["Don't stretch or squeeze it.", <span key="a" className="block w-[60%] scale-x-[1.35] scale-y-[0.8]">{badge("w-full")}</span>],
              ["Don't rotate or tilt it.", <span key="b" className="block w-[56%] -rotate-12">{badge("w-full")}</span>],
              ["Don't fill it with the gradient, a color or tie-dye.", <span key="c" className="block w-[60%]"><CmrLogoFill /></span>],
              ["Don't add a shadow, glow or outline.", <span key="d" className="block w-[60%] drop-shadow-[0_6px_6px_rgba(0,0,0,0.45)]">{badge("w-full")}</span>],
              ["Don't set it at reduced opacity.", <span key="e" className="block w-[60%] opacity-35">{badge("w-full")}</span>],
              ["Don't crowd it. Type stays outside the clear space.", <span key="f" className="flex w-[84%] items-center gap-1.5">{badge("w-[52%]")}<span className="text-[15px] leading-none font-black tracking-[-0.03em]">RUN CLUB</span></span>],
              ["Don't retype the name in another weight or face.", <span key="g" className="text-center font-mono text-[19px] leading-[1.1] font-normal">Chicago<br />Mountain<br />Runners</span>],
              ["Don't put it in a container of your own.", <span key="h" className="flex aspect-square w-[58%] items-center justify-center rounded-full border-2 border-foreground">{badge("w-[78%]")}</span>],
            ] as [string, ReactNode][]
          ).map(([caption, art]) => (
            <Usage key={caption} kind="dont" caption={caption} fill>
              {art}
            </Usage>
          ))}
        </div>
      ),
    },
    {
      id: "files",
      title: "Files.",
      nav: "Files",
      lede: "The approved logo files, ready to use. SVG is the master for anything printed, cut, stitched or enlarged; PNG is for documents and screens. Black for light grounds, white for dark ones.",
      render: () => (
        <>
          <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4", PRINT_GROW, PRINT_ROWS_1)}>
            <LogoFile mark="badge" ink="black" title="Badge, black" use="White and light grounds." />
            <LogoFile mark="badge" ink="white" title="Badge, white" use="Black and dark grounds." />
            <LogoFile mark="wordmark" ink="black" title="Wordmark, black" use="White and light grounds." />
            <LogoFile mark="wordmark" ink="white" title="Wordmark, white" use="Black and dark grounds." />
          </ul>
          <div className={cn("mt-10 grid gap-8 lg:grid-cols-12", PRINT_BOTTOM)}>
            <div className="flex flex-col gap-4 lg:col-span-5">
              <a
                href={`${LOGO_DOWNLOADS.dir}/cmr-logos.zip`}
                download="cmr-logos.zip"
                className={cn(
                  "inline-flex h-14 w-fit items-center gap-2.5 rounded-md bg-primary px-7 text-[18px] leading-[27px] font-semibold text-primary-foreground outline-none hover:bg-primary-foreground hover:text-primary hover:inset-ring hover:inset-ring-primary focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset) motion-safe:transition-colors",
                  WEB_ONLY,
                )}
              >
                <DownloadIcon className="size-[18px]" />
                Download all logo files (ZIP)
              </a>
              <p className={cn("text-p-sm text-foreground/75", WEB_ONLY)}>All eight files and a short note on using them. Fonts are not included: Geist comes from its publisher, with its license.</p>
              <p className={cn("text-[15px] leading-[22px] text-foreground/80", PRINT_ONLY)}>
                Download every file, or all of them in one ZIP, at <span className="font-semibold">{SITE_HOST}{LOGO_DOWNLOADS.section}</span>. Fonts are not included: Geist comes from its publisher, with its license.
              </p>
            </div>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-7">
              <Rule title="Use them as supplied.">Correct proportions, transparent backgrounds, the ™ in place. Scale them; do not edit them.</Rule>
              <div className="flex gap-4 border-t border-foreground pt-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- the site's own icon file */}
                <img src="/icon.svg" alt="" width={48} height={48} className="size-12 shrink-0 ring-1 ring-foreground/15" />
                <div>
                  <h3 className="text-[20px] leading-6 font-black tracking-[-0.02em] [.brand-print_&]:text-[18px] [.brand-print_&]:leading-[22px]">The site icon.</h3>
                  <p className="mt-2 text-p-sm text-foreground/70">The badge&apos;s outline alone, without letters or ™, for browser tabs and home screens.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },
  ],
};

/** Misuse example only: the badge shape filled with the mesh gradient. */
function CmrLogoFill() {
  return (
    <span
      aria-hidden
      className="block aspect-[1341.2/586.6] w-full bg-[url(/home/mesh-gradient.png)] bg-[length:100%_100%]"
      style={{
        maskImage: "url(/brand/logos/cmr-badge-black.svg)",
        maskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskImage: "url(/brand/logos/cmr-badge-black.svg)",
        WebkitMaskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}
