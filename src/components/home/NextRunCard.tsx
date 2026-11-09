import { ArrowLink } from "@/components/ArrowLink";
import { ClockIcon, MapPinIcon } from "@/components/icons";
import { TopoPattern } from "@/components/home/TopoPattern";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import type { RunOccurrence } from "@/lib/runs";
import { formatSlot, toDateTimeAttr } from "@/lib/schedule";
import { cn } from "@/lib/utils";

/**
 * "Next run" card — Figma Hero-NextRunCard (desktop 1:407), "Next run / Cricket
 * Mtn Repeats" (tablet 78:285, mobile 78:403).
 *
 *   desktop  p32, radius 8, title 30/30, rows pt16 / pt4, link pt24
 *   tablet   p24, 380 wide, title 30/32, rows at +18 / +10, link +29
 *   mobile   p24, full width, title 26/32
 * All three carry the 0 24 30 rgba(65,65,65,.55) shadow (not an MWDS shadow).
 *
 * Responsive classification (Owner decision D4):
 *   - radius: desktop only, as drawn (decorative; left as designed)
 *   - clock and pin icons, and the "Run details" arrow: kept at every size —
 *     the tablet and mobile frames are flattened text without the component's
 *     icons ("incomplete design"), and the icons label the time and place.
 *
 * With no upcoming run it keeps its shape and points to the calendar instead
 * of inventing one.
 *
 * Round 2 (Owner direction, 2026-11-08): no visible "sample" badge. The run's
 * content status stays in the data and on the card as `data-status`.
 *
 * PR #4 final refinements (Owner direction, 2026-11-09): the 8px radius at
 * every size, and a very quiet static contour pattern inside the card (the
 * site's vector TopoPattern, `--cmr-contour-on-dark` at 45%: ≈ #262626 on
 * black). White text crossing a line still measures > 15:1. No canvas.
 */
export function NextRunCard({ next, now, className }: { next: RunOccurrence | null; now: Date; className?: string }) {
  const title = fluidType([26, 30, 30], [32, 32, 30]);
  const space = fluidVars({
    "--card-title-mt": [9, 9, 12],
    "--card-time-mt": [18, 18, 16],
    "--card-place-mt": [10, 10, 4],
    "--card-link-mt": [29, 29, 24],
  });

  return (
    <article
      aria-labelledby="next-run-title"
      data-status={next?.run.status}
      style={space}
      className={cn(
        "relative isolate overflow-hidden rounded-lg bg-primary p-6 pb-[30px] text-primary-foreground lg:p-8",
        "shadow-[0_24px_30px_rgba(65,65,65,0.55)]", // Figma drop shadow; not in MWDS
        className,
      )}
    >
      <TopoPattern className="-z-10 text-(--cmr-contour-on-dark) opacity-45" />
      <p className="text-caption uppercase">Next run</p>

      <h2
        id="next-run-title"
        style={title}
        className={cn(FLUID_TYPE, "mt-(--card-title-mt-a) font-semibold tracking-[-1px] md:mt-(--card-title-mt-b)")}
      >
        {next ? next.run.title : "Schedule coming soon"}
      </h2>

      {next ? (
        <>
          <p className="mt-(--card-time-mt-a) flex items-center gap-2 font-mono text-p md:mt-(--card-time-mt-b)">
            <ClockIcon className="size-4 shrink-0" />
            <time dateTime={toDateTimeAttr(next)}>{formatSlot(next, now)}</time>
          </p>
          <p className="mt-(--card-place-mt-a) flex items-center gap-2 text-p md:mt-(--card-place-mt-b)">
            <MapPinIcon className="size-4 shrink-0" />
            <span>{next.meetupLocation}</span>
          </p>
          <ArrowLink href={`/calendar/${next.run.slug}`} className="mt-(--card-link-mt-a) text-p md:mt-(--card-link-mt-b)">
            Run details
          </ArrowLink>
        </>
      ) : (
        <ArrowLink href="/calendar" className="mt-(--card-time-mt-a) text-p md:mt-(--card-time-mt-b)">
          See the calendar
        </ArrowLink>
      )}
    </article>
  );
}
