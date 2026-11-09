import type { Run } from "@/lib/runs";
import {
  CLUB_TIME_ZONE,
  clubTimeToInstant,
  occurrencesWithStatus,
  toClubTime,
  type Occurrence,
  type WeeklySchedule,
} from "@/lib/schedule";

/**
 * iCalendar (RFC 5545) export, generated as plain text: no dependency, no
 * subscription service. Two kinds of file:
 *
 *   occurrence  one VEVENT for the chosen date, with that date's time and
 *               meeting point (so an override is reflected)
 *   series      one VEVENT with a weekly RRULE, an EXDATE per cancellation and a
 *               RECURRENCE-ID VEVENT per override, from the next real date on
 *
 * Times are floating to the America/Chicago VTIMEZONE (TZID), never UTC
 * offsets, so a 5:30 AM run stays 5:30 AM across daylight-saving changes. A
 * downloaded file is a snapshot: it does not sync later changes or
 * cancellations (the UI says so).
 */

const CRLF = "\r\n";
const PRODID = "-//Chicago Mountain Runners//Find a Run//EN";

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${CLUB_TIME_ZONE}`,
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0600",
  "TZOFFSETTO:-0500",
  "TZNAME:CDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0600",
  "TZNAME:CST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

/** Escape a TEXT value (RFC 5545 §3.3.11). */
export const escapeText = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Fold a content line at 75 octets (RFC 5545 §3.1), never splitting a UTF-8 character. */
export function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  let limit = 75;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (bytes + n > limit) {
      out.push(cur);
      cur = "";
      bytes = 0;
      limit = 74; // continuation lines start with one space
    }
    cur += ch;
    bytes += n;
  }
  out.push(cur);
  return out.join(CRLF + " ");
}

const pad = (n: number) => String(n).padStart(2, "0");
const localStamp = (date: string, time: string) => `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

const BYDAY: Record<WeeklySchedule["weekday"], string> = { SUN: "SU", MON: "MO", TUE: "TU", WED: "WE", THU: "TH", FRI: "FR", SAT: "SA" };
const DEFAULT_MINUTES = 60;

type Options = { now: Date; siteUrl: string };

function endLocal(o: Pick<Occurrence, "startsAt">, minutes: number) {
  return toClubTime(new Date(o.startsAt.getTime() + minutes * 60_000));
}

function description(run: Run, url: string): string {
  const parts = [run.description];
  if (run.status !== "verified") parts.push("Schedule details are not yet confirmed. Check the CMR site before heading out.");
  parts.push("Downloaded calendar entries do not update automatically. Check the CMR site for schedule changes.");
  parts.push(url);
  return parts.join("\n\n");
}

function veventLines(
  run: Run,
  o: Pick<Occurrence, "date" | "time" | "startsAt" | "meetupLocation">,
  opts: Options & { uid: string; extra?: string[] },
): string[] {
  const end = endLocal(o, run.durationMinutes ?? DEFAULT_MINUTES);
  const url = `${opts.siteUrl}/calendar/${run.slug}`;
  return [
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${utcStamp(opts.now)}`,
    `DTSTART;TZID=${CLUB_TIME_ZONE}:${localStamp(o.date, o.time)}`,
    `DTEND;TZID=${CLUB_TIME_ZONE}:${localStamp(end.date, end.time)}`,
    ...(opts.extra ?? []),
    `SUMMARY:${escapeText(run.title)}`,
    `LOCATION:${escapeText(o.meetupLocation)}`,
    `DESCRIPTION:${escapeText(description(run, url))}`,
    `URL:${url}`,
    "END:VEVENT",
  ];
}

function wrap(events: string[][]): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:${PRODID}`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...VTIMEZONE, ...events.flat(), "END:VCALENDAR"];
  return lines.map(fold).join(CRLF) + CRLF;
}

/** One occurrence. Returns null when the date is not a real, non-cancelled occurrence of the run. */
export function occurrenceIcs(run: Run, date: string, opts: Options): string | null {
  const o = occurrencesWithStatus(run, date, date).find((x) => x.status !== "cancelled");
  if (!o) return null;
  return wrap([veventLines(run, o, { ...opts, uid: `${run.slug}-${date}@cmr-site` })]);
}

/** The whole weekly series from its next real date. Null for a one-off run or one with nothing upcoming. */
export function seriesIcs(run: Run, opts: Options): string | null {
  const s = run.schedule;
  if (s.kind !== "weekly") return null;
  const today = toClubTime(opts.now).date;
  const horizon = (() => {
    const t = new Date(opts.now.getTime() + 400 * 864e5);
    return toClubTime(t).date;
  })();
  const all = occurrencesWithStatus(run, today, s.endsOn && s.endsOn < horizon ? s.endsOn : horizon);
  const first = all.find((o) => o.status !== "cancelled" && o.startsAt.getTime() >= opts.now.getTime());
  if (!first) return null;
  // The master carries the usual time and place; an override is its own instance.
  const uid = `${run.slug}-series@cmr-site`;
  const rule = [`FREQ=WEEKLY`, `BYDAY=${BYDAY[s.weekday]}`];
  if (s.endsOn) rule.push(`UNTIL=${utcStamp(clubTimeToInstant(s.endsOn, s.time))}`);
  const exdates = (s.cancellations ?? []).filter((c) => c.date >= first.date && (!s.endsOn || c.date <= s.endsOn));
  const extra = [
    `RRULE:${rule.join(";")}`,
    ...exdates.map((c) => `EXDATE;TZID=${CLUB_TIME_ZONE}:${localStamp(c.date, s.time)}`),
  ];
  const masterFixed = veventLines(
    run,
    { date: first.date, time: s.time, startsAt: clubTimeToInstant(first.date, s.time), meetupLocation: run.meetupLocation },
    { ...opts, uid, extra },
  );
  const overrides = (s.overrides ?? [])
    .filter((o) => o.date >= first.date && (!s.endsOn || o.date <= s.endsOn))
    .filter((o) => !(s.cancellations ?? []).some((c) => c.date === o.date))
    .map((o) => {
      const time = o.time ?? s.time;
      const place = o.meetupLocation ?? run.meetupLocation;
      return veventLines(
        run,
        { date: o.date, time, startsAt: clubTimeToInstant(o.date, time), meetupLocation: place },
        { ...opts, uid, extra: [`RECURRENCE-ID;TZID=${CLUB_TIME_ZONE}:${localStamp(o.date, s.time)}`] },
      );
    });
  return wrap([masterFixed, ...overrides]);
}

export const icsFilename = (run: Pick<Run, "slug">, date?: string) => `${run.slug}${date ? `-${date}` : "-series"}.ics`;
