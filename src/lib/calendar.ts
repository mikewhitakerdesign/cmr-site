import {
  addDays,
  monthName,
  occurrencesWithStatus,
  weekdayOf,
  WEEKDAYS,
  type IsoDate,
  type Schedulable,
  type StatusOccurrence,
} from "@/lib/schedule";

/**
 * Calendar view logic for /calendar: pure functions over ISO dates in the
 * club's time zone (no Date objects, no time zone), so server and browser
 * agree and the tests need no mocking. Weeks start on Sunday (Figma).
 */

export type CalendarView = "week" | "month";

/** How far ahead the calendar can be browsed. Recurring rules are open-ended; this keeps it honest. */
export const MAX_MONTHS_AHEAD = 12;

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export const isIsoDate = (v: unknown): v is IsoDate => {
  if (typeof v !== "string" || !ISO.test(v)) return false;
  const [y, m, d] = v.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
};

export const firstOfMonth = (date: IsoDate): IsoDate => `${date.slice(0, 8)}01`;

export function lastOfMonth(date: IsoDate): IsoDate {
  return addDays(firstOfMonth(addDays(firstOfMonth(date), 32)), -1);
}

/** The Sunday on or before `date`. */
export const startOfWeek = (date: IsoDate): IsoDate => addDays(date, -WEEKDAYS.indexOf(weekdayOf(date)));

/** The visible range for a view: a month shows whole weeks (Sunday to Saturday). */
export function viewRange(view: CalendarView, date: IsoDate): { from: IsoDate; to: IsoDate } {
  if (view === "week") {
    const from = startOfWeek(date);
    return { from, to: addDays(from, 6) };
  }
  const from = startOfWeek(firstOfMonth(date));
  return { from, to: addDays(startOfWeek(lastOfMonth(date)), 6) };
}

/** Earliest and latest dates the calendar will navigate to, from today. */
export function browseBounds(today: IsoDate): { min: IsoDate; max: IsoDate } {
  let max = firstOfMonth(today);
  for (let i = 0; i <= MAX_MONTHS_AHEAD; i++) max = firstOfMonth(addDays(max, 32));
  return { min: today, max: addDays(max, -1) };
}

export const clampDate = (date: IsoDate, today: IsoDate): IsoDate => {
  const { min, max } = browseBounds(today);
  return date < min ? min : date > max ? max : date;
};

/** URL state → a safe view and date (invalid or out-of-range values fall back). */
export function parseCalendarState(
  params: { view?: string | string[]; date?: string | string[] },
  today: IsoDate,
): { view: CalendarView; date: IsoDate } {
  const v = Array.isArray(params.view) ? params.view[0] : params.view;
  const d = Array.isArray(params.date) ? params.date[0] : params.date;
  return {
    view: v === "week" ? "week" : "month",
    date: isIsoDate(d) ? clampDate(d, today) : today,
  };
}

/** The date to show after paging: a month lands on its first day (or today), a week on the same weekday. */
export function shiftDate(view: CalendarView, date: IsoDate, dir: -1 | 1, today: IsoDate): IsoDate {
  if (view === "week") return clampDate(addDays(date, 7 * dir), today);
  const first = addDays(firstOfMonth(date), dir === 1 ? 32 : -1);
  const next = firstOfMonth(first);
  return clampDate(next.slice(0, 7) === today.slice(0, 7) ? today : next, today);
}

export function canShift(view: CalendarView, date: IsoDate, dir: -1 | 1, today: IsoDate): boolean {
  const { min, max } = browseBounds(today);
  const cur = viewRange(view, date);
  return dir === -1 ? cur.from > viewRange(view, min).from : cur.to < viewRange(view, max).to;
}

export function viewLabel(view: CalendarView, date: IsoDate): string {
  if (view === "month") return `${monthName(date)} ${date.slice(0, 4)}`;
  const { from, to } = viewRange("week", date);
  const f = `${monthName(from).slice(0, 3)} ${Number(from.slice(8))}`;
  const t = from.slice(0, 7) === to.slice(0, 7) ? `${Number(to.slice(8))}` : `${monthName(to).slice(0, 3)} ${Number(to.slice(8))}`;
  return `${f} to ${t}, ${to.slice(0, 4)}`;
}

export type CalendarDay<R extends Schedulable> = {
  date: IsoDate;
  inPeriod: boolean;
  isToday: boolean;
  isPast: boolean;
  occurrences: StatusOccurrence<R>[];
};

/**
 * Every day of the visible range with its occurrences. Days before today carry
 * none: a weekly rule is open-ended, so the calendar never shows runs that
 * "happened" before the club published them.
 */
export function buildDays<R extends Schedulable>(
  runs: readonly R[],
  view: CalendarView,
  date: IsoDate,
  today: IsoDate,
): CalendarDay<R>[] {
  const { from, to } = viewRange(view, date);
  const byDate = new Map<IsoDate, StatusOccurrence<R>[]>();
  for (const run of runs) {
    for (const o of occurrencesWithStatus(run, from < today ? today : from, to)) {
      byDate.set(o.date, [...(byDate.get(o.date) ?? []), o]);
    }
  }
  const days: CalendarDay<R>[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const occ = (byDate.get(d) ?? []).sort((a, b) => a.time.localeCompare(b.time) || a.run.title.localeCompare(b.run.title));
    days.push({
      date: d,
      inPeriod: view === "week" || d.slice(0, 7) === date.slice(0, 7),
      isToday: d === today,
      isPast: d < today,
      occurrences: occ,
    });
  }
  return days;
}
