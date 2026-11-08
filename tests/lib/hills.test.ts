import { describe, expect, it } from "vitest";
import { directoryEntries } from "@/lib/hill-directory";
import { getHill, hills, hillsWithPages, listedHills, otherHills, repeatsTo, surfaceLabel } from "@/lib/hills";
import { directionsUrl, mapUrl } from "@/lib/maps";
import { getRunsAtHill, runs } from "@/lib/runs";
import { describeCadence } from "@/lib/schedule";

// A Thursday before the 2026 schedule changes anything; both weekly runs are upcoming.
const NOW = new Date("2026-11-12T18:00:00Z");
const FIVE = ["cricket-hill", "warren-hill", "horner-hill", "schiller-hill", "mt-trashmore"];

describe("hill records (Chicago Hills milestone)", () => {
  it("gives the five listed hills a page, in display order; the placeholder has none", () => {
    expect(hillsWithPages().map((h) => h.slug)).toEqual(FIVE);
    expect(listedHills().map((h) => h.slug)).toEqual(FIVE);
    expect(getHill("example-hill")?.page).toBeUndefined();
  });

  it("keeps every listed hill provisional and promotes no measurement", () => {
    for (const h of hillsWithPages()) {
      expect(h.status).toBe("provisional");
      // Never estimated: gain per repeat and repeat distance stay unset until measured.
      expect(h.elevationGainFt).toBeUndefined();
      expect(h.repeatDistanceMi).toBeUndefined();
    }
  });

  it("keeps Warren Hill's drawing illustrative, with no figures", () => {
    const warren = getHill("warren-hill")!;
    expect(warren.profile?.interpretive).toBe(true);
    expect(warren.profile?.figures).toBeNull();
  });

  it("records surface only where the approved frame shows it (Cricket Hill)", () => {
    expect(hillsWithPages().filter((h) => h.page.surface).map((h) => h.slug)).toEqual(["cricket-hill"]);
    expect(surfaceLabel(getHill("cricket-hill")!.page)).toBe("Grass / paved path");
    expect(surfaceLabel(getHill("horner-hill")!.page)).toBeUndefined();
  });

  it("uses a photograph only where one is approved (Cricket Hill)", () => {
    expect(hillsWithPages().filter((h) => h.page.hero).map((h) => h.slug)).toEqual(["cricket-hill"]);
  });

  it("cites only https sources, and never invents a meeting point in the address", () => {
    for (const h of hillsWithPages()) {
      for (const s of h.page.sources) expect(s.href).toMatch(/^https:\/\//);
      expect(h.page.address.join(" ")).not.toMatch(/meet|parking|lot|entrance/i);
    }
  });

  it("uses the Cricket Hill copy from the approved frame verbatim", () => {
    const p = getHill("cricket-hill")!.page!;
    expect(p.lede).toBe(
      "A grassy lakefront hill beside Montrose Harbor with just enough elevation to become considerably less charming after enough repeats.",
    );
    expect(p.aboutHeading).toBe("The mountain at Montrose.");
    expect(p.about.slice(0, 3)).toEqual([
      "Cricket Hill sits just west of Montrose Harbor along Chicago's lakefront. In another city, it might be a pleasant little hill.",
      "Here, we have standards to maintain.",
      "Its open grassy slope and surrounding paths make it useful for short climbs, repeat workouts and accumulating vertical without leaving the city.",
    ]);
  });
});

describe("derived repeats (IA decision 7)", () => {
  it("counts repeats from gain per repeat, rounding up", () => {
    expect(repeatsTo(500, 40)).toBe(13);
    expect(repeatsTo(1000, 40)).toBe(25);
    expect(repeatsTo(500, 30)).toBe(17);
  });

  it("stays undefined while gain per repeat is unmeasured or invalid", () => {
    expect(repeatsTo(500, undefined)).toBeUndefined();
    expect(repeatsTo(500, 0)).toBeUndefined();
    expect(repeatsTo(500, -5)).toBeUndefined();
  });
});

describe("hill navigation helpers", () => {
  it("lists the other hills starting after the current one, wrapping", () => {
    expect(otherHills("horner-hill").map((h) => h.slug)).toEqual(["schiller-hill", "mt-trashmore", "cricket-hill", "warren-hill"]);
    expect(otherHills("mt-trashmore").map((h) => h.slug)).toEqual(FIVE.slice(0, 4));
  });

  it("numbers directory entries 01–05 and lists when CMR runs each hill", () => {
    const entries = directoryEntries(NOW);
    expect(entries.map((e) => [e.hill.slug, e.number])).toEqual(FIVE.map((s, i) => [s, i + 1]));
    const by = Object.fromEntries(entries.map((e) => [e.hill.slug, e.cadences]));
    expect(by["cricket-hill"]).toEqual(["Saturdays · 5:30 AM"]);
    expect(by["horner-hill"]).toEqual(["Wednesdays · 5:30 AM"]);
    expect(by["warren-hill"]).toEqual([]);
  });
});

describe("runs at a hill (Hill → Run)", () => {
  it("returns the next occurrence of each run held there", () => {
    expect(getRunsAtHill("cricket-hill", NOW).map((o) => o.run.slug)).toEqual(["cricket-mtn-repeats"]);
    expect(getRunsAtHill("schiller-hill", NOW)).toEqual([]);
  });

  it("drops runs that no longer have an upcoming occurrence", () => {
    const ended = runs.map((r) => (r.slug === "cricket-mtn-repeats" ? { ...r, schedule: { kind: "once" as const, date: "2026-01-03", time: "05:30" } } : r));
    expect(getRunsAtHill("cricket-hill", NOW, ended)).toEqual([]);
  });

  it("describes cadence for listings", () => {
    expect(describeCadence({ kind: "weekly", weekday: "WED", time: "05:30" })).toBe("Wednesdays · 5:30 AM");
    expect(describeCadence({ kind: "once", date: "2026-12-05", time: "07:00" })).toBe("Saturday, December 5, 2026 · 7:00 AM");
  });
});

describe("map links", () => {
  it("are plain Google Maps URLs with the query encoded", () => {
    expect(directionsUrl("Horner Park, 2741 W Montrose Ave, Chicago, IL")).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=Horner%20Park%2C%202741%20W%20Montrose%20Ave%2C%20Chicago%2C%20IL",
    );
    expect(mapUrl("Cricket Hill")).toBe("https://www.google.com/maps/search/?api=1&query=Cricket%20Hill");
  });

  it("exist for every hill page", () => {
    for (const h of hills.filter((x) => x.page)) expect(h.page!.mapQuery.length).toBeGreaterThan(5);
  });
});
