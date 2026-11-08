import { describe, expect, it } from "vitest";
import {
  addDays,
  clubTimeToInstant,
  describeSchedule,
  formatSlot,
  formatTime,
  occurrencesOf,
  toClubTime,
  toDateTimeAttr,
  upcomingOccurrences,
  weekdayOf,
  type Schedulable,
} from "@/lib/schedule";

const weekly = (overrides: Partial<Extract<Schedulable["schedule"], { kind: "weekly" }>> = {}, slug = "tue"): Schedulable => ({
  slug,
  title: slug,
  meetupLocation: "Cricket Hill",
  schedule: { kind: "weekly", weekday: "TUE", time: "05:30", ...overrides },
});

describe("calendar and time-zone primitives", () => {
  it("does date arithmetic across month and year boundaries", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(weekdayOf("2026-11-10")).toBe("TUE");
  });

  it("converts Chicago wall-clock time to the right instant in winter (CST, UTC−6) and summer (CDT, UTC−5)", () => {
    expect(clubTimeToInstant("2026-01-13", "05:30").toISOString()).toBe("2026-01-13T11:30:00.000Z");
    expect(clubTimeToInstant("2026-07-14", "05:30").toISOString()).toBe("2026-07-14T10:30:00.000Z");
  });

  it("is independent of the host time zone (it never uses the local zone)", () => {
    // Reads Chicago parts from a UTC instant regardless of process TZ.
    expect(toClubTime(new Date("2026-11-08T04:30:00Z"))).toEqual({ date: "2026-11-07", time: "22:30", weekday: "SAT" });
  });

  it("resolves the spring-forward gap forward and the fall-back hour to its first occurrence", () => {
    // 2026-03-08 02:30 does not exist in Chicago; 02:00 → 03:00.
    expect(clubTimeToInstant("2026-03-08", "02:30").toISOString()).toBe("2026-03-08T08:30:00.000Z"); // 03:30 CDT
    // 2026-11-01 01:30 happens twice; the first is CDT (UTC−5).
    expect(clubTimeToInstant("2026-11-01", "01:30").toISOString()).toBe("2026-11-01T06:30:00.000Z");
  });

  it("formats times and <time> attributes with the correct offset", () => {
    expect(formatTime("05:30")).toBe("5:30 AM");
    expect(formatTime("00:05")).toBe("12:05 AM");
    expect(formatTime("12:00")).toBe("12:00 PM");
    expect(formatTime("17:45")).toBe("5:45 PM");
    const winter = { date: "2026-12-01", time: "05:30", startsAt: clubTimeToInstant("2026-12-01", "05:30") };
    const summer = { date: "2026-06-02", time: "05:30", startsAt: clubTimeToInstant("2026-06-02", "05:30") };
    expect(toDateTimeAttr(winter)).toBe("2026-12-01T05:30-06:00");
    expect(toDateTimeAttr(summer)).toBe("2026-06-02T05:30-05:00");
  });

  it("rejects malformed dates and times instead of guessing", () => {
    expect(() => clubTimeToInstant("2026-1-5", "05:30")).toThrow(/Invalid date/);
    expect(() => clubTimeToInstant("2026-01-05", "5:30")).toThrow(/Invalid time/);
  });
});

describe("weekly recurrence", () => {
  it("produces one occurrence per matching weekday in the range", () => {
    const occ = occurrencesOf(weekly(), "2026-11-01", "2026-11-30");
    expect(occ.map((o) => o.date)).toEqual(["2026-11-03", "2026-11-10", "2026-11-17", "2026-11-24"]);
    expect(occ.every((o) => o.weekday === "TUE" && o.time === "05:30")).toBe(true);
  });

  it("keeps 5:30 AM local across the DST change (UTC instant shifts by an hour)", () => {
    const occ = occurrencesOf(weekly({ weekday: "SUN" }), "2026-10-25", "2026-11-08");
    expect(occ.map((o) => o.startsAt.toISOString())).toEqual([
      "2026-10-25T10:30:00.000Z", // CDT
      "2026-11-01T11:30:00.000Z", // CST — DST ended at 02:00 that morning
      "2026-11-08T11:30:00.000Z",
    ]);
    const spring = occurrencesOf(weekly({ weekday: "SUN" }), "2026-03-01", "2026-03-08");
    expect(spring.map((o) => o.startsAt.toISOString())).toEqual(["2026-03-01T11:30:00.000Z", "2026-03-08T10:30:00.000Z"]);
  });

  it("respects startsOn and endsOn (inclusive)", () => {
    const occ = occurrencesOf(weekly({ startsOn: "2026-11-10", endsOn: "2026-11-24" }), "2026-11-01", "2026-12-31");
    expect(occ.map((o) => o.date)).toEqual(["2026-11-10", "2026-11-17", "2026-11-24"]);
  });

  it("removes cancelled dates", () => {
    const occ = occurrencesOf(weekly({ cancellations: [{ date: "2026-11-24", note: "Thanksgiving week" }] }), "2026-11-01", "2026-11-30");
    expect(occ.map((o) => o.date)).toEqual(["2026-11-03", "2026-11-10", "2026-11-17"]);
  });

  it("applies per-date overrides of time, meeting point, and note", () => {
    const occ = occurrencesOf(
      weekly({ overrides: [{ date: "2026-11-17", time: "06:15", meetupLocation: "Montrose Harbor lot", note: "Late start" }] }),
      "2026-11-10",
      "2026-11-24",
    );
    expect(occ.map((o) => [o.date, o.time, o.meetupLocation, o.note])).toEqual([
      ["2026-11-10", "05:30", "Cricket Hill", undefined],
      ["2026-11-17", "06:15", "Montrose Harbor lot", "Late start"],
      ["2026-11-24", "05:30", "Cricket Hill", undefined],
    ]);
  });
});

