import type { ReactNode } from "react";
import { ArrowLink } from "@/components/ArrowLink";
import { Figure, Frame, Rule, SpecList, SpecTable } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_FILL, PRINT_FILL_COL, PRINT_GROW, PRINT_ROWS_1, WEB_ONLY } from "@/components/brand/styles";
import { ctaLinkVariants } from "@/components/CtaLink";
import { MotionToggle } from "@/components/MotionToggle";
import { Button } from "@/components/ui/button";
import type { BrandChapter } from "@/lib/brand/manual";
import { HEADING_ROLES, LAYOUT, MOTION, type HeadingRoleKey } from "@/lib/brand/spec";
import { fluidAt } from "@/lib/fluid";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

function Stage({ n, name, children, note }: { n: number; name: string; children: ReactNode; note: string }) {
  return (
    <li className="relative flex min-w-0 flex-1 flex-col rounded-xl border border-foreground p-4 [.brand-print_&]:p-4">
      <span className="font-mono text-[12px] leading-4 text-foreground/65">{String(n).padStart(2, "0")}</span>
      <span className="mt-1 text-[19px] leading-6 font-black tracking-[-0.02em]">{name}</span>
      <span className="mt-1 font-mono text-[11.5px] leading-4 break-words text-foreground/75">{children}</span>
      <span className="mt-2 text-[13px] leading-[18px] text-foreground/70">{note}</span>
    </li>
  );
}

/** Font size against viewport width for three roles, computed by the site's own fluid function. */
function FluidChart() {
  const W = 640;
  const H = 300;
  const pad = { l: 44, r: 16, t: 16, b: 32 };
  const vMin = LAYOUT.minViewport;
  const vMax = 1600;
  const sMax = 220;
  const x = (v: number) => pad.l + ((v - vMin) / (vMax - vMin)) * (W - pad.l - pad.r);
  const y = (s: number) => H - pad.b - (s / sMax) * (H - pad.t - pad.b);
  const keys: HeadingRoleKey[] = ["displayXL", "displayLarge", "standardH2"];
  const line = (k: HeadingRoleKey) =>
    Array.from({ length: 65 }, (_, i) => vMin + (i / 64) * (vMax - vMin))
      .map((v) => `${x(v).toFixed(1)},${y(fluidAt(HEADING_ROLES[k].size, v)).toFixed(1)}`)
      .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Chart: display type size against viewport width. Each role is a straight line between its values at 393, 768 and 1400 pixels, and flat beyond 1400." className="h-full w-full text-foreground">
      {[0, 50, 100, 150, 200].map((s) => (
        <g key={s}>
          <line x1={pad.l} x2={W - pad.r} y1={y(s)} y2={y(s)} stroke="currentColor" strokeWidth="1" opacity="0.15" />
          <text x={pad.l - 8} y={y(s) + 4} textAnchor="end" className="fill-current font-mono text-[11px] opacity-65">
            {s}
          </text>
        </g>
      ))}
      {Object.values(LAYOUT.anchors).map((v) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={pad.t} y2={H - pad.b} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x={x(v)} y={H - 10} textAnchor="middle" className="fill-current font-mono text-[11px]">
            {v}
          </text>
        </g>
      ))}
      {keys.map((k) => (
        <g key={k}>
          <polyline points={line(k)} fill="none" stroke="currentColor" strokeWidth={k === "displayXL" ? 2.5 : 1.5} strokeLinejoin="round" />
          <text x={x(1500)} y={y(HEADING_ROLES[k].size[2]) - 7} textAnchor="middle" className="fill-current text-[11px] font-semibold">
            {HEADING_ROLES[k].name}
          </text>
        </g>
      ))}
    </svg>
  );
}

const cta = (variant: "primary" | "secondary" | "outline" | "outlineOnDark", label: string, extra?: string) => (
  // A real link, so hover, press and focus are the production states. It goes nowhere new: it points at this section.
  <a href="#controls" className={cn(ctaLinkVariants({ variant }), "h-12 px-6 text-p", extra)}>
    {label}
  </a>
);

/** A button drawn in its focused state (the ring classes applied directly), for the surface it sits on. */
function Focused({ label, className }: { label: string; className: string }) {
  return (
    <span aria-hidden className={cn("inline-flex h-12 items-center rounded-md px-6 text-p font-semibold ring-3 ring-ring ring-offset-2 ring-offset-(color:--focus-offset)", className)}>
      {label}
    </span>
  );
}

