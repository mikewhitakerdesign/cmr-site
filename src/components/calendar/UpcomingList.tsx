import Link from "next/link";
import { Container } from "@/components/Container";
import { statusLabel } from "@/components/calendar/status";
import { ArrowUpRightIcon, ClockIcon, MapPinIcon } from "@/components/icons";
import { FLUID_TYPE, fluidVars } from "@/lib/fluid";
import { DISPLAY_HEADING, displayHeading } from "@/lib/headings";
import type { Run, RunOccurrence } from "@/lib/runs";
import { formatShortDate, formatTime, toDateTimeAttr, type StatusOccurrence } from "@/lib/schedule";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

export type UpcomingRow = { occurrence: StatusOccurrence<Run>; following: RunOccurrence | null };

/**
 * Upcoming runs on /calendar: the homepage's divider-based list (same black
 * surface, rules, type and stretched-link rows), refined for this page: the
 * real next date and time, the meeting place and duration, and a concise
 * description. One row per run. A cancelled occurrence stays visible, marked
 * "Cancelled" with its note and the run's next real date; changed times and
 * meeting points are labelled. Cancellations here are the organizers'
 * confirmed schedule changes, never inferred from weather.
 */
export function UpcomingList({ rows }: { rows: UpcomingRow[] }) {
  const layout = fluidVars({ "--up-pt": [48, 64, 96], "--up-pb": [56, 64, 96], "--up-list-mt": [40, 44, 56] });
  return (
    <section
      id="upcoming"
      aria-labelledby="upcoming-heading"
      style={layout}
      className={cn("bg-primary pt-(--up-pt-a) pb-(--up-pb-a) text-primary-foreground md:pt-(--up-pt-b) md:pb-(--up-pb-b)", onDarkSurface)}
    >
      <Container>
        <p className="text-caption uppercase">Upcoming runs</p>
        <h2 id="upcoming-heading" style={displayHeading()} className={cn(FLUID_TYPE, DISPLAY_HEADING, "mt-3 md:mt-4")}>
          See you on the hill<span className="ss08">.</span>
        </h2>

        <div className="mt-(--up-list-mt-a) md:mt-(--up-list-mt-b)">
          {rows.length > 0 ? (
            <ol className="border-b border-primary-foreground">
              {rows.map((r) => (
                <UpcomingItem key={r.occurrence.run.slug} row={r} />
              ))}
            </ol>
          ) : (
            <p data-slot="no-upcoming" className="border-t border-primary-foreground pt-7 text-p">
              No upcoming runs are scheduled right now. Check back soon.
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}

function UpcomingItem({ row: { occurrence: o, following } }: { row: UpcomingRow }) {
  const cancelled = o.status === "cancelled";
  const label = statusLabel(o.status, o.changedBoth);
  return (
    <li
      data-status={o.run.status}
      data-occurrence-status={o.status}
      className="group/run relative grid gap-x-8 border-t border-primary-foreground py-7 md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[210px_minmax(0,1fr)_260px_20px] lg:py-9"
    >
      <p className="font-mono text-[14px] leading-[21px] md:row-span-2 md:pt-1.5 lg:row-span-1 lg:text-p lg:leading-6">
        <time dateTime={toDateTimeAttr(o)} className={cn("block", cancelled && "line-through decoration-1")}>
          <span className="flex items-center gap-2">
            <ClockIcon className="hidden size-4 shrink-0 lg:block" />
            {formatShortDate(o.date)}
          </span>
          <span className="block lg:pl-6">{formatTime(o.time)}</span>
        </time>
      </p>

      <div className="mt-3 md:mt-0">
        <h3 className="text-[26px] leading-[30px] font-semibold tracking-[-1px] lg:text-h3 lg:leading-(--text-h3--line-height)">
          <Link
            href={`/calendar/${o.run.slug}`}
            className={cn(
              "underline-offset-4 outline-none group-hover/run:underline",
              "after:absolute after:inset-0 after:content-['']",
              "focus-visible:after:ring-3 focus-visible:after:ring-ring",
            )}
          >
            {o.run.title}
          </Link>
        </h3>
        {label && (
          <p
            data-slot="status"
            className="mt-2 inline-block border border-primary-foreground px-2 py-0.5 font-mono text-[12px] leading-5 tracking-[0.08em] uppercase"
          >
            {label}
          </p>
        )}
        {o.note && <p className="mt-2 text-p-sm">{o.note}</p>}
        {cancelled && (
          <p data-slot="following" className="mt-2 text-p-sm">
            {following ? `Next run: ${formatShortDate(following.date)} · ${formatTime(following.time)}.` : "No later run is scheduled yet."}
          </p>
        )}
        <p className="mt-3 max-w-[60ch] text-p-sm text-primary-foreground/75 md:text-p">{o.run.summary ?? o.run.description}</p>
      </div>

      <div className="mt-4 text-[14px] leading-[21px] lg:mt-0 lg:pt-1.5 lg:text-right lg:text-p lg:leading-6">
        <p className="flex items-center gap-2 lg:justify-end">
          <MapPinIcon className="size-4 shrink-0" />
          <span>{o.meetupLocation}</span>
        </p>
        {o.run.durationLabel && <p className="mt-1 text-primary-foreground/75 lg:pr-0">{o.run.durationLabel}</p>}
      </div>

      <ArrowUpRightIcon
        className={cn(
          "hidden size-5 lg:mt-2 lg:block",
          "motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover/run:translate-x-0.5 motion-safe:group-hover/run:-translate-y-0.5",
        )}
      />
    </li>
  );
}
