import type { ReactNode } from "react";
import { TypeTester } from "@/components/brand/demos/TypeTester";
import { Frame, Rule, SpecList, SpecTable } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_GROW, WEB_ONLY } from "@/components/brand/styles";
import { EYEBROW } from "@/components/hills/styles";
import { ArrowRightIcon } from "@/components/icons";
import type { BrandChapter } from "@/lib/brand/manual";
import { DISPLAY, HEADING_ROLES, LAYOUT, TEXT_ROLES, type HeadingRoleKey } from "@/lib/brand/spec";
import { cn } from "@/lib/utils";

const ROLE_KEYS = Object.keys(HEADING_ROLES) as HeadingRoleKey[];

/** A callout line for the annotated specimens. */
function Note({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[1.75rem_1fr] gap-x-3 border-t border-foreground/25 py-3">
      <span className="flex size-6 items-center justify-center rounded-full bg-foreground font-mono text-[12px] text-background">{n}</span>
      <span>
        <span className="block text-p-sm font-semibold">{title}</span>
        <span className="block text-[14px] leading-5 text-foreground/70">{children}</span>
      </span>
    </li>
  );
}

const Dot = ({ n, className }: { n: number; className?: string }) => (
  <span aria-hidden className={cn("absolute flex size-6 items-center justify-center rounded-full bg-foreground font-mono text-[12px] text-background", className)}>
    {n}
  </span>
);

