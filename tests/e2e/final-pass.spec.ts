import { expect, test, type Page } from "@playwright/test";
import { OFFICIAL_RUNS_ON_HOLD } from "../../src/lib/permit-hold";

/** Final MVP refinements: run details, hill pages and the global motion control. */
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
/** Browser tests run on software WebGL; force the animation so the pause is observable. */
const forceMotion = (page: Page) => page.addInitScript(() => ((window as unknown as Record<string, boolean>).__CMR_CONTOUR_FORCE_MOTION__ = true));
const field = (page: Page) => page.locator('[data-slot="contour-field"]').first();

test.describe("run map hover zoom", () => {
  test.skip(OFFICIAL_RUNS_ON_HOLD, "Run pages are not served while official runs are on hold.");
  test("zooms the image only, and not when motion is paused", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "hover is a desktop behaviour");
    await page.goto("/calendar/cricket-mtn-repeats");
    const map = page.locator('[data-slot="run-map"]');
    const img = map.locator("img");
    const pin = map.locator("span.bg-primary").first();
    const scale = (l: typeof img) => l.evaluate((e) => getComputedStyle(e).transform);
    await map.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.documentElement.setAttribute("data-motion", "on"));
    const pinBefore = await pin.boundingBox();
    await map.hover();
    await expect.poll(() => scale(img)).toMatch(/matrix\(1\.05/);
    expect(await pin.boundingBox()).toEqual(pinBefore);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.documentElement.setAttribute("data-motion", "off"));
    await map.hover();
    await page.waitForTimeout(600);
    expect(await scale(img)).toBe("none");
  });
});

test.describe("run details", () => {
  test.skip(OFFICIAL_RUNS_ON_HOLD, "Run pages are not served while official runs are on hold.");
  for (const slug of ["cricket-mtn-repeats", "horner-hell-repeats"]) {
    test(`${slug}: icons, map, tie-dye circles, no overflow`, async ({ page }, info) => {
      await page.goto(`/calendar/${slug}`);
      // What to expect: one outline icon per row
      const rows = page.locator("#expect-heading ~ dl > div");
      await expect(rows).toHaveCount(4);
      for (let i = 0; i < 4; i++) await expect(rows.nth(i).locator("dt svg")).toHaveCount(1);
      // Where to meet: the static map of the exact pin, loaded, with the exact directions link kept
      const map = page.locator('[data-slot="run-map"]');
      await expect(map).toBeVisible();
      expect(await map.locator("img").evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
      const section = page.locator('section[aria-labelledby="meet-heading"]');
      await expect(section.getByRole("link", { name: /Get directions/ })).toHaveAttribute(
        "href",
        slug.startsWith("cricket") ? "https://maps.app.goo.gl/11S9yixBqMH3vxC97" : "https://maps.app.goo.gl/UkzLSDPRzYykq9Aq6",
      );
      await expect(section.locator('[data-variant="compact"][data-placement="float"]')).toBeVisible();
      await expect(map.locator("img")).toHaveAttribute("src", /webp|%2Fcalendar%2Fmaps/);
      if (info.project.name === "desktop") {
        const m = (await map.boundingBox())!;
        const text = (await section.locator("h2").boundingBox())!;
        expect(m.width / m.height).toBeCloseTo(1.5, 1); // 3:2 landscape
        expect(m.height).toBeLessThan(460);
        expect(m.x).toBeGreaterThan(text.x + 300); // side by side
        // The floating weather card overlaps the map's upper-right corner and sticks out past its top edge, clear of the pin.
        const w = (await section.locator('[data-variant="compact"]').boundingBox())!;
        expect(w.y).toBeLessThan(m.y);
        expect(w.x + w.width).toBeGreaterThan(m.x + m.width - 40);
        const pin = (await map.locator("span.bg-primary").first().boundingBox())!;
        expect(w.y + w.height <= pin.y || w.x >= pin.x + pin.width).toBe(true);
      } else {
        const m = (await map.boundingBox())!;
        expect(m.width).toBeLessThanOrEqual(info.project.name === "mobile" ? 345 : 680);
      }
      // Metadata: four square tie-dye circles
      const circles = page.locator('section[aria-label="At a glance"] dl > div');
      await expect(circles).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        const b = (await circles.nth(i).boundingBox())!;
        expect(Math.abs(b.width - b.height)).toBeLessThan(1.5);
        expect(await circles.nth(i).evaluate((e) => getComputedStyle(e).borderRadius)).not.toBe("0px");
        await expect(circles.nth(i).locator(".cmr-tie-dye")).toHaveCount(1);
      }
      expect(await noHScroll(page)).toBe(true);
      expect(await axe(page)).toEqual([]);
    });
  }
});

