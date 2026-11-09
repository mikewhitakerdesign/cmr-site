import Link from "next/link";
import { ArrowLink } from "@/components/ArrowLink";
import { Container } from "@/components/Container";
import { ArrowUpRightIcon, ClockIcon, MapPinIcon } from "@/components/icons";
import { FLUID_TYPE, fluidVars } from "@/lib/fluid";
import { DISPLAY_HEADING, displayHeading } from "@/lib/headings";
import { workoutLabel, type RunOccurrence } from "@/lib/runs";
import { formatSlot, toDateTimeAttr } from "@/lib/schedule";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/**
 * Upcoming runs — Figma 1:24 (desktop), 78:304 (tablet), 78:422 (mobile).
 * Black surface; data and scheduling live in src/lib (runs.ts, schedule.ts).
 *
 *            section  heading   rows                                    schedule link
 *   mobile   pt48     36/39     stacked, 166 tall                       centered below, no arrow
 *   tablet   pt48     48/50     time column 150 + details; 124 tall     centered below, no arrow
 *   desktop  py96     64/60.8   grid 170 / 1fr / 220 / 20, py28, icons  top right, with arrow
 *
 * Responsive classification (Owner decision D4): the row icons, the ↗ column,
 * the closing rule and the link arrow are desktop-only in all three frames
 * and are treated as intentional adaptation (stacked rows drop the icon
 * column); they are not carried to tablet or mobile.
 *
 * Round 2 (Owner direction, 2026-11-08): one row per run (the next
 * occurrence of each, so the two-run schedule reads as two rows), a short
 * workout description under each title, taller rows to fit it, and no visible
 * "sample" badge (content status stays on each row as `data-status`).
 *
 * The schedule link sits after the list in the DOM (its tablet/mobile place)
 * and is moved to the top right on desktop with grid placement, so reading
 * and tab order are runs first, then the link.
 */
export function UpcomingRuns({ occurrences, now }: { occurrences: RunOccurrence[]; now: Date }) {
  const layout = fluidVars({
    "--runs-pt": [48, 48, 96],
    "--runs-pb": [50, 50, 96],
    "--runs-heading-mt": [13, 13, 16],
    "--runs-list-mt": [53, 44, 56],
  });
  // Owner direction (2026-11-08): the "Get high in the city." size (was 36 / 48 / 64).
  const heading = displayHeading();

  return (
    <section
      aria-labelledby="upcoming-runs-heading"
      style={layout}
      className={cn(
        "bg-primary text-primary-foreground",
        "pt-(--runs-pt-a) pb-(--runs-pb-a) md:pt-(--runs-pt-b) md:pb-(--runs-pb-b)",
        onDarkSurface,
      )}
    >
      <Container className="grid lg:grid-cols-[1fr_auto]">
        <div className="lg:col-start-1 lg:row-start-1">
          <p className="text-caption uppercase">Upcoming runs</p>
          <h2
            id="upcoming-runs-heading"
            style={heading}
            className={cn(FLUID_TYPE, DISPLAY_HEADING, "mt-(--runs-heading-mt-a) md:mt-(--runs-heading-mt-b)")}
          >
            See you on the hill<span className="ss08">.</span>
          </h2>
        </div>

        <div className="mt-(--runs-list-mt-a) md:mt-(--runs-list-mt-b) lg:col-span-2 lg:row-start-2">
          {occurrences.length > 0 ? (
            <ol className="lg:border-b lg:border-primary-foreground">
              {occurrences.map((o) => (
                <UpcomingRunRow key={`${o.run.slug}-${o.date}`} occurrence={o} now={now} />
              ))}
            </ol>
          ) : (
            <p className="border-t border-primary-foreground pt-7 text-p">
              No runs on the calendar right now. Check the full schedule for what&apos;s next.
            </p>
          )}
        </div>

        <ArrowLink
          href="/calendar"
          className="mt-[26px] justify-self-center text-p lg:col-start-2 lg:row-start-1 lg:mt-0 lg:mb-[-1px] lg:self-end"
          arrowClassName="hidden lg:block"
        >
          See the full schedule
        </ArrowLink>
      </Container>
    </section>
  );
}

/**
 * Explicit `lg:leading-*` beside `lg:text-*`: an arbitrary `leading-[…]` sets
 * --tw-leading, which would otherwise override the type style's line height.
 *
 * One run. The name is the only link; a stretched ::after makes the whole row
 * clickable without nesting interactive content. Hover underlines the name and
 * nudges the ↗; keyboard focus rings the whole row in the on-dark ring color.
 */
function UpcomingRunRow({ occurrence: o, now }: { occurrence: RunOccurrence; now: Date }) {
  const workout = workoutLabel(o.run);
  const location = o.meetupLocation;

  return (
    <li
      data-status={o.run.status}
      className={cn(
        "group/run relative border-t border-primary-foreground",
        // mobile: stacked
        "pt-5 pb-7",
        // tablet: time column + details
        "md:grid md:grid-cols-[150px_minmax(0,1fr)] md:gap-x-5 md:pt-6 md:pb-7",
        // desktop: four columns, aligned to the title line (the description runs below it)
        "lg:grid-cols-[170px_minmax(0,1fr)_220px_20px] lg:items-start lg:gap-x-8 lg:py-8",
      )}
    >
      {/* nowrap: the date form ("NOV 14 · 5:00 AM") is ~8px wider than Figma's 170px
          desktop column; it runs into the 32px gap rather than wrapping. */}
      <p className="font-mono text-[14px] leading-[21px] whitespace-nowrap md:row-span-2 md:pt-1 lg:row-span-1 lg:flex lg:items-center lg:gap-2 lg:pt-1.5 lg:text-p lg:leading-6">
        <ClockIcon className="hidden size-4 shrink-0 lg:block" />
        <time dateTime={toDateTimeAttr(o)}>{formatSlot(o, now)}</time>
      </p>

      <div className="mt-[13px] md:mt-0">
        <h3 className="text-[24px] leading-[30px] font-semibold tracking-[-1px] md:text-[25px] lg:text-h3 lg:leading-(--text-h3--line-height)">
          <Link
            href={`/calendar/${o.run.slug}`}
            className={cn(
              "outline-none underline-offset-4 group-hover/run:underline",
              "after:absolute after:inset-0 after:content-['']",
              "focus-visible:after:ring-3 focus-visible:after:ring-ring",
            )}
          >
            {o.run.title}
          </Link>
        </h3>
        <p className="mt-1.5 text-[14px] leading-[21px] lg:mt-1 lg:flex lg:items-center lg:gap-2 lg:text-p lg:leading-6">
          <MapPinIcon className="hidden size-4 shrink-0 lg:block" />
          <span>{location}</span>
        </p>
        {o.note && <p className="mt-1 text-p-sm">{o.note}</p>}
        {/* 75% white on black is 11.6:1. */}
        <p className="mt-3 max-w-[60ch] text-p-sm text-primary-foreground/75 md:text-p lg:mt-4">{o.run.description}</p>
      </div>

      {workout && (
        <p className="mt-4 text-[14px] leading-[21px] font-medium md:col-start-2 md:mt-3 lg:col-start-3 lg:row-start-1 lg:mt-0 lg:pt-2 lg:text-right lg:leading-5">
          {workout}
        </p>
      )}

      <ArrowUpRightIcon
        className={cn(
          "hidden size-5 lg:col-start-4 lg:row-start-1 lg:mt-1.5 lg:block",
          "motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover/run:translate-x-0.5 motion-safe:group-hover/run:-translate-y-0.5",
        )}
      />
    </li>
  );
}
