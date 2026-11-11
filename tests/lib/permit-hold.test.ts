import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/calendar/[slug]/ics/route";
import { directoryEntries } from "@/lib/hill-directory";
import { OFFICIAL_RUNS_ON_HOLD, PAUSE_COPY, PERMIT_HOLD_COPY, officialRunsAvailable, withoutHeldRuns } from "@/lib/permit-hold";
import { NextRequest } from "next/server";

const ROOT = join(__dirname, "..", "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe("permit-pending hold (src/lib/permit-hold.ts)", () => {
  it("has one flag, and the copy makes no claim about permits, agencies or applications", () => {
    expect(typeof OFFICIAL_RUNS_ON_HOLD).toBe("boolean");
    const copy = Object.values(PERMIT_HOLD_COPY).join(" ");
    expect(copy).not.toMatch(/park district|cpd|permit(ted)?\b.*(approved|granted|pending application)|applied|application|approved|endorse|insured/i);
    // /calendar's pause copy: the Owner's exact words, split only so the questions phrase can be a link.
    expect(PAUSE_COPY.heading).toBe("Hills on pause.");
    expect(PAUSE_COPY.bodyBeforeLink + PAUSE_COPY.linkText + PAUSE_COPY.bodyAfterLink).toBe(
      "Weekly hill repeat sessions will be posted shortly. Check back later or send us your questions.",
    );
    expect(PAUSE_COPY.description).toBe("Weekly hill repeat sessions will be posted shortly. Check back later or send us your questions.");
    expect(Object.values(PAUSE_COPY).join(" ")).not.toMatch(/park district|cpd|permit|insur|waiver|liab|application|approved/i);
  });

  it("hides every run while held and passes them through when lifted", () => {
    expect(withoutHeldRuns([1, 2, 3], true)).toEqual([]);
    expect(withoutHeldRuns([1, 2, 3], false)).toEqual([1, 2, 3]);
    expect(officialRunsAvailable(true)).toBe(false);
    expect(officialRunsAvailable(false)).toBe(true);
  });

  it.runIf(OFFICIAL_RUNS_ON_HOLD)("serves no calendar download while held, for a real run or any date", async () => {
    const call = (qs: string) =>
      GET(new NextRequest(`http://localhost/calendar/cricket-mtn-repeats/ics${qs}`), { params: Promise.resolve({ slug: "cricket-mtn-repeats" }) });
    for (const qs of ["?scope=series", "?scope=occurrence&date=2026-11-14", ""]) {
      const res = await call(qs);
      expect(res.status).toBe(404);
      expect(res.headers.get("Content-Type")).not.toMatch(/calendar/);
    }
  });

  it.runIf(OFFICIAL_RUNS_ON_HOLD)("lists no weekly run for any hill in the directory while held", () => {
    for (const e of directoryEntries(new Date("2026-11-12T18:00:00Z"))) expect(e.cadences).toEqual([]);
  });
});

/**
 * Deterministic guard against a bypass: any page or component that reads run
 * data must go through the hold, or be on this short, reviewed list of files
 * that are only ever reached through a held page.
 */
describe("hold coverage", () => {
  const RUN_DATA = /from "@\/lib\/(runs|ics)"/;
  const withoutTypeImports = (text: string) => text.replace(/import type [^;]+;/g, "");
  const REACHED_ONLY_THROUGH_HOLD_PAGES = new Set([
    "src/components/calendar/UpcomingList.tsx", // rendered only by /calendar, which returns the notice while held
    "src/lib/ics.ts", // called only by the ics route, which 404s while held
    "src/components/home/HomeHero.tsx", // type-only run import; its card is NextRunCard, which holds
  ]);

  it("every file that reads run data references the hold, or is on the reviewed list", () => {
    const files = [...sourceFiles(join(ROOT, "src/app")), ...sourceFiles(join(ROOT, "src/components")), join(ROOT, "src/lib/hill-directory.ts")];
    const offenders = files
      .map((f) => ({ f, rel: relative(ROOT, f), text: readFileSync(f, "utf8") }))
      .filter(({ text }) => RUN_DATA.test(withoutTypeImports(text)))
      .filter(({ text, rel }) => !/permit-hold/.test(text) && !REACHED_ONLY_THROUGH_HOLD_PAGES.has(rel))
      .map(({ rel }) => rel);
    expect(offenders).toEqual([]);
  });

  it("every route under /calendar references the hold", () => {
    const routes = sourceFiles(join(ROOT, "src/app/calendar")).filter((f) => /(page|route)\.tsx?$/.test(f));
    expect(routes.length).toBeGreaterThanOrEqual(3);
    for (const f of routes) expect(readFileSync(f, "utf8"), relative(ROOT, f)).toMatch(/permit-hold/);
  });

  it("nothing outside the calendar, the hold copy and the allowed variants links to a run detail page unguarded", () => {
    const LINKS_TO_RUN = /`\/calendar\/\$\{/;
    const files = [...sourceFiles(join(ROOT, "src/app")), ...sourceFiles(join(ROOT, "src/components"))];
    const linking = files
      .filter((f) => LINKS_TO_RUN.test(readFileSync(f, "utf8")))
      .map((f) => relative(ROOT, f))
      .filter((rel) => !/^src\/(app|components)\/calendar\//.test(rel));
    // Each remaining file must carry the hold prop/flag.
    for (const rel of linking) expect(readFileSync(join(ROOT, rel), "utf8"), rel).toMatch(/permit-hold/);
  });
});