export const typography: BrandChapter = {
  slug: "typography",
  number: "04",
  title: "Typography.",
  name: "Typography",
  summary: "One family, two cuts. Geist Black, very large and very tight, does the talking. Geist Mono keeps the records.",
  plates: [
    {
      id: "family",
      title: "Geist. Only Geist.",
      nav: "The family",
      lede: "CMR uses one type family for everything: Geist for words and Geist Mono for facts. There is no serif, no script and no second sans. The range comes from weight and size, not from more typefaces.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <Frame ground="black" className="flex min-h-[360px] flex-col justify-between p-8 lg:col-span-7 [.brand-print_&]:min-h-0">
            <p className={cn(LABEL, "text-foreground/70")}>Geist Black 900</p>
            <p className="text-[clamp(120px,22vw,300px)] leading-[0.8] font-black tracking-[-0.06em] [.brand-print_&]:text-[290px]">Aa</p>
            <p className="text-[clamp(20px,2.6vw,34px)] leading-[1.05] font-black tracking-[-0.04em]">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
              <br />
              abcdefghijklmnopqrstuvwxyz 0123456789
            </p>
          </Frame>
          <div className="flex flex-col lg:col-span-5">
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  ["Regular 400", "font-normal", "Body copy"],
                  ["Medium 500", "font-medium", "Links, navigation"],
                  ["Semibold 600", "font-semibold", "Buttons, list names"],
                  ["Black 900", "font-black", "Every display line"],
                ] as const
              ).map(([name, cls, use]) => (
                <div key={name} className="border-t border-foreground pt-3">
                  <p className={cn("text-[40px] leading-none tracking-[-0.03em]", cls)}>Hill</p>
                  <p className="mt-2 text-p-sm font-semibold">{name}</p>
                  <p className="text-[14px] leading-5 text-foreground/65">{use}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-foreground pt-3">
              <p className="font-mono text-[28px] leading-none">WED · 5:30 AM</p>
              <p className="mt-2 text-p-sm font-semibold">Geist Mono 400</p>
              <p className="text-[14px] leading-5 text-foreground/65">Labels, times, measurements, sources</p>
            </div>
            <SpecList
              className={cn("mt-6", PRINT_BOTTOM)}
              rows={[
                ["License", "SIL Open Font License 1.1"],
                ["On the website", "Served by the site itself"],
                ["Fallback", "The system sans and mono, only while Geist loads"],
              ]}
            />
          </div>
        </div>
      ),
    },
    {
      id: "display",
      title: "Five display roles.",
      nav: "Display roles",
      lede: "Every large line on the website is one of five roles. A role fixes the size at three screen widths, and the browser draws a straight line between them, so type never jumps between a phone and a desktop.",
      render: () => (
        <>
          <SpecTable
            caption="Display type roles on the website: font size over line height in pixels at the three design widths"
            head={["Role", `Phone ${LAYOUT.anchors.mobile}`, `Tablet ${LAYOUT.anchors.tablet}`, `Desktop ${LAYOUT.anchors.desktop}`, "Use"]}
            mono={[1, 2, 3]}
            rows={ROLE_KEYS.map((k) => {
              const r = HEADING_ROLES[k];
              return [r.name, ...[0, 1, 2].map((i) => `${r.size[i]} / ${r.lineHeight[i]}`), r.use];
            })}
          />
          <div className={cn("mt-8 border-t border-foreground pt-6", PRINT_GROW)}>
            <p className={cn(LABEL, "mb-4 text-foreground/65")}>Desktop sizes, to scale with one another (shown at 50%)</p>
            <div className="flex flex-col gap-3 overflow-hidden">
              {ROLE_KEYS.map((k) => {
                const r = HEADING_ROLES[k];
                return (
                  <p key={k} style={{ fontSize: r.size[2] / 2, lineHeight: r.lineHeight[2] / r.size[2], letterSpacing: DISPLAY.tracking.headings }} className="font-black whitespace-nowrap">
                    {r.example}
                  </p>
                );
              })}
            </div>
          </div>
          <div className={cn("mt-12 border-t border-foreground pt-8", WEB_ONLY)}>
            <h3 className="text-[20px] leading-6 font-black tracking-[-0.02em]">Set a line.</h3>
            <p className="mt-2 mb-6 max-w-[60ch] text-p-sm text-foreground/70">Pick a role, type a headline, and drag the viewport. The numbers are the ones a browser would compute.</p>
            <TypeTester />
          </div>
        </>
      ),
    },
    {
      id: "details",
      title: "Heavy, tight, and it ends.",
      nav: "Details",
      lede: "Four habits make a line of Geist Black read as CMR in any medium: the weight, the tracking, the leading, and the period at the end.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <Frame className="relative flex min-h-[340px] items-center p-8 md:p-12 lg:col-span-7 [.brand-print_&]:min-h-0">
            <p className="relative text-[clamp(52px,8vw,112px)] leading-[0.92] font-black tracking-[-0.04em] [.brand-print_&]:text-[104px]">
              Bad weather.
              <br />
              Good hills<span className="ss08">.</span>
              <Dot n={1} className="-top-8 left-0" />
              <Dot n={2} className="top-[18%] -right-8" />
              <Dot n={3} className="top-[44%] -left-8" />
              <Dot n={4} className="right-0 -bottom-8" />
            </p>
          </Frame>
          <div className="flex flex-col lg:col-span-5">
            <ol>
              <Note n={1} title={`Weight ${DISPLAY.weight}.`}>
                Geist Black for every headline. Never bold, never semibold, at display size.
              </Note>
              <Note n={2} title={`Tracking about ${DISPLAY.tracking.headings}.`}>
                Tight enough that words lock together; all-caps statements a little tighter ({DISPLAY.tracking.statements}). If letters collide at a size, loosen until they stop.
              </Note>
              <Note n={3} title="Leading at or under 1.">
                Line height about 0.9 to 1.0 of the size. Lines of a headline should nearly touch.
              </Note>
              <Note n={4} title="The period.">
                Headlines end. Geist&apos;s stylistic set 08 gives the display period its square shape; the site turns it on for display headings.
              </Note>
            </ol>
            <div className={cn("mt-6 grid gap-6", PRINT_BOTTOM)}>
              <Rule title="Sentence case, almost always.">Capitals for the first word and proper nouns. “Hills on repeat.” as a headline, “Hills on Repeat” as a label.</Rule>
              <Rule title="All caps is rationed.">MAKE YOUR OWN MTNS, JUST SHOW UP., FLAT IS A STATE OF MIND., and hill names in their heroes. Nothing else shouts.</Rule>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "text",
      title: "Text roles.",
      nav: "Text roles",
      lede: "Under the display line, the website's sizes come from the MWDS scale and stay fixed. Body copy is softened with opacity, so it sits back from a headline without a second gray.",
      render: () => (
        <>
          <SpecTable
            caption="Text roles on the website: typeface, weight, size and use"
            head={["Role", "Typeface", "Weight", "Size / leading, px", "Use"]}
            mono={[3]}
            rows={TEXT_ROLES.map((r) => [r.name, r.font, String(r.weight), r.size, r.detail])}
          />
          <div className={cn("mt-10 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="A comfortable reading size.">On the website, section copy is 18 over 27 at a measure of 560 to 680 px; long-form reading (The Science) opens the leading to 30. Elsewhere, set it for the reading distance.</Rule>
            <Rule title="Soften with opacity.">70% black on white, 90% white on black. One ink per surface, dimmed, instead of a palette of grays.</Rule>
            <Rule title="Left-aligned, ragged right.">Body copy is never justified or centered. Headlines may be balanced; paragraphs are left alone.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "mono",
      title: "Mono is for facts.",
      nav: "Mono",
      lede: "Geist Mono marks anything that is a record: a time, a number, an index, a label, a source. If a line is in mono, a reader can assume someone measured it or filed it.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-7">
            <Frame ground="black" className="p-6 md:p-8">
              <p className={cn(EYEBROW, "text-foreground/70")}>Upcoming runs</p>
              <div className="mt-5 border-t border-foreground/40">
                {(
                  [
                    ["01", "Cricket Hill", "Montrose Beach · Uptown", "≈ 30 ft"],
                    ["03", "Horner Hill", "Horner Park · Irving Park", "≈ 20 ft"],
                    ["05", "Mt. Trashmore", "Robert E. James Park · Evanston", "≈ 60 ft"],
                  ] as const
                ).map(([i, name, place, rise]) => (
                  <div key={i} className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 border-b border-foreground/40 py-4">
                    <span className="font-mono text-p text-foreground/70">{i}</span>
                    <span>
                      <span className="block text-[28px] leading-8 font-semibold tracking-[-1px]">{name}</span>
                      <span className="block font-mono text-[13px] leading-5 text-foreground/70">{place}</span>
                    </span>
                    <span className="font-mono text-p">{rise}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 font-mono text-[13px] leading-5 text-foreground/70">Shape and figures from USGS 3DEP elevation data, approximate.</p>
            </Frame>
          </div>
          <div className="flex flex-col lg:col-span-5">
            <SpecTable
              caption="Where Geist Mono is used"
              head={["Kind", "Example"]}
              mono={[1]}
              rows={[
                ["Eyebrow label", "UPCOMING RUNS"],
                ["Day and time", "WED · 5:30 AM"],
                ["Index", "01 … 05"],
                ["Measurement", "≈ 620 ft · .2 mi"],
                ["Spec row", "PRIMARY SURFACE"],
                ["Source and caption", "USGS 3DEP elevation data"],
              ]}
            />
            <div className={cn("mt-6 grid gap-6", PRINT_BOTTOM)}>
              <Rule title="Uppercase and tracked, when it is a label.">About +0.1 em of tracking (14 over 21 on the website). Values and captions stay in sentence case at normal spacing.</Rule>
              <Rule title="Never for sentences with feelings.">Mono does not tell jokes. Voice lives in Geist; mono is the footnote under it.</Rule>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "hierarchy",
      title: "Hierarchy in one view.",
      nav: "Hierarchy",
      lede: "A typical CMR section, with every level present. Four steps down from the headline to the caption, each one obviously smaller than the last.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <Frame className="relative p-8 md:p-12 lg:col-span-8 [.brand-print_&]:flex [.brand-print_&]:flex-col [.brand-print_&]:justify-center">
            <div className="relative max-w-[560px]">
              <p className={cn(EYEBROW, "relative text-foreground/70")}>
                <Dot n={1} className="top-0 -left-8" />
                Chicago mountains / Cricket Hill
              </p>
              <h3 className="relative mt-4 text-[clamp(44px,6vw,72px)] leading-[0.94] font-black tracking-[-0.04em]">
                <Dot n={2} className="top-2 -left-8" />
                The hill at Montrose.
              </h3>
              <p className="relative mt-6 text-[18px] leading-[27px] text-foreground/70">
                <Dot n={3} className="top-0.5 -left-8" />
                Cricket Hill sits just west of Montrose Harbor along Chicago&apos;s lakefront. In another city, it might be a pleasant little hill. Here, we
                have standards to maintain.
              </p>
              <p className="relative mt-6 inline-flex items-center gap-1.5 text-p font-medium">
                <Dot n={4} className="top-0 -left-8" />
                Explore all hills <ArrowRightIcon className="size-4" />
              </p>
              <p className="relative mt-6 font-mono text-[14px] leading-5 text-foreground/70">
                <Dot n={5} className="top-0 -left-8" />
                Surface conditions vary with weather.
              </p>
            </div>
          </Frame>
          <ol className="lg:col-span-4">
            <Note n={1} title="Eyebrow">
              Geist Mono, uppercase, 14 / 21. Says where you are.
            </Note>
            <Note n={2} title="Headline">
              Geist Black in a display role. One idea, ending in a period.
            </Note>
            <Note n={3} title="Body">
              Geist Regular 18 / 27 at 70%. Two or three sentences; the dry one goes last.
            </Note>
            <Note n={4} title="Link">
              Geist Medium 16 with a 16 px arrow. Underlines on hover; the arrow nudges 2 px.
            </Note>
            <Note n={5} title="Caption">
              Geist Mono 14 / 20. The caveat, the source, the fine print.
            </Note>
          </ol>
        </div>
      ),
    },
    {
      id: "print",
      title: "Off the screen.",
      nav: "Print and apparel",
      lede: "The pixel sizes above belong to the website. On paper and fabric, keep the relationships and let the sizes follow the format.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-7">
            <SpecTable
              caption="Typographic relationships for print and apparel"
              head={["Element", "Keep", "Let go of"]}
              rows={[
                ["Display", `Geist Black. Tracking ${DISPLAY.tracking.headings}. Leading 0.9 to 1.0. Final period.`, "Any pixel size. Scale to the format; the headline should be the largest thing by a wide margin."],
                ["Body", "Geist Regular, left-aligned, about 1.5 leading, at a tint of the ink.", "18 px. Set it by reading distance: this PDF's body is about 9.6 pt."],
                ["Labels", "Geist Mono, uppercase, tracked about +10%.", "Fixed sizes. Keep them legible first: in this PDF, about 7 pt and up."],
                ["Slogans on apparel", "Geist Black, all caps or sentence case with its period. One line or a tight stack.", "Fluid sizing. Convert to outlines before sending to a vendor."],
                ["The wordmark", "Its master file, as supplied.", "Retyping it. Never rebuild the wordmark from the font."],
              ]}
            />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Rule title="No faux styles.">No artificial bold, no squeezed or stretched type, no outlined letters. If Geist Black is unavailable, stop and get it.</Rule>
            <Rule title="No substitutes.">Do not swap in Helvetica, Inter or a system font for a deliverable. The fallback stack exists for the half-second before the web font loads.</Rule>
            <Rule title="Getting the fonts.">Geist is open source under the SIL Open Font License. Designers and vendors download it from the publisher, with the license; CMR does not pass font files around.</Rule>
            <Rule title="Smallest type on fabric: proof it.">Screen printing, heat transfer and embroidery each have a smallest reliable stroke. Agree it with the vendor and approve a proof.</Rule>
          </div>
        </div>
      ),
    },
  ],
};
