import Image from "next/image";
import type { ReactNode } from "react";
import { BrandBadge } from "@/components/brand/BrandBadge";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { LogoStage } from "@/components/brand/demos/LogoStage";
import { Figure, Frame, Pending, Rule, Source, SpecList, SpecTable, StatusTag, Usage } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_GROW, PRINT_ROWS_1, PRINT_ROWS_2 } from "@/components/brand/styles";
import type { BrandChapter, Status } from "@/lib/brand/manual";
import { BADGE, BADGE_RATIO, SILHOUETTE, WORDMARK } from "@/lib/brand/spec";
import { cn } from "@/lib/utils";

const r2 = (n: number) => Math.round(n * 100) / 100;
const pct = (n: number) => `${Math.round(n * 100)}%`;

function FamilyCard({ rank, name, role, status, children }: { rank: string; name: string; role: string; status: Status; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-col">
      <Frame className="flex aspect-[4/3] items-center justify-center p-8 [.brand-print_&]:aspect-auto [.brand-print_&]:min-h-0 [.brand-print_&]:flex-1">{children}</Frame>
      <p className={cn(LABEL, "mt-4 flex items-center gap-3 text-foreground/65")}>
        {rank} <StatusTag status={status} />
      </p>
      <p className="mt-1 text-[24px] leading-7 font-black tracking-[-0.03em]">{name}</p>
      <p className="mt-1 text-p-sm text-foreground/75">{role}</p>
    </div>
  );
}

/** The hill silhouette, exactly as the homepage draws it. */
function Silhouette({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("relative block shrink-0", className)} style={{ aspectRatio: `${SILHOUETTE.raster.w} / ${SILHOUETTE.raster.h}` }}>
      <Image src="/home/community-mark.png" alt="" fill sizes="93px" className="object-fill" />
    </span>
  );
}

const badge = (className: string, ink: "black" | "white" = "black") => <BrandBadge ink={ink} className={className} />;

