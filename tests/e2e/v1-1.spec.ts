import { expect, test } from "@playwright/test";

/**
 * v1.1 refinements, in a real browser at 393 / 768 / 1440. Formspree is always intercepted: nothing is sent
 * to the live forms.
 */
const JUST_SHOW_UP =
  "No membership fee. No pace requirement. No complicated initiation ritual. Find a hill, show up and climb it until it means something. Join the club to join the weekly group runs.";

let posts: { url: string; body: string }[];
test.beforeEach(async ({ page }) => {
  posts = [];
  await page.route("https://formspree.io/**", async (route) => {
    posts.push({ url: route.request().url(), body: route.request().postData() ?? "" });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, next: "https://formspree.io/thanks" }) });
  });
});

test.describe("Hill suggestion modal on /hills", () => {
  test("opens from the inline link, validates the location, sends once to its own form, and restores focus", async ({ page }) => {
    await page.goto("/hills");
    const link = page.getByRole("button", { name: "We'd love to hear about it." });
    await link.click();
    const dialog = page.getByRole("dialog", { name: "Know a hill?" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel(/Hill name/)).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");

    await dialog.getByRole("button", { name: "Suggest a hill" }).click();
    await expect(dialog.getByLabel(/Address or map pin/)).toBeFocused();
    await expect(dialog.getByText(/Tell us where the hill is/)).toBeVisible();
    expect(posts).toHaveLength(0);

    await dialog.getByLabel(/Address or map pin/).fill("41.9,-87.6");
    await dialog.getByRole("button", { name: "Suggest a hill" }).click();
    await expect(dialog.getByRole("status")).toHaveText("Thanks for the suggestion! We'll take a look and see if it's worth adding to the rotation.");
    await expect(dialog.getByRole("status")).toBeFocused();
    expect(posts).toHaveLength(1);
    expect(posts[0].url).toBe("https://formspree.io/f/mjywvydn");
    expect(posts[0].body).toContain("hill_suggestion");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(link).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("fits the viewport and closes from its button", async ({ page }) => {
    await page.goto("/hills");
    await page.getByRole("button", { name: "We'd love to hear about it." }).click();
    const dialog = page.getByRole("dialog", { name: "Know a hill?" });
    const box = (await dialog.boundingBox())!;
    const vp = page.viewportSize()!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
    expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
    await dialog.getByRole("button", { name: "Close hill suggestion" }).click();
    await expect(dialog).toBeHidden();
  });
});

test("FAQ: heading casing, edited answers, and the contact link opens the Questions form", async ({ page }) => {
  await page.goto("/faq");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveText("Frequently asked Qs.");
  expect(await h1.evaluate((e) => getComputedStyle(e).textTransform)).toBe("none");
  const body = await page.locator("[data-slot=faq-body]").innerText().catch(() => "");
  const all = await page.locator("main").innerHTML();
  expect(all).not.toContain("questionable use of the word mountain");
  expect(all).not.toContain("on hold while");
  expect(body).toBeDefined();

  const contact = page.locator("details", { hasText: "How can I contact CMR?" });
  await contact.locator("summary").click();
  const link = contact.getByRole("button", { name: "Questions form" });
  await link.click();
  const dialog = page.getByRole("dialog", { name: "Questions about the club?" });
  await expect(dialog.getByLabel("Your question")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(link).toBeFocused();
});

for (const path of ["/", "/hills", "/about"]) {
  test(`Just show up copy on ${path}`, async ({ page }) => {
    await page.goto(path);
    const section = page.locator("section[aria-labelledby=just-show-up-heading]");
    await expect(section.locator("p").first()).toHaveText(JUST_SHOW_UP);
    await expect(section.getByRole("link", { name: "Find a Run" })).toHaveAttribute("href", "/calendar");
    await expect(section.getByRole("link", { name: "Join the club" })).toHaveAttribute("href", "/join");
  });
}

test("Hill detail 'Know what you're running' card has a gray border and a divider under its heading", async ({ page }) => {
  for (const slug of ["cricket-hill", "warren-hill"]) {
    await page.goto(`/hills/${slug}`);
    const card = page.locator("[data-slot=hill-specs]");
    const css = (name: string) => card.evaluate((e, n) => getComputedStyle(e).getPropertyValue(n), name);
    expect(await css("border-top-width")).toBe("1px");
    expect(await css("border-top-style")).toBe("solid");
    const h3 = card.getByRole("heading", { level: 3 });
    expect(await h3.evaluate((e) => getComputedStyle(e).borderBottomWidth)).toBe("1px");
    expect(await h3.evaluate((e) => getComputedStyle(e).borderBottomColor)).toBe(await card.evaluate((e) => getComputedStyle(e).borderTopColor));
  }
});

test("Homepage 'We're going to the moon!' sits in the About card's gray container", async ({ page }) => {
  await page.goto("/");
  const moon = page.locator("[data-slot=moon]");
  const heroCard = page.locator("#hero-heading").locator("xpath=ancestor::section").getByRole("article");
  const vals = await moon.evaluate((e) => {
    const s = getComputedStyle(e);
    return { bg: s.backgroundColor, shadow: s.boxShadow, radius: s.borderTopLeftRadius, pt: parseFloat(s.paddingTop), pb: parseFloat(s.paddingBottom) };
  });
  await page.goto("/about");
  const about = await page.locator("[data-slot=hills-card] > div").last().evaluate((e) => {
    const s = getComputedStyle(e);
    return { bg: s.backgroundColor, shadow: getComputedStyle(e.parentElement!).boxShadow };
  });
  expect(vals.bg).toBe(about.bg);
  expect(vals.shadow).toBe(about.shadow);
  expect(vals.pt).toBeGreaterThanOrEqual(36);
  expect(vals.pt).toBeLessThanOrEqual(42);
  expect(vals.pb).toBe(vals.pt);
  await page.goto("/");
  expect(vals.radius).toBe(await heroCard.evaluate((e) => getComputedStyle(e).borderTopLeftRadius));
});

test("About founder letter carries the approved copy", async ({ page }) => {
  await page.goto("/about");
  const s = page.locator("section[aria-labelledby=founder-heading]");
  await expect(s).toContainText("I've spent a good part of my life finding ways to go uphill. It started with endurance sports, triathlon and cyclocross");
  await expect(s).toContainText("with temperatures around -10°F. A great introduction to the pain and joy of ultrarunning.");
  await expect(s).toContainText("sledding hills, park inclines, trash mounds, etc.");
  await expect(s).toContainText("how far a little elevation training can take them.");
  await expect(s).not.toContainText("-20°F");
  await expect(s).toContainText("Michael Whitaker");
});

test("Join: the waiver acknowledgment is required and unchecked by default", async ({ page }) => {
  await page.goto("/join");
  const box = page.getByRole("checkbox", { name: /Participation Waiver and Release of Liability/ });
  await expect(box).not.toBeChecked();
  await expect(box).toHaveAttribute("required", "");
  await expect(page.getByRole("button", { name: "Count me in" })).toBeDisabled();
  expect(posts).toHaveLength(0);
});
