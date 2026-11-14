import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ContrastChecker } from "@/components/brand/demos/ContrastChecker";
import { Swatch } from "@/components/brand/demos/Swatch";
import { Figure, Rule, SpecTable } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_GROW, WEB_ONLY } from "@/components/brand/styles";
import { contrast, formatHsl, formatRatio, formatRgb, overlay, wcagGrade } from "@/lib/brand/color";
import type { BrandChapter } from "@/lib/brand/manual";
import { allColors, colorById, functional, neutrals, primary, tints, type BrandColor } from "@/lib/brand/palette";
import { MESH_GRADIENT, MESH_OPACITY, meshHex } from "@/lib/brand/spec";
import { tintVars, grayTintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

const sw = (c: BrandColor) => ({ name: c.name, hex: c.hex, cssVar: c.cssVar });
const shortStep = (c: BrandColor) => ({ ...sw(c), name: c.name.replace(/^Neutral /, "") });

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
      <figcaption className="mt-2 text-[13px] leading-[18px] [.brand-print_&]:text-[13px] [.brand-print_&]:leading-[18px]">
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

/** The tie-dye variables for one secondary family (mauve borrows peach as its accent, as the weather art does). */
const tieDyeFor = (t: (typeof tints)[number], i: number): CSSProperties =>
  t.name === "gray"
    ? (grayTintVars as CSSProperties)
    : t.name === "mauve"
      ? ({ "--tie-wash": `var(--${t.wash.cssVar})`, "--tie-dye": `var(--${t.dye.cssVar})`, "--tie-accent": "var(--cmr-tint-peach-dye)" } as CSSProperties)
      : (tintVars(i) as CSSProperties);

export const color: BrandChapter = {
  slug: "color",
  number: "03",
  title: "Color.",
  name: "Color",
  summary: "Black and white do the work. Six pale secondary colors and the mesh gradient are saved for the moments worth marking.",
  plates: [
    {
      id: "primary",
      title: "Primary: black and white.",
      nav: "Primary",
      lede: "CMR is black type on white and white type on black. Whole sections switch between the two. Color is an event, not a background.",
      render: () => (
        <>
          <div className={cn("grid gap-4 md:grid-cols-2", PRINT_GROW)}>
            {primary.map((c) => (
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
            <Rule title="Black is black.">Pure #000000 and pure #FFFFFF, on screen and in every file. Not a charcoal, not an off-white.</Rule>
            <Rule title="Grays have jobs.">100 is the footer. 200 is hairlines and gray panels. 300 and 600 draw contour lines. 500 is secondary text. Body copy softens by opacity (70%), not by a second gray.</Rule>
            <Rule title="No dark mode.">Black sections are a layout decision, section by section. The site has no dark theme, and the manual does not define one.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "secondary",
      title: "Secondary: six washes and dyes.",
      nav: "Secondary",
      lede: "Each secondary color is a pair: a wash at about 95% lightness, and a slightly deeper dye that blooms through it. Together they make the tie-dye. They were picked from the hues of the gradient, so the two belong together.",
      render: () => (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
            {tints.map((t, i) => (
              <div key={t.name}>
                <div className="mx-auto max-w-40 [.brand-print_&]:max-w-[168px]">
                  <TieDyeDot style={tieDyeFor(t, i)} label={t.label} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-1.5">
                  <Swatch color={{ ...sw(t.wash), name: "Wash" }} compact className="min-h-20" />
                  <Swatch color={{ ...sw(t.dye), name: "Dye" }} compact className="min-h-20" />
                </div>
                <p className="mt-2 text-[13px] leading-[18px] text-foreground/65 [.brand-print_&]:text-[13px] [.brand-print_&]:leading-[18px]">{t.note}</p>
              </div>
            ))}
          </div>
          <div className={cn("mt-10 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="Rotation: mint, peach, lavender, blue.">Four in a row, in that order. Each circle borrows its neighbor&apos;s dye as an accent, so the set reads as one cloth.</Rule>
            <Rule title="Pale on purpose.">Black type on any of them is at least {formatRatio(Math.min(...tints.map((t) => contrast(black(), t.dye.hex))))}. If a secondary color looks saturated, it is wrong.</Rule>
            <Rule title="Gray means not yet.">The gray pair is the neutral tie-dye: figure frames in The Science, and any value still to be counted.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "gradient",
      title: "The gradient.",
      nav: "Gradient",
      lede: "One mesh gradient, authored once: coral and amber across the top, violet on the left, teal along the bottom. It is laid over photographs, at one of two strengths.",
      render: () => (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Figure caption="The sixteen control colors, in their 4 × 4 positions. The gradient between them is computed, not drawn. They are deeper than the secondary colors, which were taken from the same hues and lightened.">
              <div className="grid grid-cols-4 overflow-hidden rounded-lg">
                {MESH_GRADIENT.flat().map((rgb, i) => {
                  const hex = meshHex(rgb);
                  return (
                    // Black or white label, whichever reads better on this control color.
                    <div key={i} style={{ backgroundColor: hex, color: contrast(hex, black()) >= contrast(hex, white()) ? black() : white() }} className="flex aspect-square items-end p-2">
                      <span className="font-mono text-[11px] leading-3 uppercase [.brand-print_&]:text-[12px]">{hex}</span>
                    </div>
                  );
                })}
              </div>
            </Figure>
          </div>
          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <GradientOver opacity={MESH_OPACITY.hero} label={`${MESH_OPACITY.hero}%: the homepage hero. A tint of atmosphere; the photograph stays a photograph.`} />
              <GradientOver opacity={MESH_OPACITY.justShowUp} label={`${MESH_OPACITY.justShowUp}%: “Just show up.” The stronger treatment, and the most the gradient is used.`} />
            </div>
            <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 [.brand-print_&]:mt-6">
              <Rule title="Over photography.">Not a flat background, a button fill or a fill for type. It needs a picture underneath to make sense.</Rule>
              <Rule title="Stretched to fit, never tiled.">The mesh is defined in proportions, so it fills any shape. Do not crop into it, rotate it or recolor it.</Rule>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "pairings",
      title: "Pairings.",
      nav: "Pairings",
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
              <Pairing text={black()} ground={n("accent")} textName="Black" groundName="accent" note="Success messages and the Questions button." />
              <Pairing text={black()} ground={n("lavender-dye")} textName="Black" groundName="any secondary" note="Lavender dye shown: the lowest of the set." />
            </div>
            <h3 className={cn(LABEL, "mt-10 mb-3 text-foreground/65 [.brand-print_&]:mt-6")}>Not for text</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 [.brand-print_&]:gap-y-4">
              <Pairing prohibited text={white()} ground={n("peach-dye")} textName="White" groundName="any secondary" note="Invisible. Type on a secondary color is always black." />
              <Pairing prohibited text={n("neutral-300")} ground={white()} textName="Neutral 300" groundName="white" note="Contour-line gray. Lines only, never words." />
              <Pairing prohibited text={n("muted-foreground")} ground={n("muted")} textName="Neutral 500" groundName="neutral 100" note="Falls under AA. The footer mixes a darker ink for this reason." />
              <Pairing prohibited text={n("blue-dye")} ground={white()} textName="A dye" groundName="white" note="The secondary colors are grounds, not text colors." />
            </div>
            <div className={cn("mt-12 border-t border-foreground pt-8", WEB_ONLY)}>
              <h3 className="text-[20px] leading-6 font-black tracking-[-0.02em]">Check a pairing.</h3>
              <p className="mt-2 mb-6 max-w-[60ch] text-p-sm text-foreground/70">Any two colors in the palette, measured live from the current values.</p>
              <ContrastChecker colors={allColors().map((c) => ({ id: c.id, name: c.name, hex: c.hex }))} initialText="black" initialGround="peach-wash" />
            </div>
          </>
        );
      },
    },
    {
      id: "working",
      title: "Working colors.",
      nav: "Working colors",
      lede: "The colors with a job in the interface. They are named for what they do, so a component never reaches for a raw value. They will move into the MWDS design system unchanged.",
      render: () => (
        <>
          <SpecTable
            caption="Working colors: values and roles"
            head={["Name", "Sample", "HEX", "Role"]}
            mono={[2]}
            rows={functional.map((c) => [
              c.name,
              <span key="s" aria-hidden style={{ backgroundColor: `var(--${c.cssVar})` }} className="block h-5 w-12 rounded-xs ring-1 ring-foreground/15 ring-inset" />,
              c.hex,
              c.role,
            ])}
          />
          <div className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-3 [.brand-print_&]:mt-6">
            <Rule title="Red is for errors only.">The single red in the system marks an invalid field. It is never decoration and never a brand color.</Rule>
            <Rule title="Focus follows the surface.">A black ring with a white gap on white; a white ring with a black gap on black and on photographs. See Digital.</Rule>
            <Rule title="Hover inverts.">Black buttons turn white and white buttons turn black, keeping a thin outline. No third color is introduced for a hover.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "print",
      title: "Color in print.",
      nav: "Print",
      lede: "Every color here is defined for screens, in sRGB. Printed color depends on the press, the paper or fabric and the printer's profile, so it is matched by proofing, not by formula.",
      render: () => {
        const rows: BrandColor[] = [colorById("black"), colorById("white"), colorById("neutral-100"), colorById("neutral-500"), ...tints.filter((t) => ["mint", "peach", "lavender", "blue"].includes(t.name)).map((t) => t.dye)];
        return (
          <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
            <div className="lg:col-span-7">
              <SpecTable
                caption="Reference values for print: HEX, RGB and HSL"
                head={["Color", "HEX", "RGB", "HSL"]}
                mono={[1, 2, 3]}
                rows={rows.map((c) => [
                  <span key="n" className="flex items-center gap-3">
                    <span aria-hidden style={{ backgroundColor: `var(--${c.cssVar})` }} className="block size-5 shrink-0 rounded-full ring-1 ring-foreground/15 ring-inset" />
                    {c.name}
                  </span>,
                  c.hex,
                  formatRgb(c.hex),
                  formatHsl(c.hex),
                ])}
              />
            </div>
            <div className="grid content-start gap-6 lg:col-span-5">
              <Rule title="Proof it.">Give the printer the sRGB values and approve a physical proof on the real paper or fabric. No CMYK, Pantone or thread colors are specified yet, and none should be guessed.</Rule>
              <Rule title="Small black type: 100% K.">The usual default, and the safest for registration. Follow the printer if they ask for something else.</Rule>
              <Rule title="Large black areas: ask.">Whether a big black fill uses a rich black, and which mix, depends on the printer, press, paper and profile.</Rule>
              <Rule title="Gradient and tie-dye: convert with care.">Both are soft RGB color that shifts in print. Convert them through a color-managed workflow and proof them on the intended material.</Rule>
            </div>
          </div>
        );
      },
    },
  ],
};
