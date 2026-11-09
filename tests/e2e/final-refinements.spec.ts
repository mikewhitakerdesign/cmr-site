import { expect, test } from "@playwright/test";

const TIP = "No fees. No commitments. Lots of elevation.";
const desktopOnly = (name: string) => test.skip(name !== "desktop", "desktop-only behaviour");

test.describe("final refinements", () => {
  test("Join the club in the nav is pure white at rest, on /join too, and flips to black on hover", async ({ page }, info) => {
    desktopOnly(info.project.name);
    await page.goto("/join");
    const cta = page.locator("header").getByRole("link", { name: "Join the club" });
    const bg = () => cta.evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(await bg()).toBe("rgb(255, 255, 255)");
    expect(await cta.evaluate((e) => getComputedStyle(e).borderTopWidth)).toBe("1px");
    await page.mouse.move(0, 0);
    await cta.hover();
    await expect.poll(bg).toBe("rgb(0, 0, 0)");
    await page.goto("/hills");
    expect(await page.locator("header").getByRole("link", { name: "Join the club" }).evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgb(255, 255, 255)");
  });

  test("the Join form subtitle is one line at desktop and the copy is unchanged", async ({ page }, info) => {
    await page.goto("/join");
    const p = page.getByText("A couple of details, and you're officially unofficial.");
    await expect(p).toBeVisible();
    const box = (await p.boundingBox())!;
    if (info.project.name === "desktop") expect(box.height).toBeLessThan(32);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("tooltip: shows on hover and on keyboard focus, is not clipped, never blocks the click", async ({ page }, info) => {
    desktopOnly(info.project.name);
    await page.goto("/calendar");
    const cta = page.locator("header").getByRole("link", { name: "Join the club" });
    const tip = page.locator("header [role=tooltip]");
    await expect(tip).toBeHidden();
    await cta.hover();
    await expect(tip).toBeVisible();
    await expect(tip).toHaveText(TIP);
    const t = (await tip.boundingBox())!;
    const vw = page.viewportSize()!.width;
    expect(t.x).toBeGreaterThanOrEqual(0);
    expect(t.x + t.width).toBeLessThanOrEqual(vw);
    expect(t.y).toBeGreaterThan(0);
    // The tooltip is the top element where it is drawn, but pointer-events none: a click on the CTA goes through.
    await page.mouse.move(0, 0);
    await expect(tip).toBeHidden();
    await page.keyboard.press("Tab"); // first stop: skip link or logo; walk to the CTA
    await cta.focus();
    await page.keyboard.press("Tab");
    await cta.focus();
    await expect(tip).toBeVisible();
    await expect(cta).toHaveAccessibleDescription(TIP);
    await cta.click();
    await expect(page).toHaveURL(/\/join$/);
  });

  test("the hold's Join CTA and the homepage Join CTA carry the same tooltip", async ({ page }, info) => {
    desktopOnly(info.project.name);
    for (const path of ["/calendar", "/"]) {
      await page.goto(path);
      const link = page.locator("main").getByRole("link", { name: "Join the club" }).first();
      await expect(link).toHaveAccessibleDescription(TIP);
      await link.scrollIntoViewIfNeeded();
      await link.hover();
      await expect(page.locator("main [role=tooltip]").first()).toBeVisible();
      await expect(page.locator("main [role=tooltip]").first()).toHaveText(TIP);
    }
  });

  test("footer: links and motion control left, wordmark right on desktop; stacked below; one visible link row", async ({ page }, info) => {
    await page.goto("/hills");
    const footer = page.locator("footer");
    const mark = footer.getByRole("link", { name: /back to top/i });
    const nav = footer.getByRole("navigation", { name: "Footer" });
    await expect(nav).toHaveCount(1); // the hidden copy is not exposed
    await expect(nav.getByRole("link", { name: "Join the club" })).toHaveAttribute("href", "/join");
    const pause = footer.getByRole("button", { name: /pause motion|resume motion/i });
    await expect(pause).toBeVisible();
    await expect(footer.locator("input")).toHaveCount(0); // no newsletter
    for (const name of ["Privacy", "Terms", "Participation Guidelines"]) await expect(footer.getByRole("link", { name })).toBeVisible();
    const n = (await nav.boundingBox())!;
    const m = (await mark.boundingBox())!;
    if (info.project.name === "desktop") {
      expect(n.x + n.width).toBeLessThan(m.x); // links left of the wordmark
      expect(Math.abs(n.y + n.height / 2 - (m.y + m.height / 2))).toBeLessThan(m.height / 2); // beside it, not below
      expect(m.x + m.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    } else {
      expect(n.y).toBeGreaterThan(m.y + m.height); // stacked below the wordmark
    }
  });

  test("hill contour art: all rings inside the artwork's box at every size", async ({ page }) => {
    await page.goto("/hills/cricket-hill");
    const svg = page.locator('[data-slot="hill-contour-art"]').first();
    const box = (await svg.boundingBox())!;
    const outer = await svg.evaluate((s) => {
      const r = s.getBoundingClientRect();
      return [...s.querySelectorAll("path")].every((p) => {
        const b = p.getBoundingClientRect();
        return b.left >= r.left + 2 && b.right <= r.right - 2 && b.top >= r.top + 2 && b.bottom <= r.bottom - 2;
      });
    });
    expect(outer).toBe(true);
    expect(box.width).toBeGreaterThan(100);
  });
});
