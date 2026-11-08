/**
 * Run scheduling for CMR v1 — pure functions, no I/O, no dependencies.
 *
 * Model (Owner decision D5, 2026-11-07): each run page (`/calendar/[slug]`)
 * has exactly one schedule:
 *
 *   weekly  a recurrence rule — every <weekday> at <time>, optionally bounded by
 *           `startsOn` / `endsOn` — with per-date exceptions:
 *             cancellations  the occurrence on that date does not happen
 *             overrides      the occurrence on that date happens with a different
 *                            time and/or meeting point (and an optional note)
 *   once    a single dated run; `special` marks a one-off special run
 *
 * A run moved to another day is a cancellation plus a `once` run. All dates and
 * times are wall-clock values in America/Chicago; instants are derived with the
 * platform's time-zone database, so daylight-saving changes are handled
 * (a 5:30 AM run is 11:30 UTC in winter and 10:30 UTC in summer).
 */

export const CLUB_TIME_ZONE = "America/Chicago";

/** Calendar date, `YYYY-MM-DD`. */
export type IsoDate = string;
/** 24-hour wall-clock time, `HH:MM`. */
export type LocalTime = string;

export const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

const WEEKDAY_NAMES: Record<Weekday, string> = {
  SUN: "Sunday",
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

export type Cancellation = { date: IsoDate; note?: string };
export type Override = { date: IsoDate; time?: LocalTime; meetupLocation?: string; note?: string };

export type WeeklySchedule = {
  kind: "weekly";
  weekday: Weekday;
  time: LocalTime;
  /** First date the rule applies (inclusive). */
  startsOn?: IsoDate;
  /** Last date the rule applies (inclusive). */
  endsOn?: IsoDate;
  cancellations?: Cancellation[];
  overrides?: Override[];
};

export type OnceSchedule = {
  kind: "once";
  date: IsoDate;
  time: LocalTime;
  /** A one-off special run rather than an ordinary dated run. */
  special?: boolean;
  cancelled?: boolean;
};

export type RunSchedule = WeeklySchedule | OnceSchedule;

/** What a schedule needs from a run. */
export type Schedulable = { slug: string; title: string; meetupLocation: string; schedule: RunSchedule };

export type Occurrence<R extends Schedulable = Schedulable> = {
  run: R;
  /** Local (Chicago) date and time of this occurrence. */
  date: IsoDate;
  time: LocalTime;
  weekday: Weekday;
  /** The instant it starts. */
  startsAt: Date;
  meetupLocation: string;
  note?: string;
  special: boolean;
};

/* ------------------------------------------------------------------ dates */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function parseDate(date: IsoDate): [number, number, number] {
  const m = DATE_RE.exec(date);
  if (!m) throw new Error(`Invalid date "${date}" (expected YYYY-MM-DD)`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function parseTime(time: LocalTime): [number, number] {
  const m = TIME_RE.exec(time);
  if (!m) throw new Error(`Invalid time "${time}" (expected HH:MM, 24-hour)`);
  return [Number(m[1]), Number(m[2])];
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Calendar arithmetic on a date string (no time zone involved). */
export function addDays(date: IsoDate, days: number): IsoDate {
  const [y, m, d] = parseDate(date);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function weekdayOf(date: IsoDate): Weekday {
  const [y, m, d] = parseDate(date);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** Whole days from `a` to `b`. */
export function daysBetween(a: IsoDate, b: IsoDate): number {
  const [ay, am, ad] = parseDate(a);
  const [by, bm, bd] = parseDate(b);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/* ------------------------------------------------------------- time zone */

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CLUB_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** The Chicago wall-clock date and time at an instant. */
export function toClubTime(instant: Date): { date: IsoDate; time: LocalTime; weekday: Weekday } {
  const p = Object.fromEntries(partsFormatter.formatToParts(instant).map((x) => [x.type, x.value]));
  const date = `${p.year}-${p.month}-${p.day}`;
  return { date, time: `${p.hour}:${p.minute}`, weekday: weekdayOf(date) };
}

/** Offset of Chicago from UTC at an instant, in minutes (−360 in winter, −300 in summer). */
function offsetMinutes(instant: Date): number {
  const p = Object.fromEntries(partsFormatter.formatToParts(instant).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - Math.floor(instant.getTime() / 1000) * 1000) / 60_000);
}

/**
 * The instant at which Chicago wall-clock `date time` occurs.
 * In the spring-forward gap the time does not exist; it resolves to the
 * equivalent time after the jump (02:30 → 03:30). In the fall-back hour it
 * resolves to the first (daylight) occurrence.
 */
export function clubTimeToInstant(date: IsoDate, time: LocalTime): Date {
  const [y, mo, d] = parseDate(date);
  const [h, mi] = parseTime(time);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  // Try the offsets in force just before and after, prefer the earlier valid instant.
  const candidates = [offsetMinutes(new Date(wall - 864e5)), offsetMinutes(new Date(wall + 864e5))]
    .map((off) => wall - off * 60_000)
    .filter((t) => {
      const c = toClubTime(new Date(t));
      return c.date === date && c.time === `${pad(h)}:${pad(mi)}`;
    })
    .sort((a, b) => a - b);
  if (candidates.length > 0) return new Date(candidates[0]);
  // Nonexistent local time (DST gap): use the pre-transition offset, which lands after the jump.
  return new Date(wall - offsetMinutes(new Date(wall - 864e5)) * 60_000);
}

/* ----------------------------------------------------------- occurrences */

function occurrence<R extends Schedulable>(
  run: R,
  date: IsoDate,
  time: LocalTime,
  extra: { meetupLocation?: string; note?: string; special?: boolean } = {},
): Occurrence<R> {
  return {
    run,
    date,
    time,
    weekday: weekdayOf(date),
    startsAt: clubTimeToInstant(date, time),
    meetupLocation: extra.meetupLocation ?? run.meetupLocation,
    note: extra.note,
    special: extra.special ?? false,
  };
}

/** Occurrences of one run whose local date falls within [fromDate, toDate], cancellations removed. */
export function occurrencesOf<R extends Schedulable>(run: R, fromDate: IsoDate, toDate: IsoDate): Occurrence<R>[] {
  const s = run.schedule;
  if (s.kind === "once") {
    if (s.cancelled || s.date < fromDate || s.date > toDate) return [];
    return [occurrence(run, s.date, s.time, { special: s.special })];
  }
  const cancelled = new Set((s.cancellations ?? []).map((c) => c.date));
  const overrides = new Map((s.overrides ?? []).map((o) => [o.date, o]));
  const out: Occurrence<R>[] = [];
  const start = s.startsOn && s.startsOn > fromDate ? s.startsOn : fromDate;
  const end = s.endsOn && s.endsOn < toDate ? s.endsOn : toDate;
  // First matching weekday on or after `start`.
  let date = addDays(start, (WEEKDAYS.indexOf(s.weekday) - WEEKDAYS.indexOf(weekdayOf(start)) + 7) % 7);
  for (; date <= end; date = addDays(date, 7)) {
    if (cancelled.has(date)) continue;
    const o = overrides.get(date);
    out.push(occurrence(run, date, o?.time ?? s.time, { meetupLocation: o?.meetupLocation, note: o?.note }));
  }
  return out;
}

const byStart = (a: Occurrence, b: Occurrence) =>
  a.startsAt.getTime() - b.startsAt.getTime() || a.run.title.localeCompare(b.run.title);

/**
 * Upcoming occurrences across runs, chronological from `now` (IA decision 4).
 * An occurrence stays upcoming until its start time. Looks `horizonDays` ahead.
 */
export function upcomingOccurrences<R extends Schedulable>(
  runs: readonly R[],
  now: Date,
  { limit = Infinity, horizonDays = 120 }: { limit?: number; horizonDays?: number } = {},
): Occurrence<R>[] {
  const today = toClubTime(now).date;
  const until = addDays(today, horizonDays);
  return runs
    .flatMap((run) => occurrencesOf(run, today, until))
    .filter((o) => o.startsAt.getTime() >= now.getTime())
    .sort(byStart)
    .slice(0, limit);
}

/* ------------------------------------------------------------ formatting */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "05:30" → "5:30 AM". */
export function formatTime(time: LocalTime): string {
  const [h, m] = parseTime(time);
  return `${h % 12 === 0 ? 12 : h % 12}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
}

/**
 * Compact slot label as designed in Figma ("TUE · 5:30 AM"). Occurrences more
 * than six days out use the date instead of the weekday ("DEC 2 · 5:30 AM"),
 * so a weekday never points at the wrong week.
 */
export function formatSlot(o: Pick<Occurrence, "date" | "time" | "weekday">, now: Date): string {
  const ahead = daysBetween(toClubTime(now).date, o.date);
  const [, m, d] = parseDate(o.date);
  const day = ahead >= 0 && ahead <= 6 ? o.weekday : `${MONTHS[m - 1]} ${d}`;
  return `${day} · ${formatTime(o.time)}`;
}

/** ISO 8601 instant with the Chicago offset, for `<time dateTime>`. */
export function toDateTimeAttr(o: Pick<Occurrence, "date" | "time" | "startsAt">): string {
  const off = offsetMinutes(o.startsAt);
  const sign = off < 0 ? "-" : "+";
  const abs = Math.abs(off);
  return `${o.date}T${o.time}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** Human description of a schedule ("Every Tuesday · 5:30 AM"). */
export function describeSchedule(s: RunSchedule): string {
  if (s.kind === "weekly") return `Every ${WEEKDAY_NAMES[s.weekday]} · ${formatTime(s.time)}`;
  const [y, m, d] = parseDate(s.date);
  const when = `${WEEKDAY_NAMES[weekdayOf(s.date)]}, ${MONTH_NAMES[m - 1]} ${d}, ${y} · ${formatTime(s.time)}`;
  return s.cancelled ? `${when} (cancelled)` : when;
}