test.describe("hill pages", () => {
  test("map matches its column, specs sit in a filled box with art, TBD circles are grey tie-dye", async ({ page }, info) => {
    await page.goto("/hills/horner-hill");
    await expect(page.getByRole("heading", { level: 2, name: "The hill at Horner Park." })).toBeVisible();
    const specs = page.locator('[data-slot="hill-specs"]');
    await expect(specs).toBeVisible();
    expect(await specs.evaluate((e) => parseFloat(getComputedStyle(e).borderTopLeftRadius))).toBeGreaterThanOrEqual(12);
    // The contour drawing sits above the gray block, not inside it (Owner direction, 2026-11-09).
    await expect(specs.locator('[data-slot="hill-contour-art"]')).toHaveCount(0);
    const art = (await page.locator('[data-slot="hill-contour-art"]').first().boundingBox())!;
    expect(art.width).toBe(info.project.name === "desktop" ? 240 : info.project.name === "tablet" ? 180 : 140);
    expect(art.y + art.height).toBeLessThanOrEqual((await specs.boundingBox())!.y + 1);
    if (info.project.name !== "mobile") {
      // Four quadrants: heading | drawing on the top row, copy | specs below, the drawing right of the heading.
      const h = (await page.locator("#about-heading").boundingBox())!;
      const sb = (await specs.boundingBox())!;
      expect(art.x).toBeGreaterThan(h.x + h.width - 1);
      expect(Math.abs(art.x + art.width - (sb.x + sb.width))).toBeLessThan(2); // right edges align
      const copy = (await page.locator("#about-heading ~ div").first().locator("p").first().boundingBox())!;
      const box = (await specs.boundingBox())!;
      expect(Math.abs(box.y - copy.y)).toBeLessThan(6); // the box starts level with the copy
      const find = page.locator('section[aria-labelledby="find-heading"]');
      const map = (await find.locator('[data-slot="hill-map"]').boundingBox())!;
      const col = (await find.locator("h2").boundingBox())!;
      const addr = (await find.locator("p").last().boundingBox())!;
      expect(map.height).toBeGreaterThan(addr.y + addr.height - col.y - 4); // as tall as the text column
    }
    const circle = page.locator('[data-slot="repeat-circle"]').first();
    expect(await circle.evaluate((e) => getComputedStyle(e).borderStyle)).not.toBe("dashed");
    expect(await circle.locator(".cmr-tie-dye").evaluate((e) => getComputedStyle(e).backgroundImage)).toContain("gradient");
    await expect(circle).toContainText("TBD");
    expect(await noHScroll(page)).toBe(true);
    expect(await axe(page)).toEqual([]);
  });

  test("the About heading is plain black text, with no tie-dye on 'hill'", async ({ page }) => {
    for (const [slug, text] of [["cricket-hill", "The hill at Montrose."], ["mt-trashmore", "The hill at James Park."]]) {
      await page.goto(`/hills/${slug}`);
      await expect(page.locator("#about-heading")).toHaveText(text);
      await expect(page.locator("#about-heading *")).toHaveCount(0);
      expect(await page.locator("#about-heading").evaluate((e) => getComputedStyle(e).color)).toBe("rgb(0, 0, 0)");
    }
  });

  test("the hero shows a calm, sparse contour field", async ({ page }) => {
    await forceMotion(page);
    await page.goto("/hills/mt-trashmore");
    await expect(field(page)).toHaveAttribute("data-state", "animating");
    await expect(page.getByRole("heading", { level: 2, name: "The hill at James Park." })).toBeVisible();
  });
});

test.describe("motion control", () => {
  test("pauses WebGL and CSS motion, remembers the choice across navigation and reload", async ({ page }) => {
    await forceMotion(page);
    await page.goto("/hills/cricket-hill");
    await expect(field(page)).toHaveAttribute("data-state", "animating");
    const toggle = page.getByRole("button", { name: "Pause motion" });
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    await expect(page.getByRole("button", { name: "Resume motion" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    await expect(field(page)).toHaveAttribute("data-state", "still");
    // the render loop is really stopped: no new frames are drawn
    expect(await page.evaluate(() => localStorage.getItem("cmr-motion"))).toBe("off");
    // client navigation keeps it paused
    await page.locator("footer").getByRole("link", { name: "Find a Run" }).click();
    await expect(page).toHaveURL(/\/calendar$/);
    await expect(page.getByRole("button", { name: "Resume motion" })).toBeVisible();
    if (!OFFICIAL_RUNS_ON_HOLD) {
      expect(await page.locator('[data-slot="weather-art"] .wx-drift').first().evaluate((n) => getComputedStyle(n).animationName)).toBe("none");
    }
    // reload keeps it paused, before anything animates
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    // resume
    await page.getByRole("button", { name: "Resume motion" }).click();
    if (!OFFICIAL_RUNS_ON_HOLD) {
      expect(await page.locator('[data-slot="weather-art"] .wx-drift').first().evaluate((n) => getComputedStyle(n).animationName)).toBe("wx-drift");
    }
    await page.goto("/hills/cricket-hill");
    await expect(field(page)).toHaveAttribute("data-state", "animating");
  });

  test("starts paused for visitors who prefer reduced motion, and they can opt in", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/calendar");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    const btn = page.getByRole("button", { name: "Resume motion" });
    await btn.scrollIntoViewIfNeeded();
    if (!OFFICIAL_RUNS_ON_HOLD) {
      expect(await page.locator('[data-slot="weather-art"] .wx-drift').first().evaluate((n) => getComputedStyle(n).animationName)).toBe("none");
    }
    await btn.click();
    if (!OFFICIAL_RUNS_ON_HOLD) {
      expect(await page.locator('[data-slot="weather-art"] .wx-drift').first().evaluate((n) => getComputedStyle(n).animationName)).toBe("wx-drift");
    }
    await page.reload();
    await expect(page.getByRole("button", { name: "Pause motion" })).toBeVisible();
  });

  test("the control is quiet, keyboard-operable and passes axe in the footer", async ({ page }) => {
    await page.goto("/calendar");
    const btn = page.getByRole("button", { name: "Pause motion" });
    await btn.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Resume motion" })).toBeFocused();
    await expect(page.locator('[data-slot="motion-announce"]')).toHaveText("Motion paused.");
    expect(await axe(page)).toEqual([]);
  });
});
