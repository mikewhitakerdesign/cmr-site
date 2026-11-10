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
    const tip = page.locator("header [role=tooltip]").last();
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
    for (const path of ["/hills", "/"]) {
      await page.goto(path);
      const link = page.locator("main").getByRole("link", { name: "Join the club" }).first();
      await expect(link).toHaveAccessibleDescription(TIP);
      await link.scrollIntoViewIfNeeded();
      await link.hover();
      await expect(page.locator("main [role=tooltip]").first()).toBeVisible();
      await expect(page.locator("main [role=tooltip]").first()).toHaveText(TIP);
    }
  });

  test("footer: wordmark left with Navigate right, divider, Pause motion left and legal right at tablet+; stacked on mobile", async ({ page }, info) => {
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
    const legal = (await footer.getByRole("list", { name: "Legal" }).boundingBox())!;
    const pb = (await pause.boundingBox())!;
    const divider = (await footer.locator("[data-slot=footer-divider]").boundingBox())!;
    const vw = page.viewportSize()!.width;
    expect(divider.y).toBeGreaterThanOrEqual(n.y + n.height); // divider below the whole upper area
    expect(divider.y).toBeGreaterThanOrEqual(m.y + m.height);
    expect(pb.y).toBeGreaterThan(divider.y);
    expect(legal.y).toBeGreaterThan(divider.y);
    if (info.project.name === "mobile") {
      expect(n.y).toBeGreaterThan(m.y + m.height); // Navigate stacks under the wordmark
      expect(legal.y).toBeGreaterThan(pb.y + pb.height);
    } else {
      expect(m.x + m.width).toBeLessThan(n.x); // wordmark left, Navigate right
      expect(n.x + n.width).toBeGreaterThan(vw - 100); // Navigate block at the right edge
      expect(legal.x + legal.width).toBeGreaterThan(vw - 100); // legal right-aligned
      expect(pb.x).toBeLessThan(vw / 2);
      const copy = (await footer.getByText(/© \d{4} Chicago Mountain Runners/).boundingBox())!;
      expect(copy.y).toBeGreaterThan(pb.y + pb.height); // copyright directly below Pause motion
      expect(Math.abs(copy.x - pb.x)).toBeLessThan(2);
      const risk = footer.getByText(/Running carries inherent physical risk/);
      const lines = await risk.evaluate((e) => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)));
      if (info.project.name === "desktop") expect(lines).toBe(2); // balanced two-line measure
      const rb = (await risk.boundingBox())!;
      expect(rb.x + rb.width).toBeGreaterThan(vw - 100);
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

  test("\"Find what you've been looking for\" map (hill pages): borderless with the run-detail map's soft shadow; no permit-pending copy site-wide", async ({ page }) => {
    await page.goto("/hills/cricket-hill");
    const map = page.locator('[data-slot="hill-map"]');
    await expect(map).toBeVisible();
    const st = await map.evaluate((e) => {
      const c = getComputedStyle(e);
      return { border: c.borderTopWidth, shadow: c.boxShadow, radius: c.borderTopLeftRadius };
    });
    expect(st.border).toBe("0px");
    expect(st.shadow).toContain("rgba(65, 65, 65, 0.28)");
    expect(st.radius).not.toBe("0px");
    for (const path of ["/", "/calendar", "/hills", "/hills/cricket-hill"]) {
      await page.goto(path);
      await expect(page.getByText(/on hold|park-use requirements/i)).toHaveCount(0);
    }
  });
});
