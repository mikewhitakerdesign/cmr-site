import { describe, expect, it } from "vitest";
import { GET } from "@/app/calendar/[slug]/ics/route";
import { getRun, getUpcomingWithStatus, listedRuns, nextWithStatus } from "@/lib/runs";
import { NextRequest } from "next/server";

const now = new Date("2026-11-09T18:00:00Z");

describe("run records", () => {
  it("keeps the two weekly runs provisional with the approved facts and exact map links", () => {
    const c = getRun("cricket-mtn-repeats")!;
    const h = getRun("horner-hell-repeats")!;
    expect([c.status, h.status]).toEqual(["provisional", "provisional"]);
    expect(c.schedule).toMatchObject({ kind: "weekly", weekday: "SAT", time: "05:30" });
    expect(h.schedule).toMatchObject({ kind: "weekly", weekday: "WED", time: "05:30" });
    expect([c.durationMinutes, h.durationMinutes]).toEqual([120, 60]);
    expect(c.directionsUrl).toBe("https://maps.app.goo.gl/11S9yixBqMH3vxC97");
    expect(h.directionsUrl).toBe("https://maps.app.goo.gl/UkzLSDPRzYykq9Aq6");
    expect(c.content?.headline).toBe("A little mountain by the lake.");
    expect(h.content?.headline).toBe("An hour of questionable decisions.");
  });

  it("pins each meeting map on the exact Google Maps pin (coordinates the supplied links resolve to)", async () => {
    const { existsSync } = await import("node:fs");
    const c = getRun("cricket-mtn-repeats")!.pin!;
    const h = getRun("horner-hell-repeats")!.pin!;
    expect([c.lat, c.lon]).toEqual([41.962864, -87.64403]); // maps.app.goo.gl/11S9yixBqMH3vxC97
    expect([h.lat, h.lon]).toEqual([41.959459, -87.69566]); // maps.app.goo.gl/UkzLSDPRzYykq9Aq6
    for (const p of [c, h]) expect(existsSync(`public${p.image}`), p.image).toBe(true);
  });

  it("never lists the scaffold placeholder as a real run", () => {
    expect(listedRuns().map((r) => r.slug)).toEqual(["cricket-mtn-repeats", "horner-hell-repeats"]);
    expect(getUpcomingWithStatus(now).map((r) => r.occurrence.run.slug)).not.toContain("example-hill-repeats");
  });

  it("finds a run's next occurrence, none when it has ended", () => {
    const c = getRun("cricket-mtn-repeats")!;
    expect(nextWithStatus(c, now)?.occurrence.date).toBe("2026-11-14");
    expect(nextWithStatus({ ...c, schedule: { kind: "weekly", weekday: "SAT", time: "05:30", endsOn: "2026-11-01" } }, now)).toBeNull();
  });
});

describe("GET /calendar/[slug]/ics", () => {
  const call = (slug: string, qs: string) => GET(new NextRequest(`http://localhost/calendar/${slug}/ics${qs}`), { params: Promise.resolve({ slug }) });

  it("downloads a series and a single occurrence as text/calendar attachments", async () => {
    const series = await call("cricket-mtn-repeats", "?scope=series");
    expect(series.status).toBe(200);
    expect(series.headers.get("content-type")).toContain("text/calendar");
    expect(series.headers.get("content-disposition")).toContain("attachment");
    expect(await series.text()).toContain("RRULE:FREQ=WEEKLY;BYDAY=SA");
    const one = await call("horner-hell-repeats", "?scope=occurrence&date=2026-12-02");
    expect(await one.text()).toContain("DTSTART;TZID=America/Chicago:20261202T053000");
  });

  it("404s unknown runs, the placeholder, bad dates and non-occurrence dates", async () => {
    for (const [slug, qs] of [["nope", "?scope=series"], ["example-hill-repeats", "?scope=series"], ["cricket-mtn-repeats", "?scope=occurrence&date=bad"], ["cricket-mtn-repeats", "?scope=occurrence&date=2026-12-02"]]) {
      expect((await call(slug, qs)).status, `${slug}${qs}`).toBe(404);
    }
  });
});
