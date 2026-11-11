import { expect, test, type Page } from "@playwright/test";
import { OFFICIAL_RUNS_ON_HOLD } from "../../src/lib/permit-hold";

/**
 * The Questions dialog opened from "send us your questions" on /calendar while official runs are on hold
 * (src/components/QuestionsDialog.tsx), at 393 / 768 / 1440, in a real browser: top layer, focus trap,
 * Escape, backdrop, scroll lock, geometry. Formspree is mocked; the live form is never contacted.
 * The footer-area floating "Questions?" entry point must keep working beside it.
 */
test.skip(!OFFICIAL_RUNS_ON_HOLD, "The dialog is only on /calendar while runs are on hold.");

const AXE_PATH = require.resolve("axe-core");
async function axe(page: Page) {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async () => {
    // @ts-expect-error injected global
    const r = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] });
    return r.violations.map((v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  });
}

let posts: string[];
test.beforeEach(async ({ page }) => {
  posts = [];
  await page.route("https://formspree.io/**", async (route) => {
    posts.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, next: "https://formspree.io/thanks" }) });
  });
  await page.goto("/calendar");
  await page.evaluate(() => document.fonts.ready);
});

const link = (page: Page) => page.getByRole("button", { name: "send us your questions" });
const dialog = (page: Page) => page.locator("dialog");

test("opens a centered modal dialog with the question field focused", async ({ page }) => {
  await expect(dialog(page)).toBeHidden();
  await link(page).click();
  const d = page.getByRole("dialog", { name: "Questions about the club?" });
  await expect(d).toBeVisible();
  await expect(d.getByLabel("Your question")).toBeFocused();
  const box = (await d.boundingBox())!;
  const vp = page.viewportSize()!;
  expect(Math.abs(box.x + box.width / 2 - vp.width / 2)).toBeLessThanOrEqual(2);
  expect(Math.abs(box.y + box.height / 2 - vp.height / 2)).toBeLessThanOrEqual(2);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
  expect(await dialog(page).evaluate((e) => (e as HTMLDialogElement).matches(":modal"))).toBe(true);
});

test("renders outside the centred black section, so it keeps left-aligned text and the dark focus ring", async ({ page }) => {
  await link(page).click();
  expect(await dialog(page).evaluate((e) => !e.closest("[data-slot=hills-on-pause]"))).toBe(true);
  expect(await dialog(page).evaluate((e) => getComputedStyle(e).textAlign)).toMatch(/^(start|left)$/);
  const ring = await dialog(page).evaluate((e) => getComputedStyle(e).getPropertyValue("--ring").trim());
  const sectionRing = await page.locator("[data-slot=hills-on-pause]").evaluate((e) => getComputedStyle(e).getPropertyValue("--ring").trim());
  expect(ring).not.toBe(sectionRing);
});

test("the backdrop is translucent white and the page stays faintly visible behind it", async ({ page }) => {
  await link(page).click();
  const bg = await dialog(page).evaluate((e) => getComputedStyle(e, "::backdrop").backgroundColor);
  const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)|color\(srgb ([\d. ]+)\/\s*([\d.]+)\)/);
  expect(m, bg).not.toBeNull();
  const alpha = Number(m![4] ?? m![6] ?? 1);
  expect(alpha).toBeGreaterThan(0.4);
  expect(alpha).toBeLessThan(0.9);
  expect(bg).toMatch(/255,\s*255,\s*255|1 1 1/);
});

test("closes with the close button, Escape and a click on the backdrop, returning focus to the link each time", async ({ page }) => {
  const d = page.getByRole("dialog", { name: "Questions about the club?" });
  await link(page).click();
  await d.getByRole("button", { name: "Close questions" }).click();
  await expect(d).toBeHidden();
  await expect(link(page)).toBeFocused();

  await link(page).click();
  await page.keyboard.press("Escape");
  await expect(d).toBeHidden();
  await expect(link(page)).toBeFocused();

  await link(page).click();
  const vp = page.viewportSize()!;
  await page.mouse.click(4, vp.height - 4); // far corner: on the backdrop, outside the centred dialog
  await expect(d).toBeHidden();
  await expect(link(page)).toBeFocused();

  await link(page).click();
  await d.getByLabel("Your question").click(); // inside: stays open
  await expect(d).toBeVisible();
});

test("traps keyboard focus inside the dialog", async ({ page }) => {
  await link(page).click();
  const d = page.getByRole("dialog", { name: "Questions about the club?" });
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await d.evaluate((el) => el.contains(document.activeElement)), `after ${i + 1} Tab`).toBe(true);
  }
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Shift+Tab");
    expect(await d.evaluate((el) => el.contains(document.activeElement)), `after ${i + 1} Shift+Tab`).toBe(true);
  }
});

test("prevents background scrolling while open and restores it", async ({ page }) => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await link(page).click();
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await page.mouse.move(4, 4);
  await page.mouse.wheel(0, 600);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
});

test("sends a question through the shared form and shows the success state", async ({ page }) => {
  await link(page).click();
  const d = page.getByRole("dialog", { name: "Questions about the club?" });
  await d.getByRole("button", { name: "Send question" }).click();
  await expect(d.getByLabel("Your question")).toHaveAttribute("aria-invalid", "true");
  expect(posts).toEqual([]);
  await d.getByLabel("Your question").fill("Where do we meet?");
  await d.getByLabel("Email").fill("runner@example.com");
  await d.getByRole("button", { name: "Send question" }).click();
  await expect(d.getByRole("status")).toContainText("Thanks, your question is on its way.");
  expect(posts).toEqual(["https://formspree.io/f/mwlljgld"]);
});

test("is accessible open, and fits without sideways scroll", async ({ page }) => {
  await link(page).click();
  expect(await axe(page)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const box = (await dialog(page).boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(page.viewportSize()!.width - 24);
});

test("the floating Questions? entry point still works on the same page", async ({ page }) => {
  const pill = page.getByRole("button", { name: "Questions?" });
  await pill.click();
  const panel = page.locator("[data-overlay] [role=dialog]");
  await expect(panel).toBeVisible();
  await expect(panel.getByLabel("Your question")).toBeFocused();
  expect(await panel.getAttribute("aria-modal")).toBe("false");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(pill).toBeFocused();
  await expect(dialog(page)).toBeHidden();
});
