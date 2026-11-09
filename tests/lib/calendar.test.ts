import { describe, expect, it } from "vitest";
import { browseBounds, buildDays, canShift, clampDate, parseCalendarState, shiftDate, viewLabel, viewRange } from "@/lib/calendar";
import { occurrencesOf, occurrencesWithStatus, type Schedulable } from "@/lib/schedule";

const TODAY = "2026-11-09"; // Monday
const sat: Schedulable = { slug: "sat", title: "Sat Run", meetupLocation: "Cricket Hill", schedule: { kind: "weekly", weekday: "SAT", time: "05:30" } };

describe("view ranges and paging", () => {
  it("a month shows whole Sunday-to-Saturday weeks", () => {
    expect(viewRange("month", "2026-11-09")).toEqual({ from: "2026-11-01", to: "2026-12-05" });
    expect(viewRange("week", "2026-11-09")).toEqual({ from: "2026-11-08", to: "2026-11-14" });
  });

  it("pages a month to its first day (or today) and a week by seven days", () => {
    expect(shiftDate("month", "2026-11-20", 1, TODAY)).toBe("2026-12-01");
    expect(shiftDate("month", "2026-12-20", -1, TODAY)).toBe(TODAY);
    expect(shiftDate("week", "2026-11-14", 1, TODAY)).toBe("2026-11-21");
  });

  it("does not page before today's period or past twelve months ahead", () => {
    expect(canShift("month", TODAY, -1, TODAY)).toBe(false);
    expect(canShift("week", TODAY, -1, TODAY)).toBe(false);
    expect(canShift("month", TODAY, 1, TODAY)).toBe(true);
    const { max } = browseBounds(TODAY);
    expect(max).toBe("2027-11-30");
    expect(canShift("month", max, 1, TODAY)).toBe(false);
    expect(clampDate("2020-01-01", TODAY)).toBe(TODAY);
    expect(clampDate("2040-01-01", TODAY)).toBe(max);
  });

  it("reads URL state defensively", () => {
    expect(parseCalendarState({}, TODAY)).toEqual({ view: "month", date: TODAY });
    expect(parseCalendarState({ view: "week", date: "2026-12-05" }, TODAY)).toEqual({ view: "week", date: "2026-12-05" });
    expect(parseCalendarState({ view: "year", date: "2026-02-30" }, TODAY)).toEqual({ view: "month", date: TODAY });
    expect(parseCalendarState({ date: "1999-01-01" }, TODAY).date).toBe(TODAY);
  });

  it("labels the period", () => {
    expect(viewLabel("month", "2026-11-09")).toBe("November 2026");
    expect(viewLabel("week", "2026-11-09")).toBe("Nov 8 to 14, 2026");
    expect(viewLabel("week", "2026-11-29")).toBe("Nov 29 to Dec 5, 2026");
  });
});

describe("buildDays", () => {
  it("places occurrences on their dates and shows none before today", () => {
    const days = buildDays([sat], "month", TODAY, TODAY);
    expect(days).toHaveLength(35);
    const withRuns = days.filter((d) => d.occurrences.length).map((d) => d.date);
    expect(withRuns).toEqual(["2026-11-14", "2026-11-21", "2026-11-28", "2026-12-05"]);
    expect(days.find((d) => d.date === "2026-11-07")).toMatchObject({ isPast: true, occurrences: [] });
    expect(days.find((d) => d.date === TODAY)?.isToday).toBe(true);
    expect(days.find((d) => d.date === "2026-12-01")?.inPeriod).toBe(false);
  });
});

describe("occurrence status (presentation model)", () => {
  const run: Schedulable = {
    slug: "w", title: "W", meetupLocation: "Park",
    schedule: {
      kind: "weekly", weekday: "SAT", time: "05:30",
      cancellations: [{ date: "2026-11-14", note: "Ice" }],
      overrides: [{ date: "2026-11-21", time: "07:00" }, { date: "2026-11-28", meetupLocation: "Lot B" }, { date: "2026-12-05", time: "08:00", meetupLocation: "Lot C" }],
    },
  };

  it("keeps a cancelled occurrence visible with its note, and labels changes", () => {
    const all = occurrencesWithStatus(run, "2026-11-14", "2026-12-12");
    expect(all.map((o) => [o.date, o.status, o.changedBoth])).toEqual([
      ["2026-11-14", "cancelled", false],
      ["2026-11-21", "changed-time", false],
      ["2026-11-28", "changed-location", false],
      ["2026-12-05", "changed-time", true],
      ["2026-12-12", "scheduled", false],
    ]);
    expect(all[0].note).toBe("Ice");
    expect(all[1].time).toBe("07:00");
    expect(all[2].meetupLocation).toBe("Lot B");
  });

  it("leaves existing behavior untouched: occurrencesOf still drops cancellations", () => {
    expect(occurrencesOf(run, "2026-11-14", "2026-11-21").map((o) => o.date)).toEqual(["2026-11-21"]);
  });

  it("marks a cancelled one-off run", () => {
    const once: Schedulable = { slug: "o", title: "O", meetupLocation: "X", schedule: { kind: "once", date: "2026-11-15", time: "07:00", cancelled: true } };
    expect(occurrencesWithStatus(once, "2026-11-01", "2026-11-30")[0].status).toBe("cancelled");
    expect(occurrencesOf(once, "2026-11-01", "2026-11-30")).toEqual([]);
  });

  it("keeps 5:30 AM local across the spring-forward and fall-back weekends", () => {
    const wed: Schedulable = { slug: "x", title: "X", meetupLocation: "P", schedule: { kind: "weekly", weekday: "SAT", time: "05:30" } };
    const [before, after] = occurrencesWithStatus(wed, "2027-03-13", "2027-03-20"); // DST starts Sun 2027-03-14
    expect(before.startsAt.toISOString()).toBe("2027-03-13T11:30:00.000Z");
    expect(after.startsAt.toISOString()).toBe("2027-03-20T10:30:00.000Z");
  });
});
