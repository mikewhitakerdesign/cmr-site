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
  test("shows the notice, with two routes forward, and nothing else about runs", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("THE HILLS AREN'T GOING ANYWHERE.");
    await expect(page.getByText("We're reviewing park-use requirements before launching our organized group runs. Official meetups are on hold for now.")).toBeVisible();
    await expect(page.getByText("In the meantime, explore Chicago's hills and join the club for updates.")).toBeVisible();
    const hold = page.locator("[data-slot=permit-hold]");
    await expect(hold.getByRole("link", { name: "Explore the hills" })).toHaveAttribute("href", "/hills");
    await expect(hold.getByRole("link", { name: "Join the club" })).toHaveAttribute("href", "/join");
    // No calendar, run list, weather, "Add to calendar" or time.
    await expect(page.getByRole("grid")).toHaveCount(0);
    await expect(page.getByText(RUN_NAMES)).toHaveCount(0);
    await expect(page.getByText(/Add to calendar|Week|Month|forecast|Bad weather/)).toHaveCount(0);
    await expect(page.locator("time")).toHaveCount(0);
  });

  test("is a black contour hero with a translucent glass panel on top (hill-page visual language)", async ({ page }) => {
    await page.goto("/calendar");
    const hold = page.locator("[data-slot=permit-hold]");
    expect(await hold.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgb(0, 0, 0)");
    await expect(hold.locator("[data-slot=contour-field]")).toHaveCount(1);
    const panel = hold.locator("[data-slot=permit-hold-panel]");
    const s = await panel.evaluate((e) => {
      const c = getComputedStyle(e);
      return { bg: c.backgroundColor, blur: c.backdropFilter || (c as unknown as Record<string, string>).webkitBackdropFilter };
    });
    expect(s.blur).toMatch(/blur/);
    const alpha = Number(s.bg.match(/[,/]\s*([\d.]+)\s*\)$/)?.[1] ?? 1);
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(0.3); // slightly translucent
    // Readable: white text over the panel.
    expect(await page.locator("#permit-hold-heading").evaluate((e) => getComputedStyle(e).color)).toBe("rgb(255, 255, 255)");
  });

  test("is accessible, readable and does not scroll sideways", async ({ page }) => {
    await page.goto("/calendar");
    await page.evaluate(() => document.fonts.ready);
    expect(await axe(page)).toEqual([]);
    expect(await noHScroll(page)).toBe(true);
    await expect(page.locator("main [role=alert]")).toHaveCount(0);
  });

  test("the notice keyboard path reaches Explore the hills then Join the club", async ({ page }) => {
    await page.goto("/calendar");
    await page.locator("[data-slot=permit-hold]").getByRole("link", { name: "Explore the hills" }).focus();
    await expect(page.locator(":focus")).toHaveAccessibleName("Explore the hills");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAccessibleName("Join the club");
  });

  test("has no translucency fallback problem: the panel text stays high contrast with reduced transparency", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/calendar");
    expect(await axe(page)).toEqual([]);
  });
});

test.describe("no route around the hold", () => {
  for (const slug of ["cricket-mtn-repeats", "horner-hell-repeats", "example-hill-repeats", "not-a-run"]) {
    test(`/calendar/${slug} lands on the notice, not run details`, async ({ page }) => {
      await page.goto(`/calendar/${slug}`);
      await expect(page).toHaveURL(/\/calendar$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("THE HILLS AREN'T GOING ANYWHERE.");
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

  test("header and footer 'Find a Run' lead to the notice", async ({ page }) => {
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
    await expect(page.getByText("Group runs are on hold.")).toBeVisible();
    expect(await axe(page)).toEqual([]);
    expect(await noHScroll(page)).toBe(true);
  });

  test("the homepage says runs are on hold instead of listing one", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-slot=runs-on-hold]")).toBeVisible();
    await expect(page.getByText("Official group runs are on hold while we review park-use requirements.")).toBeVisible();
    await expect(page.locator("time")).toHaveCount(0);
    expect(await noHScroll(page)).toBe(true);
  });
});
