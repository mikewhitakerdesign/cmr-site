import { describe, expect, it } from "vitest";
import { escapeText, fold, icsFilename, occurrenceIcs, seriesIcs } from "@/lib/ics";
import { getRun, type Run } from "@/lib/runs";

const now = new Date("2026-11-09T18:00:00Z");
const opts = { now, siteUrl: "https://cmr.example" };
const cricket = getRun("cricket-mtn-repeats")!;
const unfold = (s: string) => s.replace(/\r\n /g, "");

describe(".ics export", () => {
  it("builds a single occurrence in Chicago time with the venue and URL", () => {
    const ics = unfold(occurrenceIcs(cricket, "2026-11-14", opts)!);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("BEGIN:VTIMEZONE\r\nTZID:America/Chicago");
    expect(ics).toContain("DTSTART;TZID=America/Chicago:20261114T053000");
    expect(ics).toContain("DTEND;TZID=America/Chicago:20261114T073000"); // 2 hours
    expect(ics).toContain("SUMMARY:Cricket Mtn Repeats");
    expect(ics).toContain("LOCATION:Cricket Hill · Montrose Beach");
    expect(ics).toContain("URL:https://cmr.example/calendar/cricket-mtn-repeats");
    expect(ics).toContain("do not update automatically");
    expect(ics).not.toContain("RRULE:FREQ=WEEKLY;BYDAY=SA"); // the single file has no recurrence
    expect(ics).not.toMatch(/\r\r|[^\r]\n/);
  });

  it("returns null for dates that are not occurrences", () => {
    expect(occurrenceIcs(cricket, "2026-11-13", opts)).toBeNull(); // a Friday
  });

  it("reflects a time and meeting-point override on the selected occurrence", () => {
    const run: Run = {
      ...cricket,
      schedule: { kind: "weekly", weekday: "SAT", time: "05:30", overrides: [{ date: "2026-11-14", time: "07:00", meetupLocation: "Montrose Harbor" }] },
    };
    const ics = unfold(occurrenceIcs(run, "2026-11-14", opts)!);
    expect(ics).toContain("DTSTART;TZID=America/Chicago:20261114T070000");
    expect(ics).toContain("LOCATION:Montrose Harbor");
  });

  it("refuses a cancelled occurrence", () => {
    const run: Run = { ...cricket, schedule: { kind: "weekly", weekday: "SAT", time: "05:30", cancellations: [{ date: "2026-11-14" }] } };
    expect(occurrenceIcs(run, "2026-11-14", opts)).toBeNull();
  });

  it("builds a weekly series with RRULE, EXDATE for cancellations and a RECURRENCE-ID override", () => {
    const run: Run = {
      ...cricket,
      schedule: {
        kind: "weekly", weekday: "SAT", time: "05:30",
        cancellations: [{ date: "2026-11-21" }],
        overrides: [{ date: "2026-11-28", time: "07:00" }],
      },
    };
    const ics = unfold(seriesIcs(run, opts)!);
    expect(ics).toContain("DTSTART;TZID=America/Chicago:20261114T053000");
    expect(ics).toContain("RRULE:FREQ=WEEKLY;BYDAY=SA");
    expect(ics).toContain("EXDATE;TZID=America/Chicago:20261121T053000");
    expect(ics).toContain("RECURRENCE-ID;TZID=America/Chicago:20261128T053000");
    expect(ics).toContain("DTSTART;TZID=America/Chicago:20261128T070000");
    expect(ics.match(/UID:cricket-mtn-repeats-series@cmr-site/g)).toHaveLength(2);
  });

  it("starts the series after a cancelled first date and ends it at endsOn", () => {
    const run: Run = {
      ...cricket,
      schedule: { kind: "weekly", weekday: "SAT", time: "05:30", cancellations: [{ date: "2026-11-14" }], endsOn: "2026-12-19" },
    };
    const ics = unfold(seriesIcs(run, opts)!);
    expect(ics).toContain("DTSTART;TZID=America/Chicago:20261121T053000");
    expect(ics).toMatch(/RRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=20261219T113000Z/);
  });

  it("offers no series for a one-off run", () => {
    expect(seriesIcs({ ...cricket, schedule: { kind: "once", date: "2026-12-01", time: "06:00" } }, opts)).toBeNull();
  });

  it("folds long lines at 75 octets and escapes text", () => {
    const folded = fold("DESCRIPTION:" + "é".repeat(80));
    for (const line of folded.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(unfold(folded)).toBe("DESCRIPTION:" + "é".repeat(80));
    expect(escapeText("a,b;c\\d\ne")).toBe("a\\,b\;c\\\\d\\ne");
  });

  it("names files", () => {
    expect(icsFilename(cricket, "2026-11-14")).toBe("cricket-mtn-repeats-2026-11-14.ics");
    expect(icsFilename(cricket)).toBe("cricket-mtn-repeats-series.ics");
  });
});
