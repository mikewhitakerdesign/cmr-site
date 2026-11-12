import { expect, test, type Page } from "@playwright/test";
import { OFFICIAL_RUNS_ON_HOLD } from "../../src/lib/permit-hold";

/**
 * The permit-pending hold on official group runs (src/lib/permit-hold.ts), at
 * 393 / 768 / 1440. These checks describe the held state; they are skipped when
 * the Owner lifts the hold (and the Find a Run specs run instead).
 */
test.skip(!OFFICIAL_RUNS_ON_HOLD, "Official runs are not on hold.");

const AXE_PATH = require.resolve("axe-core");
async function axe(page: Page) {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async () => {
    // @ts-expect-error injected global
    const r = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] });
    return r.violations.map((v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  });
}
const noHScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

const RUN_NAMES = /Cricket Mtn Repeats|Horner Hell Repeats/i;
const PAGES = ["/", "/hills", "/hills/cricket-hill", "/hills/horner-hill", "/hills/warren-hill", "/about", "/faq", "/privacy", "/terms", "/participation-guidelines", "/join", "/calendar"];

test.beforeEach(async ({ page }) => {
  await page.route("https://formspree.io/**", (r) => r.abort());
});

test.describe("/calendar while held", () => {
  test("shows the page hero and the Hills on pause section, and nothing else about runs", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hills on repeat.");
    const pause = page.locator("[data-slot=hills-on-pause]");
    await expect(pause.getByRole("heading", { level: 2 })).toHaveText("Hills on pause.");
    await expect(pause.locator("[data-slot=pause-body]")).toHaveText("Weekly hill repeat sessions will be posted shortly. Check back later or send us your questions.");
    await expect(pause.getByRole("button", { name: "send us your questions" })).toBeVisible();
    // The calendar is not rendered at all: no grid, run list, "Add to calendar" or run time. (v1.1: the hero paragraph
    // and the weather widget are back above the notice, so the weather's own date <time> is allowed.)
    await expect(page.locator("[data-weather]").first()).toBeVisible();
    await expect(page.getByRole("grid")).toHaveCount(0);
    await expect(page.getByText(RUN_NAMES)).toHaveCount(0);
    await expect(page.getByText(/Add to calendar|Month|See you on the hill|New here/)).toHaveCount(0);
    await expect(page.locator("#upcoming")).toHaveCount(0);
    await expect(page.locator("time:not([data-weather] *)")).toHaveCount(0);
    await expect(page.locator("main a[href^='/calendar']")).toHaveCount(0);
    // No public permit, agency, insurance or legal wording.
    expect(await page.locator("main").innerText()).not.toMatch(/park district|permit|insur|waiver|liabil/i);
  });

  test("the pause section is centred and matches the black statement sections", async ({ page }) => {
    await page.goto("/calendar");
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator("[data-slot=hills-on-pause]");
    expect(await section.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgb(0, 0, 0)");
    const vw = page.viewportSize()!.width;
    for (const loc of [section.getByRole("heading", { level: 2 }), section.locator("[data-slot=pause-body]")]) {
      const box = (await loc.boundingBox())!;
      expect(Math.abs(box.x + box.width / 2 - vw / 2), "horizontal centre").toBeLessThanOrEqual(2);
    }
    expect(await section.locator("[data-slot=pause-body]").evaluate((e) => getComputedStyle(e).textAlign)).toBe("center");
    // Same heading size as the "See you on the hill." section it replaces (impact H2: 48 / 54 / 96).
    const fs = await section.getByRole("heading", { level: 2 }).evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    if (vw >= 1400) expect(fs).toBeGreaterThanOrEqual(90);
    if (vw <= 400) expect(fs).toBeLessThanOrEqual(52);
  });

  test("is accessible and does not scroll sideways", async ({ page }) => {
    await page.goto("/calendar");
    await page.evaluate(() => document.fonts.ready);
    expect(await axe(page)).toEqual([]);
    expect(await noHScroll(page)).toBe(true);
  });

  test("sends no weather request while held", async ({ page }) => {
    const hosts: string[] = [];
    page.on("request", (r) => hosts.push(new URL(r.url()).host));
    await page.goto("/calendar");
    await page.waitForLoadState("networkidle");
    expect(hosts.filter((h) => /weather\.gov|open-meteo/.test(h))).toEqual([]);
  });
});

test.describe("no route around the hold", () => {
  for (const slug of ["cricket-mtn-repeats", "horner-hell-repeats", "example-hill-repeats", "not-a-run"]) {
    test(`/calendar/${slug} lands on the pause page, not run details`, async ({ page }) => {
      await page.goto(`/calendar/${slug}`);
      await expect(page).toHaveURL(/\/calendar$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hills on repeat.");
      await expect(page.getByRole("heading", { level: 2 })).toHaveText("Hills on pause.");
    });
  }

  test("calendar downloads are unavailable", async ({ request }) => {
    for (const q of ["?scope=series", "?scope=occurrence&date=2026-11-14", ""]) {
      for (const slug of ["cricket-mtn-repeats", "horner-hell-repeats"]) {
        const res = await request.get(`/calendar/${slug}/ics${q}`);
        expect(res.status(), `${slug}${q}`).toBe(404);
        expect(res.headers()["content-type"] ?? "").not.toMatch(/calendar/);
      }
    }
  });

  test("no page links to a run page or a calendar download, and none names a run", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const hrefs = await page.locator("a[href]").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? ""));
      expect(hrefs.filter((h) => /^\/calendar\/|\/ics/.test(h)), path).toEqual([]);
      await expect(page.getByText(RUN_NAMES), path).toHaveCount(0);
    }
  });

  test("the served HTML and data payload carry no run names, slugs or times", async ({ request }) => {
    for (const path of PAGES) {
      const html = await (await request.get(path)).text();
      expect(html, path).not.toMatch(RUN_NAMES);
      expect(html, path).not.toMatch(/cricket-mtn-repeats|horner-hell-repeats/);
      expect(html, path).not.toMatch(/5:30\s?AM/i);
    }
  });

  test("header and footer 'Find a Run' lead to the pause page", async ({ page }) => {
    await page.goto("/");
    const links = page.getByRole("link", { name: "Find a Run" });
    const hrefs = await links.evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    expect(new Set(hrefs)).toEqual(new Set(["/calendar"]));
  });
});

test.describe("what stays open", () => {
  test("the Chicago Hills directory and hill pages remain available", async ({ page }) => {
    await page.goto("/hills");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Cricket Hill").first()).toBeVisible();
    expect(await axe(page)).toEqual([]);
    await page.goto("/hills/cricket-hill");
    await expect(page.locator("[data-slot=hill-runs-on-hold]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hills on pause." })).toBeVisible();
    expect(await axe(page)).toEqual([]);
    expect(await noHScroll(page)).toBe(true);
  });

  test("the homepage says runs are on hold instead of listing one", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-slot=runs-on-hold]")).toBeVisible();
    await expect(page.locator("[data-slot=runs-on-hold]").getByRole("heading", { level: 2 })).toHaveText("Hills on pause.");
    await expect(page.locator("[data-slot=runs-on-hold]").getByText("Weekly hill repeat sessions will be posted shortly. Check back later.")).toBeVisible();
    await expect(page.locator("time")).toHaveCount(0);
    expect(await noHScroll(page)).toBe(true);
  });
});
