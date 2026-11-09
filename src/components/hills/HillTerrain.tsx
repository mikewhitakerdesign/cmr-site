import { Container } from "@/components/Container";
import { Odometer } from "@/components/Odometer";
import { BODY, EYEBROW, SECTION_HEADING, sectionHeading } from "@/components/hills/styles";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { REPEAT_TARGETS_FT, formatMiles, routeCounts, type HillWithPage } from "@/lib/hills";
import { tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

/**
 * "The mountain at Montrose." — Figma 1:6445: story column (heading, 18/27
 * copy at 70%, max 448) and "Know what you're running" spec rows (Geist Mono
 * label left, Geist medium value right, 45 tall, #e5e5e5 rules). Two equal
 * columns from tablet (gap 64), stacked on mobile. Padding 96. The approved
 * reference for this kind of section (Owner, refinement pass 2026-11-08).
 *
 * Rows show what is recorded: Cricket Hill keeps the Figma frame's surface,
 * exposure and terrain rows; the others show the Owner's one-line surface
 * ("Grass/dirt"). Added (not in Figma): the sources behind the geographic
 * statements, so published facts read differently from club voice.
 */
export function HillAbout({ hill }: { hill: HillWithPage }) {
  const { page } = hill;
  const rows: [string, string][] = [];
  if (page.surface) {
    rows.push(["Primary surface", page.surface.primary]);
    if (page.surface.secondary) rows.push(["Secondary surface", page.surface.secondary]);
  } else {
    rows.push(["Surface", page.surfaceSummary]);
  }
  if (page.exposure) rows.push(["Exposure", page.exposure]);
  if (page.terrainCharacter) rows.push(["Terrain character", page.terrainCharacter]);

  return (
    <section aria-labelledby="about-heading" className="py-24">
      <Container className="grid gap-16 md:grid-cols-2">
        <div>
          <h2 id="about-heading" style={sectionHeading()} className={cn(FLUID_TYPE, SECTION_HEADING)}>
            {page.aboutHeading}
          </h2>
          <div className={cn(BODY, "max-w-[448px] space-y-5 pt-8 text-foreground/70")}>
            {page.about.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {page.sources.length > 0 && (
            <div data-slot="hill-sources" className="mt-8 max-w-[448px] text-p-mini text-muted-foreground">
              <p className={cn(EYEBROW, "text-[12px] leading-5")}>Sources</p>
              <ul className="mt-1 space-y-1">
                {page.sources.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      rel="noopener noreferrer"
                      className="rounded-xs underline underline-offset-2 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="md:pt-3">
          <h3 className={cn(EYEBROW, "text-muted-foreground")}>Know what you&apos;re running</h3>
          <dl className="pt-6">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 border-b border-border py-3 text-[14px] leading-5">
                <dt className="font-mono text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="pt-4 font-mono text-[14px] leading-5 text-muted-foreground">Surface conditions vary with weather.</p>
        </div>
      </Container>
    </section>
  );
}

/**
 * "How tall is it? / How tall you need it?" — the repeats section, redesigned
 * in the refinement pass (Owner direction, 2026-11-08) from Figma's "Make it
 * taller." 1:6701: the line drawing is gone; the counts are four metric
 * circles in the homepage club-totals style (pale tie-dye, centred), set as a
 * 2 × 2 quadrant beside the copy.
 *
 * Each circle: the target ("500 ft", Geist Mono), the count (Geist Black,
 * rolling in like the homepage figures), "REPEATS", and the distance below in
 * a subordinate size. Counts are derived from the route's Owner-provided
 * baseline (routeCounts: ≈ 40 ft and 0.2 mi per Cricket Hill repeat, rounded
 * up to whole repeats) — approximate arithmetic, as the copy says. The copy's
 * last sentence names that route's length.
 *
 * A hill with no mapped route keeps the composition: the circles turn to
 * dashed outlines reading "TBD" for repeats and miles, and the copy says no
 * route is mapped yet. Nothing is calculated from a hill's overall rise.
 *
 *                 layout                                      circle
 *   mobile 393    heading, copy, quadrant (stacked)            ≤ 162
 *   tablet 768    heading; copy | quadrant                     ≤ 150
 *   desktop 1400  heading; copy | quadrant (beside the copy)   ≤ 248
 *
 * The heading spans the section: it must be two lines at the display size,
 * which is wider than the space left of a quadrant.
 */
export function HillRepeats({ hill }: { hill: HillWithPage }) {
  const { route } = hill.page;
  const counts = routeCounts(route);
  const layout = fluidVars({
    "--repeats-py": [96, 128, 144],
    "--repeats-circle": [162, 150, 248],
    "--repeats-gap": [16, 20, 28],
  });
  const value = fluidType([48, 40, 88], [48, 40, 88]);

  return (
    <section
      aria-labelledby="repeats-heading"
      data-route={route ? "mapped" : "none"}
      style={layout}
      className="border-t border-border py-(--repeats-py-a) md:py-(--repeats-py-b)"
    >
      <Container className="grid gap-x-12 gap-y-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start lg:gap-x-16">
        <h2 id="repeats-heading" style={sectionHeading()} className={cn(FLUID_TYPE, SECTION_HEADING, "md:col-span-2")}>
          <span className="block">How tall is it?</span> <span className="block">How tall you need it?</span>
        </h2>

        <p className={cn(BODY, "max-w-[448px] text-muted-foreground")}>
          One repeat isn&apos;t much of a mountain. That&apos;s what the next repeat is for.{" "}
          {route ? (
            <>
              The following number of repeats are approximations only and based on specific routes mapped by CMR. The{" "}
              {hill.name} route is {formatMiles(route.distanceMi)} miles up and down.
            </>
          ) : (
            <>CMR hasn&apos;t mapped a route on {hill.name} yet, so there are no repeat counts here.</>
          )}
        </p>

        <dl className="grid grid-cols-2 gap-(--repeats-gap-a) md:gap-(--repeats-gap-b)">
          {REPEAT_TARGETS_FT.map((target, i) => {
            const count = counts?.[target];
            return (
              <div
                key={target}
                data-slot="repeat-circle"
                style={count ? tintVars(i) : undefined}
                className={cn(
                  "relative isolate flex aspect-square w-full max-w-(--repeats-circle-a) flex-col items-center justify-center overflow-hidden rounded-full text-center",
                  "md:w-(--repeats-circle-b) md:max-w-none",
                  !count && "border border-dashed border-foreground/30",
                )}
              >
                {count && <span aria-hidden className="cmr-tie-dye absolute -z-10" />}
                <dt className="font-mono text-[13px] leading-4 lg:text-[15px] lg:leading-5">
                  {target.toLocaleString("en-US")} ft<span className="sr-only"> of climbing</span>
                </dt>
                <dd className="flex flex-col items-center">
                  <span style={value} className={cn(FLUID_TYPE, "mt-1 font-black tracking-[-0.03em] lg:mt-2", !count && "text-muted-foreground")}>
                    {count ? (
                      <Odometer value={String(count.repeats)} srLabel={`${count.repeats} repeats, about ${milesLabel(count.miles)}`} />
                    ) : (
                      <>
                        <span aria-hidden>TBD</span>
                        <span className="sr-only">Not counted yet</span>
                      </>
                    )}
                  </span>
                  <span aria-hidden className={cn(EYEBROW, "mt-1 text-[11px] leading-4 lg:mt-2 lg:text-[13px] lg:leading-5")}>
                    Repeats
                  </span>
                  <span aria-hidden data-slot="repeat-miles" className="mt-0.5 text-[12px] leading-4 text-foreground/70 lg:mt-1 lg:text-[14px] lg:leading-5">
                    {count ? milesLabel(count.miles) : "TBD"}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      </Container>
    </section>
  );
}

/** "2.6 miles", "5 miles", "1 mile". */
const milesLabel = (mi: number) => `${mi.toLocaleString("en-US", { maximumFractionDigits: 1 })} ${mi === 1 ? "mile" : "miles"}`;
