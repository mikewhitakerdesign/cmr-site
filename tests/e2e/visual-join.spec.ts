import { expect, test } from "@playwright/test";

/**
 * Visual baselines for the Join, FAQ, legal and permit-hold pages (macOS only; excluded from CI
 * like every @visual spec, see playwright.config.ts). Reduced motion: the contour backgrounds
 * render one deterministic still frame. Formspree is aborted.
 */
test.describe("visual @visual", () => {
  test.use({ reducedMotion: "reduce" });
  test.beforeEach(async ({ page }) => {
    await page.route("https://formspree.io/**", (r) => r.abort());
  });

  for (const path of ["/join", "/calendar", "/faq", "/privacy", "/terms", "/participation-guidelines"]) {
    test(`full page ${path}`, async ({ page }, info) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      for (const f of await page.locator("[data-slot=contour-field]").all()) await expect(f).toHaveAttribute("data-state", "still");
      const name = path === "/calendar" ? "permit-hold" : path.slice(1);
      await expect(page).toHaveScreenshot(`${name}-${info.project.name}.png`, { fullPage: true, animations: "disabled" });
    });
  }

  test("join success state", async ({ page }, info) => {
    await page.route("https://formspree.io/**", async (route) => {
      const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*" };
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
      await route.fulfill({ status: 200, headers: CORS, contentType: "application/json", body: JSON.stringify({ ok: true, next: "https://formspree.io/thanks" }) });
    });
    await page.goto("/join");
    const form = page.locator("#join");
    await form.getByLabel("First name").fill("Sam");
    await form.getByLabel("Email address").fill("sam@example.com");
    await form.getByRole("checkbox").check();
    await form.getByRole("button", { name: "Join the club" }).click();
    await expect(form.getByRole("status")).toBeVisible();
    await expect(form).toHaveScreenshot(`join-success-${info.project.name}.png`, { animations: "disabled" });
  });

  test("hill About section (four quadrants)", async ({ page }, info) => {
    await page.goto("/hills/cricket-hill");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("section[aria-labelledby=about-heading]")).toHaveScreenshot(`hill-about-${info.project.name}.png`, { animations: "disabled" });
  });
});
