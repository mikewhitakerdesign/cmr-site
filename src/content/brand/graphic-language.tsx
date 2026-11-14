import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ContourLab } from "@/components/brand/demos/ContourLab";
import { Figure, Frame, Pending, Rule, Source, SpecList, SpecTable } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_FILL, PRINT_FILL_COL, PRINT_GROW, PRINT_ONLY, PRINT_ROWS_1, WEB_ONLY } from "@/components/brand/styles";
import { HillContourArt } from "@/components/hills/HillContourArt";
import { HillProfile } from "@/components/HillProfile";
import { TopoPattern } from "@/components/home/TopoPattern";
import {
  ActivityIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BackpackIcon,
  CalendarPlusIcon,
  ClockIcon,
  MapPinIcon,
  MountainIcon,
  NavigationIcon,
  RepeatIcon,
  RocketIcon,
  ShareIcon,
  UserIcon,
} from "@/components/icons";
import { WeatherGlyph } from "@/components/weather/WeatherGlyph";
import type { BrandChapter } from "@/lib/brand/manual";
import { CIRCLES, CONTOUR, HILL_PROFILE, LAYOUT } from "@/lib/brand/spec";
import { REPEAT_TARGETS_FT, getHill, listedHills, routeCounts } from "@/lib/hills";
import { grayTintVars, tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

function Element({ name, where, children, className }: { name: string; where: string; children: ReactNode; className?: string }) {
  return (
    <div>
      <div className={cn("relative isolate flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl [.brand-print_&]:aspect-[16/10]", className)}>{children}</div>
      <p className="mt-3 text-p-sm font-semibold">{name}</p>
      <p className="text-[13px] leading-[18px] text-foreground/65">{where}</p>
    </div>
  );
}

function Circle({ style, children, className }: { style: CSSProperties; children: ReactNode; className?: string }) {
  return (
    <div style={style} className={cn("relative isolate flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-full text-center", className)}>
      <span aria-hidden className="cmr-tie-dye absolute -z-10" />
      {children}
    </div>
  );
}

/** One layer of the tie-dye recipe, isolated (the same gradients as `cmr-tie-dye` in src/styles/cmr.css). */
function Layer({ n, name, background, blur = false }: { n: number; name: string; background: string; blur?: boolean }) {
  return (
    <div>
      <div style={{ ...tintVars(2), background, filter: blur ? "blur(6px)" : undefined } as CSSProperties} className="aspect-square w-full rounded-full ring-1 ring-foreground/10 ring-inset" />
      <p className={cn(LABEL, "mt-3 text-[11px] text-foreground/65")}>
        {String(n).padStart(2, "0")} {name}
      </p>
    </div>
  );
}

const WASH = "var(--tie-wash)";
const BLOOMS =
  "radial-gradient(34% 30% at 36% 32%, var(--tie-dye) 0%, transparent 100%), radial-gradient(28% 32% at 68% 70%, var(--tie-accent) 0%, transparent 100%), radial-gradient(18% 16% at 70% 30%, var(--tie-dye) 0%, transparent 100%)";
const RINGS = "repeating-radial-gradient(circle at 46% 54%, transparent 0 8%, color-mix(in srgb, var(--tie-dye) 70%, transparent) 10% 11.5%, transparent 13.5% 16%)";
const SWIRL = "repeating-conic-gradient(from 18deg at 46% 54%, var(--tie-wash) 0deg 14deg, var(--tie-dye) 24deg 28deg, var(--tie-wash) 38deg 45deg)";

/** A page drawn as bands, for the composition plate. */
function Band({ kind, label, h }: { kind: "white" | "black" | "photo" | "gray"; label: string; h: number }) {
  return (
    <div
      style={{ flexGrow: h }}
      className={cn(
        "relative flex min-h-6 items-center px-3 font-mono text-[10px] leading-3 tracking-[0.08em] uppercase",
        kind === "white" && "bg-background text-foreground",
        kind === "black" && "bg-primary text-primary-foreground",
        kind === "gray" && "bg-muted text-foreground",
        kind === "photo" && "bg-primary text-primary-foreground",
      )}
    >
      {kind === "photo" && <span aria-hidden className="absolute inset-0 bg-[url(/home/mesh-gradient.png)] bg-[length:100%_100%] opacity-60" />}
      <span className="relative">{label}</span>
    </div>
  );
}

const cricket = () => getHill("cricket-hill")!;

export const graphicLanguage: BrandChapter = {
  slug: "graphic-language",
  number: "05",
  title: "Graphic language.",
  name: "Graphic language",
  summary: "Contour lines, circles, tie-dye and honest little terrain drawings. What makes a layout look like CMR before anyone reads a word.",
  plates: [
    {
      id: "elements",
      title: "Signature and occasional.",
      nav: "Elements",
      status: "inferred",
      lede: "Five elements appear across the site and carry the identity. Three more are saved for particular moments. Knowing which is which keeps the loud ones rare.",
      render: () => (
        <>
          <h3 className={cn(LABEL, "mb-3 text-foreground/65")}>Signature: use freely</h3>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Element name="Contour lines" where="Hill heroes, The Science, the homepage close." className="bg-primary">
              <TopoPattern className="text-(--cmr-contour-on-dark)" />
            </Element>
            <Element name="Black and white bands" where="Every page alternates full-width sections." className="border border-foreground/15">
              <div className="absolute inset-0 grid grid-rows-3">
                <div className="bg-background" />
                <div className="bg-primary" />
                <div className="bg-background" />
              </div>
            </Element>
            <Element name="Very large type" where="One display line per section." className="border border-foreground/15 bg-background">
              <p className="text-[clamp(40px,6vw,72px)] leading-none font-black tracking-[-0.05em]">Mtns.</p>
            </Element>
            <Element name="Circles" where="Totals, repeat counts, the About hero." className="border border-foreground/15 bg-background">
              <div className="grid w-[84%] grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <Circle key={i} style={tintVars(i)}>
                    {null}
                  </Circle>
                ))}
              </div>
            </Element>
            <Element name="Hill profiles" where="Homepage hills, the directory." className="border border-foreground/15 bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element -- static vector art */}
              <img src="/hills/cricket-hill-profile.svg" alt="" className="w-[92%]" />
            </Element>
          </div>
          <h3 className={cn(LABEL, "mt-10 mb-3 text-foreground/65", PRINT_BOTTOM)}>Occasional: one per page, at most</h3>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Element name="Tie-dye" where="Inside circles and figure frames only." className="">
              <span aria-hidden style={tintVars(1)} className="absolute inset-0 -z-10 overflow-hidden">
                <span className="cmr-tie-dye absolute" />
              </span>
            </Element>
            <Element name="The gradient" where="Over two photographs." className="bg-primary">
              <Image src="/home/hero.jpg" alt="" fill sizes="260px" className="-z-10 object-cover object-[50%_72%]" />
              <span aria-hidden className="absolute inset-0 -z-10 bg-[url(/home/mesh-gradient.png)] bg-[length:100%_100%] opacity-50" />
            </Element>
            <Element name="Weather art" where="The running calendar." className="bg-(--cmr-tint-blue-wash)">
              <WeatherGlyph condition="partly-cloudy" className="w-[44%]" />
            </Element>
            <div className="col-span-2 flex items-center">
              <p className="max-w-[44ch] text-p-sm text-foreground/75">
                The occasional elements are campaign-level: they can change with a season, a run series or a shirt. The signature elements should not.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "contours",
      title: "Contour lines.",
      nav: "Contours",
      status: "established",
      lede: "The lines on a topographic map, drawn as hairlines. On CMR's hero sections they drift slowly, like terrain that has not made up its mind. They are the one piece of mountain iconography the brand allows itself.",
      render: () => (
        <>
          <div className={WEB_ONLY}>
            <ContourLab />
          </div>
          <div className={cn("grid-cols-2 gap-4", PRINT_ONLY, "[.brand-print_&]:grid", PRINT_GROW)}>
            <Frame ground="black" label="On black" className="h-full">
              <TopoPattern className="text-(--cmr-contour-on-dark)" />
            </Frame>
            <Frame label="On white" className="h-full">
              <TopoPattern />
            </Frame>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SpecTable
                caption="Contour field settings in production"
                head={["Where", "Scale", "Levels", "Ground", "Line color"]}
                mono={[1, 2, 4]}
                rows={CONTOUR.settings.map((s) => [s.name, `${s.scale} px`, String(s.levels), s.ground, s.line])}
              />
            </div>
            <SpecList
              className="lg:col-span-5"
              rows={[
                ["Line weight, moving", `${CONTOUR.lineWidthPx} px, constant at any size`],
                ["Line weight, static", `${CONTOUR.staticLineWidthPx} px`],
                ["Static pattern", `${CONTOUR.staticPattern.paths} vector paths, tileless`],
                ["Speed", `${CONTOUR.defaults.speed} noise units per second`],
              ]}
            />
          </div>
          <Source className="mt-4">src/components/ContourField.tsx; public/home/topo.svg (traced from the approved Figma pattern).</Source>
        </>
      ),
    },
    {
      id: "contour-rules",
      title: "How contours behave.",
      nav: "Contour rules",
      status: "established",
      lede: "Contours are a ground, never a subject. They sit behind type, run off every edge, and stay faint enough that a headline crossing them loses nothing.",
      render: () => (
        <>
          <div className={cn("grid gap-4 md:grid-cols-3", PRINT_GROW, PRINT_ROWS_1)}>
            <Figure className={PRINT_FILL_COL} caption="Full-bleed behind a headline. Lines run off all four edges.">
              <Frame ground="black" className={cn("flex aspect-[4/3] items-end p-5", PRINT_FILL)}>
                <TopoPattern className="-z-10 text-(--cmr-contour-on-dark)" />
                <p className="text-[40px] leading-[0.9] font-black tracking-[-0.045em]">
                  HORNER
                  <br />
                  HILL
                </p>
              </Frame>
            </Figure>
            <Figure className={PRINT_FILL_COL} caption="Light gray on white. Black type crossing a line still measures 15:1.">
              <Frame className={cn("flex aspect-[4/3] items-center justify-center p-5", PRINT_FILL)}>
                <TopoPattern className="-z-10 text-(--cmr-contour-on-light)" />
                <p className="text-center text-[34px] leading-[0.9] font-black tracking-[-0.045em]">
                  FLAT IS
                  <br />A STATE
                  <br />
                  OF MIND.
                </p>
              </Frame>
            </Figure>
            <Figure className={PRINT_FILL_COL} caption="A small closed drawing beside a hill's facts. Decorative, and labeled as not a map.">
              <Frame className={cn("flex aspect-[4/3] items-center justify-center p-5", PRINT_FILL)}>
                <HillContourArt slug="horner-hill" className="h-[78%]" />
              </Frame>
            </Figure>
          </div>
          <div className={cn("mt-10 grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-4", PRINT_BOTTOM)}>
            <Rule title="Behind, never over.">Contours go under type and never across a photograph, a button or a face.</Rule>
            <Rule title="One field per section.">A section has one contour ground or none. Do not stack patterns or change density mid-section.</Rule>
            <Rule title="Motion is optional.">Under reduced motion, or with the site&apos;s motion paused, the field holds one still frame. Nothing depends on it moving.</Rule>
            <Rule title="Decoration is not data.">Only the hill profiles are drawn from elevation data. Every other contour is artwork and must never be captioned as a map.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "profiles",
      title: "Hill profiles.",
      nav: "Hill profiles",
      status: "established",
      lede: "Each hill gets a terrain drawing built from public elevation data: black line, white fill, twelve bands, seen from the south. The pastel tags carry the numbers, and every number admits it is approximate.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-7">
            <HillProfile name={cricket().name} profile={cricket().profile!} />
            <div className="mt-6 grid grid-cols-4 gap-3">
              {listedHills()
                .filter((h) => h.slug !== "cricket-hill" && h.profile)
                .map((h) => (
                  <figure key={h.slug}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- static vector art */}
                    <img src={h.profile!.src} alt="" className="w-full" />
                    <figcaption className="mt-1 text-[12px] leading-4 font-semibold">
                      {h.name}
                      <span className="block font-mono font-normal text-foreground/65">{h.profile!.figures ? `≈ ${h.profile!.figures.riseFt} ft` : "Illustrative"}</span>
                    </figcaption>
                  </figure>
                ))}
            </div>
          </div>
          <div className="flex flex-col lg:col-span-5">
            <SpecList
              rows={[
                ["Data", HILL_PROFILE.data],
                ["Contour bands", `${HILL_PROFILE.contourBands}, equal. No interval is claimed.`],
                ["Figures", `Rounded to ${HILL_PROFILE.rounding}, always with ≈`],
                ["Vertical scale", HILL_PROFILE.exaggeration],
                ["Ink", "Black line, white fill. No grays."],
                ["Tags", "Mint: summit. Peach: base. Blue: total rise."],
              ]}
            />
            <div className={cn("mt-6 grid gap-6", PRINT_BOTTOM)}>
              <Rule title="Same view, every hill.">One viewing angle and one style for all five, so they compare honestly.</Rule>
              <Rule title="No data, no number.">Warren Hill could not be found in the elevation data. Its drawing is labeled illustrative and shows no figures.</Rule>
            </div>
            <Source className="mt-6">scripts/assets/terrain; public/home/README.md; src/lib/hill-profiles.generated.ts.</Source>
          </div>
        </div>
      ),
    },
    {
      id: "circles",
      title: "Circles.",
      nav: "Circles",
      status: "established",
      lede: "A circle holds one thing: a number with its label, or a single short phrase. Circles come in rows of four, all the same size, and are the only place the pastel colors live.",
      render: () => {
        const counts = routeCounts(cricket().page!.route)!;
        return (
          <>
            <div className={cn("grid grid-cols-2 justify-items-center gap-6 md:grid-cols-4", PRINT_GROW, "[.brand-print_&]:items-center")}>
              {REPEAT_TARGETS_FT.map((t, i) => (
                <Circle key={t} style={tintVars(i)} className="max-w-[260px]">
                  <span className="font-mono text-[13px] leading-5">{t.toLocaleString("en-US")} ft</span>
                  <span className="text-[clamp(48px,7vw,84px)] leading-none font-black tracking-[-0.02em]">{counts[t].repeats}</span>
                  <span className={cn(LABEL, "mt-1 text-[11px]")}>Repeats</span>
                </Circle>
              ))}
            </div>
            <p className="mt-4 text-center font-mono text-[13px] leading-5 text-foreground/65">
              Cricket Hill repeats to reach each climb, from the Owner&apos;s route baseline (≈ 40 ft and .2 mi per repeat). Approximate.
            </p>
            <div className={cn("mt-8 grid gap-8 lg:grid-cols-12", PRINT_BOTTOM)}>
              <div className="lg:col-span-6">
                <SpecTable
                  caption="Circle diameters in production"
                  head={["System", "Desktop", "Tablet", "Phone"]}
                  mono={[1, 2, 3]}
                  rows={[
                    ["Club totals", `up to ${CIRCLES.clubTotals.desktop} px`, `up to ${CIRCLES.clubTotals.tablet} px`, "2 × 2"],
                    ["About hero", `${CIRCLES.aboutHero.desktop} px`, `${CIRCLES.aboutHero.tablet} px`, `${CIRCLES.aboutHero.mobile} px`],
                  ]}
                />
              </div>
              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-6">
                <Rule title="Four across, or two by two.">Never three, never five, never mixed sizes in one row.</Rule>
                <Rule title="They may overlap a boundary.">On About, the circles hang over the next section by {CIRCLES.aboutHero.overlap}. They never overlap each other.</Rule>
              </div>
            </div>
          </>
        );
      },
    },
    {
      id: "tie-dye",
      title: "Tie-dye.",
      nav: "Tie-dye",
      status: "established",
      lede: "Four soft layers and a blur: tie-dye turned down until it is almost a memory of one. It exists only on screen so far.",
      render: () => (
        <>
          <div className={cn("grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-5", PRINT_GROW, "[.brand-print_&]:items-center")}>
            <Layer n={1} name="Wash" background={WASH} />
            <Layer n={2} name="Three blooms" background={`${BLOOMS}, ${WASH}`} />
            <Layer n={3} name="Faint rings" background={`${RINGS}, ${WASH}`} />
            <Layer n={4} name="Slow swirl" background={SWIRL} />
            <div>
              <Circle style={tintVars(2)}>{null}</Circle>
              <p className={cn(LABEL, "mt-3 text-[11px] text-foreground/65")}>05 Together, blurred 10 px</p>
            </div>
          </div>
          <div className={cn("mt-10 grid gap-8 lg:grid-cols-12", PRINT_BOTTOM)}>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-3 lg:col-span-8">
              <Rule title="Always contained.">Inside a circle or a rounded figure frame. Never a page background, never behind paragraphs.</Rule>
              <Rule title="Always pale.">Built from the wash and dye pairs in Color. If you can name the color from across the room, it is too strong.</Rule>
              <Rule title="Gray when unknown.">
                <span style={grayTintVars as CSSProperties} className="relative isolate mr-2 inline-block size-5 overflow-hidden rounded-full align-[-4px]">
                  <span aria-hidden className="cmr-tie-dye absolute -z-10" />
                </span>
                The neutral version stands in for values not yet counted.
              </Rule>
            </div>
            <div className="lg:col-span-4">
              <Pending status="unresolved" title="No print master exists.">
                The effect is CSS gradients and a blur. For fabric or paper it needs to be rebuilt as high-resolution artwork and proofed. See Apparel.
              </Pending>
            </div>
          </div>
          <Source className="mt-6">src/styles/cmr.css (`cmr-tie-dye`); src/lib/tints.ts.</Source>
        </>
      ),
    },
    {
      id: "composition",
      title: "Composition.",
      nav: "Composition",
      status: "inferred",
      lede: "A CMR page is a stack of full-width bands, each with one job and one headline. The drama is in scale: a line of type 200 pixels tall beside a label 14 pixels tall, with nothing in between.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <Figure className="flex flex-col lg:col-span-4" caption="The homepage, as bands. White, black and photograph alternate; nothing shares a band.">
            <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-xl ring-1 ring-foreground/15 [.brand-print_&]:min-h-0">
              <Band kind="white" label="Header" h={1} />
              <Band kind="photo" label="Hero" h={5} />
              <Band kind="white" label="Statement" h={3} />
              <Band kind="white" label="Club totals" h={4} />
              <Band kind="black" label="Group runs" h={2} />
              <Band kind="white" label="Hills" h={5} />
              <Band kind="photo" label="Just show up" h={3} />
              <Band kind="white" label="Flat is a state of mind" h={3} />
              <Band kind="gray" label="Footer" h={2} />
            </div>
          </Figure>
          <div className="flex flex-col lg:col-span-8">
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Rule title="Full-width bands.">Sections run edge to edge and change color completely. No cards floating on a tinted page, no boxed layouts.</Rule>
              <Rule title="One headline per band.">Each section makes one statement. If a section needs two headlines, it is two sections.</Rule>
              <Rule title="Extreme scale contrast.">The largest type and the smallest sit together. The middle sizes are used sparingly.</Rule>
              <Rule title="Left, with room on the right.">Headlines hang on the left edge of the container. Supporting copy sits narrow, often in a right-hand column.</Rule>
              <Rule title="Hairlines, not boxes.">Lists are rows divided by 1 px rules, numbered 01 to 05 in mono. Borders around things are rare.</Rule>
              <Rule title="Radius is small.">6 to 8 px on buttons and panels, 12 to 24 px on a few large cards. Circles are the only fully round shape.</Rule>
            </div>
            <SpecList
              className={cn("mt-8", PRINT_BOTTOM)}
              rows={[
                ["Container", `${LAYOUT.containerMax} px maximum`],
                ["Side margin", `${LAYOUT.gutter.mobile} px on phones, ${LAYOUT.gutter.tabletUp} px from tablet up`],
                ["Design widths", `${LAYOUT.anchors.mobile}, ${LAYOUT.anchors.tablet} and ${LAYOUT.anchors.desktop} px`],
                ["Spacing unit", `${LAYOUT.baseUnit} px`],
              ]}
            />
            <Source className="mt-4">src/components/Container.tsx; src/lib/fluid.ts; src/app/page.tsx.</Source>
          </div>
        </div>
      ),
    },
    {
      id: "icons",
      title: "Icons and diagrams.",
      nav: "Icons",
      status: "established",
      lede: "Small, thin and literal. Icons label things that already have words next to them. Diagrams explain the science and are drawn in the same black line as everything else.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-7">
            <h3 className={cn(LABEL, "mb-3 text-foreground/65")}>The icon set</h3>
            <ul className="grid grid-cols-4 gap-px overflow-hidden rounded-xl bg-foreground/15 ring-1 ring-foreground/15 sm:grid-cols-7">
              {(
                [
                  ["Clock", ClockIcon],
                  ["Map pin", MapPinIcon],
                  ["Arrow", ArrowRightIcon],
                  ["Open", ArrowUpRightIcon],
                  ["Directions", NavigationIcon],
                  ["Add to calendar", CalendarPlusIcon],
                  ["Share", ShareIcon],
                  ["Repeat", RepeatIcon],
                  ["Effort", ActivityIcon],
                  ["Hill", MountainIcon],
                  ["Bring", BackpackIcon],
                  ["Person", UserIcon],
                  ["Moon", RocketIcon],
                ] as const
              ).map(([name, Icon]) => (
                <li key={name} className="flex aspect-square flex-col items-center justify-center gap-2 bg-background p-2">
                  <Icon className="size-6" />
                  <span className="text-center text-[11px] leading-3 text-foreground/65">{name}</span>
                </li>
              ))}
            </ul>
            <h3 className={cn(LABEL, "mt-8 mb-3 text-foreground/65")}>Weather glyphs</h3>
            <ul className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {(["clear", "partly-cloudy", "cloudy", "fog", "rain", "thunder", "snow", "mix"] as const).map((c, i) => (
                <li key={c} className={cn("flex aspect-square items-center justify-center rounded-lg", ["bg-(--cmr-tint-peach-wash)", "bg-(--cmr-tint-blue-wash)", "bg-(--cmr-tint-lavender-wash)", "bg-(--cmr-tint-mint-wash)"][i % 4])}>
                  <WeatherGlyph condition={c} className="w-[70%]" />
                </li>
              ))}
            </ul>
            <Source className="mt-4">src/components/icons.tsx (Lucide geometry, exported from the CMR Figma file); src/components/weather/WeatherGlyph.tsx.</Source>
          </div>
          <div className="flex flex-col lg:col-span-5">
            <div className="grid gap-6">
              <Rule title="Line only.">16 to 24 px, about 1.2 px stroke, round caps and joins, never filled. They take the color of the text beside them.</Rule>
              <Rule title="Beside a label, always.">No icon stands alone as a control. The word does the work; the icon helps the eye find it.</Rule>
              <Rule title="Diagrams are black line.">Charts and figures in The Science use the same hairlines, mono labels, and a gray tie-dye frame.</Rule>
            </div>
            <Pending status="established" title="Figure 3, the uphill runner." className={cn("mt-6", PRINT_BOTTOM)}>
              Owner-directed, AI-assisted original artwork: created by the Owner with Claude&apos;s assistance. It is an illustration, not a photograph, and is captioned as a figure.
            </Pending>
          </div>
        </div>
      ),
    },
  ],
};
