import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { directoryEntries } from "@/lib/hill-directory";
import { REPEAT_TARGETS_FT, formatMiles, getHill, hills, hillsWithPages, listedHills, otherHills, routeCounts } from "@/lib/hills";
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

  it("keeps the Figma surface rows for Cricket Hill only, and the Owner's Grass/dirt summary for every hill", () => {
    expect(hillsWithPages().filter((h) => h.page.surface).map((h) => h.slug)).toEqual(["cricket-hill"]);
    for (const h of hillsWithPages()) expect(h.page.surfaceSummary).toBe("Grass/dirt");
  });

  it("gives every hill page a static map built from its place, and no photograph", () => {
    for (const h of hillsWithPages()) {
      expect(h.page.mapImage).toBe(`/hills/maps/${h.slug}.jpg`);
      expect(existsSync(join(process.cwd(), "public", h.page.mapImage))).toBe(true);
      expect(h.page).not.toHaveProperty("hero");
      expect(h.page).not.toHaveProperty("standfirst");
    }
  });

  it("cites only https sources, and never invents a meeting point in the address", () => {
    for (const h of hillsWithPages()) {
      for (const s of h.page.sources) expect(s.href).toMatch(/^https:\/\//);
      expect(h.page.address.join(" ")).not.toMatch(/meet|parking|lot|entrance/i);
    }
  });

  it("uses the Owner's Warren and Schiller paragraphs verbatim, keeping headings and sources", () => {
    const warren = getHill("warren-hill")!.page!;
    expect(warren.aboutHeading).toBe("The hill at Warren Park.");
    expect(warren.about).toEqual([
      "Warren Park covers roughly 89 acres and has a nine-hole golf course and an ice rink. The hill is proving less cooperative.",
      "At this point, locating it may count as the first repeat.",
    ]);
    expect(warren.sources.map((s) => s.label)).toEqual(["Chicago Park District: Warren (Laurence) Park"]);
    const schiller = getHill("schiller-hill")!.page!;
    expect(schiller.aboutHeading).toBe("The hill at Schiller Woods.");
    expect(schiller.about).toEqual([
      "Schiller Woods sits along Irving Park Road. Somewhere in the vicinity is a hill we intend to run up repeatedly.",
      "Its exact location remains a closely guarded secret. Apparently, even from us.",
    ]);
    for (const h of hillsWithPages()) expect([...h.page.about, h.page.lede].join(" ")).not.toMatch(/—/);
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

describe("route baseline and derived repeat counts (Owner, 2026-11-08)", () => {
  it("counts to four climbing targets", () => {
    expect(REPEAT_TARGETS_FT).toEqual([500, 1000, 2500, 5000]);
  });

  it("stores Cricket Hill's Owner-provided baseline, not counts", () => {
    const route = getHill("cricket-hill")!.page!.route!;
    expect(route).toMatchObject({ distanceMi: 0.2, gainPerRepeatFt: 40 });
    expect(route.basis).toMatch(/25 complete repeats ≈ 5 miles and ≈ 1,000 ft/);
    expect(route).not.toHaveProperty("counts");
  });

  it("derives the Owner's table, rounding up to whole repeats", () => {
    expect(routeCounts(getHill("cricket-hill")!.page!.route)).toEqual({
      500: { repeats: 13, miles: 2.6 },
      1000: { repeats: 25, miles: 5 },
      2500: { repeats: 63, miles: 12.6 },
      5000: { repeats: 125, miles: 25 },
    });
  });

  it("calculates nothing without a route — never from the hill's overall rise", () => {
    for (const slug of ["warren-hill", "horner-hill", "schiller-hill", "mt-trashmore"]) {
      const h = getHill(slug)!;
      expect(h.page!.route).toBeUndefined();
      expect(routeCounts(h.page!.route)).toBeUndefined();
    }
    expect(routeCounts({ distanceMi: 0.2, gainPerRepeatFt: 0, basis: "" })).toBeUndefined();
  });

  it("writes miles the way the Owner does", () => {
    expect(formatMiles(0.2)).toBe(".2");
    expect(formatMiles(1.5)).toBe("1.5");
    expect(formatMiles(3)).toBe("3");
  });
});

describe("hill navigation helpers", () => {
  it("lists the other hills starting after the current one, wrapping", () => {
    expect(otherHills("horner-hill").map((h) => h.slug)).toEqual(["schiller-hill", "mt-trashmore", "cricket-hill", "warren-hill"]);
    expect(otherHills("mt-trashmore").map((h) => h.slug)).toEqual(FIVE.slice(0, 4));
  });

  it("lists directory entries in display order with when CMR runs each hill every week", () => {
    const entries = directoryEntries(NOW);
    expect(entries.map((e) => e.hill.slug)).toEqual(FIVE);
    const by = Object.fromEntries(entries.map((e) => [e.hill.slug, e.cadences]));
    expect(by["cricket-hill"]).toEqual(["Saturdays · 5:30 AM"]);
    expect(by["horner-hill"]).toEqual(["Wednesdays · 5:30 AM"]);
    expect(by["warren-hill"]).toEqual([]);
  });

  it("leaves one-off runs out of the weekly column", () => {
    const once = runs.map((r) => (r.slug === "cricket-mtn-repeats" ? { ...r, schedule: { kind: "once" as const, date: "2026-12-05", time: "07:00" } } : r));
    expect(getRunsAtHill("cricket-hill", NOW, once)).toHaveLength(1);
    const by = Object.fromEntries(directoryEntries(NOW, once).map((e) => [e.hill.slug, e.cadences]));
    expect(by["cricket-hill"]).toEqual([]);
    expect(by["horner-hill"]).toEqual(["Wednesdays · 5:30 AM"]);
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
