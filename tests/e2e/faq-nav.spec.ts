import { expect, test } from "@playwright/test";

/**
 * FAQ refinements: no eyebrow, a sticky category bar below the hero (the same treatment as The
 * Science's section bar), headings above their accordions at every width, anchors that land clear.
 */
test.describe("FAQ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/faq");
  });

  test("no eyebrow; the category bar sits below the hero, not in it", async ({ page }) => {
    await expect(page.getByText("GOOD QUESTIONS.")).toHaveCount(0);
    const hero = page.locator("section[aria-labelledby=faq-heading]");
    await expect(hero.getByRole("navigation")).toHaveCount(0);
    const h = (await hero.boundingBox())!;
    const n = (await page.locator("[data-slot=faq-nav]").boundingBox())!;
    expect(n.y).toBeGreaterThanOrEqual(h.y + h.height - 1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Frequently asked Qs.");
  });

  test("the bar sticks just under the header's bar and never overlaps it", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1400));
    await page.waitForTimeout(700);
    const bar = (await page.locator("[data-slot=header-bar]").boundingBox())!;
    const n = (await page.locator("[data-slot=faq-nav]").boundingBox())!;
    expect(n.y).toBeGreaterThanOrEqual(bar.y + bar.height - 2);
    expect(n.y).toBeLessThan(bar.y + bar.height + 8);
    // It scrolls sideways inside itself at most; the page never does.
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("category links land with the heading visible below the bars, and mark the current item", async ({ page }) => {
    await page.getByRole("navigation", { name: "FAQ categories" }).getByRole("link", { name: "Schedules & Safety" }).click();
    await page.waitForTimeout(1500);
    const bar = (await page.locator("[data-slot=header-bar]").boundingBox())!;
    const n = (await page.locator("[data-slot=faq-nav]").boundingBox())!;
    const hd = (await page.locator("#schedules-and-safety-heading").boundingBox())!;
    expect(hd.y).toBeGreaterThanOrEqual(Math.max(bar.y + bar.height, n.y + n.height));
    expect(hd.y).toBeLessThan(400);
    await expect(page.getByRole("link", { name: "Schedules & Safety" }).first()).toHaveAttribute("aria-current", "location");
  });

  test("headings sit above their accordions at every width (no side-by-side collision)", async ({ page }) => {
    for (const id of ["the-club", "running-with-us", "schedules-and-safety", "staying-connected"]) {
      const h = (await page.locator(`#${id}-heading`).boundingBox())!;
      const first = (await page.locator(`#${id} details`).first().boundingBox())!;
      expect(first.y).toBeGreaterThanOrEqual(h.y + h.height + 16);
      expect(first.x).toBeLessThan(h.x + 4 + 1); // same left edge: stacked, not a second column
    }
    await expect(page.locator("details")).toHaveCount(23);
  });
});
