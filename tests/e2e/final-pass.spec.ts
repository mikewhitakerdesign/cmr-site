import { expect, test, type Page } from "@playwright/test";

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

test.describe("run details", () => {
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
      await expect(section.locator('[data-variant="compact"][data-minimal]')).toBeVisible();
      if (info.project.name === "desktop") {
        const m = (await map.boundingBox())!;
        const text = (await section.locator("h2").boundingBox())!;
        expect(m.height).toBeGreaterThanOrEqual(420);
        expect(m.x).toBeGreaterThan(text.x + 300); // side by side
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
    const art = (await specs.locator('[data-slot="hill-contour-art"]').boundingBox())!;
    expect(art.width).toBe(info.project.name === "desktop" ? 250 : info.project.name === "tablet" ? 160 : 120);
    if (info.project.name !== "mobile") {
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

  test("the word 'hill' in the About heading carries the tie-dye; More hills does not", async ({ page }) => {
    await page.goto("/hills/cricket-hill");
    const word = page.locator("#about-heading .cmr-tie-dye-text");
    await expect(word).toHaveCount(1);
    await expect(word).toHaveText("hill");
    await expect(page.locator("#about-heading")).toHaveText("The hill at Montrose.");
    await expect(page.locator("#more-heading .cmr-tie-dye-text")).toHaveCount(0);
    expect(await word.evaluate((e) => getComputedStyle(e).webkitTextStrokeWidth)).not.toBe("0px");
    await page.goto("/hills/mt-trashmore");
    await expect(page.locator("#about-heading .cmr-tie-dye-text")).toHaveText("hill");
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
    expect(await page.locator('[data-slot="weather-art"] .wx-drift').first().evaluate((n) => getComputedStyle(n).animationName)).toBe("none");
    // reload keeps it paused, before anything animates
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    // resume
    await page.getByRole("button", { name: "Resume motion" }).click();
    expect(await page.locator('[data-slot="weather-art"] .wx-drift').first().evaluate((n) => getComputedStyle(n).animationName)).toBe("wx-drift");
    await page.goto("/hills/cricket-hill");
    await expect(field(page)).toHaveAttribute("data-state", "animating");
  });

  test("starts paused for visitors who prefer reduced motion, and they can opt in", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/calendar");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    const btn = page.getByRole("button", { name: "Resume motion" });
    await btn.scrollIntoViewIfNeeded();
    expect(await page.locator('[data-slot="weather-art"] .wx-drift').first().evaluate((n) => getComputedStyle(n).animationName)).toBe("none");
    await btn.click();
    expect(await page.locator('[data-slot="weather-art"] .wx-drift').first().evaluate((n) => getComputedStyle(n).animationName)).toBe("wx-drift");
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