describe("dated and special runs", () => {
  const once = (date: string, extra: object = {}): Schedulable => ({
    slug: `once-${date}`,
    title: "Special",
    meetupLocation: "Somewhere",
    schedule: { kind: "once", date, time: "07:00", ...extra },
  });

  it("occurs exactly once, on its date, flagged when special", () => {
    expect(occurrencesOf(once("2026-12-05"), "2026-12-01", "2026-12-31")).toHaveLength(1);
    expect(occurrencesOf(once("2026-12-05"), "2026-12-06", "2026-12-31")).toHaveLength(0);
    expect(occurrencesOf(once("2026-12-05", { special: true }), "2026-12-01", "2026-12-31")[0].special).toBe(true);
  });

  it("disappears when cancelled", () => {
    expect(occurrencesOf(once("2026-12-05", { cancelled: true }), "2026-12-01", "2026-12-31")).toHaveLength(0);
  });

  it("describes schedules for detail pages", () => {
    expect(describeSchedule(weekly().schedule)).toBe("Every Tuesday · 5:30 AM");
    expect(describeSchedule({ kind: "once", date: "2026-12-05", time: "07:00" })).toBe("Saturday, December 5, 2026 · 7:00 AM");
    expect(describeSchedule({ kind: "once", date: "2026-12-05", time: "07:00", cancelled: true })).toMatch(/\(cancelled\)$/);
  });
});

describe("upcoming occurrences", () => {
  const runs = [
    weekly({}, "cricket"),
    weekly({ weekday: "FRI" }, "horner"),
    weekly({ weekday: "SAT", time: "05:00" }, "schiller"),
  ];

  it("is chronological from now, in Chicago time", () => {
    // Saturday 2026-11-07, 22:30 Chicago → Saturday's run has passed.
    const now = new Date("2026-11-08T04:30:00Z");
    expect(upcomingOccurrences(runs, now, { limit: 3 }).map((o) => `${o.run.slug} ${o.date}`)).toEqual([
      "cricket 2026-11-10",
      "horner 2026-11-13",
      "schiller 2026-11-14",
    ]);
  });

  it("keeps a run upcoming until its start time, then moves to the next week", () => {
    const before = new Date("2026-11-10T11:29:00Z"); // 05:29 CST Tuesday
    const after = new Date("2026-11-10T11:31:00Z");
    expect(upcomingOccurrences(runs, before, { limit: 1 })[0].date).toBe("2026-11-10");
    expect(upcomingOccurrences(runs, after, { limit: 1 })[0].run.slug).toBe("horner");
  });

  it("uses Chicago's date near UTC midnight (not the UTC date)", () => {
    // 2026-11-11T02:00Z is still Tuesday evening in Chicago.
    const now = new Date("2026-11-11T02:00:00Z");
    expect(upcomingOccurrences(runs, now, { limit: 1 })[0].run.slug).toBe("horner");
  });

  it("skips a cancellation to the following week and folds in special runs", () => {
    const withExceptions = [
      weekly({ cancellations: [{ date: "2026-11-10" }] }, "cricket"),
      { slug: "turkey", title: "Turkey Trot-ish", meetupLocation: "Cricket Hill", schedule: { kind: "once", date: "2026-11-26", time: "08:00", special: true } } as Schedulable,
    ];
    const now = new Date("2026-11-08T04:30:00Z");
    expect(upcomingOccurrences(withExceptions, now, { limit: 4 }).map((o) => `${o.run.slug} ${o.date}`)).toEqual([
      "cricket 2026-11-17",
      "cricket 2026-11-24",
      "turkey 2026-11-26",
      "cricket 2026-12-01",
    ]);
  });

  it("returns nothing when nothing is scheduled", () => {
    expect(upcomingOccurrences([], new Date())).toEqual([]);
  });
});

describe("slot labels", () => {
  const now = new Date("2026-11-08T04:30:00Z"); // Sat 22:30 Chicago

  it("uses the weekday for the coming six days (Figma: 'TUE · 5:30 AM')", () => {
    expect(formatSlot({ date: "2026-11-10", time: "05:30", weekday: "TUE" }, now)).toBe("TUE · 5:30 AM");
    expect(formatSlot({ date: "2026-11-13", time: "05:30", weekday: "FRI" }, now)).toBe("FRI · 5:30 AM");
  });

  it("uses the date once a weekday would be ambiguous", () => {
    expect(formatSlot({ date: "2026-11-14", time: "05:00", weekday: "SAT" }, now)).toBe("NOV 14 · 5:00 AM");
    expect(formatSlot({ date: "2026-12-02", time: "05:30", weekday: "WED" }, now)).toBe("DEC 2 · 5:30 AM");
  });
});
