import { Container } from "@/components/Container";
import { RocketIcon } from "@/components/icons";
import { Odometer } from "@/components/Odometer";
import type { ClubTotals as ClubTotalsData } from "@/lib/club-totals";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { DISPLAY_HEADING, displayHeading } from "@/lib/headings";
import { tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

/**
 * "2026 club totals." — Figma 1:243 (desktop), 78:294 (tablet), 78:412
 * (mobile), redesigned in homepage Round 2 (Owner direction, 2026-11-08):
 *
 *   - heading centered; no visible provisional badge (the `status` stays on
 *     the data and on the section as `data-status`)
 *   - four equal circles, each a very pale tie-dye (mint, peach, lavender,
 *     blue) — soft radial blooms over a slow conic swirl, blurred, inside a
 *     clipped circle; the figure and label centered in it
 *   - figures slightly smaller than Figma (96 → 80 desktop, 48 → 40 below)
 *   - figures roll in once, odometer-style, when they scroll into view
 *     (Odometer; static under reduced motion)
 *
 *                 circles                      figure   label
 *   mobile 393    2 × 2, ≤162, gap 20 / 24     40       13/18
 *   tablet 768    4 across, ≤150, gap 24       40       13/18
 *   desktop 1400  4 across, ≤280, gap 32       80       16/24
 *
 * Semantics: a description list; each value (<dd>) is shown above its label
 * (<dt>) visually, so assistive tech reads "Vertical climbed: 132K ft".
 * Renders nothing when there are no totals (Owner decision D1: hide rather
 * than invent). All figures remain provisional until the Owner confirms them.
 */
export function ClubTotals({ totals }: { totals: ClubTotalsData | null }) {
  if (!totals || totals.items.length === 0) return null;

  const layout = fluidVars({
    "--totals-pt": [56, 64, 136],
    "--totals-pb": [64, 86, 128],
    "--totals-grid-mt": [36, 40, 72],
    "--totals-gap-x": [20, 24, 32],
    "--totals-circle": [162, 150, 280],
    "--totals-label-mt": [6, 6, 12],
  });
  // Owner direction (2026-11-08): the "Get high in the city." size (was 32 / 44 / 64).
  const heading = displayHeading();
  const value = fluidType([40, 40, 80], [40, 40, 80]);
  const label = fluidType([13, 13, 16], [18, 18, 24]);

  return (
    <section
      aria-labelledby="club-totals-heading"
      data-status={totals.status}
      style={layout}
      className="bg-background text-foreground pt-(--totals-pt-a) pb-(--totals-pb-a) md:pt-(--totals-pt-b) md:pb-(--totals-pb-b)"
    >
      <Container>
        <h2 id="club-totals-heading" style={heading} className={cn(FLUID_TYPE, DISPLAY_HEADING, "text-center ss08")}>
          {totals.year} club totals.
        </h2>

        <dl
          className={cn(
            "grid grid-cols-2 justify-items-center gap-y-6 md:grid-cols-4",
            "mt-(--totals-grid-mt-a) gap-x-(--totals-gap-x-a) md:mt-(--totals-grid-mt-b) md:gap-x-(--totals-gap-x-b)",
          )}
        >
          {totals.items.map((item, i) => (
            <div
              key={item.label}
              data-slot="total"
              style={tintVars(i)}
              className={cn(
                "relative isolate flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-full px-[12%] text-center",
                "max-w-(--totals-circle-a) md:max-w-(--totals-circle-b)",
              )}
            >
              <span aria-hidden className="cmr-tie-dye absolute -z-10" />
              <dt
                style={label}
                className={cn(FLUID_TYPE, "order-2 mt-(--totals-label-mt-a) font-medium md:mt-(--totals-label-mt-b)")}
              >
                {item.label}
              </dt>
              <dd style={value} className={cn(FLUID_TYPE, "order-1 font-black tracking-[-0.02em] whitespace-nowrap")}>
                <span className="inline-flex items-end leading-none">
                  <Odometer watch="section" value={item.value} srLabel={item.unit ? `${item.value} ${item.unit}` : item.value} />
                  {item.unit && (
                    <span aria-hidden className="mb-[0.12em] ml-[0.04em] text-[0.3em] leading-none tracking-[-0.02em]">
                      {item.unit}
                    </span>
                  )}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        {totals.moon && <MoonLine moon={totals.moon} />}
      </Container>
    </section>
  );
}

const feet = (n: number) => n.toLocaleString("en-US");

/**
 * "We're going to the moon!" — a small editorial aside under the totals (PR #4
 * final pass, Owner direction 2026-11-09). Centred, much smaller than the
 * circles: an outlined rocket and a short heading, then one sentence whose
 * distance is bold and a touch larger. The distance counts down, odometer
 * style, from the full Earth–Moon distance to what's left, starting with the
 * totals when the section comes into view (once per page load; still under
 * reduced motion; assistive tech reads the final figure).
 */
function MoonLine({ moon }: { moon: NonNullable<ClubTotalsData["moon"]> }) {
  return (
    <div data-slot="moon" className="mx-auto mt-14 max-w-[680px] text-center md:mt-16 lg:mt-24">
      <h3 className="inline-flex items-center gap-2 text-[20px] leading-7 font-black tracking-[-0.02em] lg:text-[24px] lg:leading-8">
        <RocketIcon className="size-5 shrink-0 lg:size-6" />
        We&apos;re going to the moon!
      </h3>
      <p className="mt-2 text-p text-foreground/70 lg:text-p-lg">
        Join the club and help us get there. We&apos;re only{" "}
        <strong className="text-[1.15em] font-bold whitespace-nowrap text-foreground tabular-nums">
          <Odometer
            watch="section"
            value={feet(moon.remainingFt)}
            from={feet(moon.startFt)}
          />{" "}
          feet away
        </strong>
        .
      </p>
    </div>
  );
}
