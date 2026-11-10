import { expect, test, type Page } from "@playwright/test";
import { OFFICIAL_RUNS_ON_HOLD } from "../../src/lib/permit-hold";

// The open-state Find a Run experience. While official runs are on hold (src/lib/permit-hold.ts)
// these checks do not apply; tests/e2e/permit-hold.spec.ts covers the held state instead.
test.skip(OFFICIAL_RUNS_ON_HOLD, "Official runs are on hold; Find a Run is not served.");

/**
 * Find a Run (/calendar) and run detail pages at 393 / 768 / 1440.
 * Weather comes from the canned fixture (playwright.config.ts), never the live API.
 */
const AXE_PATH = require.resolve("axe-core");
const SLUGS = ["cricket-mtn-repeats", "horner-hell-repeats"] as const;
const MAPS = { "cricket-mtn-repeats": "https://maps.app.goo.gl/11S9yixBqMH3vxC97", "horner-hell-repeats": "https://maps.app.goo.gl/UkzLSDPRzYykq9Aq6" };

async function axe(page: Page) {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async () => {
    // @ts-expect-error injected global
    const r = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] });
    return r.violations.map((v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  });
}

const noHScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

const isoInDays = (n: number) => {
  const d = new Date(Date.now() + n * 864e5);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(d);
};

test.describe("/calendar", () => {
  test("hero, order of sections and weather", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pick a hill. Show up.");
    await expect(page.getByText("FIND A RUN", { exact: true })).toHaveCount(0); // eyebrow removed
    const headings = await page.locator("main h2").allTextContents();
    expect(headings.map((h) => h.trim())).toEqual([
      "See you on the hill.",
      "Running calendar.",
      "Bad weather. Good hills.",
      "New here? Good.",
      "Know your mountain.",
      "Come for the hills. Stay for the people.",
    ]);
    const weather = page.getByRole("region", { name: "Current weather" });
    await expect(weather).toBeVisible();
    await expect(weather.getByRole("list", { name: "Five-day forecast" }).getByRole("listitem")).toHaveCount(5);
    await expect(weather).toContainText("Source: National Weather Service");
    expect(await noHScroll(page)).toBe(true);
  });

  test("upcoming list shows both runs with real dates and detail links", async ({ page }) => {
    await page.goto("/calendar");
    const rows = page.locator("#upcoming li");
    await expect(rows).toHaveCount(2);
    for (const slug of SLUGS) await expect(page.locator(`#upcoming a[href="/calendar/${slug}"]`)).toBeVisible();
    await expect(page.locator("#upcoming")).toContainText("5:30 AM");
  });

  test("calendar navigation keeps view and date in the URL", async ({ page }, info) => {
    await page.goto("/calendar");
    const label = page.locator('[data-slot="period-label"]');
    const before = await label.textContent();
    await page.getByRole("button", { name: "Next month" }).click();
    await expect(label).not.toHaveText(before!);
    await expect(page).toHaveURL(/date=\d{4}-\d{2}-01/);
    await page.getByRole("button", { name: "week", exact: true }).click();
    await expect(page).toHaveURL(/view=week/);
    await page.getByRole("button", { name: "Today" }).click();
    await expect(page).not.toHaveURL(/date=/);
    await expect(page).toHaveURL(/view=week/);
    if (info.project.name === "mobile") {
      await expect(page.locator('[data-slot="agenda"]')).toBeVisible();
      await expect(page.locator("table[data-view]")).toBeHidden();
    } else {
      await expect(page.locator("table[data-view]")).toBeVisible();
      await expect(page.locator('[data-slot="agenda"]')).toBeHidden();
    }
  });

  test("a deep link restores view and date", async ({ page }) => {
    const date = isoInDays(40);
    await page.goto(`/calendar?view=week&date=${date}`);
    await expect(page.getByRole("button", { name: "week", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-slot="period-label"]')).toContainText(date.slice(0, 4));
    await page.goto("/calendar?view=bogus&date=nonsense");
    await expect(page.getByRole("button", { name: "month", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("selecting an event shows its details (tablet and desktop)", async ({ page }, info) => {
    test.skip(info.project.name === "mobile", "phones use the agenda");
    await page.goto("/calendar");
    await page.locator("table[data-view] td button[aria-pressed]:not([data-date-button])").first().click();
    const panel = page.locator('[data-slot="selected-day"]');
    await expect(panel.getByRole("link", { name: /Run details/ })).toBeVisible();
  });

  test("agenda rows link to run details (phones)", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "agenda is the phone layout");
    await page.goto("/calendar");
    const link = page.locator('[data-slot="agenda"] a[href^="/calendar/"]').first();
    await expect(link).toBeVisible();
    expect(await noHScroll(page)).toBe(true);
  });

  test("weather art moves only when motion is allowed", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/calendar");
    const el = page.locator('[data-slot="weather-art"] .wx-drift').first();
    expect(await el.evaluate((n) => getComputedStyle(n).animationName)).not.toBe("none");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => el.evaluate((n) => getComputedStyle(n).animationName)).toBe("none");
  });

  test("passes axe (including contrast)", async ({ page }) => {
    await page.goto("/calendar");
    await page.waitForTimeout(500);
    expect(await axe(page)).toEqual([]);
  });
});

for (const slug of SLUGS) {
  test.describe(`/calendar/${slug}`, () => {
    test("shared template: sections, no Hill Beta, exact directions link", async ({ page }) => {
      await page.goto(`/calendar/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const headings = (await page.locator("main h2").allTextContents()).map((h) => h.trim());
      expect(headings).toEqual(["Next run", "What to expect.", "Where to meet.", "Bad weather. Good hills.", "First time?"]);
      await expect(page.getByText(/hill beta/i)).toHaveCount(0);
      await expect(page.getByRole("link", { name: /Get directions/ }).first()).toHaveAttribute("href", MAPS[slug]);
      await expect(page.getByRole("link", { name: "Back to the calendar" })).toHaveAttribute("href", "/calendar");
      await expect(page.getByText("No registration. Just show up.")).toBeVisible();
      // compact weather, not the full forecast band
      await expect(page.locator('[data-variant="compact"][data-weather="ok"]')).toBeVisible();
      await expect(page.getByRole("list", { name: "Five-day forecast" })).toHaveCount(0);
      expect(await noHScroll(page)).toBe(true);
    });

    test("Add to calendar downloads valid .ics files", async ({ page, request }) => {
      await page.goto(`/calendar/${slug}`);
      await page.getByRole("button", { name: "Add to calendar" }).click();
      await expect(page.getByText(/won't automatically sync/)).toBeVisible();
      for (const name of ["Just this run", "Entire recurring series"]) {
        const href = await page.getByRole("link", { name }).getAttribute("href");
        const res = await request.get(href!);
        expect(res.status()).toBe(200);
        expect(res.headers()["content-type"]).toContain("text/calendar");
        const body = await res.text();
        expect(body).toContain("TZID=America/Chicago");
        expect(body.includes("RRULE:FREQ=WEEKLY")).toBe(name !== "Just this run");
      }
    });

    test("passes axe (including contrast)", async ({ page }) => {
      await page.goto(`/calendar/${slug}`);
      await page.waitForTimeout(500);
      expect(await axe(page)).toEqual([]);
    });
  });
}

test("the scaffold placeholder run has no detail page", async ({ page }) => {
  expect((await page.goto("/calendar/example-hill-repeats"))?.status()).toBe(404);
});
