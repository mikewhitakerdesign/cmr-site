"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { statusLabel } from "@/components/calendar/status";
import { ArrowLink } from "@/components/ArrowLink";
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, MapPinIcon } from "@/components/icons";
import {
  buildDays,
  canShift,
  clampDate,
  shiftDate,
  viewLabel,
  type CalendarDay,
  type CalendarView,
} from "@/lib/calendar";
import { addDays, formatLongDate, formatTime, monthName, toDateTimeAttr, type IsoDate, type StatusOccurrence } from "@/lib/schedule";
import { FLUID_TYPE } from "@/lib/fluid";
import { DISPLAY_HEADING, standardH2 } from "@/lib/headings";
import { tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

/** The part of a run the calendar needs (serializable). */
export type CalendarRun = {
  slug: string;
  title: string;
  meetupLocation: string;
  durationLabel?: string;
  description: string;
  status: "placeholder" | "provisional" | "verified";
  schedule: import("@/lib/schedule").RunSchedule;
};

const DAY_HEADS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ctl =
  "inline-flex h-10 items-center justify-center rounded-md border border-foreground bg-background px-3 text-[14px] font-medium text-foreground outline-none " +
  "hover:bg-foreground hover:text-background focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-40 motion-safe:transition-colors motion-safe:duration-150";

type Occ = StatusOccurrence<CalendarRun>;
const keyOf = (o: Occ) => `${o.run.slug}:${o.date}`;

/** URL for a view and date: defaults (month, today) are left out. */
export function calendarQuery(view: CalendarView, date: IsoDate, today: IsoDate): string {
  const p = new URLSearchParams();
  if (view !== "month") p.set("view", view);
  if (date !== today) p.set("date", date);
  const q = p.toString();
  return q ? `?${q}` : "";
}

/**
 * The running calendar: Week and Month, previous / next / Today, a selectable
 * date and a selectable event. Desktop and tablet draw a grid (a real table,
 * with chips that select an event); phones get a date-grouped agenda instead
 * of cramped text in cells. The visible view and date live in the URL
 * (`?view=week&date=2026-11-14`, replaced in place, so Back is not flooded);
 * the server renders the same state from the same URL.
 *
 * Today is passed in from the server, never read from the browser clock, so
 * hydration always agrees. Days before today show no runs: a weekly rule has no
 * start date, and the calendar does not invent history. Browsing is limited to
 * today through twelve months ahead (src/lib/calendar.ts).
 */
export function RunCalendar({
  runs,
  today,
  initialView,
  initialDate,
}: {
  runs: CalendarRun[];
  today: IsoDate;
  initialView: CalendarView;
  initialDate: IsoDate;
}) {
  const [view, setView] = useState<CalendarView>(initialView);
  const [date, setDate] = useState<IsoDate>(initialDate);
  const [eventKey, setEventKey] = useState<string | null>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  const focusDate = useRef(false);
  const mounted = useRef(false);

  const days = useMemo(() => buildDays(runs, view, date, today), [runs, view, date, today]);
  const tintOf = (slug: string) => tintVars(Math.max(0, runs.findIndex((r) => r.slug === slug)));
  const selected = days.find((d) => d.date === date);
  const anyRuns = days.some((d) => d.inPeriod && d.occurrences.length > 0);
  const unconfirmed = runs.some((r) => r.status !== "verified");

  // Keep the URL in step (not on first render: the server already rendered it).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    window.history.replaceState(null, "", `${window.location.pathname}${calendarQuery(view, date, today)}`);
  }, [view, date, today]);

  // After keyboard navigation, put focus on the new date's button.
  useEffect(() => {
    if (!focusDate.current) return;
    focusDate.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-date-button="${date}"]`)?.focus();
  }, [date, view]);

  const pick = (d: IsoDate, keepEvent = false) => {
    setDate(clampDate(d, today));
    if (!keepEvent) setEventKey(null);
  };
  const go = (dir: -1 | 1) => pick(shiftDate(view, date, dir, today));
  const unit = view === "month" ? "month" : "week";

  const onDateKey = (e: KeyboardEvent, d: IsoDate) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let next: IsoDate | null = null;
    if (e.key in step) next = addDays(d, step[e.key]);
    else if (e.key === "Home") next = addDays(d, -new Date(`${d}T12:00:00Z`).getUTCDay());
    else if (e.key === "End") next = addDays(d, 6 - new Date(`${d}T12:00:00Z`).getUTCDay());
    else if (e.key === "PageUp" || e.key === "PageDown") next = shiftDate(view, d, e.key === "PageUp" ? -1 : 1, today);
    if (!next) return;
    e.preventDefault();
    focusDate.current = true;
    pick(next);
  };

  return (
    <section id="calendar" aria-labelledby="calendar-heading" className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12">
        <h2 id="calendar-heading" style={standardH2()} className={cn(FLUID_TYPE, DISPLAY_HEADING)}>
          Running calendar<span className="ss08">.</span>
        </h2>
        <p className="mt-4 max-w-[560px] text-[18px] leading-[27px] text-foreground/70">
          Two regular weekly workouts. More reasons to get up early may appear here eventually.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 md:mt-10">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button type="button" className={cn(ctl, "w-10 px-0")} aria-label={`Previous ${unit}`} disabled={!canShift(view, date, -1, today)} onClick={() => go(-1)}>
              <ChevronLeftIcon />
            </button>
            <button type="button" className={cn(ctl, "w-10 px-0")} aria-label={`Next ${unit}`} disabled={!canShift(view, date, 1, today)} onClick={() => go(1)}>
              <ChevronRightIcon />
            </button>
            <button type="button" className={ctl} onClick={() => pick(today)}>
              Today
            </button>
            <h3 aria-live="polite" data-slot="period-label" className="ml-1 text-[18px] leading-7 font-semibold md:ml-3 md:text-[20px]">
              {viewLabel(view, date)}
            </h3>
          </div>

          <div role="group" aria-label="Calendar view" className="inline-flex rounded-md border border-foreground p-0.5">
            {(["week", "month"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "h-9 rounded-[4px] px-4 text-[14px] font-medium capitalize outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2",
                  view === v ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/10",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {!anyRuns && (
          <p data-slot="empty-period" className="mt-6 border-y border-foreground/20 py-4 text-p">
            No runs are scheduled this {unit}.
          </p>
        )}

        {/* Grid: tablet and desktop */}
        <table ref={gridRef} data-view={view} className="mt-6 hidden w-full table-fixed border-collapse border border-foreground md:table">
          <caption className="sr-only">
            {viewLabel(view, date)}. Select a date to see its runs. Arrow keys move between dates.
          </caption>
          <thead>
            <tr>
              {DAY_HEADS.map((h) => (
                <th key={h} scope="col" className="border border-foreground/40 px-2 py-1.5 text-left font-mono text-[12px] leading-5 font-normal tracking-[0.1em] uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: days.length / 7 }, (_, w) => (
              <tr key={days[w * 7].date}>
                {days.slice(w * 7, w * 7 + 7).map((d) => (
                  <Cell key={d.date} day={d} view={view} selected={d.date === date} eventKey={eventKey} tintOf={tintOf} onDateKey={onDateKey} onPick={(x) => pick(x)} onEvent={(o) => { setDate(o.date); setEventKey(keyOf(o)); }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Selected day: tablet and desktop */}
        <div aria-live="polite" data-slot="selected-day" className="mt-6 hidden border-t border-foreground pt-6 md:block">
          <p className="font-mono text-[13px] leading-5 tracking-[0.1em] uppercase">Selected day</p>
          <p className="mt-1 text-h4 font-semibold tracking-[-0.5px]">{formatLongDate(date)}</p>
          {selected && selected.occurrences.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-4">
              {selected.occurrences.map((o) => (
                <li key={keyOf(o)} data-selected={eventKey === keyOf(o) || undefined} className={cn("border-l-2 py-1 pl-4", eventKey === keyOf(o) ? "border-foreground" : "border-foreground/20")}>
                  <EventDetail o={o} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-p text-foreground/75">{selected?.isPast ? "This date has passed." : "No runs this day."}</p>
          )}
        </div>

        {/* Agenda: phones */}
        <div data-slot="agenda" className="mt-6 md:hidden">
          <ol className="border-t border-foreground">
            {days
              .filter((d) => d.inPeriod && (view === "week" || d.occurrences.length > 0))
              .map((d) => (
                <li key={d.date} data-date={d.date} className="border-b border-foreground/30 py-4">
                  <button
                    type="button"
                    aria-pressed={d.date === date}
                    aria-current={d.isToday ? "date" : undefined}
                    onClick={() => pick(d.date)}
                    className={cn("flex w-full items-center gap-2 rounded-xs text-left font-mono text-[13px] leading-5 tracking-[0.1em] uppercase outline-none focus-visible:ring-3 focus-visible:ring-ring", d.date === date && "font-semibold underline underline-offset-4")}
                  >
                    {formatLongDate(d.date)}
                    {d.isToday && <span className="rounded-full bg-foreground px-2 text-[11px] text-background">Today</span>}
                  </button>
                  {d.occurrences.length > 0 ? (
                    <ul className="mt-3 flex flex-col gap-3">
                      {d.occurrences.map((o) => (
                        <li key={keyOf(o)} style={tintOf(o.run.slug)} className="rounded-md bg-(--tie-dye) p-4">
                          <EventDetail o={o} compact />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-p-sm text-foreground/75">{d.isPast ? "Passed." : "No runs."}</p>
                  )}
                </li>
              ))}
          </ol>
        </div>

        {unconfirmed && (
          <p data-slot="provisional-note" className="mt-6 text-p-sm text-foreground/75">
            Run times and meeting points are provisional until the club confirms them. Cancellations and changes appear here.
          </p>
        )}
      </div>
    </section>
  );
}

function Cell({
  day: d,
  view,
  selected,
  eventKey,
  tintOf,
  onDateKey,
  onPick,
  onEvent,
}: {
  day: CalendarDay<CalendarRun>;
  view: CalendarView;
  selected: boolean;
  eventKey: string | null;
  tintOf: (slug: string) => CSSProperties;
  onDateKey: (e: KeyboardEvent, d: IsoDate) => void;
  onPick: (d: IsoDate) => void;
  onEvent: (o: Occ) => void;
}) {
  const n = d.occurrences.length;
  return (
    <td
      data-date={d.date}
      data-selected={selected || undefined}
      className={cn(
        "relative border border-foreground/40 p-1.5 align-top lg:p-2",
        view === "week" ? "h-[220px]" : "h-[104px] lg:h-[124px]",
        selected && "bg-foreground/[0.05] outline outline-2 -outline-offset-2 outline-foreground",
      )}
    >
      <button
        type="button"
        data-date-button={d.date}
        tabIndex={selected ? 0 : -1}
        aria-pressed={selected}
        aria-current={d.isToday ? "date" : undefined}
        aria-label={`${formatLongDate(d.date)}${n ? `, ${n} ${n === 1 ? "run" : "runs"}` : ""}`}
        onClick={() => onPick(d.date)}
        onKeyDown={(e) => onDateKey(e, d.date)}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full font-mono text-[14px] outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2",
          d.isToday ? "bg-foreground text-background" : d.inPeriod && !d.isPast ? "text-foreground hover:bg-foreground/10" : "text-foreground/55 hover:bg-foreground/10",
        )}
      >
        {Number(d.date.slice(8))}
        {view === "month" && d.date.slice(8) === "01" && <span className="sr-only"> {monthName(d.date)}</span>}
      </button>
      {d.occurrences.length > 0 && (
        <ul className="mt-1.5 flex flex-col gap-1">
          {d.occurrences.map((o) => {
            const label = statusLabel(o.status, o.changedBoth);
            const cancelled = o.status === "cancelled";
            return (
              <li key={keyOf(o)}>
                <button
                  type="button"
                  aria-pressed={eventKey === keyOf(o)}
                  onClick={() => onEvent(o)}
                  style={tintOf(o.run.slug)}
                  className={cn(
                    "block w-full rounded-[4px] px-1.5 py-1 text-left text-[11px] leading-[14px] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring",
                    cancelled ? "border border-dashed border-foreground/60 bg-background" : "bg-(--tie-dye) hover:ring-1 hover:ring-foreground",
                    eventKey === keyOf(o) && "ring-2 ring-foreground",
                  )}
                >
                  <span className={cn("block font-mono", cancelled && "line-through")}>{formatTime(o.time)}</span>
                  <span className={cn("block truncate", cancelled && "line-through")}>{o.run.title}</span>
                  {label && <span className="block truncate font-semibold">{label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </td>
  );
}

function EventDetail({ o, compact = false }: { o: Occ; compact?: boolean }) {
  const label = statusLabel(o.status, o.changedBoth);
  const cancelled = o.status === "cancelled";
  return (
    <article data-occurrence-status={o.status} data-status={o.run.status}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="text-[20px] leading-6 font-semibold tracking-[-0.5px]">{o.run.title}</h4>
        <p className="flex items-center gap-1.5 font-mono text-[14px]">
          <ClockIcon className="size-4" />
          <time dateTime={toDateTimeAttr(o)} className={cn(cancelled && "line-through")}>
            {formatTime(o.time)}
          </time>
        </p>
      </div>
      {label && (
        <p data-slot="status" className="mt-2 inline-block border border-foreground px-2 py-0.5 font-mono text-[12px] leading-5 tracking-[0.08em] uppercase">
          {label}
        </p>
      )}
      {o.note && <p className="mt-2 text-p-sm">{o.note}</p>}
      <p className="mt-2 flex items-center gap-1.5 text-p-sm">
        <MapPinIcon className="size-4 shrink-0" />
        {o.meetupLocation}
        {o.run.durationLabel && <span className="text-foreground/75"> · {o.run.durationLabel}</span>}
      </p>
      {!compact && <p className="mt-2 max-w-[62ch] text-p-sm text-foreground/75">{o.run.description}</p>}
      <ArrowLink href={`/calendar/${o.run.slug}`} className="mt-3 text-p-sm" aria-label={`Run details: ${o.run.title}`}>
        Run details
      </ArrowLink>
    </article>
  );
}