export const digital: BrandChapter = {
  slug: "digital",
  number: "08",
  title: "Digital.",
  name: "Digital",
  summary: "How the identity is built into the website: where values live, how layouts flex, how controls behave, and what must hold for every visitor.",
  plates: [
    {
      id: "tokens",
      title: "Where values live.",
      nav: "Tokens",
      lede: "A color or a size is decided once, in Figma, and travels to the site through a checked pipeline. Nobody types a hex code into a component, and this manual reads the same values the site does.",
      render: () => (
        <>
          <ol className="flex flex-col gap-3 lg:flex-row">
            <Stage n={1} name="Figma" note="The source of truth. The MWDS design system file, with a CMR theme.">
              MWDS variables, CMR mode
            </Stage>
            <Stage n={2} name="Token files" note="A read-only, checksummed export. A hand edit fails the build.">
              Exported tokens
            </Stage>
            <Stage n={3} name="Generated CSS" note="Custom properties, preserving Figma's alias chain. Never edited by hand.">
              CSS variables
            </Stage>
            <Stage n={4} name="Semantic names" note="The only vocabulary components use: primary, muted, border, accent.">
              bg-primary · text-muted-foreground
            </Stage>
            <Stage n={5} name="Components" note="Buttons, links, inputs and sections, built only from those names.">
              The website
            </Stage>
          </ol>
          <div className={cn("mt-8 grid gap-8 lg:grid-cols-12", PRINT_BOTTOM)}>
            <div className="lg:col-span-7">
              <SpecTable
                caption="Layers of the CMR styling system"
                head={["Layer", "Holds", "Changed by"]}
                mono={[]}
                rows={[
                  ["MWDS tokens", "Black, white, neutrals, the interface accent, type scale, spacing, radii, shadows.", "Editing Figma, then re-exporting."],
                  ["CMR layer", "The secondary colors, contour grays, footer ink, tie-dye recipe, motion.", "The site's CMR stylesheet, with Owner direction."],
                  ["Brand specification", "Measurements of artwork and mirrors of component values, for this manual.", "The manual's data, checked by tests."],
                ]}
              />
            </div>
            <div className="grid gap-6 lg:col-span-5">
              <Rule title="No second palette.">The framework&apos;s default colors are switched off, so a stray gray from outside the system cannot exist.</Rule>
              <Rule title="Proven against Figma.">Tests compare every generated color with what Figma itself resolves for a real CMR frame.</Rule>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "layout",
      title: "Layout.",
      nav: "Layout",
      lede: "The site is designed at three widths and is exact at each of them. Between them, type and spacing move in straight lines, so there is no width at which a layout snaps.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <Figure className={cn("lg:col-span-7", PRINT_FILL_COL)} caption="Display type size in pixels against viewport width. Dashed lines are the three design widths; beyond 1400 everything holds.">
            <Frame className={cn("aspect-[16/9] p-4", PRINT_FILL)}>
              <FluidChart />
            </Frame>
          </Figure>
          <div className="flex flex-col lg:col-span-5">
            <SpecList
              rows={[
                ["Design widths", `${LAYOUT.anchors.mobile} · ${LAYOUT.anchors.tablet} · ${LAYOUT.anchors.desktop} px`],
                ["Narrowest supported", `${LAYOUT.minViewport} px`],
                ["Container", `${LAYOUT.containerMax} px maximum, centered`],
                ["Side margin", `${LAYOUT.gutter.mobile} px, then ${LAYOUT.gutter.tabletUp} px from 768`],
                ["Spacing grid", `${LAYOUT.baseUnit} px`],
                ["Breakpoints", "768 (tablet), 1024 (desktop), 1280 (wide)"],
              ]}
            />
            <div className={cn("grid gap-6", PRINT_BOTTOM)}>
              <Rule title="The page never scrolls sideways.">A row that cannot fit (the phone navigation, a wide table) scrolls inside itself. Tested at every width.</Rule>
              <Rule title="Reading order is source order.">Columns reflow, but text always comes before its figure in the markup, so every screen and screen reader agree.</Rule>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "controls",
      title: "Buttons and links.",
      nav: "Controls",
      lede: "Four buttons, one link. Every state is a solid fill with an opposite label, so a button is 21:1 whether it sits on white, on black or on a photograph. When a filled button inverts, it keeps a thin outline, so it never vanishes into the page. These are the live components: hover and press them.",
      render: () => (
        <>
          <div className={cn("grid gap-4 md:grid-cols-2", PRINT_GROW, PRINT_ROWS_1)}>
            <Frame label="On white" className="flex min-h-[220px] flex-wrap content-center items-center gap-3 p-8 pt-12 [.brand-print_&]:min-h-0">
              {cta("primary", "Find a Run")}
              {cta("outline", "Join the club")}
              <ArrowLink href="#controls" className="ml-2 text-p">
                Explore all hills
              </ArrowLink>
            </Frame>
            {/* A plain black surface, as the site's black sections are: not the inverted-token frame, which would flip the buttons. */}
            <div className={cn("relative flex min-h-[220px] flex-wrap content-center items-center gap-3 overflow-hidden rounded-xl bg-primary p-8 pt-12 text-primary-foreground [.brand-print_&]:min-h-0", onDarkSurface)}>
              <p className={cn(LABEL, "absolute top-4 left-4 text-[11px] text-primary-foreground/60")}>On black and on photographs</p>
              {cta("secondary", "Join the club")}
              {cta("outlineOnDark", "More hills")}
              <ArrowLink href="#controls" className="ml-2 text-p">
                See the full schedule
              </ArrowLink>
            </div>
          </div>
          <SpecTable
            className="mt-8"
            caption="Button variants and their states"
            head={["Variant", "Rest", "Hover", "Pressed", "Used for"]}
            rows={[
              ["Primary", "Black fill, white label", "White fill, black label, 1 px black outline", "Neutral 200 fill, outline kept", "The main action on white and on photographs."],
              ["Secondary", "White fill, black label", "Black fill, white label, 1 px white outline", "Neutral 800 fill, outline kept", "The second action on photographs and black."],
              ["Outline", "1 px black border", "Black fill, white label", "Neutral 800 fill", "The header's “Join the club.” Light surfaces."],
              ["Outline on dark", "1 px white border", "White fill, black label", "Neutral 200 fill", "Black sections."],
              ["Arrow link", "Medium text, 16 px arrow", "Underline; arrow moves 2 px", "—", "Onward navigation inside a section."],
            ]}
          />
          <div className={cn("mt-6 flex flex-wrap items-center gap-x-8 gap-y-4", PRINT_BOTTOM)}>
            <div className="flex items-center gap-3">
              <Button>Join the list</Button>
              <Button disabled>Sending…</Button>
              <span className="text-[14px] leading-5 text-foreground/70">Form buttons: the MWDS Button, 8 px radius. Hover darkens; disabled is half strength and does nothing.</span>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "focus",
      title: "Focus.",
      nav: "Focus",
      lede: "Keyboard focus is a 3 px ring with a 2 px gap between it and the control. The ring takes the opposite color of the surface and the gap takes the surface's own color, so the ring is visible everywhere, including on a solid black button.",
      render: () => (
        <>
          <div className={cn("grid grid-cols-2 gap-4 lg:grid-cols-4", PRINT_GROW, PRINT_ROWS_1)}>
            {(
              [
                ["White", "border border-foreground/15 bg-background text-foreground", "bg-primary text-primary-foreground", "Black ring, white gap"],
                ["Footer gray", "bg-muted text-foreground [--focus-offset:var(--muted)]", "bg-primary text-primary-foreground", "Black ring, gray gap"],
                ["Black", cn("science-dark bg-background text-foreground", onDarkSurface), "bg-primary text-primary-foreground", "White ring, black gap"],
                ["Mint", "bg-accent text-foreground [--focus-offset:var(--accent)]", "bg-primary text-primary-foreground", "Black ring, mint gap"],
              ] as const
            ).map(([name, surface, button, note]) => (
              <figure key={name} className={PRINT_FILL_COL}>
                <div className={cn("flex aspect-[4/3] items-center justify-center rounded-xl", PRINT_FILL, surface)}>
                  <Focused label="Join the club" className={button} />
                </div>
                <figcaption className="mt-3">
                  <span className="block text-p-sm font-semibold">{name}</span>
                  <span className="block font-mono text-[12px] leading-5 text-foreground/65">{note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className={cn("mt-8 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="Never removed.">Every link, button, field and control shows the ring on keyboard focus. Nothing uses `outline: none` without it.</Rule>
            <Rule title="Never hidden under the header.">The sticky header and this bar are accounted for in scroll offsets, so a focused item is never covered.</Rule>
            <Rule title="Errors change the ring.">An invalid field gets a red border and a pale red ring, and says what is wrong in text.</Rule>
          </div>
          <p className={cn("mt-6 text-p-sm text-foreground/70", WEB_ONLY)}>Press Tab on this page to see the real thing: the examples above are drawn in their focused state.</p>
        </>
      ),
    },
    {
      id: "motion",
      title: "Motion.",
      nav: "Motion",
      lede: "Slow, small and optional. Decorative motion follows one site-wide preference, set by the visitor's system or by a control in the footer. Nothing important ever depends on something moving.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-7">
            <SpecTable
              caption="Motion in production: durations and where they are used"
              head={["Motion", "Timing", "Where"]}
              mono={[1]}
              rows={MOTION.map((m) => [m.name, m.value, m.where])}
            />
          </div>
          <div className="flex flex-col lg:col-span-5">
            <div className={cn("rounded-xl bg-muted p-6 [--focus-offset:var(--muted)]", WEB_ONLY)}>
              <p className={cn(LABEL, "text-foreground/65")}>The site&apos;s motion preference</p>
              <p className="mt-2 text-p-sm text-foreground/80">This is the same control as the one in the footer. It stops the contour fields and floating circles on every page.</p>
              <div className="mt-4">
                <MotionToggle />
              </div>
            </div>
            <div className="mt-6 grid gap-6 [.brand-print_&]:mt-0">
              <Rule title="Two kinds of motion.">Functional (hover, focus, the header resizing) stays quick, 150 to 300 ms. Decorative (contours, floating circles, counting numbers) is slow and can be switched off.</Rule>
              <Rule title="Once, then still.">Numbers roll in a single time when they come into view. Nothing loops for attention.</Rule>
              <Rule title="Respect the setting.">With reduced motion requested, decorative animation shows one still frame and scrolling is instant.</Rule>
              <Rule title="No flashing. Ever.">Even the lightning in the weather art is a still bolt.</Rule>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "accessibility",
      title: "Accessibility.",
      nav: "Accessibility",
      lede: "The target is WCAG 2.2 AA for anything a visitor reads or operates. It is checked by automated tests at three screen widths on every change, and the one place that falls short is written down.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-7">
            <SpecTable
              caption="Accessibility expectations for CMR digital work"
              head={["Expectation", "How the site meets it"]}
              rows={[
                ["Text contrast 4.5:1, large text 3:1", "Token pairings are measured (see Color). Axe runs contrast checks on every page."],
                ["Keyboard access to everything", "Native links, buttons and inputs. A skip link. Dialogs trap and return focus."],
                ["Visible focus", "The 3 px ring on every surface (previous page)."],
                ["Targets large enough to tap", "Phone navigation cells are 48 px tall and the whole cell is the link."],
                ["Headings in order", "One h1 per page; sections are h2. The visual size never decides the level."],
                ["Meaning without color", "Status is text, not hue. Struck-through words stay in the accessible name."],
                ["Images described or hidden", "Decorative photographs and contours are hidden from assistive technology; informative figures have text alternatives."],
                ["Motion is optional", "System setting honored; a visible pause control on every page."],
              ]}
            />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Rule title="One known exception.">The homepage hero headline sits on a pale sky below AA contrast. The Owner has accepted it, and it is not claimed to conform; see Photography.</Rule>
            <Rule title="Expression and function are separate.">Contour lines and tie-dye may be faint, because they carry no information. The moment something carries information, it meets the standard.</Rule>
            <Rule title="New work is tested the same way.">A page is not finished until it passes axe at all three widths and can be used start to finish from the keyboard.</Rule>
            <Rule title="An exception is a decision.">Falling short is allowed only when the Owner accepts it in writing, with the measured figure and the alternative on file.</Rule>
          </div>
        </div>
      ),
    },
    {
      id: "mwds",
      title: "Next: MWDS.",
      nav: "MWDS",
      lede: "CMR's tokens already come from the MWDS design system in Figma. A fuller integration is planned as its own project. This is what is expected to move when it happens, so that the standards change their sources and not their look.",
      render: () => (
        <>
          <SpecTable
            caption="Expected changes when MWDS is integrated"
            head={["Area", "Today", "With MWDS", "Parity risk"]}
            rows={[
              ["Core color, spacing, radii", "MWDS tokens, CMR theme, exported from Figma.", "Unchanged in principle; consumed from the MWDS package.", "Low. Same values, new delivery."],
              ["Secondary colors, contour grays, footer ink", "CMR-only variables in the CMR stylesheet.", "Promoted to MWDS variables in the CMR theme, then aliased.", "Low, if the hex values are carried over exactly."],
              ["Display type roles", "Five fluid roles in code, off the MWDS scale.", "Candidates for MWDS text styles with per-breakpoint values.", "Medium. Line height and tracking must match to the pixel."],
              ["Buttons", "A CMR button for marketing surfaces; the MWDS Button for forms.", "One MWDS Button with CMR variants, if it gains on-photo states.", "Medium. Hover inversion and the focus gap are CMR-specific."],
              ["Tie-dye, contours, hill profiles", "CMR artwork and code.", "Stay CMR. Brand graphics are not design-system components.", "None."],
              ["This manual", "Reads the same values as the site.", "Repoint the two source paths and the variable names.", "Low. Layouts and graphics do not change."],
            ]}
          />
          <div className={cn("mt-8 grid gap-x-8 gap-y-6 md:grid-cols-2", PRINT_BOTTOM)}>
            <Rule title="Not part of this edition.">No MWDS package, Storybook or token migration is included here. The manual documents CMR as it is built today.</Rule>
            <Rule title="A Figma edition of this manual.">Planned as a native, editable Figma file built on MWDS variables and components once the integration lands. This PDF is not a substitute for it.</Rule>
          </div>
        </>
      ),
    },
  ],
};
