import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ContrastChecker } from "@/components/brand/demos/ContrastChecker";
import { Swatch } from "@/components/brand/demos/Swatch";
import { Figure, Pending, Rule, Source, SpecTable } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_GROW, WEB_ONLY } from "@/components/brand/styles";
import { contrast, formatCmykUnproofed, formatHsl, formatRatio, formatRgb, overlay, wcagGrade } from "@/lib/brand/color";
import type { BrandChapter } from "@/lib/brand/manual";
import { allColors, colorById, core, cream, functional, mint, neutrals, tints, type BrandColor } from "@/lib/brand/palette";
import { MESH_GRADIENT, MESH_OPACITY, meshHex } from "@/lib/brand/spec";
import { tintVars, grayTintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

const sw = (c: BrandColor) => ({ name: c.name, hex: c.hex, cssVar: c.cssVar });
const shortStep = (c: BrandColor) => ({ ...sw(c), name: c.name.replace(/^(Neutral|Mint) /, "") });

/**
 * One text-on-ground pairing with its computed contrast. The colored tile is a
 * picture of the pairing (hidden from assistive technology, since some of these
 * are deliberately unreadable); the ratio and verdict are in the caption, in
 * ordinary text.
 */
function Pairing({ text, ground, textName, groundName, note, prohibited = false }: { text: string; ground: string; textName: string; groundName: string; note: string; prohibited?: boolean }) {
  const ratio = contrast(text, ground);
  return (
    <figure data-slot="brand-pairing" data-prohibited={prohibited || undefined}>
      <div aria-hidden style={{ backgroundColor: ground }} className="relative flex h-28 items-end rounded-lg p-4 ring-1 ring-foreground/15 ring-inset [.brand-print_&]:h-[120px]">
        {/* Drawn as an image of text, so the sample can show a failing pair without being one. */}
        <svg viewBox="0 0 120 40" className="h-10 w-[120px]" role="presentation">
          <text x="0" y="34" fill={text} className="text-[40px] font-black" style={{ letterSpacing: "-0.04em" }}>
            Aa
          </text>
        </svg>
        {prohibited && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full text-foreground">
            <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        )}
      </div>
      <figcaption className="mt-2 text-[13px] leading-[18px] [.brand-print_&]:text-[12.5px] [.brand-print_&]:leading-[17px]">
        <span className="flex items-baseline justify-between gap-3">
          <span className={cn("font-semibold", prohibited && "line-through")}>
            {textName} on {groundName}
          </span>
          <span className="shrink-0 font-mono text-[12px]">
            {formatRatio(ratio)} · {wcagGrade(ratio)}
          </span>
        </span>
        <span className="block text-foreground/65">{note}</span>
      </figcaption>
    </figure>
  );
}

function TieDyeDot({ style, label }: { style: CSSProperties; label: string }) {
  return (
    <div style={style} className="relative isolate flex aspect-square w-full items-center justify-center overflow-hidden rounded-full text-center">
      <span aria-hidden className="cmr-tie-dye absolute -z-10" />
      <span className="text-p-sm font-extrabold">{label}</span>
    </div>
  );
}

const hero = (
  <Image src="/home/hero.jpg" alt="" fill sizes="(min-width: 1024px) 420px, 90vw" className="object-cover object-[50%_70%]" />
);

function GradientOver({ opacity, label }: { opacity: number; label: ReactNode }) {
  return (
    <Figure caption={label}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-primary ">
        {hero}
        <div aria-hidden style={{ opacity: opacity / 100 }} className="absolute inset-0 bg-[url(/home/mesh-gradient.png)] bg-[length:100%_100%]" />
      </div>
    </Figure>
  );
}

const black = () => colorById("black").hex;
const white = () => colorById("white").hex;