export const marks: BrandChapter = {
  slug: "marks",
  number: "02",
  title: "The marks.",
  name: "Marks",
  summary: "A badge, a wordmark and a hill. What each one is for, how much room it needs, and what not to do to it.",
  plates: [
    {
      id: "family",
      title: "Three marks, one order.",
      nav: "The family",
      status: "proposed",
      lede: "CMR has three pieces of identity artwork. Until now nothing said which comes first. This order is adopted provisionally (Owner, 2026-11-13) and is subject to visual review.",
      render: () => (
        <>
          <div className={cn("grid gap-x-6 gap-y-10 md:grid-cols-3", PRINT_GROW, PRINT_ROWS_1)}>
            <FamilyCard rank="Primary" name="The badge" role="The signature. Small, in a corner, on everything." status="proposed">
              {badge("w-[62%]")}
            </FamilyCard>
            <FamilyCard rank="Full name" name="The wordmark" role="When the name must be spelled out, and when there is room to be large." status="proposed">
              <BrandWordmark className="w-[74%]" />
            </FamilyCard>
            <FamilyCard rank="Supporting" name="The hill silhouette" role="A graphic, not a logo. It stands beside the brand statement." status="proposed">
              <Silhouette className="h-[78%]" />
            </FamilyCard>
          </div>
          <div className={cn("mt-10 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="One mark per view.">The site never shows the badge and the wordmark together: badge in the header, wordmark in the footer, a full page apart.</Rule>
            <Rule title="No lockup exists.">There is no approved arrangement of badge plus wordmark, or of either with an expression. Do not make one.</Rule>
            <Rule title="The ™ stays.">Both marks carry a ™ in the supplied artwork. Keep it. This manual makes no statement about registration.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "badge",
      title: "The badge.",
      nav: "Badge",
      status: "established",
      lede: "Three letters knocked out of a black shape. The shape is not an oval: it is flatter along the bottom and higher on one shoulder, like a hill drawn from memory. That irregularity is the mark.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="grid gap-4 lg:col-span-7 [.brand-print_&]:grid-rows-2">
            <Frame label="On white" className="flex min-h-[220px] items-center justify-center p-8 [.brand-print_&]:min-h-0">
              {badge("w-[58%] max-w-[420px]")}
            </Frame>
            <Frame ground="black" label="On black" className="flex min-h-[220px] items-center justify-center p-8 [.brand-print_&]:min-h-0">
              {badge("w-[58%] max-w-[420px]", "white")}
            </Frame>
          </div>
          <div className="flex flex-col lg:col-span-5">
            <SpecList
              rows={[
                ["Source", `Figma “Brand / CMR logo” ${BADGE.figmaNode}`],
                ["Frame", `${BADGE.figmaFrame.w} × ${BADGE.figmaFrame.h}`],
                ["Shape, width to height", `${r2(BADGE_RATIO)} : 1`],
                ["Letters", "C M R, knocked out"],
                ["Letter height", `${pct(BADGE.letters.h / BADGE.lozenge.h)} of the shape`],
                ["™", "Top right of the R, knocked out"],
                ["Colors", "One. Black, or white on black."],
                ["Master", `Raster, ${BADGE.raster.w} × ${BADGE.raster.h} px`],
              ]}
            />
            <div className={cn("mt-6 grid gap-6", PRINT_BOTTOM)}>
              <Rule title="It is always solid.">One flat color with the letters cut out, so whatever is behind the badge shows through them.</Rule>
              <Rule title="The letters are artwork.">They are not set in Geist or any font in the system. Never retype them.</Rule>
            </div>
            <Source className="mt-6">public/brand/cmr-logo-art.png, cmr-logo-mask-shape.svg (unmodified Figma exports); measured in src/lib/brand/spec.ts.</Source>
          </div>
        </div>
      ),
    },
    {
      id: "space",
      title: "Clear space and size.",
      nav: "Space and size",
      status: "proposed",
      lede: "Give the badge room equal to the height of its own letters on every side. The site already does this without having said so. The minimum sizes are proposals until someone has tested them in print.",
      render: () => (
        <div className={cn("flex flex-col", PRINT_GROW)}>
          <div className={PRINT_GROW}>
            <LogoStage />
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 [.brand-print_&]:mt-6">
            <div className="lg:col-span-7">
              <SpecTable
                caption="Badge widths in production on the CMR website"
                head={["Where", "Width", "Status"]}
                mono={[1]}
                rows={[
                  ["Header, desktop", `${BADGE.production.desktop} px`, "Established"],
                  ["Header, desktop, scrolled", `${BADGE.production.desktopCompact} px`, "Established"],
                  ["Header, tablet", `${BADGE.production.tablet} px`, "Established"],
                  ["Header, phone", `${BADGE.production.mobile} px`, "Established"],
                  ["Header, tablet, scrolled", `${BADGE.production.tabletCompact} px (smallest in use)`, "Established"],
                ]}
              />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-5">
              <Pending status="proposed" title="Minimum on screen: 72 px wide.">
                Below the smallest production size the ™ stops resolving. Under 72 px, use the wordless avatar once one exists (see Files).
              </Pending>
              <Pending status="unresolved" title="Minimum in print and embroidery: not tested.">
                No physical proof exists. Set these with the printer, on the actual material, before specifying them.
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
      status: "established",
      lede: "The full name in three stacked lines of Geist Black capitals, flush left, set tight. It is typography, so unlike the badge its construction can be stated exactly.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="flex flex-col lg:col-span-7">
            <Frame className="flex min-h-[300px] flex-1 items-center justify-center p-10">
              <div className="relative w-full max-w-[520px]">
                <BrandWordmark className="w-full" />
                {/* Cap height and line gap, from the traced artwork's own measurements. */}
                <svg aria-hidden viewBox={`0 0 ${WORDMARK.traced.w} ${WORDMARK.traced.h}`} className="pointer-events-none absolute inset-0 size-full overflow-visible text-foreground" fill="none" stroke="currentColor">
                  {[0, 1, 2].flatMap((i) => {
                    const y = 1 + i * (WORDMARK.traced.capHeight + WORDMARK.traced.lineGap);
                    return [y, y + WORDMARK.traced.capHeight].map((v) => (
                      <line key={`${i}-${v}`} x1={-90} x2={WORDMARK.traced.w + 40} y1={v} y2={v} strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" opacity="0.45" />
                    ));
                  })}
                </svg>
                <span className={cn(LABEL, "absolute top-[10%] right-full mr-3 text-[10px] text-foreground/70")}>Cap</span>
                <span className={cn(LABEL, "absolute top-[29.5%] right-full mr-3 text-[10px] text-foreground/70")}>Gap</span>
              </div>
            </Frame>
            <Frame ground="muted" label="As used: the footer" className="mt-4 flex items-center justify-center p-8">
              <BrandWordmark className="w-[46%] max-w-[280px] text-(--cmr-quiet-ink)" />
            </Frame>
          </div>
          <div className="flex flex-col lg:col-span-5">
            <SpecList
              rows={[
                ["Source", `Figma “CMR Logo Wordmark” ${WORDMARK.figmaNode}`],
                ["Typeface", WORDMARK.typeface],
                ["Size / leading", `${WORDMARK.fontSizePx} / ${WORDMARK.lineHeightPx} px`],
                ["Leading", `${r2(WORDMARK.lineHeightPx / WORDMARK.fontSizePx)} × the type size`],
                ["Tracking", `${r2((WORDMARK.trackingPx / WORDMARK.fontSizePx) * 100)}% (-1/64 em)`],
                ["Line gap", `${pct(WORDMARK.traced.lineGap / WORDMARK.traced.capHeight)} of the cap height`],
                ["™", `${pct(WORDMARK.tm.fontSizePx / WORDMARK.fontSizePx)} of the type size, after RUNNERS`],
                ["Proportion", `${r2(WORDMARK.traced.w / WORDMARK.traced.h)} : 1`],
              ]}
            />
            <div className={cn("mt-6 grid gap-6", PRINT_BOTTOM)}>
              <Rule title="Three lines, flush left.">CHICAGO is shorter than the lines below it. That ragged right edge is correct. Do not justify or center it.</Rule>
              <Rule title="Never one line.">Chicago Mountain Runners in a sentence is just text. The wordmark is the stack.</Rule>
            </div>
            <Source className="mt-6">Type values read from the live text in Figma. public/brand/cmr-wordmark.svg is a trace of that frame.</Source>
          </div>
        </div>
      ),
    },
    {
      id: "grounds",
      title: "Color and ground.",
      nav: "Grounds",
      status: "established",
      lede: "The marks are one color. They take the color of the type around them: black on light, white on black, quiet gray in the footer. They are never filled with anything else.",
      render: () => (
        <>
          <div className={cn("grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4", PRINT_GROW, PRINT_ROWS_1)}>
            <Usage kind="do" caption="Black on white. The header." fill>
              {badge("w-[60%]")}
            </Usage>
            <Usage kind="do" ground="black" caption="White on black." fill>
              {badge("w-[60%]", "white")}
            </Usage>
            <Usage kind="do" ground="muted" caption="Quiet ink on the gray footer. Wordmark only." fill>
              <BrandWordmark className="w-[62%] text-(--cmr-quiet-ink)" />
            </Usage>
            <Usage kind="do" caption="Black on a pale tint." stageClassName="bg-accent" fill>
              {badge("w-[60%]")}
            </Usage>
          </div>
          <div className={cn("mt-10 grid gap-8 lg:grid-cols-12", PRINT_BOTTOM)}>
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:col-span-8">
              <Rule title="Contrast first.">Black on white and white on black are 21:1. On a tint, the mark is always black.</Rule>
              <Rule title="Flat grounds.">A solid color behind the mark, with its clear space. Not a busy photograph, not contour lines running through the letters.</Rule>
            </div>
            <div className="lg:col-span-4">
              <Pending status="proposed" title="On tints and on photographs.">
                The site only ever places the marks on white, black and footer gray. The tint example is a proposal. No treatment on photography is defined.
              </Pending>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "silhouette",
      title: "The hill silhouette.",
      nav: "Silhouette",
      status: "established",
      lede: "A hill profile turned on its side, solid black. It appears once on the site, as a tall mark standing at the left of the opening statement. It works like a drop cap, not like a logo.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <Figure className="flex flex-col lg:col-span-7" caption="The homepage statement, as built. The silhouette is centered on the block of text at every size.">
            <Frame className="flex flex-1 items-center gap-6 p-8 md:p-10">
              <Silhouette className="h-[220px] md:h-[280px] [.brand-print_&]:h-[300px]" />
              <p className="ss08 text-[clamp(22px,2.9vw,36px)] leading-[1.07] font-black">
                Chicago Mountain Runners
                <sup className="relative -top-[1.6em] ml-[0.06em] align-baseline text-[0.3em] leading-none">TM</sup>{" "}
                <span className="text-muted-foreground">
                  is a running community for finding elevation, running it repeatedly and occasionally questioning our <s>sanity</s> decisions.
                </span>
              </p>
            </Frame>
          </Figure>
          <div className="flex flex-col lg:col-span-5">
            <SpecTable
              caption="Silhouette sizes on the homepage"
              head={["Viewport", "Width × height"]}
              mono={[1]}
              rows={[
                ["Phone, 393", `${SILHOUETTE.production.mobile[0]} × ${SILHOUETTE.production.mobile[1]} px`],
                ["Tablet, 768", `${SILHOUETTE.production.tablet[0]} × ${SILHOUETTE.production.tablet[1]} px`],
                ["Desktop, 1400", `${SILHOUETTE.production.desktop[0]} × ${SILHOUETTE.production.desktop[1]} px`],
              ]}
            />
            <div className={cn("mt-6 grid gap-6", PRINT_BOTTOM)}>
              <Rule title="Upright, flat edge right.">Always vertical, always with the straight edge toward the text it introduces.</Rule>
              <Rule title="Black only. Never alone.">It needs the statement next to it to mean anything. It is not an avatar, an icon or a pattern.</Rule>
              <Pending status="unresolved" title="Raster only.">
                The file is a {SILHOUETTE.raster.w} × {SILHOUETTE.raster.h} px crop of a larger image in Figma. No vector exists, so it cannot be enlarged for print yet.
              </Pending>
            </div>
            <Source className="mt-6">public/home/community-mark.png; src/components/home/CommunityIntro.tsx.</Source>
          </div>
        </div>
      ),
    },
    {
      id: "misuse",
      title: "Leave it alone.",
      nav: "Misuse",
      status: "established",
      lede: "The marks arrive finished. Every example below is the real artwork with one thing done to it, and each is struck through the way CMR strikes its own second thoughts.",
      render: () => (
        <div className={cn("grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 [.brand-print_&]:gap-y-5", PRINT_GROW, PRINT_ROWS_2)}>
          {(
            [
              ["Don't stretch or squeeze it.", <span key="a" className="block w-[60%] scale-x-[1.35] scale-y-[0.8]">{badge("w-full")}</span>],
              ["Don't rotate or tilt it.", <span key="b" className="block w-[56%] -rotate-12">{badge("w-full")}</span>],
              ["Don't fill it with the gradient, a tint or tie-dye.", <span key="c" className="block w-[60%]"><CmrLogoFill /></span>],
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
      title: "Files, and what is missing.",
      nav: "Files",
      status: "unresolved",
      lede: "The honest state of the masters. The website has what it needs. Print and merchandise do not yet, and two everyday files have never been made.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-8">
            <SpecTable
              caption="CMR mark files and their status"
              head={["Asset", "File", "Format", "Status"]}
              mono={[1]}
              rows={[
                ["Badge, production", "public/brand/cmr-logo-art.png + two masks", `Raster ${BADGE.raster.w} × ${BADGE.raster.h}`, "Approved. In use."],
                ["Badge, vector", "public/brand/proposed/cmr-badge-proposed.svg", "SVG, one path", "Proposed. Awaiting Owner review. Not in use."],
                ["Wordmark, production", "public/brand/cmr-wordmark.svg", "SVG, traced", "Approved. In use."],
                ["Wordmark, type original", `Figma ${WORDMARK.figmaNode}`, "Live Geist Black text", "Approved source. Outline it for a true vector master."],
                ["Hill silhouette", "public/home/community-mark.png", `Raster ${SILHOUETTE.raster.w} × ${SILHOUETTE.raster.h}`, "Approved. Web only."],
                ["Favicon / app icon", "None", "None", "Missing. The site still serves its framework's default icon."],
                ["Social sharing image", "None", "None", "Missing. Shared links show no CMR image."],
              ]}
            />
            <Source className="mt-4">Proposed vector: scripts/assets/trace-badge.mjs. Compared with the raster at full size, 0.001% of pixels differ.</Source>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-4">
            <Figure caption="The proposed vector badge. Same geometry as the approved raster; nothing redrawn.">
              <Frame className="flex aspect-[16/9] items-center justify-center p-6">
                {/* eslint-disable-next-line @next/next/no-img-element -- static vector artwork; the optimizer does not process SVG */}
                <img src="/brand/proposed/cmr-badge-proposed.svg" alt="The CMR badge, proposed vector reconstruction" className="w-[70%]" />
              </Frame>
            </Figure>
            <Pending status="proposed" title="Small-format avatar.">
              A square or round crop for favicons and profile pictures needs to be designed and approved. It is not something to improvise from the badge.
            </Pending>
          </div>
        </div>
      ),
    },
  ],
};

/** Misuse example only: the badge shape filled with the mesh gradient. */
function CmrLogoFill() {
  return (
    <span
      aria-hidden
      className="block aspect-[1386/728] w-full bg-[url(/home/mesh-gradient.png)] bg-[length:100%_100%]"
      style={{
        maskImage: "url(/brand/proposed/cmr-badge-proposed.svg)",
        maskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskImage: "url(/brand/proposed/cmr-badge-proposed.svg)",
        WebkitMaskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}