export const color: BrandChapter = {
  slug: "color",
  number: "03",
  title: "Color.",
  name: "Color",
  summary: "Black and white do the work. Mint is the accent, and the pastels and the gradient are saved for the moments worth marking.",
  plates: [
    {
      id: "core",
      title: "Black and white first.",
      nav: "Core",
      status: "established",
      lede: "CMR is black type on white and white type on black. Whole sections switch between the two. Color is an event, not a background.",
      render: () => (
        <>
          <div className={cn("grid gap-4 md:grid-cols-2", PRINT_GROW)}>
            {core.map((c) => (
              <Swatch key={c.id} color={sw(c)} detail={c.role} className="min-h-56 [.brand-print_&]:h-full" />
            ))}
          </div>
          <h3 className={cn(LABEL, "mt-10 mb-3 text-foreground/65 [.brand-print_&]:mt-7")}>Neutrals</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11">
            {neutrals.map((c) => (
              <Swatch key={c.id} color={shortStep(c)} compact className="[.brand-print_&]:min-h-[110px]" />
            ))}
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-3 [.brand-print_&]:mt-6">
            <Rule title="Grays have jobs.">
              100 is the footer. 200 is hairlines and gray panels. 300 and 600 draw contour lines. 500 is secondary text. Nothing else is gray.
            </Rule>
            <Rule title="Black is black.">Type and fills are pure #000000 on screen, not a soft charcoal. Body copy softens by opacity (70%), not by a second gray.</Rule>
            <Rule title="No dark mode.">Black sections are a layout decision, section by section. The site has no dark theme, and the manual does not define one.</Rule>
          </div>
          <Source className="mt-6">tokens/mwds (Figma MWDS, CMR theme) › src/styles/generated/mwds-tokens.css</Source>
        </>
      ),
    },
    {
      id: "mint",
      title: "Mint, and cream.",
      nav: "Mint",
      status: "established",
      lede: "Mint is CMR's one named accent. Cream is the available secondary. Both stay quiet: a pale wash behind a message, never a loud field.",
      render: () => (
        <>
          <div className={cn("grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11", PRINT_GROW)}>
            {mint.map((c) => (
              <Swatch key={c.id} color={shortStep(c)} compact className="min-h-32 [.brand-print_&]:h-full" />
            ))}
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 [.brand-print_&]:mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
              <Swatch color={sw(colorById("accent"))} detail="Mint 100. The accent." className="min-h-40 [.brand-print_&]:min-h-[150px]" />
              <Swatch color={sw(cream)} detail="Secondary." className="min-h-40 [.brand-print_&]:min-h-[150px]" />
            </div>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-7">
              <Rule title="Where mint appears.">Success messages, the Questions button, the summit label on hill profiles, and the first tie-dye tint. Mint 100 and mint 50 only.</Rule>
              <Rule title="The deep end of the ramp.">Mint 200 to 950 exist as tokens and are not used on the site today. They are available, not established.</Rule>
              <Rule title="Type on mint is black.">Black on mint 100 is {formatRatio(contrast(black(), colorById("accent").hex))}. White on mint 100 is {formatRatio(contrast(white(), colorById("accent").hex))} and is never used.</Rule>
              <Rule title="Cream.">Defined as the secondary fill in the token set. No page uses it as a surface yet, so its role is open.</Rule>
            </div>
          </div>
          <Pending status="proposed" title="Color hierarchy is provisional." className="mt-8 [.brand-print_&]:mt-6">
            Owner direction (2026-11-13): mint stays the core accent and cream stays available. The final order of the palette is subject to Owner visual review.
          </Pending>
        </>
      ),
    },
    {
      id: "tints",
      title: "Six tints, wash and dye.",
      nav: "Tints",
      status: "established",
      lede: "Each pastel is a pair: a wash at about 95% lightness, and a slightly deeper dye that blooms through it. Together they make the tie-dye.",
      render: () => (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
            {tints.map((t, i) => (
              <div key={t.name}>
                <div className="mx-auto max-w-40 [.brand-print_&]:max-w-[168px]">
                  <TieDyeDot style={t.name === "gray" ? grayTintVars : t.name === "mauve" ? ({ "--tie-wash": `var(--${t.wash.cssVar})`, "--tie-dye": `var(--${t.dye.cssVar})`, "--tie-accent": "var(--cmr-tint-peach-dye)" } as CSSProperties) : tintVars(i)} label={t.label} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-1.5">
                  <Swatch color={{ ...sw(t.wash), name: "Wash" }} compact className="min-h-20" />
                  <Swatch color={{ ...sw(t.dye), name: "Dye" }} compact className="min-h-20" />
                </div>
                <p className="mt-2 text-[13px] leading-[18px] text-foreground/65 [.brand-print_&]:text-[12.5px] [.brand-print_&]:leading-[17px]">{t.note}</p>
              </div>
            ))}
          </div>
          <div className={cn("mt-10 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="Rotation: mint, peach, lavender, blue.">Four in a row, always in that order. Each circle borrows its neighbor&apos;s dye as an accent, so the set reads as one cloth.</Rule>
            <Rule title="Pale on purpose.">Black type on any tint is at least {formatRatio(Math.min(...tints.map((t) => contrast(black(), t.dye.hex))))}. If a tint looks saturated, it is wrong.</Rule>
            <Rule title="Gray means not yet.">The gray pair is the neutral tie-dye: figure frames in The Science, and any value still to be counted.</Rule>
          </div>
          <Source className="mt-6">src/styles/cmr.css (--cmr-tint-*), src/lib/tints.ts. Picked from the gradient&apos;s hues (Owner direction, 2026-11-08).</Source>
        </>
      ),
    },
    {
      id: "gradient",
      title: "The gradient.",
      nav: "Gradient",
      status: "established",
      lede: "One mesh gradient, authored once: coral and amber across the top, violet on the left, teal along the bottom. It is only ever laid over a photograph.",
      render: () => (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Figure caption="The sixteen control colors, in their 4 × 4 positions. The gradient between them is computed, not drawn.">
              <div className="grid grid-cols-4 overflow-hidden rounded-lg">
                {MESH_GRADIENT.flat().map((rgb, i) => {
                  const hex = meshHex(rgb);
                  return (
                    // Black or white label, whichever reads better on this control color.
                    <div key={i} style={{ backgroundColor: hex, color: contrast(hex, black()) >= contrast(hex, white()) ? black() : white() }} className="flex aspect-square items-end p-2">
                      <span className="font-mono text-[11px] leading-3 uppercase">{hex}</span>
                    </div>
                  );
                })}
              </div>
            </Figure>
          </div>
          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <GradientOver opacity={MESH_OPACITY.hero} label={`${MESH_OPACITY.hero}% over the homepage hero. A tint of atmosphere; the photograph stays a photograph.`} />
              <GradientOver opacity={MESH_OPACITY.justShowUp} label={`${MESH_OPACITY.justShowUp}% over "Just show up." The loudest the gradient gets.`} />
            </div>
            <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 [.brand-print_&]:mt-6">
              <Rule title="Over photography only.">Never a flat background, a button fill, or a fill for type. It needs an image underneath to make sense.</Rule>
              <Rule title="Stretched to fit, never tiled.">The mesh is defined in proportions, so it fills any shape. Do not crop into it, rotate it, or recolor it.</Rule>
            </div>
            <Source className="mt-6">Figma shader on Hero 1:377 and Just show up 1:296 › scripts/assets/bake-mesh-gradient.mjs › public/home/mesh-gradient.png</Source>
          </div>
        </div>
      ),
    },
    {
      id: "pairings",
      title: "Pairings.",
      nav: "Pairings",
      status: "established",
      lede: "Two rules, kept apart. Anything a person must read or operate meets WCAG 2.2 AA. Expressive graphics, like contour lines and tie-dye, are allowed to be faint because nothing depends on them.",
      render: () => {
        const body = overlay(black(), white(), 0.7);
        const n = (id: string) => colorById(id).hex;
        return (
          <>
            <h3 className={cn(LABEL, "mb-3 text-foreground/65")}>In use</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 [.brand-print_&]:gap-y-4">
              <Pairing text={black()} ground={white()} textName="Black" groundName="white" note="Headlines, buttons, everything by default." />
              <Pairing text={white()} ground={black()} textName="White" groundName="black" note="Black sections and filled buttons." />
              <Pairing text={body} ground={white()} textName="70% black" groundName="white" note="Body copy." />
              <Pairing text={n("muted-foreground")} ground={white()} textName="Neutral 500" groundName="white" note="Secondary text. AA at any size." />
              <Pairing text={n("quiet-ink")} ground={n("muted")} textName="Quiet ink" groundName="neutral 100" note="The footer. Just above AA, on purpose." />
              <Pairing text={n("neutral-400")} ground={black()} textName="Neutral 400" groundName="black" note="Secondary text in black sections." />
              <Pairing text={black()} ground={n("accent")} textName="Black" groundName="mint 100" note="Success messages." />
              <Pairing text={black()} ground={n("lavender-dye")} textName="Black" groundName="any tint" note="Lavender dye shown: the lowest of the set." />
            </div>
            <h3 className={cn(LABEL, "mt-10 mb-3 text-foreground/65 [.brand-print_&]:mt-6")}>Not for text</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 [.brand-print_&]:gap-y-4">
              <Pairing prohibited text={white()} ground={n("accent")} textName="White" groundName="mint 100" note="Invisible. Type on mint is always black." />
              <Pairing prohibited text={n("neutral-300")} ground={white()} textName="Neutral 300" groundName="white" note="Contour-line gray. Lines only, never words." />
              <Pairing prohibited text={n("muted-foreground")} ground={n("muted")} textName="Neutral 500" groundName="neutral 100" note="Falls under AA. The footer mixes a darker ink for this reason." />
              <Pairing prohibited text={n("mint-500")} ground={white()} textName="Mint 500" groundName="white" note="Mint is a ground, not a text color." />
            </div>
            <div className={cn("mt-12 border-t border-foreground pt-8", WEB_ONLY)}>
              <h3 className="text-[20px] leading-6 font-black tracking-[-0.02em]">Check a pairing.</h3>
              <p className="mt-2 mb-6 max-w-[60ch] text-p-sm text-foreground/70">Any two colors in the palette, measured live from the current token values.</p>
              <ContrastChecker colors={allColors().map((c) => ({ id: c.id, name: c.name, hex: c.hex }))} initialText="black" initialGround="accent" />
            </div>
          </>
        );
      },
    },
    {
      id: "working",
      title: "Working colors.",
      nav: "Working colors",
      status: "established",
      lede: "The colors with a job in the interface. They are named for what they do, so a component never reaches for a raw value.",
      render: () => (
        <>
          <SpecTable
            caption="Functional colors, their values and roles"
            head={["Name", "Sample", "HEX", "Token", "Role"]}
            mono={[2, 3]}
            rows={functional.map((c) => [
              c.name,
              <span key="s" aria-hidden style={{ backgroundColor: `var(--${c.cssVar})` }} className="block h-5 w-12 rounded-xs ring-1 ring-foreground/15 ring-inset" />,
              c.hex,
              `--${c.cssVar}`,
              c.role,
            ])}
          />
          <div className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-3 [.brand-print_&]:mt-6">
            <Rule title="Red is for errors only.">The single red in the system marks an invalid field. It is never decoration and never a brand color.</Rule>
            <Rule title="Focus follows the surface.">A black ring with a white gap on white; a white ring with a black gap on black and on photographs. See Digital.</Rule>
            <Rule title="Hover inverts.">Black buttons turn white and white buttons turn black. No third color is introduced for a hover.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "print",
      title: "Color in print.",
      nav: "Print",
      status: "proposed",
      lede: "Every color here was authored for screens, in sRGB. The CMYK column is arithmetic, not a color match. Treat it as the starting point for a printer's proof.",
      render: () => {
        const rows: BrandColor[] = [colorById("black"), colorById("white"), colorById("accent"), cream, colorById("mint-500"), colorById("mint-800"), ...tints.filter((t) => ["peach", "lavender", "blue"].includes(t.name)).map((t) => t.dye), colorById("muted"), colorById("neutral-500")];
        return (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <SpecTable
                caption="Color values for print reference: HEX, RGB, HSL and unproofed CMYK"
                head={["Color", "HEX", "RGB", "HSL", "CMYK, unproofed"]}
                mono={[1, 2, 3, 4]}
                rows={rows.map((c) => [
                  <span key="n" className="flex items-center gap-3">
                    <span aria-hidden style={{ backgroundColor: `var(--${c.cssVar})` }} className="block size-5 shrink-0 rounded-full ring-1 ring-foreground/15 ring-inset" />
                    {c.name}
                  </span>,
                  c.hex,
                  formatRgb(c.hex),
                  formatHsl(c.hex),
                  formatCmykUnproofed(c.hex),
                ])}
              />
              <Source className="mt-4">CMYK computed in src/lib/brand/color.ts: device conversion, no ICC profile, no ink limit. Not proofed on any press or substrate.</Source>
            </div>
            <div className="flex flex-col gap-4 lg:col-span-4">
              <Pending title="No spot colors are specified.">No Pantone or other spot reference has been chosen or matched for mint, cream or the tints. Choose them against physical swatch books, with the printer.</Pending>
              <Pending title="Black build is the printer's call.">Type prints 100% K. Whether large black floods use a rich black, and which build, depends on the press and paper and has not been tested.</Pending>
              <Pending title="Tie-dye and the gradient are RGB.">Both lose range in CMYK. Proof them on the actual stock or fabric before approving a run. See Apparel.</Pending>
            </div>
          </div>
        );
      },
    },
  ],
};
